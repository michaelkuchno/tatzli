/**
 * Fast integrity check of every recording in the manifest (runs 8 ffmpeg decoders in parallel, ~1 min):
 *  - the file decodes without errors (corrupt AAC → silent / "muted" in the app)
 *  - the duration fits the text (a 1-word clip of 19 s = extra speech or silence → a chain would hang)
 * Usage: npx tsx scripts/check-audio-files.ts   (exit code 1 on problems)
 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'
import { allAudioItems } from '../content/index'

const root = join(import.meta.dirname, '..', 'public', 'audio')
const m = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as { items: Record<string, Record<string, string>> }
const plain = (s: string) => s.replace(/\[([^\]]+)\]\d+(?:\+\d+)*/g, '$1')
const text: Record<string, Record<string, string>> = {}
for (const a of allAudioItems()) text[a.id] = Object.fromEntries(Object.entries(a.text).map(([l, t]) => [l, plain(String(t))]))

const jobs = Object.entries(m.items).flatMap(([id, v]) => Object.entries(v).map(([l, f]) => ({ id, l, f })))
const problems: string[] = []
const run = (j: (typeof jobs)[number]) =>
  new Promise<void>((done) => {
    const p = spawn(ffmpegPath as unknown as string, ['-v', 'error', '-stats', '-i', join(root, j.f), '-f', 'null', '-'])
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('close', (code) => {
      const t = [...err.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop()
      const sec = t ? +t[1] * 3600 + +t[2] * 60 + +t[3] : 0
      const errors = err.split('\n').filter((x) => x.trim() && !/time=|frame=|size=/.test(x))
      const max = (2.5 + (text[j.id]?.[j.l]?.length ?? 0) * 0.12) * 1.6
      if (code !== 0 || errors.length) problems.push(`corrupt  ${j.l} ${j.id} (${j.f})`)
      else if (sec > max) problems.push(`too long ${j.l} ${j.id} ${sec.toFixed(1)} s (max ${max.toFixed(1)}) (${j.f})`)
      done()
    })
  })
const queue = [...jobs]
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await run(queue.pop()!) }))
console.log(`${jobs.length} files checked · ${problems.length} problems`)
for (const p of problems) console.log('  ' + p)
process.exit(problems.length ? 1 : 0)
