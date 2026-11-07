import 'fake-indexeddb/auto'
import { describe, expect, it, beforeAll } from 'vitest'
import type { Lang } from '@content/types'
import { setProvider, AiError, type AiProvider } from '@/lib/ai/provider'
import { translate } from '@/lib/ai/translate'
import { checkBernese } from '@/lib/beRules'

/**
 * Real Gemini round trip – runs only with TATZLI_LIVE=1 and GEMINI_API_KEY set (never in CI):
 *   TATZLI_LIVE=1 npx vitest run tests/unit/translate.live.test.ts
 */
const LIVE = !!process.env.TATZLI_LIVE && !!process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-3.5-flash'

const live: AiProvider = {
  name: 'gemini-live',
  async json(prompt, model) {
    for (let i = 0; i < 4; i++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3 } }),
      })
      if (r.status === 429 || r.status >= 500) {
        await new Promise((s) => setTimeout(s, 4000 * (i + 1)))
        continue
      }
      if (!r.ok) throw new AiError('other', String(r.status))
      const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return JSON.parse(j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '{}')
    }
    throw new AiError('rate', 'rate')
  },
  tts: async () => new Blob(),
  models: async () => [MODEL],
}

const CASES: { text: string; lang: Lang; expect: Partial<Record<Lang, RegExp>> }[] = [
  { text: 'Guten Morgen! Wir gehen heute in den Zoo.', lang: 'de', expect: { pl: /dzień dobry/i, en: /good morning/i, be: /morge/i } },
  { text: 'Dzień dobry! Idziemy dziś do zoo.', lang: 'pl', expect: { de: /guten morgen/i, en: /good morning/i, be: /morge/i } },
  { text: 'Good morning! Today we are going to the zoo.', lang: 'en', expect: { de: /guten morgen/i, pl: /dzień dobry/i, be: /morge/i } },
  { text: 'Guete Morge! Hüt gö mir i Zoo.', lang: 'be', expect: { de: /guten morgen/i, pl: /dzień dobry/i, en: /good morning/i } },
  { text: 'D Chatz isch im Garte und spiut mit em Bau.', lang: 'be', expect: { de: /katze/i, pl: /kot/i, en: /cat/i } },
]

describe.skipIf(!LIVE)('translator – live Gemini', () => {
  beforeAll(() => setProvider(live))
  for (const c of CASES)
    it(`${c.lang}: «${c.text}»`, { timeout: 120_000 }, async () => {
      const r = await translate(c.text, 'auto', MODEL)
      console.log(`[${c.lang}→] detected=${r.source} | be: ${r.text.be} | de: ${r.text.de} | pl: ${r.text.pl} | en: ${r.text.en} | BE ${r.be.confidence} ${r.be.issues.join('; ')}`)
      expect(r.source).toBe(c.lang)
      expect(r.text[c.lang]).toBe(c.text)
      for (const [l, re] of Object.entries(c.expect)) expect(r.text[l as Lang]).toMatch(re!)
      // the Bernese output must not contain forms the rule checker rejects (Zurich/Standard German)
      if (c.lang !== 'be') expect(checkBernese(r.text.be).filter((h) => h.severity === 'error')).toEqual([])
    })
})
