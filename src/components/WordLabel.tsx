import { useState } from 'react'
import type { Lang } from '@content/types'
import { WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { speakIn } from '@/lib/speak'
import { LANG_META, LangBadge } from './LangBadge'
import { showColor } from './ColorBurst'

/** Speaker icon button for one language. */
export function SpeakerButton({ audioId, lang, text, size = 36 }: { audioId: string; lang: Lang; text?: string; size?: number }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full shadow-sm active:scale-95 transition-transform"
      style={{ width: size, height: size, background: LANG_META[lang].color, color: LANG_META[lang].ink }}
      aria-label={`${LANG_META[lang].name}: ${text ?? audioId}`}
      data-testid={`speak-${lang}`}
      onClick={(e) => {
        e.stopPropagation()
        void speakIn(audioId, lang, text)
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="currentColor" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16 8.5c1.2 1 1.8 2.2 1.8 3.5s-.6 2.5-1.8 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

/**
 * A word in all displayed languages. Hovering/tapping one language highlights its equivalents
 * in the other languages (same background) and plays its pronunciation.
 */
export function WordLabel({ wordId, compact, langs: langsProp }: { wordId: string; compact?: boolean; langs?: Lang[] }) {
  const { profile } = useApp()
  const w = WORD_BY_ID[wordId]
  const [hot, setHot] = useState(false)
  if (!w) return null
  const langs = langsProp ?? profile?.langs ?? ['be', 'de', 'pl', 'en']
  return (
    <div
      className={`word-label flex flex-col gap-1 rounded-2xl bg-white/95 shadow-lg ${compact ? 'p-1.5' : 'p-3'} min-w-max`}
      onPointerLeave={() => setHot(false)}
      data-testid={`label-${wordId}`}
    >
      {langs.map((l) => (
        <div
          key={l}
          data-lang={l}
          data-hot={hot ? 'true' : 'false'}
          className={`flex items-center gap-2 rounded-xl px-2 py-0.5 transition-all duration-200 cursor-pointer ${hot ? 'scale-105' : ''}`}
          style={{ background: hot ? '#ffe58a' : 'transparent', boxShadow: hot ? `inset 4px 0 0 ${LANG_META[l].color}` : undefined }}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setHot(true)
          }}
          onClick={(e) => {
            e.stopPropagation()
            setHot(true)
            showColor(w.id)
            void speakIn(`w.${w.id}`, l)
          }}
        >
          <LangBadge lang={l} size={compact ? 18 : 24} />
          <span className={`font-bold ${compact ? 'text-base' : 'text-2xl tv:text-4xl'}`} style={{ color: LANG_META[l].color === '#e0a21b' ? '#8a5d00' : LANG_META[l].color }}>
            {w.text[l]}
          </span>
          {!compact && <SpeakerButton audioId={`w.${w.id}`} lang={l} text={w.text[l]} size={32} />}
        </div>
      ))}
    </div>
  )
}
