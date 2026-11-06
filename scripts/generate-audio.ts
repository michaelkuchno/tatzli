/**
 * Build-time pronunciation generator (run by the developer, never by the child).
 *
 *   npx tsx scripts/generate-audio.ts [--langs be,de,pl,en] [--levels 1,2,3] [--batch 20] [--encode-only]
 *
 * - Source of truth: every content item (content/index.ts → allAudioItems) × 4 languages.
 * - Order: level 1 (2–3 years) first, then level 2, then level 3 (SPEC: youngest first).
 * - Engine: Gemini TTS (key from GEMINI_API_KEY). Bärndütsch is requested explicitly as Bernese dialect.
 *   Each language has a chain of TTS models; when a model's daily free-tier quota is used up, the next model
 *   in the chain continues (the model used per clip is recorded in .audio-cache/models.json).
 * - Quota saving: several texts are spoken in ONE request with long pauses, then split at the silences;
 *   the split must yield exactly N segments with plausible durations, otherwise smaller batches are tried.
 * - Raw PCM is cached in .audio-cache/ (gitignored) → resumable after quota limits.
 * - Output: public/audio/<lang>/<hash>.m4a (AAC mono 24 kHz, silence-trimmed, loudness-normalised) and
 *   public/audio/manifest.json (item id → file per language). Identical texts share one file.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'
import { allAudioItems, WORD_BY_ID, PHRASE_BY_ID, STORY_BY_ID, SONG_BY_ID, TOPIC_BY_ID } from '../content/index'
import type { Lang, Level } from '../content/types'
import { geminiKey, sleep } from './gemini-node'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = join(ROOT, '.audio-cache')
const OUT = join(ROOT, 'public', 'audio')
const MANIFEST = join(OUT, 'manifest.json')
const MODELS_FILE = join(CACHE, 'models.json')
const STATUS_FILE = join(ROOT, 'scripts', 'data', 'audio-status.json')
const VOICE_VERSION = 'v1'
const RATE = 24000
const ALL: Lang[] = ['be', 'de', 'pl', 'en']

const args = process.argv.slice(2)
const arg = (k: string, d?: string) => {
  const i = args.indexOf(`--${k}`)
  return i >= 0 ? args[i + 1] : d
}
const LANGS = (arg('langs', 'be,de,pl,en') as string).split(',') as Lang[]
const LEVELS = (arg('levels', '1,2,3') as string).split(',').map(Number) as Level[]
const BATCH = Number(arg('batch', '20'))
const PAUSE = Number(arg('pause', '6500'))
const ENCODE_ONLY = args.includes('--encode-only')

const TTS_MODELS = ['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts', 'gemini-3.8-flash-lite-tts']
/** Preferred model first; the rest is the fallback chain. Bärndütsch gets the strongest model. */
const CHAIN: Record<Lang, string[]> = {
  be: ['gemini-3.8-flash-tts', 'gemini-2.5-pro-preview-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts'],
  de: ['gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts', 'gemini-3.8-flash-lite-tts', 'gemini-2.5-pro-preview-tts', 'gemini-3.8-flash-tts'],
  pl: ['gemini-2.5-flash-preview-tts', 'gemini-3.1-flash-tts-preview', 'gemini-3.8-flash-lite-tts', 'gemini-2.5-pro-preview-tts', 'gemini-3.8-flash-tts'],
  en: ['gemini-3.8-flash-lite-tts', 'gemini-2.5-flash-preview-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-pro-preview-tts', 'gemini-3.8-flash-tts'],
}
const VOICE: Record<Lang, string> = { be: arg('voice-be', 'Sulafat')!, de: arg('voice-de', 'Sulafat')!, pl: arg('voice-pl', 'Sulafat')!, en: arg('voice-en', 'Sulafat')! }
const exhausted = new Set<string>()

export const hashOf = (lang: Lang, text: string) => createHash('sha1').update(`${VOICE_VERSION}|${lang}|${text}`).digest('hex').slice(0, 12)
const cachePath = (lang: Lang, h: string) => join(CACHE, lang, `${h}.pcm`)

function ensureDirs() {
  for (const l of ALL) {
    mkdirSync(join(CACHE, l), { recursive: true })
    mkdirSync(join(OUT, l), { recursive: true })
  }
  mkdirSync(join(ROOT, 'scripts', 'data'), { recursive: true })
}

