import { describe, expect, it } from 'vitest'
import { applyOutcome, newProgress, pickItems, dueItems, INTERVAL_DAYS } from '@/lib/srs'
import { difficulty } from '@/lib/adapt'
import type { ItemProgress } from '@/lib/db'

const DAY = 86400000
const T0 = Date.UTC(2026, 10, 5)

describe('spaced repetition', () => {
  it('moves up after recognition on different days and schedules the next review', () => {
    let p = newProgress(1, 'chatz', 'word', T0)
    p = applyOutcome(p, 'recognised', T0)
    expect(p.strength).toBe(1)
    expect(p.due).toBe(T0 + INTERVAL_DAYS[1] * DAY)
    p = applyOutcome(p, 'recognised', T0 + DAY)
    expect(p.strength).toBe(2)
  })
  it('does not cram: repeated recognition in one session counts once', () => {
    let p = applyOutcome(newProgress(1, 'x', 'word', T0), 'recognised', T0)
    p = applyOutcome(p, 'recognised', T0 + 60000)
    p = applyOutcome(p, 'recognised', T0 + 120000)
    expect(p.strength).toBe(1)
    expect(p.exposures).toBe(3)
  })
  it('a needed hint lowers strength', () => {
    let p: ItemProgress = { ...newProgress(1, 'x', 'word', T0), strength: 3 }
    p = applyOutcome(p, 'hinted', T0)
    expect(p.strength).toBe(2)
    expect(p.hints).toBe(1)
  })
  it('exposure alone eventually counts as box 1', () => {
    let p = newProgress(1, 'x', 'word', T0)
    for (let i = 0; i < 3; i++) p = applyOutcome(p, 'exposed', T0 + i)
    expect(p.strength).toBe(1)
  })
  it('picks due items first, then a limited number of new ones', () => {
    const prog = new Map<string, ItemProgress>()
    prog.set('a', { ...newProgress(1, 'a', 'word', T0), exposures: 2, strength: 2, due: T0 - DAY })
    prog.set('b', { ...newProgress(1, 'b', 'word', T0), exposures: 2, strength: 4, due: T0 + 5 * DAY })
    const pick = pickItems(['a', 'b', 'c', 'd', 'e', 'f'], prog, 3, T0, () => 0.3)
    expect(pick[0]).toBe('a')
    expect(pick).toHaveLength(3)
    expect(new Set(pick).size).toBe(3)
    expect(pick.filter((x) => !prog.has(x)).length).toBeLessThanOrEqual(2)
  })
  it('lists due items most overdue first', () => {
    const rows = [
      { ...newProgress(1, 'a', 'word', T0), exposures: 1, due: T0 - DAY },
      { ...newProgress(1, 'b', 'word', T0), exposures: 1, due: T0 - 3 * DAY },
      { ...newProgress(1, 'c', 'word', T0), exposures: 0, due: T0 - 9 * DAY },
    ]
    expect(dueItems(rows, T0).map((r) => r.itemId)).toEqual(['b', 'a'])
  })
})

describe('adaptive difficulty', () => {
  it('frequent skipping makes activities shorter and easier', () => {
    const base = difficulty(2, { skips: 0, hints: 0, completions: 0 })
    const skipped = difficulty(2, { skips: 6, hints: 0, completions: 2 })
    expect(skipped.rounds).toBeLessThan(base.rounds)
    expect(skipped.choices).toBeLessThan(base.choices)
  })
  it('many hints lower the number of choices', () => {
    const d = difficulty(3, { skips: 0, hints: 30, completions: 4 })
    expect(d.choices).toBeLessThan(4)
  })
  it('smooth engaged play adds a little challenge within the level', () => {
    const d = difficulty(1, { skips: 0, hints: 0, completions: 10 })
    expect(d.choices).toBe(3)
    expect(d.maxCount).toBeLessThanOrEqual(5)
  })
})
