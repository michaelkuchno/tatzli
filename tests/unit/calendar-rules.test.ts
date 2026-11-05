import { describe, expect, it } from 'vitest'
import { easter, zibelemaerit, seasonOf, activeHolidays, baernerFasnacht } from '@/lib/calendar'
import { checkBernese } from '@/lib/beRules'
import { topicsFor } from '@/lib/topics'

describe('calendar', () => {
  it('computes Easter', () => {
    expect(easter(2026).toDateString()).toBe(new Date(2026, 3, 5).toDateString())
    expect(easter(2027).toDateString()).toBe(new Date(2027, 2, 28).toDateString())
  })
  it('computes the Zibelemärit (4th Monday of November)', () => {
    expect(zibelemaerit(2026).getDate()).toBe(23)
    expect(zibelemaerit(2025).getDate()).toBe(24)
  })
  it('computes Bärner Fasnacht (Thursday after Ash Wednesday)', () => {
    const f = baernerFasnacht(2026)
    expect(f.getDay()).toBe(4)
    expect(f.getMonth()).toBe(1)
  })
  it('finds seasons and holiday windows', () => {
    expect(seasonOf(new Date(2026, 10, 5))).toBe('autumn')
    expect(seasonOf(new Date(2026, 0, 5))).toBe('winter')
    expect(activeHolidays(new Date(2026, 11, 6))).toContain('samichlous')
    expect(activeHolidays(new Date(2026, 11, 24))).toContain('wigilia')
    expect(activeHolidays(new Date(2026, 6, 31))).toContain('august')
  })
  it('shows seasonal topics only in their window', () => {
    expect(topicsFor(2, new Date(2026, 11, 5)).some((t) => t.id === 's-samichlous')).toBe(true)
    expect(topicsFor(2, new Date(2026, 5, 5)).some((t) => t.id === 's-samichlous')).toBe(false)
  })
})

describe('Bernese rule checks', () => {
  const errors = (s: string) => checkBernese(s).filter((h) => h.severity === 'error')
  it('accepts typical Bernese forms', () => {
    expect(errors('I gange id Chindsgi.')).toEqual([])
    expect(errors('Mir göh go schwümme. Grüessech!')).toEqual([])
    expect(errors('Zeig mer d Nase!')).toEqual([])
  })
  it('flags forms of other dialects', () => {
    expect(errors('Grüezi mitenand').some((h) => h.word === 'grüezi')).toBe(true)
    expect(errors('Mer gönd hei').some((h) => h.word === 'gönd')).toBe(true)
    expect(errors('Das Meitli isch chli').map((h) => h.word)).toEqual(expect.arrayContaining(['meitli', 'chli']))
  })
  it('flags Zurich l-forms', () => {
    expect(errors('di ganzi Wält').some((h) => h.word === 'wält')).toBe(true)
  })
})
