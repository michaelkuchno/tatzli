/**
 * Verifies EVERY generated recording (BE, DE, PL, EN) with speech recognition (Gemini audio understanding):
 * the clip is transcribed and compared with the expected text of that language; for Bärndütsch the dialect
 * is judged as well (must be Bernese / Swiss German, not Standard German). Clips that fail are deleted
 * (m4a + raw cache) so `generate-audio.ts --batch 1` re-creates them one by one.
 *
 *   npx tsx scripts/verify-audio.ts [--langs be,de,pl,en] [--delete-failed] [--group 8]
 * Results: scripts/data/audio-check.json
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allAudioItems } from '../content/index'
import type { Lang } from '../content/types'
import { geminiRaw, sleep } from './gemini-node'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'scripts', 'data')
const MANIFEST = join(ROOT, 'public', 'audio', 'manifest.json')
const args = process.argv.slice(2)
const arg = (k: string, d: string) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d)
const LANGS = arg('langs', 'be,de,pl,en').split(',') as Lang[]
/** one result file per language → parallel verifiers never overwrite each other */
const OUT = join(DATA, `audio-check.${LANGS.join('-')}.json`)
const GROUP = Number(arg('group', '8'))
const DELETE = args.includes('--delete-failed')
const MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-3.8-flash'

const LANG_NAME: Record<Lang, string> = { be: 'Berndeutsch (Schweizerdeutsch, Berner Mundart)', de: 'Hochdeutsch', pl: 'Polnisch', en: 'Englisch' }
type Result = { file: string; ok: boolean; transcript: string; issue: string }

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { items: Record<string, Partial<Record<Lang, string>>> }
  const results: Record<string, Result> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
  // also respect results from other files (legacy combined file, other language files)
  const known: Record<string, Result> = {}
  for (const f of readdirSync(DATA).filter((x) => x.startsWith('audio-check') && x.endsWith('.json'))) Object.assign(known, JSON.parse(readFileSync(join(DATA, f), 'utf8')))
  // unique files per language with their expected text
  const files = new Map<string, { lang: Lang; file: string; text: string; ids: string[] }>()
  for (const it of allAudioItems()) {
    for (const l of LANGS) {
      const f = manifest.items[it.id]?.[l]
      if (!f || !existsSync(join(ROOT, 'public', 'audio', f))) continue
      const e = files.get(f) ?? { lang: l, file: f, text: it.text[l], ids: [] }
      e.ids.push(it.id)
      files.set(f, e)
    }
  }
  // re-check anything that is not confirmed ok (new clips, and clips regenerated after an earlier failure)
  const todo = [...files.values()].filter((f) => !results[f.file]?.ok && !known[f.file]?.ok)
  console.log(`${files.size} recordings · ${todo.length} to check (model ${MODEL})`)
  for (const lang of LANGS) {
    const list = todo.filter((t) => t.lang === lang)
    const queue: (typeof list)[] = []
    for (let i = 0; i < list.length; i += GROUP) queue.push(list.slice(i, i + GROUP))
    let doneCount = 0
    while (queue.length) {
      const group = queue.shift()!
      const parts: unknown[] = [
        {
          text: `Du prüfst Aussprache-Aufnahmen für eine Sprachlern-App für Kinder. Sprache: ${LANG_NAME[lang]}.
Für jede der ${group.length} Audiodateien (in dieser Reihenfolge) ist der erwartete Text:
${group.map((g, k) => `${k + 1}. «${g.text}»`).join('\n')}
Transkribiere jede Aufnahme wörtlich und entscheide, ob sie genau den erwarteten Text (gleiche Wörter, gleiche Bedeutung, vollständig, verständlich, ohne zusätzliche Wörter wie Nummern oder Anweisungen) in der richtigen Sprache${lang === 'be' ? ' – und zwar in Berner Mundart/Schweizerdeutsch, NICHT Hochdeutsch –' : ''} enthält. Kleine Schreibvarianten des Dialekts sind ok.
Antworte NUR mit JSON-Array: [{"n":1,"transcript":"…","ok":true|false,"issue":"kurz, leer wenn ok"}]`,
        },
      ]
      for (const g of group) parts.push({ inlineData: { mimeType: 'audio/mp4', data: readFileSync(join(ROOT, 'public', 'audio', g.file)).toString('base64') } })
      const res = (await geminiRaw(MODEL, { contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } })) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null
      const text = res?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
      if (!text) {
        if (group.length > 1) {
          // a broken file makes the whole request invalid → check one by one
          for (const g of group) queue.unshift([g])
          continue
        }
        const g = group[0]
        console.log(`✗ ${lang} «${g.text}» → unreadable audio`)
        results[g.file] = { file: g.file, ok: false, transcript: '', issue: 'unreadable audio' }
        if (DELETE) {
          const h = g.file.split('/')[1].replace('.m4a', '')
          for (const p of [join(ROOT, 'public', 'audio', g.file), join(ROOT, '.audio-cache', lang, `${h}.pcm`)]) if (existsSync(p)) unlinkSync(p)
          delete results[g.file]
        }
        continue
      }
      let arr: { n: number; transcript: string; ok: boolean; issue: string }[]
      try {
        arr = JSON.parse(text)
      } catch {
        console.warn('unparsable answer, skipping group')
        continue
      }
      for (const a of arr) {
        const g = group[a.n - 1]
        if (!g) continue
        results[g.file] = { file: g.file, ok: !!a.ok, transcript: a.transcript, issue: a.issue }
        if (!a.ok) {
          console.log(`✗ ${lang} «${g.text}» → «${a.transcript}» ${a.issue}`)
          if (DELETE) {
            const h = g.file.split('/')[1].replace('.m4a', '')
            for (const p of [join(ROOT, 'public', 'audio', g.file), join(ROOT, '.audio-cache', lang, `${h}.pcm`)]) if (existsSync(p)) unlinkSync(p)
            delete results[g.file]
          }
        }
      }
      writeFileSync(OUT, JSON.stringify(results, null, 1))
      doneCount += group.length
      console.log(`  ${lang}: ${doneCount}/${list.length}`)
      await sleep(800)
    }
  }
  const all = Object.values(results)
  console.log(`checked ${all.length} · ok ${all.filter((r) => r.ok).length} · failed ${all.filter((r) => !r.ok).length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
