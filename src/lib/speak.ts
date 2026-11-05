import type { Lang } from '@content/types'
import type { Profile } from './db'
import { play, playSequence } from './audio'

export function soundLangs(profile: Profile | null): Lang[] {
  if (!profile) return ['be']
  const langs: Lang[] = [profile.audioLang]
  if (profile.repeatSecond && profile.audioLang2 && profile.audioLang2 !== profile.audioLang) langs.push(profile.audioLang2)
  return langs
}

/** Speak an item in the profile's sound language(s). */
export function speak(profile: Profile | null, audioId: string, text?: Partial<Record<Lang, string>>) {
  return playSequence(audioId, soundLangs(profile), text)
}

/** Speak several items one after another in the sound language(s). */
export async function speakChain(profile: Profile | null, ids: string[]) {
  for (const id of ids) await playSequence(id, soundLangs(profile))
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
