import type { Lang } from '../../../content/types'

/** TTS style instructions per language (Bernese explicitly requested as dialect). */
export const TTS_STYLE: Record<Lang, string> = {
  be: 'Sprich den folgenden Text auf Berndeutsch (Berner Mundart aus der Stadt Bern), nicht Hochdeutsch, warm, langsam und deutlich für kleine Kinder:',
  de: 'Sprich den folgenden Text auf Hochdeutsch, warm, langsam und deutlich für kleine Kinder:',
  pl: 'Przeczytaj poniższy tekst po polsku, ciepło, powoli i wyraźnie dla małych dzieci:',
  en: 'Read the following text in British English, warmly, slowly and clearly for small children:',
}
export const TTS_VOICE: Record<Lang, string> = { be: 'Sulafat', de: 'Sulafat', pl: 'Sulafat', en: 'Sulafat' }
