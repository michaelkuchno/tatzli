/**
 * Rule-based Bernese checks (phonology/morphology markers + forms typical of other dialects).
 * Used by scripts/verify-be.ts, by the AI pipeline at runtime and by unit tests.
 */

export interface RuleHit {
  rule: string
  word: string
  severity: 'error' | 'warn'
  hint: string
}

/** Whole-word forms that are typical of Zurich / other dialects and should not appear in our Bernese. */
export const NON_BERNESE: { form: string; hint: string }[] = [
  { form: 'grüezi', hint: 'Bern: Grüessech' },
  { form: 'grüezech', hint: 'Bern: Grüessech' },
  { form: 'hoi', hint: 'Bern: Sali / Hallo' },
  { form: 'gönd', hint: 'Bern: göh' },
  { form: 'gömmer', hint: 'Bern: mir göh' },
  { form: 'gaat', hint: 'Bern: geit' },
  { form: 'gaht', hint: 'Bern: geit' },
  { form: 'nöd', hint: 'Bern: nid' },
  { form: 'meitli', hint: 'Bern: Meitschi' },
  { form: 'chli', hint: 'Bern: chly' },
  { form: 'chlii', hint: 'Bern: chly' },
  { form: 'wält', hint: 'Bern: Wäut (l-Vokalisierung)' },
  { form: 'mached', hint: 'Bern: mache' },
  { form: 'händ', hint: 'Bern (Verb): hei; als Nomen „Händ“ (Hände) ok', },
  { form: 'sind', hint: 'Bern: sy' },
  { form: 'isch gsi', hint: 'ok – kept for completeness' },
  { form: 'öpper', hint: 'Bern: öpper ist ok' },
  { form: 'tüend', hint: 'Bern: tüe' },
  { form: 'chömed', hint: 'Bern: chömet / chöme' },
  { form: 'luegt', hint: 'ok' },
  { form: 'mer', hint: 'Bern „wir“: mir (mer nur als unbetontes „mir/mich“ ok)' },
]

// Forms that are only warnings (can be legit in certain uses)
const WARN_ONLY = new Set(['händ', 'mer', 'öpper', 'isch gsi', 'luegt'])
const IGNORE = new Set(['öpper', 'isch gsi', 'luegt'])

const norm = (s: string) => s.toLowerCase().normalize('NFC')

function words(text: string): string[] {
  return norm(text)
    .replace(/[.,!?;:«»"“”„()…–-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function checkBernese(text: string): RuleHit[] {
  const hits: RuleHit[] = []
  const ws = words(text)
  for (const { form, hint } of NON_BERNESE) {
    if (IGNORE.has(form)) continue
    if (form.includes(' ')) {
      if (norm(text).includes(form)) hits.push({ rule: 'non-bernese', word: form, severity: WARN_ONLY.has(form) ? 'warn' : 'error', hint })
      continue
    }
    if (ws.includes(form)) {
      // "Händ" as a noun (capitalised in source) is fine
      if (form === 'händ' && /\bHänd\b/.test(text)) continue
      // "mer" as unstressed object pronoun after a verb ("Zeig mer", "Chasch mer") is fine
      if (form === 'mer' && /\b(zeig|chasch|gisch|gib|säg|hilf|bring)\s+mer\b/i.test(text)) continue
      hits.push({ rule: 'non-bernese', word: form, severity: WARN_ONLY.has(form) ? 'warn' : 'error', hint })
    }
  }
  // Unstressed schwa written as ä at word end (e.g. "Gipfäli") – berndeutsch.ch guidance
  for (const w of ws) {
    if (/[^aeiouäöü]äli$/.test(w)) hits.push({ rule: 'schwa-ae', word: w, severity: 'warn', hint: 'unbetontes e bleibt e (…eli)' })
  }
  // l before consonant / word end should be vocalised in Bernese: "Wald" -> "Waud", "viel" -> "viu"
  for (const w of ws) {
    if (/(?:[aeiouäöü])l(?:[dtbcfgkmpsz]|$)/.test(w) && !L_EXCEPTIONS.has(w) && !w.startsWith('ll')) {
      // double l (e.g. "Ball" -> "Bau") and "ll" endings are also vocalised; only warn
      hits.push({ rule: 'l-vocalisation', word: w, severity: 'warn', hint: 'Bern vokalisiert l vor Konsonant / im Auslaut (l → u)' })
    }
  }
  return hits
}

/**
 * Words where a written l before consonant/at end is usual even in Bernese spelling
 * (loanwords, names, standard-near words, or l after which a vowel follows in inflection).
 */
export const L_EXCEPTIONS = new Set([
  'gibel', 'hallo', 'salat', 'bleistift', 'billett', 'telefon', 'lampe', 'velo', 'schoggi', 'tschou', 'all',
  'familie', 'giel', 'viel', 'zahl', 'ballon', 'violett', 'helfe', 'häll', 'hell', 'puzzle', 'glas', 'gable',
  'üle', 'spile', 'spiel', 'schnell', 'kreisel', 'mol', 'mal', 'well', 'öl', 'mehl', 'lampion', 'spital',
  'apfel', 'stall', 'teller', 'täller', 'allei', 'als', 'hals', 'mill', 'oblate', 'klötzli', 'plüsch',
])

/** Positive Bernese markers (used to compute a "bernese-ness" signal in the report). */
export const BERNESE_MARKERS = [
  'gange', 'göh', 'geit', 'chunnt', 'chöme', 'mir', 'sy', 'hei', 'wei', 'chöi', 'chly', 'giel', 'meitschi', 'gspänli',
  'grüessech', 'merci', 'viu', 'mau', 'aui', 'wäut', 'äuä', 'gäu', 'nid', 'ds', 'dr', 'tschou', 'adie',
]
