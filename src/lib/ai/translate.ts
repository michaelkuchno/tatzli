import { z } from 'zod'
import type { Lang } from '@content/types'
import { LANGS } from '@content/types'
import { validateAlignment, plain } from '../align'
import { db, type AiItem } from '../db'
import { provider, AiError } from './provider'
import { beCheck } from './pipeline'

/**
 * Translator for grown-ups: free text in any of the four languages (including Bärndütsch) → the other three.
 * Online only (Gemini). The Bernese result gets the same control as all AI content: rule check + second model check.
 * Results are text; a voice is only an explicitly marked, unverified AI voice (setting), never mixed with the verified recordings.
 */
export const TRANSLATE_MAX = 600
export type SourceLang = Lang | 'auto'

const Aligned = z.object({ source: z.enum(['be', 'de', 'pl', 'en']), be: z.string().min(1), de: z.string().min(1), pl: z.string().min(1), en: z.string().min(1) })

export interface Translation {
  source: Lang
  /** plain text per language (the source language = the input, unchanged) */
  text: Record<Lang, string>
  /** aligned notation ([chunk]N) for the approval queue / child view */
  aligned: Record<Lang, string>
  be: { confidence: 'high' | 'medium' | 'low'; issues: string[] }
}

const NAMES: Record<Lang, string> = { be: 'Berndeutsch (Berner Mundart, Stadt Bern)', de: 'Hochdeutsch', pl: 'Polnisch', en: 'Englisch (britisch)' }

export function translatePrompt(input: string, from: SourceLang): string {
  return [
    'TASK:TRANSLATE',
    'Du bist ein sorgfältiger Übersetzer für eine Sprachlern-App für Kinder (2–7 Jahre) und ihre Familie.',
    from === 'auto'
      ? 'Erkenne die Sprache des Textes: be = Berndeutsch / Schweizerdeutsch (z. B. «isch», «gsi», «chli», «Chindsgi», «dr», «ds»), de = Hochdeutsch, pl = Polnisch, en = Englisch.'
      : `Der Text ist ${NAMES[from]} (source = "${from}").`,
    'Übersetze ihn natürlich und kindgerecht in alle vier Sprachen. Die Ausgangssprache bleibt WÖRTLICH unverändert (keine Korrektur).',
    'Berndeutsch: echte Berner Mundart der Stadt Bern – l-Vokalisierung («Schueu», «Stueu», «Miuch»), «gsi», «nid», «i gange», «mir», Artikel «dr / d / ds», «Grosi», «Chindsgi». Kein Zürichdeutsch (nicht «gsii», «mer», «Schuel»), kein Hochdeutsch.',
    'Markiere einander entsprechende Satzteile in allen vier Sprachen mit derselben Nummer: [Teil]N, zusammengesetzte Entsprechung [Teil]1+2. Satzzeichen ausserhalb der Klammern. Beispiel:',
    '{"source":"de","be":"[I]1 [gange]2 [id Chindsgi]3.","de":"[Ich]1 [gehe]2 [in den Kindergarten]3.","pl":"[Idę]1+2 [do przedszkola]3.","en":"[I]1 [go]2 [to kindergarten]3."}',
    'Antworte NUR mit JSON {"source":"be|de|pl|en","be":"…","de":"…","pl":"…","en":"…"}.',
    '',
    `TEXT: ${JSON.stringify(input)}`,
  ].join('\n')
}

const norm = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([.,!?;:…])/g, '$1').trim().toLowerCase()

export async function translate(input: string, from: SourceLang, model: string): Promise<Translation> {
  const text = input.trim().slice(0, TRANSLATE_MAX)
  if (!text) throw new AiError('invalid', 'empty')
  let parsed: z.infer<typeof Aligned> | null = null
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    const raw = await provider().json(translatePrompt(text, from), model)
    const r = Aligned.safeParse(raw)
    if (r.success) parsed = r.data
  }
  if (!parsed) throw new AiError('invalid', 'translation invalid')
  const source: Lang = from === 'auto' ? parsed.source : from
  let aligned: Record<Lang, string> = { be: parsed.be, de: parsed.de, pl: parsed.pl, en: parsed.en }
  // the input stays exactly as typed; broken alignment → one block per language (still a correct translation)
  const srcChanged = norm(plain(aligned[source])) !== norm(text)
  if (srcChanged || validateAlignment(aligned).length) {
    aligned = Object.fromEntries(LANGS.map((l) => [l, `[${l === source ? text : plain(aligned[l])}]1`])) as Record<Lang, string>
  }
  const out = Object.fromEntries(LANGS.map((l) => [l, plain(aligned[l])])) as Record<Lang, string>
  const be = await beCheck([out.be], model)
  return { source, text: out, aligned, be }
}

/** Hand a translation to the approval queue (it reaches the child only after a grown-up approves it). */
export function queueTranslation(tr: Translation): Promise<number> {
  return db.aiQueue.add({
    kind: 'variant',
    status: 'pending',
    createdAt: Date.now(),
    request: { source: tr.source, translator: true },
    payload: { phrases: [tr.aligned] },
    qc: { ok: true, notes: 'Übersetzer', beIssues: tr.be.issues },
    beConfidence: tr.be.confidence,
  } as AiItem) as Promise<number>
}