/** Level of an audio item (prompts & titles of level-1 topics count as level 1). */
function levelOf(id: string): Level {
  const [kind, ref] = [id.slice(0, id.indexOf('.')), id.slice(id.indexOf('.') + 1)]
  if (kind === 'w' || kind === 'snd') return WORD_BY_ID[ref]?.level ?? 3
  if (kind === 'p') return PHRASE_BY_ID[ref]?.level ?? 3
  if (kind === 'st') return STORY_BY_ID[ref]?.level ?? 3
  if (kind === 's') return STORY_BY_ID[ref.split('.')[0]]?.level ?? 3
  if (kind === 'sg') return SONG_BY_ID[ref]?.level ?? 3
  if (kind === 'song') return SONG_BY_ID[ref.split('.')[0]]?.level ?? 3
  if (kind === 't') return TOPIC_BY_ID[ref]?.level ?? 3
  return 1
}

/** Accepts raw 16-bit PCM or a WAV container; returns raw PCM at 24 kHz mono. */
function toPcm(buf: Buffer): Buffer {
  if (buf.subarray(0, 4).toString('ascii') !== 'RIFF') return buf
  let off = 12
  let rate = RATE
  while (off + 8 <= buf.length) {
    const id = buf.subarray(off, off + 4).toString('ascii')
    const size = buf.readUInt32LE(off + 4)
    if (id === 'fmt ') rate = buf.readUInt32LE(off + 12)
    if (id === 'data') {
      const pcm = buf.subarray(off + 8, Math.min(buf.length, off + 8 + size))
      if (rate === RATE) return pcm
      return execFileSync(ffmpegPath as unknown as string, ['-loglevel', 'error', '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', 'pipe:0', '-f', 's16le', '-ar', String(RATE), '-ac', '1', 'pipe:1'], { input: pcm, maxBuffer: 1 << 28 })
    }
    off += 8 + size + (size % 2)
  }
  return buf
}

/** Split PCM at silences ≥ minGap seconds. */
export function splitOnSilence(pcm: Buffer, minGap = 0.6, threshold = 500): Buffer[] {
  const samples = Math.floor(pcm.length / 2)
  const win = Math.floor(RATE * 0.02)
  const loud: boolean[] = []
  for (let i = 0; i < samples; i += win) {
    let peak = 0
    for (let j = i; j < Math.min(samples, i + win); j++) peak = Math.max(peak, Math.abs(pcm.readInt16LE(j * 2)))
    loud.push(peak > threshold)
  }
  const gapWins = Math.ceil((minGap * RATE) / win)
  const segs: [number, number][] = []
  let start = -1
  let silent = 0
  for (let w = 0; w < loud.length; w++) {
    if (loud[w]) {
      if (start < 0) start = w
      silent = 0
    } else if (start >= 0) {
      silent++
      if (silent >= gapWins) {
        segs.push([start, w - silent + 1])
        start = -1
        silent = 0
      }
    }
  }
  if (start >= 0) segs.push([start, loud.length])
  return segs.filter(([a, b]) => (b - a) * win >= RATE * 0.12).map(([a, b]) => pcm.subarray(Math.max(0, a - 3) * win * 2, Math.min(samples, (b + 4) * win) * 2))
}

const plausible = (parts: Buffer[], texts: string[]) =>
  parts.every((p, i) => {
    const sec = p.length / 2 / RATE
    const chars = Math.max(2, texts[i].length)
    return sec >= 0.2 && chars / sec <= 35 && chars / sec >= 0.6
  })

/**
 * Split a batch recording into exactly texts.length parts. First try fixed gap lengths; then cut at the
 * N−1 longest pauses (the model pauses ~3 s between entries, much longer than inside an entry).
 */
function splitInto(pcm: Buffer, texts: string[]): Buffer[] | null {
  const direct = splitIntoExact(pcm, texts)
  if (direct) return direct
  // the model sometimes speaks the instruction first → drop the leading segment and try again
  const segs = splitOnSilence(pcm, 0.9)
  if (segs.length === texts.length + 1) {
    const rest = pcm.subarray(segs[1].byteOffset - pcm.byteOffset)
    return splitIntoExact(rest, texts)
  }
  return null
}

