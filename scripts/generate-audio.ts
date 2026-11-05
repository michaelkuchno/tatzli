/**
 * Build-time pronunciation generator (run by the developer, never by the child).
 *
 *   npx tsx scripts/generate-audio.ts [--langs be,de,pl,en] [--limit N] [--batch 12] [--model gemini-2.5-flash-preview-tts]
 *
 * - Source of truth: every content item from content/index.ts (allAudioItems) × 4 languages.
 * - Engine: Gemini TTS (key from GEMINI_API_KEY). BE is requested explicitly as Bernese dialect.
 *   To save free-tier quota, several short texts are spoken in ONE request with long pauses and then
 *   split at the silences; if the number of segments does not match, the batch is retried item by item.
 * - Raw PCM is cached in .audio-cache/ (gitignored) so the script is resumable after quota limits.
 * - Output: public/audio/<lang>/<hash>.m4a (AAC mono, loudness-normalised, silence-trimmed) and
 *   public/audio/manifest.json mapping item id → file per language. Identical texts share one file.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'
import { allAudioItems } from '../content/index'
import type { Lang } from '../content/types'
import { geminiRaw, sleep } from './gemini-node'
import { TTS_STYLE } from '../src/lib/ai/ttsStyle'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = join(ROOT, '.audio-cache')
const OUT = join(ROOT, 'public', 'audio')
const MANIFEST = join(OUT, 'manifest.json')
const VOICE_VERSION = 'v1'

const args = process.argv.slice(2)
const arg = (k: string, d?: string) => {
  const i = args.indexOf(`--${k}`)
  return i >= 0 ? args[i + 1] : d
}
const LANGS = (arg('langs', 'be,de,pl,en') as string).split(',') as Lang[]
const LIMIT = Number(arg('limit', '100000'))
const BATCH = Number(arg('batch', '12'))
const MODEL = arg('model', process.env.GEMINI_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts') as string
const VOICE: Record<Lang, string> = { be: arg('voice-be', 'Sulafat')!, de: arg('voice-de', 'Sulafat')!, pl: arg('voice-pl', 'Sulafat')!, en: arg('voice-en', 'Sulafat')! }
const RATE = 24000

export const hashOf = (lang: Lang, text: string) => createHash('sha1').update(`${VOICE_VERSION}|${lang}|${text}`).digest('hex').slice(0, 12)
const cachePath = (lang: Lang, h: string) => join(CACHE, lang, `${h}.pcm`)

function ensureDirs() {
  for (const l of ['be', 'de', 'pl', 'en']) {
    mkdirSync(join(CACHE, l), { recursive: true })
    mkdirSync(join(OUT, l), { recursive: true })
  }
}

/** Split 16-bit PCM at silences ≥ minGap seconds. Returns PCM chunks with leading/trailing silence trimmed. */
export function splitOnSilence(pcm: Buffer, minGap = 0.6, threshold = 500): Buffer[] {
  const samples = pcm.length / 2
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
  // drop tiny blips (< 120 ms)
  return segs.filter(([a, b]) => (b - a) * win >= RATE * 0.12).map(([a, b]) => pcm.subarray(Math.max(0, a - 3) * win * 2, Math.min(samples, (b + 4) * win) * 2))
}

async function ttsRequest(text: string, lang: Lang): Promise<Buffer | null> {
  const res = (await geminiRaw(MODEL, {
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE[lang] } } } },
  })) as { candidates?: { content?: { parts?: { inlineData?: { data: string } }[] } }[] } | null
  const data = res?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data
  return data ? Buffer.from(data, 'base64') : null
}

const SEP: Record<Lang, string> = {
  be: 'Lies die folgenden Einträge nacheinander auf Berndeutsch (Berner Mundart). Mach nach jedem Eintrag eine lange Pause von zwei Sekunden. Lies keine Nummern vor, nur die Einträge:',
  de: 'Lies die folgenden Einträge nacheinander auf Hochdeutsch, warm und langsam für kleine Kinder. Nach jedem Eintrag zwei Sekunden Pause. Keine Nummern vorlesen:',
  pl: 'Przeczytaj kolejno poniższe wpisy po polsku, ciepło i powoli dla małych dzieci. Po każdym wpisie zrób dwusekundową pauzę. Nie czytaj numerów:',
  en: 'Read the following entries one after another in British English, warmly and slowly for small children. Pause for two seconds after each entry. Do not read the numbers:',
}

