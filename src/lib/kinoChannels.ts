import type { L4, WordCategory } from '@content/types'
import { timeLapse } from './testSpeed'

/**
 * The cinema's "films": each is a short, finite programme of one kind. After one film the next one starts by itself
 * (until the grown-up's cinema time is used up). Lessons (topics) are films too.
 */
export type ChannelId = 'mix' | 'songs' | 'stories' | 'phrases' | `cat-${WordCategory}`

export interface Channel {
  id: ChannelId
  icon: string
  color: string
  title: L4
  /** the kinds of segments this film contains */
  kind: 'mix' | 'songs' | 'stories' | 'phrases' | 'words'
  cats?: WordCategory[]
  /** how many items one film shows */
  size: number
}

const c = (id: ChannelId, icon: string, color: string, title: L4, kind: Channel['kind'], size: number, cats?: WordCategory[]): Channel => ({ id, icon, color, title, kind, size, cats })

export const CHANNELS: Channel[] = [
  c('mix', 'tatzli', '#ffe58a', { be: 'Vo auem öppis', de: 'Von allem etwas', pl: 'Wszystkiego po trochu', en: 'A bit of everything' }, 'mix', 12),
  c('songs', 'pose-sing', '#fbcfe8', { be: 'Lieder', de: 'Lieder', pl: 'Piosenki', en: 'Songs' }, 'songs', 3),
  c('stories', 'buech', '#fde2c4', { be: 'Gschichte', de: 'Geschichten', pl: 'Bajki', en: 'Stories' }, 'stories', 2),
  c('cat-animals', 'chue', '#d9f99d', { be: 'Tier', de: 'Tiere', pl: 'Zwierzęta', en: 'Animals' }, 'words', 10, ['animals']),
  c('cat-food', 'oepfu', '#fecaca', { be: 'Ässe', de: 'Essen', pl: 'Jedzenie', en: 'Food' }, 'words', 10, ['food']),
  c('cat-colors', 'rot', '#e9d5ff', { be: 'Farbe', de: 'Farben', pl: 'Kolory', en: 'Colours' }, 'words', 8, ['colors', 'shapes']),
  c('cat-numbers', 'kloetzli', '#bfdbfe', { be: 'Zahle', de: 'Zahlen', pl: 'Liczby', en: 'Numbers' }, 'words', 10, ['numbers']),
  c('cat-transport', 'bus', '#c7d2fe', { be: 'Underwägs', de: 'Unterwegs', pl: 'W drodze', en: 'On the move' }, 'words', 10, ['transport']),
  c('cat-body', 'nase', '#fed7aa', { be: 'Dr Körper', de: 'Der Körper', pl: 'Ciało', en: 'The body' }, 'words', 10, ['body', 'clothes']),
  c('cat-family', 'mami', '#fbcfe8', { be: 'Familie', de: 'Familie', pl: 'Rodzina', en: 'Family' }, 'words', 10, ['family', 'emotions']),
  c('cat-home', 'huus', '#fef3c7', { be: 'Dehei', de: 'Zuhause', pl: 'W domu', en: 'At home' }, 'words', 10, ['home', 'toys']),
  c('cat-nature', 'boum', '#bbf7d0', { be: 'Natur', de: 'Natur', pl: 'Przyroda', en: 'Nature' }, 'words', 10, ['nature', 'time']),
  c('phrases', 'pose-wave', '#a5f3fc', { be: 'Sätzli', de: 'Sätze', pl: 'Zdania', en: 'Sentences' }, 'phrases', 8),
]
export const CHANNEL_BY_ID = Object.fromEntries(CHANNELS.map((x) => [x.id, x])) as Record<ChannelId, Channel>

/** the cinema session (one meal): the grown-up's time limit counts across all films */
let sessionStart = 0
export function startKinoSession() {
  sessionStart = Date.now()
}
export function kinoSessionSeconds() {
  if (!sessionStart) sessionStart = Date.now()
  return ((Date.now() - sessionStart) / 1000) * timeLapse()
}