function splitIntoExact(pcm: Buffer, texts: string[]): Buffer[] | null {
  for (const gap of [1.6, 1.3, 1.1, 0.9, 0.75, 0.6]) {
    const parts = splitOnSilence(pcm, gap)
    if (parts.length === texts.length && plausible(parts, texts)) return parts
  }
  // longest-pauses strategy
  const segs = splitOnSilence(pcm, 0.25)
  if (segs.length < texts.length) return null
  const offs = segs.map((s) => s.byteOffset - pcm.byteOffset)
  const gaps = segs.slice(1).map((s, i) => ({ i, len: offs[i + 1] - (offs[i] + segs[i].length) }))
  const cuts = new Set(
    gaps
      .sort((a, b) => b.len - a.len)
      .slice(0, texts.length - 1)
      .map((g) => g.i),
  )
  const parts: Buffer[] = []
  let start = 0
  for (let i = 0; i < segs.length; i++) {
    if (cuts.has(i) || i === segs.length - 1) {
      parts.push(pcm.subarray(offs[start], offs[i] + segs[i].length))
      start = i + 1
    }
  }
  return parts.length === texts.length && plausible(parts, texts) ? parts : null
}

type TtsResult = { pcm: Buffer } | { quota: true } | { error: string }
/** Per-model request limiter (Tier 1: 10 requests/min per TTS model → we stay at --rpm, default 9). */
const RPM = Number(arg('rpm', '9'))
const sent: number[] = []
async function throttle() {
  for (;;) {
    const now = Date.now()
    while (sent.length && now - sent[0] > 60000) sent.shift()
    if (sent.length < RPM) {
      sent.push(now)
      return
    }
    await sleep(60000 - (now - sent[0]) + 250)
  }
}
let dailyRetries = 0

// --vertex <project>: use Vertex AI (Google Cloud) with gcloud Application Default Credentials
const VERTEX_PROJECT = arg('vertex')
const VERTEX_LOCATION = arg('location', 'global')!
const GCLOUD = process.env.GCLOUD_BIN ?? join(process.env.LOCALAPPDATA ?? '', 'Google', 'Cloud SDK', 'google-cloud-sdk', 'bin', 'gcloud.cmd')
let token = { value: '', at: 0 }
function accessToken(): string {
  if (Date.now() - token.at > 40 * 60000) {
    token = { value: execFileSync(`"${GCLOUD}" auth application-default print-access-token`, { encoding: 'utf8', shell: true }).trim(), at: Date.now() }
  }
  return token.value
}
function endpoint(model: string): { url: string; headers: Record<string, string> } {
  if (VERTEX_PROJECT) {
    const host = VERTEX_LOCATION === 'global' ? 'aiplatform.googleapis.com' : `${VERTEX_LOCATION}-aiplatform.googleapis.com`
    return {
      url: `https://${host}/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken()}`, 'x-goog-user-project': VERTEX_PROJECT },
    }
  }
  return { url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiKey()! } }
}

async function ttsRequest(model: string, text: string, lang: Lang): Promise<TtsResult> {
  let wait = 8000
  for (let t = 0; t < 8; t++) {
    await throttle()
    let r: Response
    try {
      const ep = endpoint(model)
      r = await fetch(ep.url, {
        method: 'POST',
        headers: ep.headers,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE[lang] } } } },
        }),
      })
    } catch (e) {
      await sleep(wait)
      wait *= 2
      if (t === 4) return { error: String(e) }
      continue
    }
    if (r.ok) {
      let j: { candidates?: { content?: { parts?: { inlineData?: { data: string } }[] } }[] }
      try {
        j = await r.json()
      } catch (e) {
        // connection dropped while reading the body → retry
        console.warn(`  ${model}: body read failed (${(e as Error).message}), retry`)
        await sleep(wait)
        wait = Math.min(wait * 2, 90000)
        continue
      }
      const data = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data
      if (!data) return { error: 'no audio in response' }
      return { pcm: toPcm(Buffer.from(data, 'base64')) }
    }
    const body = await r.text()
    if (r.status === 429) {
      if (/PerDay|per day|free_tier_requests|RequestsPerDay|per_day/i.test(body) && !/PerMinute|per_minute/i.test(body)) {
        // wait and retry a few times before giving up on this model (a daily cap on Tier 1 would be unexpected)
        console.warn(`  ${model}: daily-limit 429: ${(body.match(/metric: ([^,]+)/) ?? [])[1] ?? ''} ${(body.match(/limit: \d+/) ?? [])[0] ?? ''}`)
        if (++dailyRetries > 3) return { quota: true }
        await sleep(120000)
        continue
      }
      const m = body.match(/"retryDelay":\s*"(\d+)s"/)
      await sleep(m ? Number(m[1]) * 1000 + 1500 : wait)
      wait = Math.min(wait * 2, 90000)
      continue
    }
    if (r.status >= 500) {
      await sleep(wait)
      wait = Math.min(wait * 2, 90000)
      continue
    }
    return { error: `${r.status} ${body.slice(0, 200)}` }
  }
  return { error: 'retries exhausted' }
}

