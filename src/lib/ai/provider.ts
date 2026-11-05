import type { Lang } from '@content/types'
import { loadApiKey } from './crypto'

export type AiErrorKind = 'offline' | 'rate' | 'auth' | 'invalid' | 'nokey' | 'other'
export class AiError extends Error {
  constructor(
    public kind: AiErrorKind,
    msg: string,
  ) {
    super(msg)
  }
}

export interface AiProvider {
  name: string
  json(prompt: string, model: string): Promise<unknown>
  tts(text: string, lang: Lang, model: string): Promise<Blob>
  models(): Promise<string[]>
}

const API = 'https://generativelanguage.googleapis.com/v1beta'

export { TTS_STYLE, TTS_VOICE } from './ttsStyle'
import { TTS_STYLE, TTS_VOICE } from './ttsStyle'

/** Wrap raw 16-bit little-endian mono PCM in a WAV container. */
export function pcmToWav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const out = new Uint8Array(44 + pcm.length)
  const v = new DataView(out.buffer)
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF')
  v.setUint32(4, 36 + pcm.length, true)
  w(8, 'WAVE')
  w(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, rate, true)
  v.setUint32(28, rate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  w(36, 'data')
  v.setUint32(40, pcm.length, true)
  out.set(pcm, 44)
  return out
}

export class GeminiProvider implements AiProvider {
  name = 'gemini'
  private async key() {
    const k = await loadApiKey()
    if (!k) throw new AiError('nokey', 'no API key')
    return k
  }
  private async call(model: string, body: unknown): Promise<{ candidates?: { content?: { parts?: { text?: string; inlineData?: { data: string; mimeType: string } }[] } }[] }> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new AiError('offline', 'offline')
    let r: Response
    try {
      r = await fetch(`${API}/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': await this.key() },
        body: JSON.stringify(body),
      })
    } catch (e) {
      if (e instanceof AiError) throw e
      throw new AiError('offline', 'network error')
    }
    if (r.status === 429) throw new AiError('rate', await r.text())
    if (r.status === 401 || r.status === 403) throw new AiError('auth', await r.text())
    if (!r.ok) throw new AiError('other', `${r.status} ${(await r.text()).slice(0, 200)}`)
    return r.json()
  }
  async json(prompt: string, model: string) {
    const res = await this.call(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    })
    const text = res.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    try {
      return JSON.parse(text)
    } catch {
      throw new AiError('invalid', 'model returned invalid JSON')
    }
  }
  async tts(text: string, lang: Lang, model: string) {
    const res = await this.call(model, {
      contents: [{ role: 'user', parts: [{ text: `${TTS_STYLE[lang]}\n\n${text}` }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE[lang] } } } },
    })
    const data = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data
    if (!data) throw new AiError('invalid', 'no audio returned')
    const pcm = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    const wav = pcmToWav(pcm)
    return new Blob([wav.buffer as ArrayBuffer], { type: 'audio/wav' })
  }
  async models() {
    const r = await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': await this.key() } })
    if (r.status === 429) throw new AiError('rate', 'rate limited')
    if (!r.ok) throw new AiError(r.status === 400 || r.status === 403 ? 'auth' : 'other', String(r.status))
    const j = (await r.json()) as { models: { name: string; supportedGenerationMethods?: string[] }[] }
    return j.models.filter((m) => m.supportedGenerationMethods?.includes('generateContent')).map((m) => m.name.replace('models/', ''))
  }
}

let override: AiProvider | null = null
/** Tests / E2E can install a fake provider (window.__tatzliFakeAi = true or setProvider). */
export function setProvider(p: AiProvider | null) {
  override = p
}
export function provider(): AiProvider {
  if (override) return override
  if (typeof window !== 'undefined' && (window as unknown as { __tatzliFakeAi?: boolean }).__tatzliFakeAi) return new FakeProvider()
  return new GeminiProvider()
}

/** Deterministic offline provider for tests. */
export class FakeProvider implements AiProvider {
  name = 'fake'
  async json(prompt: string): Promise<unknown> {
    if (prompt.includes('TASK:QC')) return { ok: true, notes: 'Altersgerecht, keine problematischen Inhalte.', translationIssues: [] }
    if (prompt.includes('TASK:BECHECK')) return { items: [{ id: 'x', bernese: true, issues: '' }] }
    if (prompt.includes('TASK:IDEAS'))
      return { ideas: [{ pl: 'Policzcie razem jabłka w kuchni po berneńsku: eis, zwöi, drü!', de: 'Zählt zusammen Äpfel in der Küche auf Berndeutsch: eis, zwöi, drü!', en: 'Count apples in the kitchen in Bernese together: eis, zwöi, drü!', be: 'Eis, zwöi, drü Öpfu!' }] }
    if (prompt.includes('TASK:VARIANTS'))
      return {
        phrases: [{ be: '[D Chatz]1 [isch]2 [im Garte]3.', de: '[Die Katze]1 [ist]2 [im Garten]3.', pl: '[Kot]1 [jest]2 [w ogrodzie]3.', en: '[The cat]1 [is]2 [in the garden]3.' }],
      }
    return {
      title: { be: 'Tatzli im Garte', de: 'Tatzli im Garten', pl: 'Tatzli w ogrodzie', en: 'Tatzli in the garden' },
      words: ['chatz', 'bluem'],
      pages: [
        {
          scene: { place: 'garden', items: [{ key: 'tatzli', x: 30, y: 85 }, { key: 'chatz', x: 65, y: 85 }] },
          text: { be: '[Tatzli]1 [gseht]2 [d Chatz]3.', de: '[Tatzli]1 [sieht]2 [die Katze]3.', pl: '[Tatzli]1 [widzi]2 [kota]3.', en: '[Tatzli]1 [sees]2 [the cat]3.' },
        },
        {
          scene: { place: 'garden', items: [{ key: 'chatz', x: 40, y: 85 }, { key: 'bluem', x: 70, y: 85 }] },
          text: { be: '[D Chatz]1 [schmöckt]2 [a dr Bluem]3.', de: '[Die Katze]1 [riecht]2 [an der Blume]3.', pl: '[Kot]1 [wącha]2 [kwiatek]3.', en: '[The cat]1 [smells]2 [the flower]3.' },
        },
      ],
      parentQuestions: [{ pl: 'Zapytaj: Wo isch d Chatz?', de: 'Frag: Wo isch d Chatz?', en: 'Ask: Wo isch d Chatz?' }],
      offscreen: { pl: 'Poszukajcie kwiatka na spacerze.', de: 'Sucht beim Spaziergang eine Blume.', en: 'Look for a flower on a walk.' },
    }
  }
  async tts(): Promise<Blob> {
    // 0.2 s of silence
    const wav = pcmToWav(new Uint8Array(9600))
    return new Blob([wav.buffer as ArrayBuffer], { type: 'audio/wav' })
  }
  async models() {
    return ['fake-model']
  }
}