async function generateBatch(lang: Lang, texts: { h: string; text: string }[]): Promise<number> {
  if (texts.length > 1) {
    const prompt = `${SEP[lang]}\n\n${texts.map((t, i) => `${i + 1}. ${t.text}`).join('\n')}`
    const pcm = await ttsRequest(prompt, lang)
    if (!pcm) return -1
    const parts = splitOnSilence(pcm)
    if (parts.length === texts.length) {
      parts.forEach((p, i) => writeFileSync(cachePath(lang, texts[i].h), p))
      return texts.length
    }
    console.warn(`  ${lang}: batch split ${parts.length}≠${texts.length} – falling back to single requests`)
  }
  let n = 0
  for (const t of texts) {
    const pcm = await ttsRequest(`${TTS_STYLE[lang]}\n\n${t.text}`, lang)
    if (!pcm) return n === 0 ? -1 : n
    const parts = splitOnSilence(pcm, 1.2)
    writeFileSync(cachePath(lang, t.h), parts.length ? Buffer.concat(parts) : pcm)
    n++
    await sleep(1500)
  }
  return n
}

function encode(lang: Lang, h: string) {
  const out = join(OUT, lang, `${h}.m4a`)
  if (existsSync(out)) return
  execFileSync(ffmpegPath as unknown as string, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', cachePath(lang, h),
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.4,loudnorm=I=-18:TP=-2,apad=pad_dur=0.12',
    '-c:a', 'aac', '-b:a', '40k', '-ar', '24000', '-ac', '1', '-movflags', '+faststart', out,
  ])
}

async function main() {
  ensureDirs()
  const items = allAudioItems()
  const manifest: { version: number; generated: string; sources: Record<string, string>; items: Record<string, Partial<Record<Lang, string>>> } = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
    : { version: 1, generated: '', sources: {}, items: {} }
  const needed = new Map<string, { lang: Lang; h: string; text: string }>()
  for (const it of items) {
    for (const lang of ['be', 'de', 'pl', 'en'] as Lang[]) {
      const text = it.text[lang]
      const h = hashOf(lang, text)
      manifest.items[it.id] ??= {}
      manifest.items[it.id][lang] = `${lang}/${h}.m4a`
      if (LANGS.includes(lang) && !existsSync(cachePath(lang, h)) && !existsSync(join(OUT, lang, `${h}.m4a`))) needed.set(`${lang}:${h}`, { lang, h, text })
    }
  }
  // drop manifest entries for removed items
  const ids = new Set(items.map((i) => i.id))
  for (const k of Object.keys(manifest.items)) if (!ids.has(k)) delete manifest.items[k]

  const todo = [...needed.values()].slice(0, LIMIT)
  console.log(`${items.length} items · ${todo.length} clips to synthesise (model ${MODEL})`)
  for (const lang of LANGS) {
    // short texts batch well; long sentences go alone
    const ofLang = todo.filter((t) => t.lang === lang).sort((a, b) => a.text.length - b.text.length)
    let i = 0
    while (i < ofLang.length) {
      const size = ofLang[i].text.length < 25 ? BATCH : ofLang[i].text.length < 60 ? Math.max(1, Math.floor(BATCH / 2)) : 1
      const batch = ofLang.slice(i, i + size)
      const n = await generateBatch(lang, batch)
      if (n < 0) {
        console.warn('quota exhausted or error – stopping; run again later (cache is kept)')
        i = ofLang.length
        break
      }
      i += Math.max(n, batch.length)
      console.log(`  ${lang}: ${Math.min(i, ofLang.length)}/${ofLang.length}`)
      await sleep(Number(arg('pause', '7000')))
    }
  }

  // encode everything that is cached
  let encoded = 0
  for (const lang of ['be', 'de', 'pl', 'en'] as Lang[]) {
    for (const f of readdirSync(join(CACHE, lang))) {
      const h = f.replace('.pcm', '')
      if (!existsSync(join(OUT, lang, `${h}.m4a`))) {
        encode(lang, h)
        encoded++
      }
    }
  }
  // remove orphaned files
  const used = new Set(Object.values(manifest.items).flatMap((x) => Object.values(x)))
  for (const lang of ['be', 'de', 'pl', 'en']) for (const f of readdirSync(join(OUT, lang))) if (!used.has(`${lang}/${f}`)) unlinkSync(join(OUT, lang, f))

  manifest.generated = new Date().toISOString()
  manifest.sources = { be: `Gemini TTS ${MODEL} (Berndeutsch-Anweisung), voice ${VOICE.be}`, de: `Gemini TTS ${MODEL}, voice ${VOICE.de}`, pl: `Gemini TTS ${MODEL}, voice ${VOICE.pl}`, en: `Gemini TTS ${MODEL}, voice ${VOICE.en}` }
  writeFileSync(MANIFEST, JSON.stringify(manifest))
  const missing = Object.entries(manifest.items).flatMap(([id, m]) => (Object.entries(m) as [Lang, string][]).filter(([, f]) => !existsSync(join(OUT, f))).map(([l]) => `${id}:${l}`))
  console.log(`encoded ${encoded} new files · missing ${missing.length}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
