import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** The speaking speed must apply to absolutely every spoken text – no audio element may bypass it. */
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : /\.tsx?$/.test(f) ? [join(dir, f)] : []))

describe('speaking speed applies to every speech playback', () => {
  const src = files(join(__dirname, '..', '..', 'src'))
  it('every new Audio(…) is followed by applySpeechRate', () => {
    const bad: string[] = []
    for (const f of src) {
      const s = readFileSync(f, 'utf8')
      const n = (s.match(/new Audio\(/g) ?? []).length
      const m = (s.match(/applySpeechRate\((?!a: HTMLMediaElement)/g) ?? []).length
      if (n > m) bad.push(`${f}: ${n} audio elements, ${m} applySpeechRate`)
    }
    expect(bad).toEqual([])
  })
  it('iOS: recordings play on the ONE shared, tap-unlocked element (no new Audio() outside the audio layer)', () => {
    const bad = src.filter((f) => !f.endsWith(join('lib', 'audio.ts')) && /new Audio\(/.test(readFileSync(f, 'utf8')))
    expect(bad).toEqual([])
  })
  it('the device voice follows the speed', () => {
    const s = readFileSync(join(__dirname, '..', '..', 'src', 'lib', 'audio.ts'), 'utf8')
    expect(s).toMatch(/u\.rate = [^\n]*\* rate/)
  })
  it('offers half speed as the slowest step', async () => {
    const { SPEECH_RATES } = await import('@/lib/speak')
    expect(SPEECH_RATES[0]).toBe(0.5)
  })
})
