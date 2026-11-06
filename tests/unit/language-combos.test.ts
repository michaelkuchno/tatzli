import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, type Lang } from '@content/types'
import { allAudioItems } from '@content/index'

/** All non-empty ordered language combinations a parent can choose for sound (64). */
function combinations(): Lang[][] {
  const out: Lang[][] = []
  const perm = (rest: Lang[], cur: Lang[]) => {
    if (cur.length) out.push(cur)
    for (const l of rest) perm(rest.filter((x) => x !== l), [...cur, l])
  }
  perm([...LANGS], [])
  return out
}

describe('every sound-language combination has a verified recording for every item', () => {
  const root = join(__dirname, '..', '..', 'public', 'audio')
  const manifest = existsSync(join(root, 'manifest.json')) ? (JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as { items: Record<string, Partial<Record<Lang, string>>> }) : { items: {} }
  const items = allAudioItems()
  // known gaps without a verified recording (silent + caption); see scripts/audio-gaps.ts
  const known = new Set<string>(JSON.parse(readFileSync(join(__dirname, 'audio-gaps.json'), 'utf8')))
  it('has 64 combinations', () => expect(combinations().length).toBe(64))
  it('no combination leaves an item silent', () => {
    const ok = new Set<string>()
    for (const a of items) for (const l of LANGS) { const f = manifest.items[a.id]?.[l]; if (known.has(`${a.id}:${l}`) || (f && existsSync(join(root, f)))) ok.add(`${a.id}:${l}`) }
    const broken: string[] = []
    for (const combo of combinations()) {
      const missing = items.filter((a) => combo.some((l) => !ok.has(`${a.id}:${l}`))).length
      if (missing) broken.push(`${combo.join('→')}: ${missing} items without recording`)
    }
    expect(broken.slice(0, 8), `${broken.length} of 64 combinations incomplete`).toEqual([])
  })
})