const BATCH_INTRO: Record<Lang, string> = {
  be: 'Lies die folgenden Einträge nacheinander auf Berndeutsch (Berner Mundart aus der Stadt Bern, nicht Hochdeutsch, nicht Zürichdeutsch), warm, langsam und deutlich für kleine Kinder. Mach nach jedem Eintrag eine Pause von drei Sekunden. Lies keine Nummern vor, nur die Einträge:',
  de: 'Lies die folgenden Einträge nacheinander auf Hochdeutsch, warm, langsam und deutlich für kleine Kinder. Nach jedem Eintrag drei Sekunden Pause. Keine Nummern vorlesen:',
  pl: 'Przeczytaj kolejno poniższe wpisy po polsku, ciepło, powoli i wyraźnie dla małych dzieci. Po każdym wpisie zrób trzysekundową pauzę. Nie czytaj numerów:',
  en: 'Read the following entries one after another in British English, warmly, slowly and clearly for small children. Pause for three seconds after each entry. Do not read the numbers:',
}

const PREFER = arg('model')
function currentModel(lang: Lang): string | null {
  const chain = PREFER ? (args.includes('--only-model') ? [PREFER] : [PREFER, ...CHAIN[lang].filter((m) => m !== PREFER)]) : CHAIN[lang]
  return chain.find((m) => !exhausted.has(m)) ?? null
}

/** Generate a group of clips; returns number written or -1 if every model of the language is exhausted. */
async function generateGroup(lang: Lang, group: { h: string; text: string }[], models: Record<string, string>): Promise<number> {
  for (;;) {
    const model = currentModel(lang)
    if (!model) return -1
    // Same "read only the entries" format for single clips – a free-form style instruction was sometimes spoken aloud.
    const prompt = `${BATCH_INTRO[lang]}\n\n${group.map((t, i) => `${i + 1}. ${t.text}`).join('\n')}`
    const res = await ttsRequest(model, prompt, lang)
    if ('quota' in res) {
      console.warn(`  ${model}: daily quota used up → next model`)
      exhausted.add(model)
      continue
    }
    if ('error' in res) {
      console.warn(`  ${lang} ${model}: ${res.error}`)
      return 0
    }
    if (group.length === 1) {
      const parts = splitOnSilence(res.pcm, 1.5)
      writeFileSync(cachePath(lang, group[0].h), parts.length ? Buffer.concat(parts) : res.pcm)
      models[`${lang}/${group[0].h}`] = model
      return 1
    }
    const parts = splitInto(res.pcm, group.map((g) => g.text))
    if (parts) {
      parts.forEach((p, i) => {
        writeFileSync(cachePath(lang, group[i].h), p)
        models[`${lang}/${group[i].h}`] = model
      })
      return group.length
    }
    // split failed → halve the group
    console.warn(`  ${lang}: could not split batch of ${group.length}, halving`)
    const mid = Math.ceil(group.length / 2)
    await sleep(PAUSE)
    const a = await generateGroup(lang, group.slice(0, mid), models)
    if (a < 0) return a
    await sleep(PAUSE)
    const b = await generateGroup(lang, group.slice(mid), models)
    return b < 0 ? (a > 0 ? a : -1) : a + b
  }
}

function encode(lang: Lang, h: string) {
  const out = join(OUT, lang, `${h}.m4a`)
  if (existsSync(out)) return false
  execFileSync(ffmpegPath as unknown as string, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', cachePath(lang, h),
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.5,loudnorm=I=-18:TP=-2,apad=pad_dur=0.12',
    '-c:a', 'aac', '-b:a', '40k', '-ar', '24000', '-ac', '1', '-movflags', '+faststart', out,
  ])
  return true
}

