/**
 * Bärndütsch verification pipeline (run by the developer at build time, never by the child):
 *   1. rule checks (scripts/be-rules.ts)
 *   2. dictionary look-ups on berndeutsch.ch (word level, cached in scripts/data/berndeutsch-cache.json;
 *      only headwords/spelling variants are stored – no definitions are copied)
 *   3. independent second check by Gemini (batched, cached in scripts/data/gemini-be-check.json)
 *   4. manual decisions (content/be-overrides.json)
 * Output: content/be-review.json (confidence + sources per item) and docs/BAERNDUETSCH_REVIEW.md.
 *
 * Usage: npx tsx scripts/verify-be.ts [--dict] [--gemini] [--report]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WORDS } from '../content/words'
import type { BeConfidence, BeReviewEntry } from '../content/types'
import { checkBernese, type RuleHit } from './be-rules'
import { geminiKey, geminiText, sleep } from './gemini-node'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'scripts', 'data')
if (!existsSync(DATA)) mkdirSync(DATA, { recursive: true })
const DICT_CACHE = join(DATA, 'berndeutsch-cache.json')
const GEM_CACHE = join(DATA, 'gemini-be-check.json')
const OVERRIDES = join(ROOT, 'content', 'be-overrides.json')
const OUT = join(ROOT, 'content', 'be-review.json')
const REPORT = join(ROOT, 'docs', 'BAERNDUETSCH_REVIEW.md')

const TOKEN = /\[([^\]]+)\](\d+(?:\+\d+)*)/g
const plain = (s: string) => s.replace(TOKEN, '$1').replace(/\s+/g, ' ').trim()

interface Item {
  id: string
  kind: 'word' | 'sentence'
  be: string
  de: string
  /** for words: lemma without article */
  lemma?: string
  deLemma?: string
}

function stripArticle(s: string) {
  return s.replace(/^(dr|d|ds|der|die|das|den)\s+/i, '').trim()
}

type ContentModule = typeof import('../content/index')

export function wordItems(): Item[] {
  return WORDS.map((w) => ({ id: `w.${w.id}`, kind: 'word' as const, be: w.text.be, de: w.text.de, lemma: stripArticle(w.text.be), deLemma: stripArticle(w.text.de) }))
}

export function collectItems(C: ContentModule): Item[] {
  const { PHRASES, STORIES, SONGS, UI_PROMPTS, TOPICS } = C
  const items: Item[] = []
  for (const w of WORDS) items.push({ id: `w.${w.id}`, kind: 'word', be: w.text.be, de: w.text.de, lemma: stripArticle(w.text.be), deLemma: stripArticle(w.text.de) })
  for (const p of PHRASES) items.push({ id: `p.${p.id}`, kind: 'sentence', be: plain(p.src.be), de: plain(p.src.de) })
  for (const s of STORIES) {
    items.push({ id: `st.${s.id}`, kind: 'sentence', be: s.title.be, de: s.title.de })
    s.pages.forEach((pg, i) => {
      items.push({ id: `s.${s.id}.${i}`, kind: 'sentence', be: plain(pg.text.be), de: plain(pg.text.de) })
      if (pg.choice) {
        items.push({ id: `s.${s.id}.${i}.c`, kind: 'sentence', be: plain(pg.choice.prompt.be), de: plain(pg.choice.prompt.de) })
        pg.choice.options.forEach((o, k) => items.push({ id: `s.${s.id}.${i}.o${k}`, kind: 'sentence', be: plain(o.label.be), de: plain(o.label.de) }))
      }
      if (pg.question) items.push({ id: `s.${s.id}.${i}.q`, kind: 'sentence', be: plain(pg.question.prompt.be), de: plain(pg.question.prompt.de) })
    })
  }
  for (const s of SONGS) {
    items.push({ id: `sg.${s.id}`, kind: 'sentence', be: s.title.be, de: s.title.de })
    s.lines.forEach((l, i) => items.push({ id: `song.${s.id}.${i}`, kind: 'sentence', be: plain(l.src.be), de: plain(l.src.de) }))
  }
  for (const t of TOPICS) items.push({ id: `t.${t.id}`, kind: 'sentence', be: t.title.be, de: t.title.de })
  for (const u of UI_PROMPTS) items.push({ id: `ui.${u.id}`, kind: 'sentence', be: u.text.be, de: u.text.de })
  return items
}

// ---------------- berndeutsch.ch ----------------
type DictEntry = { headword: string; variants: string[] }
type DictCache = Record<string, DictEntry[]>

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFC')
    .replace(/y/g, 'i')
    .replace(/ii/g, 'i')
    .replace(/üü/g, 'ü')
    .replace(/uu/g, 'u')
    .replace(/ää/g, 'ä')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e')
    .replace(/oo/g, 'o')
    .replace(/[^a-zäöüéè]/g, '')

