import type { L4, Story, Song, Topic, Word, Phrase } from './types'
import { WORDS, WORD_BY_ID } from './words'
import { PHRASES, PHRASE_BY_ID } from './phrases'
import { STORIES } from './stories'
import { SONGS } from './songs'
import { TOPICS } from './topics'
import { UI_PROMPTS } from './prompts'

export { WORDS, WORD_BY_ID, PHRASES, PHRASE_BY_ID, STORIES, SONGS, TOPICS, UI_PROMPTS }
export const STORY_BY_ID: Record<string, Story> = Object.fromEntries(STORIES.map((s) => [s.id, s]))
export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(SONGS.map((s) => [s.id, s]))
export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]))

const TOKEN = /\[([^\]]+)\](\d+(?:\+\d+)*)/g
const plain = (s: string) => s.replace(TOKEN, '$1').replace(/\s+/g, ' ').trim()
const plainL4 = (x: L4): L4 => ({ be: plain(x.be), de: plain(x.de), pl: plain(x.pl), en: plain(x.en) })

export interface AudioItem {
  id: string
  text: L4
  kind: 'word' | 'phrase' | 'story' | 'song' | 'title' | 'prompt' | 'sound'
}

/** Every piece of content that must have pronunciation in all four languages. */
export function allAudioItems(): AudioItem[] {
  const out: AudioItem[] = []
  for (const w of WORDS as Word[]) {
    out.push({ id: `w.${w.id}`, text: w.text, kind: 'word' })
    if (w.sound) out.push({ id: `snd.${w.id}`, text: w.sound, kind: 'sound' })
  }
  for (const p of PHRASES as Phrase[]) out.push({ id: `p.${p.id}`, text: plainL4(p.src), kind: 'phrase' })
  for (const s of STORIES) {
    out.push({ id: `st.${s.id}`, text: s.title, kind: 'title' })
    s.pages.forEach((pg, i) => {
      out.push({ id: `s.${s.id}.${i}`, text: plainL4(pg.text), kind: 'story' })
      if (pg.choice) {
        out.push({ id: `s.${s.id}.${i}.c`, text: plainL4(pg.choice.prompt), kind: 'story' })
        pg.choice.options.forEach((o, k) => out.push({ id: `s.${s.id}.${i}.o${k}`, text: plainL4(o.label), kind: 'story' }))
      }
      if (pg.question) out.push({ id: `s.${s.id}.${i}.q`, text: plainL4(pg.question.prompt), kind: 'story' })
    })
  }
  for (const s of SONGS) {
    out.push({ id: `sg.${s.id}`, text: s.title, kind: 'title' })
    s.lines.forEach((l, i) => out.push({ id: `song.${s.id}.${i}`, text: plainL4(l.src), kind: 'song' }))
  }
  for (const t of TOPICS) out.push({ id: `t.${t.id}`, text: t.title, kind: 'title' })
  for (const p of UI_PROMPTS) out.push({ id: `ui.${p.id}`, text: p.text, kind: 'prompt' })
  return out
}

let audioIndex: Map<string, L4> | null = null
export function audioText(id: string): L4 | undefined {
  if (!audioIndex) audioIndex = new Map(allAudioItems().map((a) => [a.id, a.text]))
  return audioIndex.get(id)
}
