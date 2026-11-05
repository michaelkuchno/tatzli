import type { Level, PlaceId, Topic } from '@content/types'
import { TOPICS } from './content'
import { inWindow } from './calendar'

/** Regular topics of the level plus seasonal topics whose calendar window is active today. */
export function topicsFor(level: Level, date = new Date()): Topic[] {
  return TOPICS.filter((t) => {
    if (t.seasonal) return inWindow(date, t.seasonal) && Math.abs(t.level - level) <= 1
    return t.level === level
  })
}

export function seasonalNow(date = new Date()): Topic[] {
  return TOPICS.filter((t) => t.seasonal && inWindow(date, t.seasonal))
}

export function byPlace(topics: Topic[]): Map<PlaceId, Topic[]> {
  const m = new Map<PlaceId, Topic[]>()
  for (const t of topics) m.set(t.place, [...(m.get(t.place) ?? []), t])
  return m
}