function parseResults(html: string): DictEntry[] {
  const out: DictEntry[] = []
  const re = /<h3>\s*<a href="https:\/\/www\.berndeutsch\.ch\/words\/\d+[^"]*">([^<]+)<\/a>[\s\S]*?<\/h3>([\s\S]*?)(?=<h3>|<\/div>\s*<\/div>)/g
  for (const m of html.matchAll(re)) {
    const head = m[1].trim()
    const rest = m[2]
    const vm = rest.match(/Schreibweisen:\s*([^<]+)</)
    const variants = vm ? vm[1].split(/[,;]/).map((v) => v.trim()).filter(Boolean) : []
    out.push({ headword: head, variants })
  }
  return out
}

async function lookup(term: string, cache: DictCache): Promise<DictEntry[]> {
  if (cache[term]) return cache[term]
  const url = `https://www.berndeutsch.ch/search?q=${encodeURIComponent(term)}`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'TatzliContentCheck/1.0 (educational, non-commercial; rate-limited)' } })
      if (r.ok) {
        const res = parseResults(await r.text())
        cache[term] = res
        return res
      }
    } catch {
      /* retry */
    }
    await sleep(2000)
  }
  return []
}

export type DictVerdict = 'match' | 'near' | 'none'
function dictVerdict(lemma: string, entries: DictEntry[]): { v: DictVerdict; hit?: string } {
  const f = fold(lemma)
  if (!f) return { v: 'none' }
  for (const e of entries) {
    for (const cand of [e.headword, ...e.variants]) {
      // candidate may contain several words; compare against each word and the whole
      const parts = [cand, ...cand.split(/[\s/]+/)]
      for (const c of parts) if (fold(c) === f) return { v: 'match', hit: cand }
    }
  }
  for (const e of entries) {
    for (const cand of [e.headword, ...e.variants]) {
      const c = fold(cand)
      if (c.length >= 4 && f.length >= 4 && (c.startsWith(f) || f.startsWith(c)) && Math.abs(c.length - f.length) <= 3) return { v: 'near', hit: cand }
    }
  }
  return { v: 'none' }
}

async function runDict(items: Item[]) {
  const cache: DictCache = existsSync(DICT_CACHE) ? JSON.parse(readFileSync(DICT_CACHE, 'utf8')) : {}
  const words = items.filter((i) => i.kind === 'word')
  let n = 0
  for (const w of words) {
    const terms = [w.lemma!, w.deLemma!]
    for (const t of terms) {
      if (!cache[t]) {
        await lookup(t, cache)
        n++
        await sleep(700) // be polite
        if (n % 20 === 0) {
          writeFileSync(DICT_CACHE, JSON.stringify(cache, null, 1))
          console.log(`dict: ${n} look-ups`)
        }
      }
    }
  }
  writeFileSync(DICT_CACHE, JSON.stringify(cache, null, 1))
  console.log(`dict done (${n} new look-ups)`)
}

// ---------------- Gemini second check ----------------
type GemResult = { id: string; bernese: boolean; issues: string; suggestion?: string }
type GemCache = Record<string, GemResult & { be: string }>

const GEM_PROMPT = `Du bist Dialektologe für Berndeutsch (Stadt und Agglomeration Bern, z. B. Ostermundigen).
Prüfe die folgenden berndeutschen Wörter/Sätze für eine Lern-App für Kinder. Die Schreibung folgt einer leserlichen, Dieth-nahen Konvention
(l-Vokalisierung als "u" geschrieben, z. B. Wäut, Miuch, Vogu; "y" für altes langes î, z. B. Zyt, wyss, chly; Artikel dr/d/ds).
Für jeden Eintrag: Ist das idiomatisches, heute in Bern gebräuchliches Berndeutsch mit der angegebenen hochdeutschen Bedeutung?
Markiere Formen, die typisch für Zürichdeutsch oder andere Dialekte sind, falsche Bedeutungen, oder sehr veraltete Wörter.
Schreibvarianten innerhalb unserer Konvention sind KEIN Fehler. Antworte NUR mit JSON: [{"id": "...", "bernese": true|false, "issues": "kurz, deutsch, leer wenn ok", "suggestion": "bessere berndeutsche Form oder leer"}]`

