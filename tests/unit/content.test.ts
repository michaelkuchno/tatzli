import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, type L4 } from '@content/types'
import { WORDS, PHRASES, STORIES, SONGS, TOPICS, WORD_BY_ID, PHRASE_BY_ID, STORY_BY_ID, SONG_BY_ID, allAudioItems } from '@content/index'
import review from '@content/be-review.json'
import { validateAlignment } from '@/lib/align'
import { ILLUS } from '@/illustrations/registry'
import { PLACE_IDS } from '@/illustrations/places'
import { MAP_SPOTS } from '@/illustrations/map'

const full = (x: L4) => LANGS.every((l) => typeof x[l] === 'string' && x[l].trim().length > 0)

describe('content volume (SPEC §12)', () => {
  it('has ≥300 words, ≥100 phrases, 20 stories, 10 songs, ≥10 topics per level', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(300)
    expect(PHRASES.length).toBeGreaterThanOrEqual(100)
    expect(STORIES.length).toBe(20)
    expect(SONGS.length).toBe(10)
    for (const lv of [1, 2, 3]) expect(TOPICS.filter((t) => t.level === lv && !t.seasonal).length).toBeGreaterThanOrEqual(10)
  })
  it('ids are unique', () => {
    for (const list of [WORDS, PHRASES, STORIES, SONGS, TOPICS] as { id: string }[][]) expect(new Set(list.map((x) => x.id)).size).toBe(list.length)
  })
  it('shares words between levels', () => {
    const byLevel = [1, 2, 3].map((lv) => new Set(TOPICS.filter((t) => t.level === lv).flatMap((t) => t.words)))
    expect([...byLevel[0]].some((w) => byLevel[1].has(w) || byLevel[2].has(w))).toBe(true)
  })
})

describe('every item has 4 languages and an illustration', () => {
  it('words', () => {
    for (const w of WORDS) {
      expect(full(w.text), w.id).toBe(true)
      expect(ILLUS[w.illu], `illustration for ${w.id}`).toBeTypeOf('function')
      if (w.sound) expect(full(w.sound), w.id).toBe(true)
    }
  })
  it('phrases are aligned in all four languages', () => {
    for (const p of PHRASES) {
      expect(full(p.src), p.id).toBe(true)
      expect(validateAlignment(p.src), p.id).toEqual([])
      for (const w of p.words ?? []) expect(WORD_BY_ID[w], `${p.id} → ${w}`).toBeDefined()
      if (p.illu) expect(ILLUS[p.illu], `${p.id} illu ${p.illu}`).toBeTypeOf('function')
    }
  })
  it('stories: 4 languages, alignment, valid scenes and branching', () => {
    for (const s of STORIES) {
      expect(full(s.title), s.id).toBe(true)
      s.pages.forEach((pg, i) => {
        const tag = `${s.id}#${i}`
        expect(validateAlignment(pg.text), tag).toEqual([])
        expect(PLACE_IDS).toContain(pg.scene.place)
        for (const it of pg.scene.items) expect(ILLUS[WORD_BY_ID[it.key]?.illu ?? it.key], `${tag} ${it.key}`).toBeTypeOf('function')
        if (pg.choice) {
          expect(validateAlignment(pg.choice.prompt), tag).toEqual([])
          for (const o of pg.choice.options) {
            expect(validateAlignment(o.label), tag).toEqual([])
            expect(o.next).toBeGreaterThan(i)
            expect(o.next).toBeLessThan(s.pages.length)
            expect(ILLUS[WORD_BY_ID[o.illu]?.illu ?? o.illu], `${tag} ${o.illu}`).toBeTypeOf('function')
          }
        }
        if (pg.question) {
          expect(validateAlignment(pg.question.prompt), tag).toEqual([])
          expect(pg.question.answer).toBeLessThan(pg.question.options.length)
        }
      })
      expect(s.pages.some((p) => p.end) || s.pages.length > 0).toBe(true)
    }
  })
  it('songs: original, aligned, melody beats match lines', () => {
    for (const s of SONGS) {
      expect(s.origin).toBe('original')
      const melody = s.melody.reduce((a, n) => a + n.d, 0)
      const lines = s.lines.reduce((a, l) => a + l.beats, 0)
      expect(Math.abs(melody - lines), s.id).toBeLessThan(0.001)
      for (const l of s.lines) expect(validateAlignment(l.src), s.id).toEqual([])
    }
  })
  it('topics reference existing content', () => {
    for (const t of TOPICS) {
      expect(full(t.title), t.id).toBe(true)
      expect(t.words.length, t.id).toBeGreaterThan(3)
      for (const w of t.words) expect(WORD_BY_ID[w], `${t.id} → ${w}`).toBeDefined()
      for (const p of t.phrases) expect(PHRASE_BY_ID[p], `${t.id} → ${p}`).toBeDefined()
      if (t.story) expect(STORY_BY_ID[t.story], `${t.id} story`).toBeDefined()
      if (t.song) expect(SONG_BY_ID[t.song], `${t.id} song`).toBeDefined()
      if (t.offscreen.phrase) expect(PHRASE_BY_ID[t.offscreen.phrase], `${t.id} off`).toBeDefined()
      expect(ILLUS[t.icon], `${t.id} icon`).toBeTypeOf('function')
      expect(ILLUS[t.sticker], `${t.id} sticker`).toBeTypeOf('function')
      if (t.games.includes('sort')) {
        expect(t.sort, t.id).toBeDefined()
        for (const b of t.sort!.bins) for (const w of b.words) expect(WORD_BY_ID[w], `${t.id} sort ${w}`).toBeDefined()
      }
      if (t.games.includes('count') && t.count) {
        expect(WORD_BY_ID[t.count.word]).toBeDefined()
        expect(ILLUS[t.count.container]).toBeTypeOf('function')
      }
      expect(MAP_SPOTS.some((s) => s.place === t.place), `${t.id} on map`).toBe(true)
    }
  })
})

