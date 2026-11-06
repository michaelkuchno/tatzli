/** Writes tests/unit/audio-gaps.json: item×language pairs with no verified recording yet (stay silent, caption only). */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS } from '../content/types'
import { allAudioItems } from '../content/index'
const root = join(import.meta.dirname, '..', 'public', 'audio')
const m = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as { items: Record<string, Record<string, string>> }
const gaps: string[] = []
for (const a of allAudioItems()) for (const l of LANGS) { const f = m.items[a.id]?.[l]; if (!f || !existsSync(join(root, f))) gaps.push(`${a.id}:${l}`) }
writeFileSync(join(import.meta.dirname, '..', 'tests', 'unit', 'audio-gaps.json'), JSON.stringify(gaps, null, 1) + '\n')
console.log(`${gaps.length} known gaps`)
