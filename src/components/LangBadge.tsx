import type { Lang } from '@content/types'

/**
 * Fixed colour + symbol per language, consistent across the app.
 * Colours differ strongly in lightness so they stay distinguishable with colour-vision deficiencies:
 * BE dark red (L≈38), DE golden (L≈72), PL teal (L≈55), EN deep blue (L≈32).
 */
export const LANG_META: Record<Lang, { name: string; short: string; color: string; soft: string; ink: string }> = {
  be: { name: 'Bärndütsch', short: 'BE', color: '#b3261e', soft: '#fde3df', ink: '#ffffff' },
  de: { name: 'Deutsch', short: 'DE', color: '#e0a21b', soft: '#fff2cc', ink: '#2b2000' },
  pl: { name: 'Polski', short: 'PL', color: '#1f8f7f', soft: '#d6f3ee', ink: '#ffffff' },
  en: { name: 'English', short: 'EN', color: '#2747a8', soft: '#dfe6fb', ink: '#ffffff' },
}

/** Small flag/symbol. BE = original little bear on the Bern colours (not the coat of arms). */
export function LangBadge({ lang, size = 22 }: { lang: Lang; size?: number }) {
  const r = 4
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 32 24" aria-label={LANG_META[lang].name} role="img" className="inline-block shrink-0">
      <clipPath id={`clip-${lang}`}>
        <rect width="32" height="24" rx={r} />
      </clipPath>
      <g clipPath={`url(#clip-${lang})`}>
        {lang === 'be' && (
          <>
            <rect width="32" height="24" fill="#c8102e" />
            <path d="M0 24 L32 0 L32 24 Z" fill="#f2c200" />
            {/* tiny friendly bear head */}
            <circle cx="16" cy="12.5" r="6.2" fill="#1b1b1b" />
            <circle cx="11.3" cy="7.6" r="2.4" fill="#1b1b1b" />
            <circle cx="20.7" cy="7.6" r="2.4" fill="#1b1b1b" />
            <ellipse cx="16" cy="14.6" rx="2.8" ry="2.1" fill="#f6d8b0" />
            <circle cx="16" cy="13.8" r="0.9" fill="#1b1b1b" />
            <circle cx="13.6" cy="11" r="0.8" fill="#fff" />
            <circle cx="18.4" cy="11" r="0.8" fill="#fff" />
          </>
        )}
        {lang === 'de' && (
          <>
            <rect width="32" height="8" fill="#1b1b1b" />
            <rect y="8" width="32" height="8" fill="#dd0000" />
            <rect y="16" width="32" height="8" fill="#ffce00" />
          </>
        )}
        {lang === 'pl' && (
          <>
            <rect width="32" height="12" fill="#ffffff" />
            <rect y="12" width="32" height="12" fill="#dc143c" />
          </>
        )}
        {lang === 'en' && (
          <>
            <rect width="32" height="24" fill="#012169" />
            <path d="M0 0 L32 24 M32 0 L0 24" stroke="#fff" strokeWidth="5" />
            <path d="M0 0 L32 24 M32 0 L0 24" stroke="#c8102e" strokeWidth="2" />
            <path d="M16 0 V24 M0 12 H32" stroke="#fff" strokeWidth="7" />
            <path d="M16 0 V24 M0 12 H32" stroke="#c8102e" strokeWidth="4" />
          </>
        )}
      </g>
      <rect width="32" height="24" rx={r} fill="none" stroke="rgba(0,0,0,.25)" />
    </svg>
  )
}