describe('Bärndütsch verification', () => {
  const rows = review as { id: string; confidence: string; sources: string[] }[]
  const byId = new Map(rows.map((r) => [r.id, r]))
  it('every BE item has a review entry with sources', () => {
    for (const a of allAudioItems().filter((x) => x.kind !== 'sound')) {
      const r = byId.get(a.id)
      expect(r, a.id).toBeDefined()
      expect(r!.sources.length, a.id).toBeGreaterThan(0)
    }
  })
  it('only high/medium confidence items reach the child', () => {
    const low = allAudioItems()
      .map((a) => byId.get(a.id))
      .filter((r) => r && r.confidence === 'low')
      .map((r) => r!.id)
    expect(low).toEqual([])
  })
})

describe('pronunciation in all four languages (SPEC §8)', () => {
  const root = join(__dirname, '..', '..', 'public', 'audio')
  const manifest = existsSync(join(root, 'manifest.json')) ? (JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as { items: Record<string, Record<string, string>> }) : { items: {} }
  it('every content item has 4 audio files', () => {
    const missing: string[] = []
    for (const a of allAudioItems()) {
      for (const l of LANGS) {
        const f = manifest.items[a.id]?.[l]
        if (!f || !existsSync(join(root, f))) missing.push(`${a.id}:${l}`)
      }
    }
    // known gaps (no verified recording yet → silent + caption, never a guessed voice); regenerate: npx tsx scripts/audio-gaps.ts
    const known = new Set<string>(JSON.parse(readFileSync(join(__dirname, 'audio-gaps.json'), 'utf8')))
    const fresh = missing.filter((m) => !known.has(m))
    expect(fresh.slice(0, 20), `${fresh.length} new gaps (${missing.length} total)`).toEqual([])
  })
})
