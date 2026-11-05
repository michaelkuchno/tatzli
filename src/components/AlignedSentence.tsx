import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AlignedSource, Lang } from '@content/types'
import { parseSentence, plain } from '@/lib/align'
import { WORDS } from '@/lib/content'
import { speakIn } from '@/lib/speak'
import { useApp } from '@/state/AppContext'
import { LANG_META, LangBadge } from './LangBadge'
import { SpeakerButton } from './WordLabel'

const GROUP_COLORS = ['#ffe58a', '#bfe9ff', '#ffd1e1', '#c9f2c7', '#e5d4ff', '#ffd8b0']

const strip = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?…:;«»"“”„]/g, '')
    .trim()

/** Find a word whose text (with or without article) equals the segment, to play word-level audio. */
function wordForSegment(lang: Lang, text: string): string | undefined {
  const t = strip(text)
  for (const w of WORDS) {
    const full = strip(w.text[lang])
    const bare = full.replace(/^(dr|d|ds|der|die|das|the)\s+/, '')
    if (t === full || t === bare) return w.id
  }
  return undefined
}

export interface AlignedSentenceProps {
  src: AlignedSource
  audioId: string
  langs?: Lang[]
  size?: 'md' | 'lg' | 'xl'
  /** index of segment to emphasise in the first language (song karaoke) */
  activeWord?: { lang: Lang; index: number } | null
  testId?: string
}

/**
 * Sentence shown in all displayed languages, one row per language. Hover/tap a phrase segment →
 * equivalents in the other languages light up in the same colour (phrase-level alignment), with
 * connecting lines on big screens, and the segment is pronounced.
 */
export function AlignedSentence({ src, audioId, langs: langsProp, size = 'lg', activeWord, testId }: AlignedSentenceProps) {
  const { profile, tv } = useApp()
  const langs = langsProp ?? profile?.langs ?? ['be', 'de', 'pl', 'en']
  const sentence = useMemo(() => parseSentence(src), [src])
  const [hot, setHot] = useState<number[] | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; c: string }[]>([])
  const text = { md: 'text-xl', lg: 'text-2xl md:text-3xl', xl: 'text-3xl md:text-5xl' }[size]

  useLayoutEffect(() => {
    if (!hot || !box.current || !(tv || window.innerWidth >= 1024)) {
      setLines([])
      return
    }
    const root = box.current.getBoundingClientRect()
    const rows = langs.map((l) => Array.from(box.current!.querySelectorAll<HTMLElement>(`[data-row="${l}"] [data-hot="true"]`)))
    const out: { x1: number; y1: number; x2: number; y2: number; c: string }[] = []
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i][0]
      const b = rows[i + 1][0]
      if (!a || !b) continue
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      out.push({ x1: ra.left + ra.width / 2 - root.left, y1: ra.bottom - root.top, x2: rb.left + rb.width / 2 - root.left, y2: rb.top - root.top, c: GROUP_COLORS[(hot[0] - 1) % GROUP_COLORS.length] })
    }
    setLines(out)
  }, [hot, langs, tv])

  return (
    <div ref={box} className="aligned relative flex flex-col gap-2" data-testid={testId} onPointerLeave={() => setHot(null)}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.c} strokeWidth={6} strokeLinecap="round" opacity={0.9} className="align-line" />
        ))}
      </svg>
      {langs.map((lang) => (
        <div key={lang} data-row={lang} className="flex flex-wrap items-center gap-x-1 gap-y-1">
          <LangBadge lang={lang} size={26} />
          <span className={`${text} font-bold leading-snug`} style={{ color: lang === 'de' ? '#7a5200' : LANG_META[lang].color }}>
            {sentence[lang].map((seg, i) => {
              const aligned = seg.groups.length > 0
              const isHot = !!hot && aligned && seg.groups.some((g) => hot.includes(g))
              const isActive = activeWord && activeWord.lang === lang && activeWord.index === i
              const bg = isHot ? GROUP_COLORS[(hot![0] - 1) % GROUP_COLORS.length] : isActive ? '#ffe58a' : 'transparent'
              if (!aligned) return <span key={i}>{seg.text}</span>
              return (
                <span
                  key={i}
                  data-hot={isHot ? 'true' : 'false'}
                  data-seg={seg.groups.join('+')}
                  className="seg cursor-pointer rounded-lg px-0.5 transition-all duration-200"
                  style={{ background: bg, transform: isHot || isActive ? 'translateY(-2px)' : undefined, display: 'inline-block' }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') setHot(seg.groups)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setHot(seg.groups)
                    const w = wordForSegment(lang, seg.text)
                    if (w) void speakIn(`w.${w}`, lang)
                    else void speakIn(audioId, lang, plain(src[lang]))
                  }}
                >
                  {seg.text}
                </span>
              )
            })}
          </span>
          <span className="ml-1">
            <SpeakerButton audioId={audioId} lang={lang} size={34} text={plain(src[lang])} />
          </span>
        </div>
      ))}
    </div>
  )
}