async function runGemini(items: Item[], force = false) {
  const key = geminiKey()
  if (!key) {
    console.warn('GEMINI_API_KEY missing – skipping Gemini check')
    return
  }
  const cache: GemCache = existsSync(GEM_CACHE) ? JSON.parse(readFileSync(GEM_CACHE, 'utf8')) : {}
  const todo = items.filter((i) => force || !cache[i.id] || cache[i.id].be !== i.be)
  console.log(`gemini: ${todo.length} items to check`)
  const BATCH = Number(process.env.BE_BATCH ?? 70)
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    const list = batch.map((b) => ({ id: b.id, be: b.be, de: b.de }))
    const text = await geminiText(`${GEM_PROMPT}\n\n${JSON.stringify(list, null, 0)}`, { json: true })
    if (!text) {
      console.warn('gemini: empty response, stopping (rate limit?)')
      break
    }
    try {
      const arr = JSON.parse(text) as GemResult[]
      for (const r of arr) {
        const it = batch.find((b) => b.id === r.id)
        if (it) cache[r.id] = { ...r, be: it.be }
      }
      writeFileSync(GEM_CACHE, JSON.stringify(cache, null, 1))
      console.log(`gemini: ${Math.min(i + BATCH, todo.length)}/${todo.length}`)
    } catch (e) {
      console.warn('gemini: could not parse batch', (e as Error).message)
    }
    await sleep(4500)
  }
}

// ---------------- combine ----------------
type Override = { confidence?: BeConfidence; note?: string; sources?: string[] }

function combine(items: Item[]) {
  const dict: DictCache = existsSync(DICT_CACHE) ? JSON.parse(readFileSync(DICT_CACHE, 'utf8')) : {}
  const gem: GemCache = existsSync(GEM_CACHE) ? JSON.parse(readFileSync(GEM_CACHE, 'utf8')) : {}
  const ov: Record<string, Override> = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {}
  const out: BeReviewEntry[] = []
  const details: { id: string; be: string; de: string; dict?: string; gem?: string; rules: RuleHit[]; conf: BeConfidence; note?: string }[] = []

  // words verified by dictionary become "known" vocabulary used to score sentences
  const known = new Set<string>()
  for (const it of items) {
    if (it.kind !== 'word') continue
    const entries = [...(dict[it.lemma!] ?? []), ...(dict[it.deLemma!] ?? [])]
    const dv = dictVerdict(it.lemma!, entries)
    if (dv.v !== 'none') known.add(fold(it.lemma!))
  }

  for (const it of items) {
    const rules = checkBernese(it.be)
    const ruleErr = rules.some((r) => r.severity === 'error')
    const g = gem[it.id] && gem[it.id].be === it.be ? gem[it.id] : undefined
    const sources: string[] = ['rules']
    let conf: BeConfidence
    let dictInfo: string | undefined
    if (it.kind === 'word') {
      const entries = [...(dict[it.lemma!] ?? []), ...(dict[it.deLemma!] ?? [])]
      const dv = dictVerdict(it.lemma!, entries)
      dictInfo = dv.v === 'none' ? 'no entry' : `${dv.v}: ${dv.hit}`
      if (dv.v !== 'none') sources.push('berndeutsch.ch')
      if (g) sources.push('gemini')
      const gemOk = g ? g.bernese : undefined
      // words written identically in Standard German (Tisch, Fisch, rot …) are not listed in the differential
      // dictionary; they follow the regular correspondence rules → confirmed by rules
      const identical = fold(it.lemma!) === fold(it.deLemma!)
      if (identical) sources.push('rules:identical-to-de')
      if (ruleErr) conf = 'low'
      else if (dv.v === 'match' && gemOk !== false) conf = 'high'
      else if (identical && gemOk === true) conf = 'high'
      else if (identical && gemOk !== false) conf = 'medium'
      else if (dv.v === 'near' && gemOk === true) conf = 'high'
      else if (dv.v !== 'none') conf = 'medium'
      else if (gemOk === true) conf = 'medium'
      else conf = 'low'
    } else {
      if (g) sources.push('gemini')
      const toks = it.be
        .toLowerCase()
        .replace(/[.,!?…]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2)
      const coverage = toks.length ? toks.filter((t) => known.has(fold(t))).length / toks.length : 0
      if (coverage > 0) sources.push('vocab-verified')
      if (ruleErr) conf = 'low'
      else if (g?.bernese === true) conf = rules.length === 0 || coverage >= 0.3 ? 'high' : 'medium'
      else if (g?.bernese === false) conf = 'low'
      else conf = 'medium' // not yet checked by the model: rules-only
    }
    const o = ov[it.id]
    let note = g?.issues || undefined
    if (o) {
      if (o.confidence) conf = o.confidence
      if (o.sources) for (const s of o.sources) if (!sources.includes(s)) sources.push(s)
      if (o.note) note = o.note
      sources.push('manual-review')
    }
    out.push({ id: it.id, be: it.be, confidence: conf, sources, note })
    details.push({ id: it.id, be: it.be, de: it.de, dict: dictInfo, gem: g ? (g.bernese ? 'ok' : `✗ ${g.issues}${g.suggestion ? ` → ${g.suggestion}` : ''}`) : undefined, rules, conf, note })
  }
  writeFileSync(OUT, JSON.stringify(out, null, 1))
  return details
}

