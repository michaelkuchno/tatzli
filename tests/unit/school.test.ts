import { describe, expect, it } from 'vitest'
import { LANGS, type L4 } from '@content/types'
import { WORD_BY_ID, PHRASES, TOPICS, PHRASE_BY_ID, TOPIC_BY_ID, allAudioItems } from '@content/index'
import { SCHOOL_PHRASES, SCHOOL_TOPICS, STAGES, schoolLessons } from '@content/school'
import { validateAlignment } from '@/lib/align'
import { ILLUS } from '@/illustrations/registry'
import { topicsFor } from '@/lib/topics'
import { initialLetter, stageOf } from '@/lib/school'
import { makeTask } from '@/activities/MathGame'

const full = (x: L4) => LANGS.every((l) => typeof x[l] === 'string' && x[l].trim().length > 0)
const plain = (s: string) => s.replace(/\[([^\]]+)\]\d+(?:\+\d+)*/g, '$1').replace(/\s+/g, ' ').trim().toLowerCase()

describe('school lessons (Chindsgi 1/2, 1st–3rd class)', () => {
  it('every stage has 5 lessons in at least 3 different subjects', () => {
    for (const s of STAGES) {
      const ls = schoolLessons(s)
      expect(ls.length, s).toBe(5)
      expect(new Set(ls.map((l) => l.school.subject)).size, s).toBeGreaterThanOrEqual(3)
    }
    // every subject of Lehrplan 21 cycle 1 appears somewhere
    expect(new Set(SCHOOL_TOPICS.map((l) => l.school.subject))).toEqual(new Set(['deutsch', 'mathe', 'nmg', 'gestalten', 'musik', 'sport']))
  })
  it('ids are unique and do not collide with the map content', () => {
    const ids = SCHOOL_TOPICS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(TOPICS.some((t) => t.id === id)).toBe(false)
    const pids = SCHOOL_PHRASES.map((p) => p.id)
    expect(new Set(pids).size).toBe(pids.length)
    for (const id of pids) expect(PHRASES.some((p) => p.id === id)).toBe(false)
    for (const id of [...ids, ...pids]) expect(id, 'ascii ids (file names)').toMatch(/^[a-z0-9-]+$/)
  })
  it('sentences are aligned in all four languages and reference existing words and pictures', () => {
    for (const p of SCHOOL_PHRASES) {
      expect(full(p.src), p.id).toBe(true)
      expect(validateAlignment(p.src), p.id).toEqual([])
      for (const w of p.words ?? []) expect(WORD_BY_ID[w], `${p.id} → ${w}`).toBeDefined()
      expect(ILLUS[p.illu ?? ''], `${p.id} illu`).toBeTypeOf('function')
    }
  })
  it('lessons reference existing content and their games have what they need', () => {
    for (const t of SCHOOL_TOPICS) {
      expect(full(t.title), t.id).toBe(true)
      expect(t.words.length, t.id).toBeGreaterThanOrEqual(2)
      for (const w of t.words) expect(WORD_BY_ID[w], `${t.id} → ${w}`).toBeDefined()
      for (const p of t.phrases) expect(PHRASE_BY_ID[p], `${t.id} → ${p}`).toBeDefined()
      expect(PHRASE_BY_ID[t.school.intro], `${t.id} intro`).toBeDefined()
      expect(PHRASE_BY_ID[t.school.intro].illu).toBe('lehrerin')
      if (t.offscreen.phrase) expect(PHRASE_BY_ID[t.offscreen.phrase], `${t.id} off`).toBeDefined()
      expect(ILLUS[t.icon], `${t.id} icon`).toBeTypeOf('function')
      expect(ILLUS[t.sticker], `${t.id} sticker`).toBeTypeOf('function')
      expect(TOPIC_BY_ID[t.id]).toBe(t)
      if (t.games.includes('sort')) {
        expect(t.sort?.bins.length, t.id).toBeGreaterThanOrEqual(2)
        for (const b of t.sort!.bins) {
          expect(full(b.label)).toBe(true)
          expect(ILLUS[b.illu], `${t.id} bin`).toBeTypeOf('function')
          for (const w of b.words) expect(WORD_BY_ID[w], `${t.id} sort ${w}`).toBeDefined()
        }
      }
      if (t.games.includes('count')) expect(t.count && WORD_BY_ID[t.count.word] && ILLUS[t.count.container]).toBeTruthy()
      if (t.games.includes('math')) {
        expect(t.school.math, t.id).toBeDefined()
        expect(PHRASE_BY_ID[t.school.math!.prompt], `${t.id} math prompt`).toBeDefined()
      }
      if (t.games.includes('order')) {
        expect(t.school.order!.items.length, t.id).toBeGreaterThanOrEqual(3)
        for (const w of t.school.order!.items) expect(WORD_BY_ID[w], `${t.id} order ${w}`).toBeDefined()
        expect(PHRASE_BY_ID[t.school.order!.prompt]).toBeDefined()
      }
      if (t.games.includes('letters')) {
        expect(PHRASE_BY_ID[t.school.letters!]).toBeDefined()
        // every word of the lesson starts with a different letter in every language → the letters game is unambiguous
        for (const l of LANGS) {
          const first = t.words.map((w) => initialLetter(WORD_BY_ID[w].text[l]))
          expect(new Set(first).size, `${t.id} ${l}: ${first.join('')}`).toBe(first.length)
        }
      }
    }
  })
  it('no repetition: a word or a sentence belongs to one school lesson only, and no sentence repeats the map content', () => {
    const seen = new Map<string, string>()
    for (const t of SCHOOL_TOPICS)
      for (const w of t.words) {
        expect(seen.get(w), `${w} in ${t.id} and ${seen.get(w)}`).toBeUndefined()
        seen.set(w, t.id)
      }
    const used = SCHOOL_TOPICS.flatMap((t) => [t.school.intro, ...t.phrases])
    const shared = new Set(SCHOOL_TOPICS.flatMap((t) => [t.school.order?.prompt].filter(Boolean)))
    for (const id of used) expect(used.filter((x) => x === id).length, id).toBe(1)
    for (const p of SCHOOL_PHRASES) expect(used.includes(p.id) || shared.has(p.id) || SCHOOL_TOPICS.some((t) => t.school.letters === p.id || t.school.math?.prompt === p.id), `${p.id} is used`).toBe(true)
    const mapTexts = new Set(PHRASES.flatMap((p) => LANGS.map((l) => plain(p.src[l]))))
    for (const p of SCHOOL_PHRASES) for (const l of LANGS) expect(mapTexts.has(plain(p.src[l])), `${p.id}:${l}`).toBe(false)
  })
  it('the stage comes from the profile, otherwise from the age level', () => {
    expect(stageOf({ level: 1 })).toBe('kg1')
    expect(stageOf({ level: 2 })).toBe('kg1')
    expect(stageOf({ level: 3 })).toBe('k1')
    expect(stageOf({ level: 2, stage: 'k3' })).toBe('k3')
    expect(stageOf(null)).toBe('kg1')
    expect(initialLetter('d Lampe')).toBe('L')
    expect(initialLetter('the moon')).toBe('M')
    expect(initialLetter('jeż')).toBe('J')
  })
  it('maths tasks are always solvable with recorded number words (1–20) and three different options', () => {
    let seed = 7
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (const t of SCHOOL_TOPICS.filter((x) => x.school.math))
      for (let i = 0; i < 400; i++) {
        const k = makeTask(t.school.math!, i, r)
        expect(k.answer).toBeGreaterThanOrEqual(1)
        expect(k.answer).toBeLessThanOrEqual(20)
        expect(new Set(k.options).size).toBe(3)
        expect(k.options).toContain(k.answer)
        for (const o of k.options) expect(o).toBeGreaterThanOrEqual(1)
        if (k.kind === 'add') expect(k.a + k.b).toBe(k.answer)
        if (k.kind === 'sub') expect(k.a - k.b).toBe(k.answer)
        if (k.kind === 'mult') expect(k.a * k.b).toBe(k.answer)
        if (k.kind === 'mult') expect(t.school.math!.tables).toContain(k.a)
        if (k.kind === 'clock') for (const o of k.options) expect(o).toBeLessThanOrEqual(12)
        if (k.kind === 'dots') expect(k.answer).toBeLessThanOrEqual(t.school.math!.max!)
        if (k.kind === 'add' || k.kind === 'sub') expect(Math.max(k.a, k.b, k.answer)).toBeLessThanOrEqual(t.school.math!.max!)
      }
  })
  it('school lessons are not on the map (existing levels unchanged) but need recordings like everything else', () => {
    for (const lv of [1, 2, 3] as const) for (const t of topicsFor(lv)) expect(t.school).toBeUndefined()
    const ids = new Set(allAudioItems().map((a) => a.id))
    for (const t of SCHOOL_TOPICS) {
      expect(ids.has(`t.${t.id}`)).toBe(true)
      for (const p of [t.school.intro, ...t.phrases]) expect(ids.has(`p.${p}`)).toBe(true)
      t.sort?.bins.forEach((_, i) => expect(ids.has(`bin.${t.id}.${i}`)).toBe(true))
    }
  })
})
