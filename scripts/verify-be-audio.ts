/**
 * Automatic check of generated Bärndütsch recordings (SPEC §8):
 * each BE clip is sent to Gemini audio understanding, which transcribes the Swiss German speech,
 * gives its meaning in Standard German and judges the dialect. The meaning is compared with the DE text.
 * Failed clips are deleted from .audio-cache/public so `generate-audio.ts --voice-be <other>` re-creates them.
 *
 *   npx tsx scripts/verify-be-audio.ts [--limit N] [--delete-failed]
 * Results: scripts/data/be-audio-check.json (+ summary appended by verify-be.ts --report).
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allAudioItems } from '../content/index'
import { geminiText, sleep } from './gemini-node'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'scripts', 'data', 'be-audio-check.json')
const MANIFEST = join(ROOT, 'public', 'audio', 'manifest.json')
const args = process.argv.slice(2)
const LIMIT = Number(args[args.indexOf('--limit') + 1] || 100000)
const DELETE = args.includes('--delete-failed')

type Result = { file: string; transcript: string; meaningDe: string; dialect: string; matches: boolean; score: number }

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { items: Record<string, Record<string, string>> }
  const results: Record<string, Result> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
  const items = allAudioItems().filter((a) => a.kind !== 'sound')
  let n = 0
  for (const it of items) {
    const f = manifest.items[it.id]?.be
    if (!f || !existsSync(join(ROOT, 'public', 'audio', f))) continue
    if (results[it.id]?.file === f) continue
    if (n++ >= LIMIT) break
    const data = readFileSync(join(ROOT, 'public', 'audio', f)).toString('base64')
    const text = await geminiText(
      `Transkribiere diese kurze Aufnahme (Schweizerdeutsch, erwartet: Berndeutsch) wörtlich, gib die Bedeutung auf Hochdeutsch an und beurteile den Dialekt.
Erwartete Bedeutung (Hochdeutsch): "${it.text.de}". Erwarteter berndeutscher Text: "${it.text.be}".
Antworte NUR JSON: {"transcript":"…","meaningDe":"…","dialect":"berndeutsch|anderes schweizerdeutsch|hochdeutsch|unverständlich","matches":true|false,"score":0..1}
"matches" = die Bedeutung stimmt mit der erwarteten Bedeutung überein und ist verständlich.`,
      { json: true, audio: { mime: 'audio/mp4', data } },
    )
    if (!text) {
      console.warn('quota/error – stopping, rerun later')
      break
    }
    try {
      const r = JSON.parse(text) as Omit<Result, 'file'>
      results[it.id] = { file: f, ...r }
      if (!r.matches || r.dialect === 'unverständlich' || r.dialect === 'hochdeutsch') {
        console.log(`✗ ${it.id}: "${it.text.be}" → "${r.transcript}" (${r.dialect})`)
        if (DELETE) {
          const h = f.split('/')[1].replace('.m4a', '')
          for (const p of [join(ROOT, 'public', 'audio', f), join(ROOT, '.audio-cache', 'be', `${h}.pcm`)]) if (existsSync(p)) unlinkSync(p)
        }
      }
    } catch {
      console.warn('unparsable answer for', it.id)
    }
    writeFileSync(OUT, JSON.stringify(results, null, 1))
    await sleep(4500)
  }
  const all = Object.values(results)
  const ok = all.filter((r) => r.matches && r.dialect !== 'unverständlich' && r.dialect !== 'hochdeutsch').length
  console.log(`checked ${all.length} · understood with correct meaning ${ok} · bernese ${all.filter((r) => r.dialect === 'berndeutsch').length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
