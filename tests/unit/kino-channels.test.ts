import { describe, expect, it } from 'vitest'
import { CHANNELS } from '@/lib/kinoChannels'
import { hasIllu } from '@/illustrations/registry'
import { WORDS } from '@/lib/content'

describe('cinema films', () => {
  it('offers many different kinds of films, each with a picture and a title in all languages', () => {
    expect(CHANNELS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(CHANNELS.map((c) => c.id)).size).toBe(CHANNELS.length)
    for (const c of CHANNELS) {
      expect(hasIllu(c.icon), c.icon).toBe(true)
      for (const l of ['be', 'de', 'pl', 'en'] as const) expect(c.title[l]).toBeTruthy()
    }
  })
  it('every word film has enough words to fill it', () => {
    for (const c of CHANNELS.filter((x) => x.kind === 'words')) expect(WORDS.filter((w) => c.cats!.includes(w.cat) && w.level <= 2).length, c.id).toBeGreaterThanOrEqual(c.size)
  })
})
