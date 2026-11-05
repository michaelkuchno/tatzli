/** Minimal Gemini REST helpers for build-time scripts (Node 18+ fetch). Key only from env, never stored. */
import { execSync } from 'node:child_process'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function geminiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  if (process.platform === 'win32') {
    try {
      const v = execSync(`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User')"`, { encoding: 'utf8' }).trim()
      if (v) return v
    } catch {
      /* ignore */
    }
  }
  return undefined
}

export const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash'
const API = 'https://generativelanguage.googleapis.com/v1beta'

export async function geminiRaw(model: string, body: unknown, tries = 6): Promise<unknown | null> {
  const key = geminiKey()
  if (!key) throw new Error('GEMINI_API_KEY missing')
  let wait = 8000
  for (let t = 0; t < tries; t++) {
    const r = await fetch(`${API}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })
    if (r.ok) return r.json()
    const txt = await r.text()
    if (r.status === 429 || r.status >= 500) {
      const m = txt.match(/"retryDelay":\s*"(\d+)s"/)
      const delay = m ? Number(m[1]) * 1000 + 1000 : wait
      if (/PerDay|per day|RPD/i.test(txt) && t >= 1) {
        console.warn(`gemini ${model}: daily quota exhausted`)
        return null
      }
      console.warn(`gemini ${model}: ${r.status}, retry in ${Math.round(delay / 1000)}s`)
      await sleep(delay)
      wait = Math.min(wait * 2, 90000)
      continue
    }
    console.warn(`gemini ${model}: ${r.status} ${txt.slice(0, 300)}`)
    return null
  }
  return null
}

export async function geminiText(prompt: string, opts: { json?: boolean; model?: string; audio?: { mime: string; data: string } } = {}): Promise<string | null> {
  const parts: unknown[] = [{ text: prompt }]
  if (opts.audio) parts.push({ inlineData: { mimeType: opts.audio.mime, data: opts.audio.data } })
  const res = (await geminiRaw(opts.model ?? TEXT_MODEL, {
    contents: [{ role: 'user', parts }],
    generationConfig: opts.json ? { responseMimeType: 'application/json', temperature: 0.2 } : { temperature: 0.2 },
  })) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null
  return res?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? null
}

export async function listModels(): Promise<{ name: string; supportedGenerationMethods?: string[] }[]> {
  const key = geminiKey()
  if (!key) return []
  const out: { name: string; supportedGenerationMethods?: string[] }[] = []
  let page = ''
  do {
    const r = await fetch(`${API}/models?pageSize=200${page ? `&pageToken=${page}` : ''}`, { headers: { 'x-goog-api-key': key } })
    if (!r.ok) break
    const j = (await r.json()) as { models: { name: string; supportedGenerationMethods?: string[] }[]; nextPageToken?: string }
    out.push(...j.models)
    page = j.nextPageToken ?? ''
  } while (page)
  return out
}
