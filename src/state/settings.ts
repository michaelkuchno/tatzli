import type { UiLang } from '@/lib/i18n'

export interface AppSettings {
  uiLang: UiLang
  volume: number
  music: boolean
  trail: boolean
  reducedMotion: 'system' | 'on' | 'off'
  captions: boolean
  parentTips: boolean
  tvMode: 'auto' | 'on' | 'off'
  /** story/topic/AI ids approved by the parent for the daily surprise */
  surprisePool: string[]
  aiTextModel: string
  aiTtsModel: string
  /** translator: offer an (unverified, clearly marked) AI voice for translations – off by default */
  translateVoice: boolean
  /** parent-marked items checked by someone from Bern */
  beChecked: Record<string, { by: string; at: number }>
  /** per-profile session extension for today (minutes) */
  extendToday: Record<string, number>
  audioPrefetched: boolean
  /** play only verified recordings (no device speech synthesis) */
  strictAudio: boolean
  /** mealtime show */
  kinoMinutes: number
  kinoPrompt: string
  kinoMix: { songs: boolean; stories: boolean; words: boolean; colors: boolean }
}

export const DEFAULT_SETTINGS: AppSettings = {
  uiLang: 'pl',
  volume: 0.8,
  music: true,
  trail: true,
  reducedMotion: 'system',
  captions: true,
  parentTips: true,
  tvMode: 'auto',
  surprisePool: [],
  aiTextModel: 'gemini-3.5-flash',
  aiTtsModel: 'gemini-2.5-flash-preview-tts',
  translateVoice: false,
  beChecked: {},
  extendToday: {},
  audioPrefetched: false,
  strictAudio: true,
  kinoMinutes: 20,
  kinoPrompt: 'your-turn',
  kinoMix: { songs: true, stories: true, words: true, colors: true },
}
