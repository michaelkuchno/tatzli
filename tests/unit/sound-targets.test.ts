import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS } from '@content/types'
import { TOPICS, STORIES, WORDS, PHRASES, SONGS, WORD_BY_ID, UI_PROMPTS, allAudioItems } from '@content/index'
import { audioIdForKey, CHARACTER_AUDIO } from '@content/characters'
import { COLOR_CYCLE } from '@/lib/speak'

const items = new Map(allAudioItems().map((a) => [a.id, a]))
const has = (id: string) => items.has(id) && LANGS.every((l) => (items.get(id)!.text[l] ?? '').trim().length > 0)

function srcFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? srcFiles(p) : p.endsWith('.tsx') || p.endsWith('.ts') ? [p] : []
  })
}

describe('every clickable thing has a pronunciation target in 4 languages', () => {
  it('words, animal sounds, phrases, stories, songs, topic titles', () => {
    const missing: string[] = []
    for (const w of WORDS) {
      if (!has(`w.${w.id}`)) missing.push(`w.${w.id}`)
      if (w.sound && !has(`snd.${w.id}`)) missing.push(`snd.${w.id}`)
    }
    for (const p of PHRASES) if (!has(`p.${p.id}`)) missing.push(`p.${p.id}`)
    for (const s of STORIES) {
      if (!has(`st.${s.id}`)) missing.push(`st.${s.id}`)
      s.pages.forEach((pg, i) => {
        if (!has(`s.${s.id}.${i}`)) missing.push(`s.${s.id}.${i}`)
        if (pg.choice) {
          if (!has(`s.${s.id}.${i}.c`)) missing.push(`s.${s.id}.${i}.c`)
          pg.choice.options.forEach((_, k) => !has(`s.${s.id}.${i}.o${k}`) && missing.push(`s.${s.id}.${i}.o${k}`))
        }
        if (pg.question && !has(`s.${s.id}.${i}.q`)) missing.push(`s.${s.id}.${i}.q`)
      })
    }
    for (const s of SONGS) s.lines.forEach((_, i) => !has(`song.${s.id}.${i}`) && missing.push(`song.${s.id}.${i}`))
    for (const t of TOPICS) if (!has(`t.${t.id}`)) missing.push(`t.${t.id}`)
    expect(missing).toEqual([])
  })

  it('album stickers, sorting bins, recolour colours', () => {
    const missing: string[] = []
    for (const t of TOPICS) {
      if (!has(`w.${t.sticker}`)) missing.push(`sticker ${t.id}: ${t.sticker}`)
      t.sort?.bins.forEach((_, i) => !has(`bin.${t.id}.${i}`) && missing.push(`bin.${t.id}.${i}`))
    }
    for (const c of COLOR_CYCLE) if (!has(`w.${c.id}`)) missing.push(`colour ${c.id}`)
    expect(missing).toEqual([])
  })

  it('every character in a story scene says its name', () => {
    const missing = new Set<string>()
    const PROPS = new Set(['heart-small', 'sparkle', 'basket', 'box', 'sticker-star', 'picnic-blanket', 'bench', 'fountain', 'flower-box', 'sandcastle'])
    for (const s of STORIES)
      for (const p of s.pages)
        for (const it of p.scene.items) {
          if (PROPS.has(it.key)) continue
          const id = audioIdForKey(it.key, !!WORD_BY_ID[it.key])
          if (!id || !has(id)) missing.add(it.key)
        }
    expect([...missing]).toEqual([])
    for (const k of Object.keys(CHARACTER_AUDIO)) expect(audioIdForKey(k, false)).toBeTruthy()
  })

  it('every ui.* prompt used in the code exists', () => {
    const used = new Set<string>()
    for (const f of srcFiles(join(__dirname, '..', '..', 'src'))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/'ui\.([a-z-]+)'/g)) used.add(m[1])
    }
    // kino prompts are chosen from settings
    for (const p of ['your-turn', 'say-again', 'say-with-me', 'can-you']) used.add(p)
    const known = new Set(UI_PROMPTS.map((p) => p.id))
    expect([...used].filter((u) => !known.has(u))).toEqual([])
    for (const u of used) expect(has(`ui.${u}`), u).toBe(true)
  })
})
