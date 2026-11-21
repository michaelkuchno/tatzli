import type { Stage } from '@content/types'
import type { Profile } from './db'

/** the child's school stage: chosen by a grown-up, otherwise derived from the age level (4–5 → Chindsgi 1, 6–7 → 1st class) */
export function stageOf(p: Pick<Profile, 'stage' | 'level'> | null | undefined): Stage {
  if (p?.stage) return p.stage
  return p?.level === 3 ? 'k1' : 'kg1'
}

/** short Bärndütsch name of a stage for the child screens */
export const STAGE_BE: Record<Stage, string> = { kg1: 'Chindsgi 1', kg2: 'Chindsgi 2', k1: '1. Klass', k2: '2. Klass', k3: '3. Klass' }

/** the first letter of a word without its article (d Lampe → L, die Nase → N, the moon → M) */
export function initialLetter(text: string): string {
  return text
    .trim()
    .replace(/^(d|dr|ds|es|e|en|der|die|das|the|a|an)\s+/i, '')
    .charAt(0)
    .toUpperCase()
}
