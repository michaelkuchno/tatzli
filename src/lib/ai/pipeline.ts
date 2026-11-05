import { z } from 'zod'
import type { Lang, Level, PlaceId, Story } from '@content/types'
import { LANGS } from '@content/types'
import { WORDS, WORD_BY_ID } from '../content'
import { validateAlignment, plain } from '../align'
import { checkBernese } from '../beRules'
import { db, type AiItem } from '../db'
import { provider, AiError } from './provider'
import { hasIllu } from '@/illustrations/registry'

// ---------- schema ----------
const L4 = z.object({ be: z.string().min(1), de: z.string().min(1), pl: z.string().min(1), en: z.string().min(1) })
const UI3 = z.object({ pl: z.string(), de: z.string(), en: z.string() })
const PLACES = ['home', 'kitchen', 'room', 'garden', 'quarry', 'bus', 'zytglogge', 'baerepark', 'aare', 'gurten', 'zoo', 'market', 'chindsgi', 'school', 'playground'] as const
const Item = z.object({ key: z.string(), x: z.number().min(0).max(100), y: z.number().min(0).max(100), scale: z.number().optional(), pose: z.string().optional() })
export const AiStorySchema = z.object({
  title: L4,
  words: z.array(z.string()).min(1),
  pages: z
    .array(
      z.object({
        scene: z.object({ place: z.enum(PLACES), items: z.array(Item).max(6) }),
        text: L4,
      }),
    )
    .min(2)
    .max(8),
  parentQuestions: z.array(UI3).min(1),
  offscreen: UI3,
})
export type AiStory = z.infer<typeof AiStorySchema>

const FORBIDDEN = 'Gewalt, Waffen, Tod, Monster, Angst, Gefahr ohne Erwachsene, Verletzungen, Krankheit, Streit ohne Versöhnung, Werbung, Marken, Süssigkeiten als Belohnung, Social Media, Bildschirme, Nacktheit, Religion als Bekehrung, Politik'

const KEYS_HINT = () =>
  [
    'tatzli (Pose optional: jump, clap, wave, sit, dance, sleep, eat, run, walk, look, hug, read, build, swim, sing)',
    'mami-baer, papi-baer, grosi-baer, grossaetti-baer, lotti, bebe-baer, kasia (Eichhörnchen aus Polen), freddie (Fuchs aus England), tante-ottilie (Eule, spricht Hochdeutsch)',
    `Wörter (Bild vorhanden): ${WORDS.filter((w) => w.cat !== 'verbs' && w.cat !== 'numbers').map((w) => w.id).join(', ')}`,
  ].join('\n')

export interface SceneRequest {
  place: PlaceId
  level: Level
  length: 'short' | 'medium' | 'long'
  topicWords: string[]
  theme?: string
}

/** Build the generation prompt. Contains no child data (no names, ages with dates, recordings, progress). */
export function scenePrompt(r: SceneRequest): string {
  const pages = r.length === 'short' ? 3 : r.length === 'medium' ? 4 : 6
  const known = r.topicWords
    .map((id) => WORD_BY_ID[id])
    .filter(Boolean)
    .map((w) => `${w.id}: ${w.text.be} = ${w.text.de}`)
    .join('; ')
  return `TASK:SCENE
Du schreibst für eine Sprachlern-App (Kinder ${r.level === 1 ? '2–3' : r.level === 2 ? '4–5' : '6–7'} Jahre) eine neue, kurze, warme Mini-Geschichte mit ${pages} Seiten.
Hauptfigur: Tatzli, ein kleiner Bär aus Ostermundigen bei Bern. Ort: ${r.place}. ${r.theme ? `Thema: ${r.theme}.` : ''}
Sprachen: Berndeutsch (be, Berner Mundart, NICHT Zürichdeutsch: i gange, mir göh, geit, chunnt, sy, hei, chly, Giel, Meitschi, Grüessech, l-Vokalisierung als u geschrieben: Wäut, Miuch, Vogu, viu; Artikel dr/d/ds), Hochdeutsch (de), Polnisch (pl), Englisch (en).
Benutze bevorzugt diese bereits geprüften Wörter (genau diese berndeutsche Form): ${known}.
Sätze: ${r.level === 1 ? '3–5 Wörter' : r.level === 2 ? '4–7 Wörter' : '5–10 Wörter'}, konkret, Bedeutung aus dem Bild ersichtlich.
Ausrichtung: markiere in jeder Sprache bedeutungsgleiche Phrasen mit [Text]N (gleiche Nummer N in allen vier Sprachen; [Text]1+2 wenn eine Phrase zwei Gruppen abdeckt). Jede Nummer muss in allen vier Sprachen vorkommen.
Szene: place aus (${PLACES.join(', ')}); items: höchstens 5, key nur aus dieser Liste:
${KEYS_HINT()}
x,y in Prozent (Fusspunkt), Boden y 75–90.
Verboten: ${FORBIDDEN}. Nichts Unheimliches. Keine echten Personennamen ausser den Figuren.
Gib NUR JSON in diesem Schema zurück:
{"title":{"be","de","pl","en"},"words":[Wort-IDs],"pages":[{"scene":{"place","items":[{"key","x","y"}]},"text":{"be","de","pl","en"}}],"parentQuestions":[{"pl","de","en"}],"offscreen":{"pl","de","en"}}`
}

