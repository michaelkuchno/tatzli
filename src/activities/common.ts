import { useEffect, useState } from 'react'
import type { Level } from '@content/types'
import { difficulty, type Difficulty } from '@/lib/adapt'
import { engagement } from '@/lib/progress'

export function shuffle<T>(a: readonly T[]): T[] {
  const c = [...a]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = c[i]
    c[i] = c[j]
    c[j] = t
  }
  return c
}

export function useDifficulty(profileId: number | undefined, level: Level): Difficulty {
  const [d, setD] = useState<Difficulty>(() => difficulty(level, { skips: 0, hints: 0, completions: 0 }))
  useEffect(() => {
    if (!profileId) return
    let alive = true
    void engagement(profileId).then((e) => {
      if (alive) setD(difficulty(level, e))
    })
    return () => {
      alive = false
    }
  }, [profileId, level])
  return d
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface ActivityProps {
  topicId: string
  /** called when the activity reached its natural end (counts as participation) */
  onComplete: () => void
  /** report a hint/help event (adaptive difficulty) */
  onHint: () => void
}
