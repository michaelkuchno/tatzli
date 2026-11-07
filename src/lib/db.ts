import Dexie, { type EntityTable } from 'dexie'
import type { Lang, Level } from '@content/types'

export interface Profile {
  id?: number
  nickname: string
  level: Level
  avatar: string
  /** displayed languages in display order */
  langs: Lang[]
  /** sound languages in playback order (1–4); every word/sentence is spoken in each of them, one after another */
  audioLangs: Lang[]
  /** @deprecated v1/v2 – first sound language (kept in sync with audioLangs[0]) */
  audioLang: Lang
  /** @deprecated v1/v2 */
  audioLang2?: Lang
  /** @deprecated v1/v2 */
  repeatSecond: boolean
  sessionMinutes: number
  /** speaking speed 0.7–1.0 (unset = default for the level, see speechRate()) */
  speechRate?: number
  createdAt: number
}

export interface ItemProgress {
  key: string // `${profileId}:${itemId}`
  profileId: number
  itemId: string
  kind: 'word' | 'phrase'
  exposures: number
  /** 0..6 strength (Leitner box) – never shown to the child */
  strength: number
  lastSeen: number
  due: number
  hints: number
}

export interface TopicProgress {
  key: string // `${profileId}:${topicId}`
  profileId: number
  topicId: string
  visits: number
  done: string[] // activity kinds completed at least once
  lastVisit: number
}

export interface Sticker {
  key: string
  profileId: number
  stickerId: string
  earnedAt: number
}

export interface Favorite {
  key: string
  profileId: number
  itemId: string
}

export interface SessionLog {
  id?: number
  profileId: number
  date: string // YYYY-MM-DD
  seconds: number
  skips: number
  hints: number
  completions: number
}

export interface Recording {
  key: string // `${audioId}:${lang}`
  audioId: string
  lang: Lang
  blob: Blob
  mime: string
  author: string
  createdAt: number
}

export interface Setting {
  key: string
  value: unknown
}

export type AiKind = 'scene' | 'variant' | 'idea'
export type AiStatus = 'pending' | 'approved' | 'rejected'
export interface AiItem {
  id?: number
  kind: AiKind
  status: AiStatus
  createdAt: number
  request: Record<string, unknown>
  payload: unknown
  qc?: { ok: boolean; notes: string; beIssues: string[] }
  beConfidence?: 'high' | 'medium' | 'low'
  audioReady?: boolean
  error?: string
}

export interface AudioBlob {
  key: string // `${audioId}:${lang}`
  blob: Blob
}

export interface KeyRecord {
  id: string
  key: CryptoKey
}

export class TatzliDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  progress!: EntityTable<ItemProgress, 'key'>
  topics!: EntityTable<TopicProgress, 'key'>
  stickers!: EntityTable<Sticker, 'key'>
  favorites!: EntityTable<Favorite, 'key'>
  sessions!: EntityTable<SessionLog, 'id'>
  recordings!: EntityTable<Recording, 'key'>
  settings!: EntityTable<Setting, 'key'>
  aiQueue!: EntityTable<AiItem, 'id'>
  aiAudio!: EntityTable<AudioBlob, 'key'>
  keys!: EntityTable<KeyRecord, 'id'>

  constructor(name = 'tatzli') {
    super(name)
    // v1 – initial schema
    this.version(1).stores({
      profiles: '++id, nickname',
      progress: 'key, profileId, itemId, due',
      topics: 'key, profileId, topicId',
      stickers: 'key, profileId',
      favorites: 'key, profileId',
      sessions: '++id, profileId, date, [profileId+date]',
      recordings: 'key, audioId',
      settings: 'key',
    })
    // v2 – AI queue, AI audio and encrypted key store; profile defaults migration
    this.version(2)
      .stores({
        aiQueue: '++id, status, kind, createdAt',
        aiAudio: 'key',
        keys: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('profiles')
          .toCollection()
          .modify((p: Profile) => {
            if (p.repeatSecond === undefined) p.repeatSecond = false
          })
      })
    // v3 – sound in up to four languages in a chosen order (replaces 'repeat in second language')
    this.version(3)
      .stores({})
      .upgrade(async (tx) => {
        await tx
          .table('profiles')
          .toCollection()
          .modify((p: Profile) => {
            if (!p.audioLangs) p.audioLangs = p.repeatSecond && p.audioLang2 && p.audioLang2 !== p.audioLang ? [p.audioLang, p.audioLang2] : [p.audioLang ?? 'be']
          })
      })
  }
}

export const db = new TatzliDB()

export const pkey = (profileId: number, id: string) => `${profileId}:${id}`

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key)
  return (row?.value as T | undefined) ?? fallback
}
export async function setSetting(key: string, value: unknown) {
  await db.settings.put({ key, value })
}

export function today(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