function report(details: ReturnType<typeof combine>) {
  const by = (c: BeConfidence) => details.filter((d) => d.conf === c).length
  const words = details.filter((d) => d.id.startsWith('w.'))
  const dictHits = words.filter((d) => d.dict && d.dict !== 'no entry').length
  const gemChecked = details.filter((d) => d.gem).length
  const gemFlag = details.filter((d) => d.gem && d.gem !== 'ok')
  const low = details.filter((d) => d.conf === 'low')
  const lines: string[] = []
  lines.push('# Bärndütsch – raport weryfikacji', '')
  lines.push(`Wygenerowano: ${new Date().toISOString().slice(0, 10)} przez \`npx tsx scripts/verify-be.ts --report\`.`, '')
  lines.push('## Statystyki', '')
  lines.push(`| | liczba |`, `|---|---|`)
  lines.push(`| Pozycje BE (słowa, frazy, zdania historii, wersy piosenek, tytuły, polecenia) | ${details.length} |`)
  lines.push(`| – w tym słowa | ${words.length} |`)
  lines.push(`| Słowa potwierdzone w berndeutsch.ch (dokładnie lub wariant) | ${dictHits} |`)
  lines.push(`| Pozycje sprawdzone przez Gemini (druga kontrola) | ${gemChecked} |`)
  lines.push(`| Pozycje oznaczone przez Gemini jako wątpliwe | ${gemFlag.length} |`)
  lines.push(`| Pewność **wysoka** | ${by('high')} |`)
  lines.push(`| Pewność **średnia** | ${by('medium')} |`)
  lines.push(`| Pewność **niska** (nie trafia do dziecka) | ${by('low')} |`, '')
  lines.push('Zasady przyznawania pewności: patrz `docs/BAERNDUETSCH.md` → „Procedura weryfikacji”.', '')
  lines.push('## Pozycje oznaczone przez drugą kontrolę (Gemini) lub reguły', '')
  lines.push('| id | BE | DE | słownik | Gemini | reguły | pewność | decyzja |', '|---|---|---|---|---|---|---|---|')
  for (const d of details.filter((x) => (x.gem && x.gem !== 'ok') || x.rules.some((r) => r.severity === 'error') || x.conf === 'low')) {
    lines.push(`| ${d.id} | ${d.be} | ${d.de} | ${d.dict ?? '–'} | ${(d.gem ?? '–').replace(/\|/g, '/')} | ${d.rules.map((r) => `${r.word}: ${r.hint}`).join('; ') || '–'} | ${d.conf} | ${d.note ?? ''} |`)
  }
  lines.push('', '## Słowa bez wpisu w berndeutsch.ch', '')
  lines.push('| id | BE | DE | Gemini | pewność |', '|---|---|---|---|---|')
  for (const d of words.filter((x) => x.dict === 'no entry')) lines.push(`| ${d.id} | ${d.be} | ${d.de} | ${d.gem ?? '–'} | ${d.conf} |`)
  lines.push('', `Pozycje o niskiej pewności: ${low.length === 0 ? 'brak – wszystkie zastąpione lub usunięte.' : low.map((l) => l.id).join(', ')}`, '')
  const existing = existsSync(REPORT) ? readFileSync(REPORT, 'utf8') : ''
  const manual = existing.includes('<!-- MANUAL -->') ? existing.slice(existing.indexOf('<!-- MANUAL -->')) : '<!-- MANUAL -->\n## Decyzje ręczne i weryfikacja wymowy\n\n(uzupełniane ręcznie)\n'
  writeFileSync(REPORT, lines.join('\n') + '\n' + manual)
}

async function main() {
  const args = new Set(process.argv.slice(2))
  if (args.has('--dict')) await runDict(wordItems())
  if (args.has('--dict-only')) return
  const items = collectItems(await import('../content/index'))
  console.log(`${items.length} BE items`)
  if (args.has('--gemini')) await runGemini(items, args.has('--force'))
  const details = combine(items)
  if (args.has('--report')) report(details)
  const c = (x: BeConfidence) => details.filter((d) => d.conf === x).length
  console.log(`high ${c('high')} · medium ${c('medium')} · low ${c('low')}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
