import type { Level } from '@content/types'

/**
 * Engagement-based difficulty inside a level. Signals: skips (child leaves an activity early),
 * hints (animated hint was needed), completions. Nothing of this is shown to the child.
 */
export interface Engagement {
  skips: number
  hints: number
  completions: number
}

export interface Difficulty {
  /** number of pictures in "Wo isch?" */
  choices: number
  /** seconds before the animated hint appears */
  hintAfter: number
  /** rounds per game */
  rounds: number
  /** memory pairs */
  pairs: number
  /** max number in counting game */
  maxCount: number
}

const BASE: Record<Level, Difficulty> = {
  1: { choices: 2, hintAfter: 4, rounds: 4, pairs: 3, maxCount: 3 },
  2: { choices: 3, hintAfter: 6, rounds: 5, pairs: 4, maxCount: 6 },
  3: { choices: 4, hintAfter: 8, rounds: 6, pairs: 6, maxCount: 10 },
}

export function difficulty(level: Level, e: Engagement): Difficulty {
  const d = { ...BASE[level] }
  const total = e.skips + e.completions
  const skipRate = total === 0 ? 0 : e.skips / total
  const hintRate = e.completions === 0 ? 0 : e.hints / Math.max(1, e.completions * d.rounds)
  if (total >= 3 && skipRate > 0.4) {
    // frequent skipping => shorter & easier
    d.rounds = Math.max(2, d.rounds - 2)
    d.choices = Math.max(2, d.choices - 1)
    d.pairs = Math.max(2, d.pairs - 1)
  }
  if (hintRate > 0.5) {
    d.choices = Math.max(2, d.choices - 1)
    d.hintAfter = Math.max(3, d.hintAfter - 2)
    d.maxCount = Math.max(3, d.maxCount - 2)
  }
  if (total >= 4 && skipRate < 0.1 && hintRate < 0.15) {
    // smooth, engaged play => a little more challenge (still inside the level)
    d.choices = Math.min(level === 1 ? 3 : 6, d.choices + 1)
    d.rounds = d.rounds + 1
    d.pairs = Math.min(8, d.pairs + 1)
    d.maxCount = Math.min(level === 3 ? 20 : level === 2 ? 10 : 5, d.maxCount + 2)
  }
  return d
}

export const DEFAULT_SESSION_MINUTES: Record<Level, number> = { 1: 10, 2: 15, 3: 20 }
