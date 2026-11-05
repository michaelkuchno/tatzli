import type { L4 } from './types'

/** Spoken names of the cast (clicking a character in a scene says who it is). Family members reuse their word. */
export const CHARACTER_AUDIO: Record<string, { word?: string; name?: L4 }> = {
  tatzli: { name: { be: 'Tatzli', de: 'Tatzli', pl: 'Tatzli', en: 'Tatzli' } },
  lotti: { name: { be: 'Lotti', de: 'Lotti', pl: 'Lotti', en: 'Lotti' } },
  kasia: { name: { be: 'Kasia, ds Eichhörnli', de: 'Kasia, das Eichhörnchen', pl: 'Kasia, wiewiórka', en: 'Kasia the squirrel' } },
  freddie: { name: { be: 'Freddie, dr Fuchs', de: 'Freddie, der Fuchs', pl: 'Freddie, lis', en: 'Freddie the fox' } },
  'tante-ottilie': { name: { be: 'Tante Ottilie', de: 'Tante Ottilie', pl: 'Ciocia Ottilie', en: 'Aunt Ottilie' } },
  'mami-baer': { word: 'mami' },
  'papi-baer': { word: 'papi' },
  'grosi-baer': { word: 'grosi' },
  'grossaetti-baer': { word: 'grossaetti' },
  'bebe-baer': { word: 'bebe' },
}

/** Audio id for a scene item key (word, character) or undefined for purely decorative props. */
export function audioIdForKey(key: string, isWord: boolean): string | undefined {
  if (isWord) return `w.${key}`
  const c = CHARACTER_AUDIO[key]
  if (!c) return undefined
  return c.word ? `w.${c.word}` : `ch.${key}`
}
