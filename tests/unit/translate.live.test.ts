import 'fake-indexeddb/auto'
import { describe, expect, it, beforeAll } from 'vitest'
import type { Lang } from '@content/types'
import { setProvider, AiError, type AiProvider } from '@/lib/ai/provider'
import { translate } from '@/lib/ai/translate'
import { checkBernese } from '@/lib/beRules'

/**
 * Real Gemini round trip – runs only with TATZLI_LIVE=1 and GEMINI_API_KEY set (never in CI):
 *   TATZLI_LIVE=1 npx vitest run tests/unit/translate.live.test.ts
 * Every source language → the three others (12 directions), plus an independent model review of each result.
 */
const LIVE = !!process.env.TATZLI_LIVE && !!process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-3.5-flash'

async function gemini(prompt: string, model: string, temperature = 0.3): Promise<unknown> {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature } }),
    })
    if (r.status === 429 || r.status >= 500) {
      await new Promise((s) => setTimeout(s, 4000 * (i + 1)))
      continue
    }
    if (!r.ok) throw new AiError('other', `${r.status} ${(await r.text()).slice(0, 200)}`)
    const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    return JSON.parse(j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '{}')
  }
  throw new AiError('rate', 'rate')
}

const live: AiProvider = { name: 'gemini-live', json: (p, m) => gemini(p, m), tts: async () => new Blob(), models: async () => [MODEL] }

const CASES: { text: string; lang: Lang; expect: Partial<Record<Lang, RegExp>> }[] = [
  { text: 'Guten Morgen! Wir gehen heute in den Zoo.', lang: 'de', expect: { pl: /dzień dobry/i, en: /good morning/i, be: /morge/i } },
  { text: 'Kannst du mir bitte helfen? Ich habe Hunger.', lang: 'de', expect: { pl: /pomó|pomoż/i, en: /help/i, be: /hunger/i } },
  { text: 'Dzień dobry! Idziemy dziś do zoo.', lang: 'pl', expect: { de: /guten (morgen|tag)/i, en: /good (morning|day)|hello/i, be: /morge|tag|grüess/i } },
  { text: 'Mama, gdzie są moje buty? Chcę iść na plac zabaw.', lang: 'pl', expect: { de: /schuhe/i, en: /shoes/i, be: /schue/i } },
  { text: 'Good morning! Today we are going to the zoo.', lang: 'en', expect: { de: /guten morgen/i, pl: /dzień dobry/i, be: /morge/i } },
  { text: 'The little bear is tired and wants to sleep.', lang: 'en', expect: { de: /bär/i, pl: /miś|niedźwi/i, be: /bär/i } },
  { text: 'Guete Morge! Hüt gö mir i Zoo.', lang: 'be', expect: { de: /guten morgen/i, pl: /dzień dobry/i, en: /good morning/i } },
  { text: 'D Chatz isch im Garte und spiut mit em Bau.', lang: 'be', expect: { de: /katze/i, pl: /kot/i, en: /cat/i } },
  { text: 'Chasch mer bitte häufe? I ha Hunger.', lang: 'be', expect: { de: /helfen/i, pl: /pomó|pomoż/i, en: /help/i } },
]

const review = (src: string, r: Record<Lang, string>) =>
  [
    'Du prüfst Übersetzungen für eine Kinder-Sprach-App. Ausgangstext und Übersetzungen:',
    JSON.stringify({ source: src, ...r }),
    'Prüfe: 1) Haben alle vier Texte dieselbe Bedeutung (nichts fehlt, nichts erfunden)? 2) Sind Deutsch, Polnisch, Englisch grammatisch korrekt und natürlich?',
    '3) Ist "be" echtes Berndeutsch (Stadt Bern), nicht Zürichdeutsch und nicht Hochdeutsch? Kleine Schreibvarianten sind ok.',
    'Antworte NUR mit JSON {"meaning":true|false,"grammar":true|false,"bernese":true|false,"problems":["…"]}. meaning = alle vier sagen dasselbe; grammar = de/pl/en korrekt und natürlich; bernese = be ist Berndeutsch. false nur bei echten Fehlern.',
  ].join('\n')

describe.skipIf(!LIVE)('translator – live Gemini', () => {
  beforeAll(() => setProvider(live))
  for (const c of CASES)
    it(`${c.lang}: «${c.text}»`, { timeout: 180_000 }, async () => {
      const r = await translate(c.text, 'auto', MODEL)
      const rv = (await gemini(review(c.lang, r.text), MODEL, 0)) as { meaning: boolean; grammar: boolean; bernese: boolean; problems: string[] }
      console.log(`[${c.lang}→] detected=${r.source} | be: ${r.text.be} | de: ${r.text.de} | pl: ${r.text.pl} | en: ${r.text.en} | BE ${r.be.confidence} ${r.be.issues.join('; ')} | review meaning=${rv.meaning} grammar=${rv.grammar} bernese=${rv.bernese} ${rv.problems?.join('; ') ?? ''}`)
      expect(r.source).toBe(c.lang)
      expect(r.text[c.lang]).toBe(c.text)
      for (const [l, re] of Object.entries(c.expect)) expect(r.text[l as Lang]).toMatch(re!)
      // the Bernese output must not contain forms the rule checker rejects (Zurich/Standard German)
      if (c.lang !== 'be') expect(checkBernese(r.text.be).filter((h) => h.severity === 'error')).toEqual([])
      // meaning and de/pl/en grammar must hold; the Bernese verdict of a second model is reported (it is the noisier judge –
      // Bernese is guarded by the rule checker above and the in-app confidence badge)
      expect(rv.meaning && rv.grammar, rv.problems?.join('; ')).toBe(true)
      if (c.lang !== 'be') expect(r.be.confidence, r.be.issues.join('; ')).not.toBe('low')
    })
})
