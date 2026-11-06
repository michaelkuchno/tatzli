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
  it('has 64 combinations', () => expect(combinations().length).toBe(64))
  it('no combination leaves an item silent', () => {
    const broken: string[] = []
    for (const combo of combinations()) {
      const missing = items.filter((a) => combo.some((l) => !manifest.items[a.id]?.[l] || !existsSync(join(root, manifest.items[a.id]![l]!)))).length
      if (missing) broken.push(`${combo.join('→')}: ${missing} items without recording`)
    }
    expect(broken.slice(0, 8), `${broken.length} of 64 combinations incomplete`).toEqual([])
  })
})
