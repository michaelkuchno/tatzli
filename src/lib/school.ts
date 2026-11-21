import type { Curriculum, Stage } from '@content/types'
import type { Profile } from './db'

/** the child's school stage: chosen by a grown-up, otherwise derived from the age level (4–5 → Chindsgi 1, 6–7 → 1st class) */
export function stageOf(p: Pick<Profile, 'stage' | 'level'> | null | undefined): Stage {
  if (p?.stage) return p.stage
  return p?.level === 3 ? 'k1' : 'kg1'
}

/** which school the child's lessons follow: Swiss (Lehrplan 21, the default – the family lives in Ostermundigen) or Polish */
export function curriculumOf(p: Pick<Profile, 'school'> | null | undefined): Curriculum {
  return p?.school ?? 'ch'
}

/** short Bärndütsch name of a stage for the child screens */
export const STAGE_BE: Record<Stage, string> = { kg1: 'Chindsgi 1', kg2: 'Chindsgi 2', k1: '1. Klass', k2: '2. Klass', k3: '3. Klass' }
/** short Polish name of a stage of the Polish school */
export const STAGE_PL: Record<Stage, string> = { kg1: 'Przedszkole', kg2: 'Zerówka', k1: 'Klasa 1', k2: 'Klasa 2', k3: 'Klasa 3' }
/** the short stage name the child sees: in the language of that school */
export const stageName = (c: Curriculum, s: Stage) => (c === 'pl' ? STAGE_PL : STAGE_BE)[s]
/** the school's own name (Swiss: Bärndütsch, Polish: Polish) */
export const SCHOOL_NAME: Record<Curriculum, string> = { ch: 'Schueu', pl: 'Szkoła' }

/** the first letter of a word without its article (d Lampe → L, die Nase → N, the moon → M) */
export function initialLetter(text: string): string {
  return text
    .trim()
    .replace(/^(d|dr|ds|es|e|en|der|die|das|the|a|an)\s+/i, '')
    .charAt(0)
    .toUpperCase()
}
