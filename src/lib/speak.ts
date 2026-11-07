import type { Lang } from '@content/types'
import type { Profile } from './db'
import { play, playSequence, playGroups } from './audio'

export function soundLangs(profile: Profile | null): Lang[] {
  if (!profile) return ['be']
  if (profile.audioLangs?.length) return profile.audioLangs
  const langs: Lang[] = [profile.audioLang]
  if (profile.repeatSecond && profile.audioLang2 && profile.audioLang2 !== profile.audioLang) langs.push(profile.audioLang2)
  return langs
}

/** Speak an item in the profile's sound language(s). */
export function speak(profile: Profile | null, audioId: string, text?: Partial<Record<Lang, string>>) {
  return playSequence(audioId, soundLangs(profile), text)
}

/** Speak several items as one utterance per sound language («Wo isch …? · dr Aff», then «Wo ist …? · der Affe»). */
export function speakChain(profile: Profile | null, ids: string[]) {
  return playGroups(ids, soundLangs(profile))
}

/** Speaking speed options (parent area). Default depends on the level: 2–3 y slow, 4–5 y a bit slower, 6–7 y normal. */
export const SPEECH_RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1] as const
export function speechRate(profile: Profile | null): number {
  if (profile?.speechRate) return profile.speechRate
  return profile?.level === 1 ? 0.8 : profile?.level === 3 ? 1 : 0.9
}

/** Speak an item in one specific language (speaker buttons, tapping a language row). */
export function speakIn(audioId: string, lang: Lang, text?: string) {
  return play(audioId, lang, text)
}

export const COLOR_CYCLE: { id: string; hex: string }[] = [
  { id: 'rot', hex: '#e2493b' },
  { id: 'blau', hex: '#3f8fd8' },
  { id: 'gaeub', hex: '#f6c945' },
  { id: 'grueen', hex: '#5fae4f' },
  { id: 'orangsch', hex: '#f28c28' },
  { id: 'violett', hex: '#8e5bbf' },
  { id: 'rosa', hex: '#f7a8c8' },
  { id: 'bruun', hex: '#8b5a2b' },
]
