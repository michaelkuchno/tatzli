import type { ItemProgress } from './db'

/**
 * Child-level spaced repetition (no visible scores).
 * Leitner-style strength 0..6. Every meaningful exposure counts; a confident recognition
 * (first try, no hint) moves the item up, a needed hint moves it down one box.
 * Several exposures on the same day count once for strength (no cramming).
 */
export const INTERVAL_DAYS = [0, 1, 2, 4, 7, 14, 30]
const DAY = 24 * 60 * 60 * 1000
const SAME_SESSION = 6 * 60 * 60 * 1000

export type Outcome = 'exposed' | 'recognised' | 'hinted'

export function newProgress(profileId: number, itemId: string, kind: 'word' | 'phrase', now: number): ItemProgress {
  return { key: `${profileId}:${itemId}`, profileId, itemId, kind, exposures: 0, strength: 0, lastSeen: 0, due: now, hints: 0 }
}

export function applyOutcome(p: ItemProgress, outcome: Outcome, now: number): ItemProgress {
  const next: ItemProgress = { ...p, exposures: p.exposures + 1, lastSeen: now }
  const sameSession = p.lastSeen > 0 && now - p.lastSeen < SAME_SESSION
  if (outcome === 'recognised') {
    if (!sameSession || p.strength === 0) next.strength = Math.min(6, p.strength + 1)
  } else if (outcome === 'exposed') {
    if (p.strength === 0 && p.exposures >= 2) next.strength = 1
  } else {
    next.hints = p.hints + 1
    next.strength = Math.max(0, p.strength - 1)
  }
  next.due = now + INTERVAL_DAYS[next.strength] * DAY
  return next
}

export function isDue(p: ItemProgress, now: number) {
  return p.due <= now
}

function shuffle<T>(a: T[], rnd: () => number): T[] {
  const c = [...a]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = c[i]
    c[i] = c[j]
    c[j] = t
  }
  return c
}

/**
 * Pick `n` items for a game: due reviews first (most overdue first), then a limited number of
 * new items (≈1/3), then known items for variety, then remaining new items.
 */
export function pickItems(
  topicItems: string[],
  progress: Map<string, ItemProgress>,
  n: number,
  now: number,
  rnd: () => number = Math.random,
): string[] {
  const due: ItemProgress[] = []
  const fresh: string[] = []
  const known: string[] = []
  for (const id of topicItems) {
    const p = progress.get(id)
    if (!p || p.exposures === 0) fresh.push(id)
    else if (isDue(p, now)) due.push(p)
    else known.push(id)
  }
  due.sort((a, b) => a.due - b.due)
  const out: string[] = []
  const add = (id: string) => {
    if (out.length < n && !out.includes(id)) out.push(id)
  }
  const maxNew = Math.max(1, Math.ceil(n / 3))
  for (const p of due) add(p.itemId)
  const fr = shuffle(fresh, rnd)
  for (const id of fr.slice(0, maxNew)) add(id)
  for (const id of shuffle(known, rnd)) add(id)
  for (const id of fr) add(id)
  return out
}

/** Items that are due across all topics (for review suggestions), most overdue first. */
export function dueItems(all: ItemProgress[], now: number): ItemProgress[] {
  return all.filter((p) => p.exposures > 0 && isDue(p, now)).sort((a, b) => a.due - b.due)
}
