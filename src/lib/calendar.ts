import type { Season, SeasonalWindow } from '@content/types'

export function seasonOf(d: Date): Season {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const md = m * 100 + day
  if (md >= 321 && md < 621) return 'spring'
  if (md >= 621 && md < 923) return 'summer'
  if (md >= 923 && md < 1221) return 'autumn'
  return 'winter'
}

/** Gregorian Easter Sunday (Meeus/Jones/Butcher). */
export function easter(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/** Bern Zibelemärit: fourth Monday of November. */
export function zibelemaerit(year: number): Date {
  const d = new Date(year, 10, 1)
  const firstMonday = 1 + ((8 - d.getDay()) % 7)
  return new Date(year, 10, firstMonday + 21)
}

/** Bärner Fasnacht starts on the Thursday after Ash Wednesday (Easter − 46 days). */
export function baernerFasnacht(year: number): Date {
  const e = easter(year)
  const ashWed = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 46)
  return new Date(ashWed.getFullYear(), ashWed.getMonth(), ashWed.getDate() + 1)
}

const DAY = 86400000
const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const shift = (d: Date, days: number) => new Date(d.getTime() + days * DAY)

export type HolidayId = 'zibelemaerit' | 'samichlous' | 'advent' | 'wiehnachte' | 'wigilia' | 'fasnacht' | 'ostere' | 'august'

/** Holiday windows for the given date's year (computed, so they move with the calendar). */
export function holidayWindows(year: number): Record<HolidayId, SeasonalWindow> {
  const z = zibelemaerit(year)
  const e = easter(year)
  const f = baernerFasnacht(year)
  return {
    zibelemaerit: { from: md(shift(z, -10)), to: md(shift(z, 3)), holiday: 'Zibelemärit' },
    samichlous: { from: '11-28', to: '12-07', holiday: 'Samichlous' },
    advent: { from: '12-01', to: '12-23', holiday: 'Advent' },
    wiehnachte: { from: '12-15', to: '12-31', holiday: 'Wiehnachte' },
    wigilia: { from: '12-20', to: '12-26', holiday: 'Wigilia' },
    fasnacht: { from: md(shift(f, -14)), to: md(shift(f, 3)), holiday: 'Fasnacht' },
    ostere: { from: md(shift(e, -14)), to: md(shift(e, 2)), holiday: 'Ostere / Wielkanoc' },
    august: { from: '07-20', to: '08-02', holiday: '1. August' },
  }
}

export function inWindow(d: Date, w: SeasonalWindow): boolean {
  const x = md(d)
  return w.from <= w.to ? x >= w.from && x <= w.to : x >= w.from || x <= w.to
}

export function activeHolidays(d: Date): HolidayId[] {
  const ws = holidayWindows(d.getFullYear())
  return (Object.keys(ws) as HolidayId[]).filter((k) => inWindow(d, ws[k]))
}

export function timeOfDay(d: Date): 'day' | 'evening' | 'night' {
  const h = d.getHours()
  if (h >= 21 || h < 6) return 'night'
  if (h >= 18) return 'evening'
  return 'day'
}