export function validateStory(raw: unknown): { story?: AiStory; problems: string[] } {
  const p = AiStorySchema.safeParse(raw)
  if (!p.success) return { problems: p.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  const problems: string[] = []
  const s = p.data
  for (const [i, pg] of s.pages.entries()) {
    for (const pr of validateAlignment(pg.text)) problems.push(`page ${i}: ${pr}`)
    pg.scene.items = pg.scene.items.filter((it) => hasIllu(WORD_BY_ID[it.key]?.illu ?? it.key))
  }
  s.words = s.words.filter((w) => WORD_BY_ID[w])
  return { story: s, problems }
}

/** BE control identical in spirit to the build-time pipeline: rules + second model check + vocabulary preference. */
export async function beCheck(texts: string[], model: string): Promise<{ confidence: 'high' | 'medium' | 'low'; issues: string[] }> {
  const issues: string[] = []
  for (const t of texts) for (const h of checkBernese(t)) if (h.severity === 'error') issues.push(`${t}: ${h.word} – ${h.hint}`)
  const verified = new Set(WORDS.map((w) => w.text.be.toLowerCase().replace(/^(dr|d|ds)\s+/, '')))
  const tokens = texts.join(' ').toLowerCase().replace(/[.,!?…]/g, ' ').split(/\s+/).filter((x) => x.length > 2)
  const coverage = tokens.length ? tokens.filter((x) => verified.has(x)).length / tokens.length : 0
  let modelOk = true
  try {
    const res = (await provider().json(
      `TASK:BECHECK\nDu bist Dialektologe für Berndeutsch (Stadt Bern). Prüfe diese Sätze auf nicht-berndeutsche Formen (z. B. Zürichdeutsch), falsche Grammatik oder unpassende Wörter. Antworte NUR JSON {"items":[{"id":"…","bernese":true|false,"issues":"…"}]}.\n${JSON.stringify(texts.map((t, i) => ({ id: String(i), be: t })))}`,
      model,
    )) as { items?: { bernese: boolean; issues: string }[] }
    for (const it of res.items ?? []) if (!it.bernese) {
      modelOk = false
      issues.push(it.issues)
    }
  } catch (e) {
    if (e instanceof AiError && (e.kind === 'offline' || e.kind === 'rate')) throw e
    issues.push('second check unavailable')
  }
  const confidence = issues.some((i) => i.includes('–')) ? 'low' : !modelOk ? 'low' : coverage >= 0.25 ? 'high' : 'medium'
  return { confidence, issues }
}

export async function qualityCheck(story: AiStory, model: string): Promise<{ ok: boolean; notes: string }> {
  const res = (await provider().json(
    `TASK:QC\nPrüfe diese Kinder-Geschichte (Zielgruppe 2–7 Jahre) auf: Altersangemessenheit, nichts Unheimliches oder Gefährliches, Konsistenz der vier Übersetzungen (be/de/pl/en). Antworte NUR JSON {"ok":true|false,"notes":"kurz auf Deutsch","translationIssues":["…"]}.\n${JSON.stringify(story.pages.map((p) => p.text))}`,
    model,
  )) as { ok?: boolean; notes?: string; translationIssues?: string[] }
  return { ok: !!res.ok, notes: [res.notes ?? '', ...(res.translationIssues ?? [])].filter(Boolean).join(' · ') }
}

/** Generate → validate (retry) → BE check → QC → queue (pending). The child never sees it before approval. */
export async function generateScene(req: SceneRequest, model: string): Promise<number> {
  let story: AiStory | undefined
  let problems: string[] = []
  for (let attempt = 0; attempt < 3 && !story; attempt++) {
    const raw = await provider().json(scenePrompt(req) + (problems.length ? `\nKorrigiere diese Fehler: ${problems.join('; ')}` : ''), model)
    const v = validateStory(raw)
    if (v.story && v.problems.length === 0) story = v.story
    else problems = v.problems
  }
  if (!story) throw new AiError('invalid', problems.join('; '))
  const be = await beCheck(
    story.pages.map((p) => plain(p.text.be)),
    model,
  )
  const qc = await qualityCheck(story, model)
  return db.aiQueue.add({
    kind: 'scene',
    status: 'pending',
    createdAt: Date.now(),
    request: { ...req },
    payload: story,
    qc: { ok: qc.ok, notes: qc.notes, beIssues: be.issues },
    beConfidence: be.confidence,
  } as AiItem) as Promise<number>
}

/** Variants: new aligned sentences reusing the same words (freshness for repetition). */
export async function generateVariants(topicWords: string[], level: Level, model: string): Promise<number> {
  const known = topicWords.map((id) => WORD_BY_ID[id]).filter(Boolean).map((w) => `${w.text.be} = ${w.text.de}`).join('; ')
  const raw = (await provider().json(
    `TASK:VARIANTS\nSchreibe 5 neue kurze Sätze für Kinder (${level === 1 ? '2–3' : level === 2 ? '4–5' : '6–7'} J.) mit diesen Wörtern: ${known}. Je Satz be (Berndeutsch, Berner Mundart), de, pl, en mit Ausrichtung [Text]N wie: {"be":"[I]1 [gange]2 [id Chindsgi]3.","de":"[Ich]1 [gehe]2 [in den Kindergarten]3.","pl":"[Idę]1+2 [do przedszkola]3.","en":"[I]1 [go]2 [to kindergarten]3."}. Verboten: ${FORBIDDEN}. NUR JSON {"phrases":[…]}`,
    model,
  )) as { phrases?: unknown[] }
  const phrases = z.array(L4).safeParse(raw.phrases ?? [])
  if (!phrases.success) throw new AiError('invalid', 'variants invalid')
  const good = phrases.data.filter((p) => validateAlignment(p).length === 0)
  const be = await beCheck(
    good.map((p) => plain(p.be)),
    model,
  )
  return db.aiQueue.add({
    kind: 'variant',
    status: 'pending',
    createdAt: Date.now(),
    request: { topicWords, level },
    payload: { phrases: good },
    qc: { ok: good.length > 0, notes: `${good.length}/${phrases.data.length} valid`, beIssues: be.issues },
    beConfidence: be.confidence,
  } as AiItem) as Promise<number>
}

export async function generateIdeas(season: string, level: Level, model: string): Promise<number> {
  const raw = (await provider().json(
    `TASK:IDEAS\nGib 5 kurze Spielideen ohne Bildschirm für Eltern (Kind ${level === 1 ? '2–3' : level === 2 ? '4–5' : '6–7'} J., Jahreszeit ${season}, Raum Bern), die Berndeutsch-Wörter im Alltag üben (Küche, Einkauf, Spaziergang, Bus). Je Idee pl/de/en und ein berndeutscher Satz (be). NUR JSON {"ideas":[{"pl","de","en","be"}]}`,
    model,
  )) as { ideas?: unknown[] }
  const ideas = z.array(z.object({ pl: z.string(), de: z.string(), en: z.string(), be: z.string() })).safeParse(raw.ideas ?? [])
  if (!ideas.success) throw new AiError('invalid', 'ideas invalid')
  const be = await beCheck(
    ideas.data.map((i) => i.be),
    model,
  )
  return db.aiQueue.add({ kind: 'idea', status: 'pending', createdAt: Date.now(), request: { season, level }, payload: ideas.data, qc: { ok: true, notes: '', beIssues: be.issues }, beConfidence: be.confidence } as AiItem) as Promise<number>
}

/** Pronunciation for an AI item in all 4 languages (stored locally). Missing ones fall back to device TTS. */
export async function generateAudio(item: AiItem, ttsModel: string, onProgress?: (d: number, t: number) => void): Promise<number> {
  const jobs: { key: string; text: string; lang: Lang }[] = []
  if (item.kind === 'scene') {
    const s = item.payload as AiStory
    s.pages.forEach((p, i) => {
      for (const l of LANGS) jobs.push({ key: `ai.q${item.id}.${i}:${l}`, text: plain(p.text[l]), lang: l })
    })
  } else if (item.kind === 'variant') {
    const ps = (item.payload as { phrases: Record<Lang, string>[] }).phrases
    ps.forEach((p, i) => {
      for (const l of LANGS) jobs.push({ key: `aiv.${item.id}.${i}:${l}`, text: plain(p[l]), lang: l })
    })
  }
  let ok = 0
  for (const [n, j] of jobs.entries()) {
    try {
      if (!(await db.aiAudio.get(j.key))) {
        const blob = await provider().tts(j.text, j.lang, ttsModel)
        await db.aiAudio.put({ key: j.key, blob })
      }
      ok++
    } catch (e) {
      if (e instanceof AiError && (e.kind === 'rate' || e.kind === 'offline')) break
    }
    onProgress?.(n + 1, jobs.length)
  }
  await db.aiQueue.update(item.id!, { audioReady: ok === jobs.length })
  return ok
}

export function aiStoryToStory(item: AiItem): Story {
  const s = item.payload as AiStory
  return {
    id: `q${item.id}`,
    title: s.title,
    level: ((item.request.level as Level) ?? 2) as Level,
    place: s.pages[0].scene.place,
    words: s.words,
    pages: s.pages.map((p, i) => ({ scene: { place: p.scene.place, items: p.scene.items.map((it) => ({ ...it, pose: it.pose as Story['pages'][number]['scene']['items'][number]['pose'] })) }, text: p.text, end: i === s.pages.length - 1 })),
  }
}

export function aiErrorMessage(e: unknown): 'offlineNoAi' | 'rateLimited' | 'keyBad' | null {
  if (e instanceof AiError) {
    if (e.kind === 'offline') return 'offlineNoAi'
    if (e.kind === 'rate') return 'rateLimited'
    if (e.kind === 'auth' || e.kind === 'nokey') return 'keyBad'
  }
  return null
}