async function main() {
  ensureDirs()
  if (!geminiKey() && !ENCODE_ONLY) throw new Error('GEMINI_API_KEY missing')
  const items = allAudioItems()
  const models: Record<string, string> = existsSync(MODELS_FILE) ? JSON.parse(readFileSync(MODELS_FILE, 'utf8')) : {}
  const manifest: { version: number; generated: string; sources: Record<string, string>; items: Record<string, Partial<Record<Lang, string>>> } = { version: 1, generated: '', sources: {}, items: {} }
  const todo: { lang: Lang; h: string; text: string; level: Level }[] = []
  const seen = new Set<string>()
  for (const it of items) {
    const level = levelOf(it.id)
    for (const lang of ALL) {
      const text = it.text[lang]
      const h = hashOf(lang, text)
      ;(manifest.items[it.id] ??= {})[lang] = `${lang}/${h}.m4a`
      const k = `${lang}:${h}`
      if (seen.has(k)) continue
      seen.add(k)
      if (!existsSync(cachePath(lang, h)) && !existsSync(join(OUT, lang, `${h}.m4a`))) todo.push({ lang, h, text, level })
    }
  }
  console.log(`${items.length} items × 4 · ${seen.size} unique clips · ${todo.length} still to synthesise`)

  if (!ENCODE_ONLY) {
    for (const level of LEVELS) {
      for (const lang of LANGS) {
        if (!currentModel(lang)) continue
        const list = todo.filter((t) => t.lang === lang && t.level === level).sort((a, b) => a.text.length - b.text.length)
        let i = 0
        while (i < list.length) {
          const len = list[i].text.length
          const size = len < 30 ? BATCH : len < 70 ? Math.max(1, Math.floor(BATCH / 2)) : Math.max(1, Math.floor(BATCH / 4))
          const group = list.slice(i, i + size)
          const n = await generateGroup(lang, group, models)
          writeFileSync(MODELS_FILE, JSON.stringify(models))
          if (n < 0) {
            console.warn(`  ${lang}: all TTS models exhausted for today`)
            break
          }
          i += group.length
          console.log(`  L${level} ${lang}: ${Math.min(i, list.length)}/${list.length} (${currentModel(lang)})`)
          encodeAll()
          await sleep(PAUSE)
        }
      }
    }
  }

  encodeAll()
  // remove orphaned files
  const used = new Set(Object.values(manifest.items).flatMap((x) => Object.values(x)))
  for (const lang of ALL) for (const f of readdirSync(join(OUT, lang))) if (!used.has(`${lang}/${f}`)) unlinkSync(join(OUT, lang, f))
  // Only reference files that exist: missing ones fall back to device speech at runtime.
  for (const m of Object.values(manifest.items)) for (const l of ALL) if (m[l] && !existsSync(join(OUT, m[l]!))) delete m[l]
  // --verified-only: publish only recordings confirmed by speech recognition (scripts/verify-audio.ts)
  if (args.includes('--verified-only')) {
    const dataDir = join(ROOT, 'scripts', 'data')
    const checked: Record<string, { ok: boolean }> = {}
    for (const f of readdirSync(dataDir).filter((x) => x.startsWith('audio-check') && x.endsWith('.json'))) {
      const part = JSON.parse(readFileSync(join(dataDir, f), 'utf8')) as Record<string, { ok: boolean }>
      for (const [k, r] of Object.entries(part)) if (!checked[k]?.ok) checked[k] = r // a confirmed ok wins over an older failure
    }
    for (const m of Object.values(manifest.items)) for (const l of ALL) if (m[l] && !checked[m[l]!]?.ok) delete m[l]
  }
  manifest.generated = new Date().toISOString()
  const usedModels = (l: Lang) => [...new Set(Object.entries(models).filter(([k]) => k.startsWith(`${l}/`)).map(([, v]) => v))].join(' + ')
  manifest.sources = Object.fromEntries(ALL.map((l) => [l, `Gemini TTS (${usedModels(l) || '–'}), voice ${VOICE[l]}${l === 'be' ? ', Berndeutsch-Anweisung' : ''}`]))
  writeFileSync(MANIFEST, JSON.stringify(manifest))

  // status per level/language for docs/PROGRESS.md
  const status: Record<string, { done: number; total: number }> = {}
  for (const it of items) {
    const lv = levelOf(it.id)
    for (const l of ALL) {
      const k = `L${lv} ${l}`
      status[k] ??= { done: 0, total: 0 }
      status[k].total++
      if (manifest.items[it.id][l]) status[k].done++
    }
  }
  writeFileSync(STATUS_FILE, JSON.stringify({ updated: manifest.generated, status }, null, 1))
  const total = Object.values(status).reduce((a, s) => a + s.total, 0)
  const done = Object.values(status).reduce((a, s) => a + s.done, 0)
  console.log(`audio ready: ${done}/${total} (item×language) – remaining ${total - done}`)
  for (const [k, s] of Object.entries(status).sort()) console.log(`  ${k}: ${s.done}/${s.total}`)
}

function encodeAll() {
  let n = 0
  for (const lang of ALL) for (const f of readdirSync(join(CACHE, lang))) if (f.endsWith('.pcm') && encode(lang, f.replace('.pcm', ''))) n++
  return n
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
void TTS_MODELS
