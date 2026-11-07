import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Illustration } from '@/illustrations/registry'

export interface Chapter {
  /** start position (seconds or units) */
  at: number
  /** illustration key shown as preview / marker */
  illu: string
  kind?: 'word' | 'phrase' | 'song' | 'story' | 'page' | 'line'
}

export interface PlaybackBarProps {
  position: number
  total: number
  chapters: Chapter[]
  playing: boolean
  onSeek: (pos: number) => void
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  /** step for the −/+ buttons (default 10 s) */
  step?: number
  /** format a position for display (default mm:ss) */
  format?: (pos: number) => string
  /** children are rendered behind the tap-catcher (the content) */
  children?: ReactNode
  testId?: string
  /** finished / nothing to control: no bar (it must never cover the end buttons) */
  disabled?: boolean
}

const mmss = (s: number) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, '0')}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`

/**
 * Playback controls for self-running content (Kino, stories, songs).
 * Hidden by default so a toddler's random taps don't skip around: one tap on the screen shows the bar,
 * it hides again after 4 s without interaction. Drag the bar (with a picture preview of what plays there),
 * jump ±step, previous/next chapter, play/pause. Keyboard: ←/→ = ±step, Space/Enter = play/pause.
 */
export function PlaybackBar({ position, total, chapters, playing, onSeek, onToggle, onPrev, onNext, step = 10, format = mmss, children, testId = 'playback', disabled = false }: PlaybackBarProps) {
  const [visible, setVisible] = useState(false)
  const [drag, setDrag] = useState<number | null>(null)
  const hideTimer = useRef<number | null>(null)
  const track = useRef<HTMLDivElement>(null)

  const poke = () => {
    if (disabled) return
    setVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setVisible(false), 4000)
  }
  useEffect(() => () => void (hideTimer.current && clearTimeout(hideTimer.current)), [])

  // keyboard (TV remote / laptop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        poke()
        onSeek(Math.max(0, Math.min(total, position + (e.key === 'ArrowRight' ? step : -step))))
      } else if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.closest('button')) return
        e.preventDefault()
        poke()
        onToggle()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const posFromEvent = (clientX: number) => {
    const r = track.current!.getBoundingClientRect()
    return Math.max(0, Math.min(total, ((clientX - r.left) / r.width) * total))
  }
  const shown = drag ?? position
  const chapterAt = (p: number) => {
    let c = chapters[0]
    for (const ch of chapters) if (ch.at <= p) c = ch
    return c
  }
  const pct = (p: number) => `${total ? (p / total) * 100 : 0}%`

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" data-testid={testId} data-visible={visible}>
      {/* tap anywhere on the content to reveal the controls */}
      <div
        className="flex min-h-0 flex-1 flex-col"
        onPointerDownCapture={(e) => {
          // taps on the content's own buttons (weiter, choices, words) must not pop the bar up over them
          if ((e.target as HTMLElement).closest('[data-nobar]')) return
          poke()
        }}
      >
        {children}
      </div>
      <AnimatePresence>
        {visible && !disabled && (
          <motion.div
            className="safe-x absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-stone-900/70 to-transparent pb-4 pt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            onPointerDown={poke}
            data-testid={`${testId}-controls`}
          >
            <div className="mx-auto flex max-w-5xl flex-col gap-3">
              {/* scrubber */}
              <div className="flex items-center gap-3 text-lg font-bold text-white tv:text-3xl">
                <span data-testid={`${testId}-time`} className="w-20 text-right tabular-nums">
                  {format(shown)}
                </span>
                <div
                  ref={track}
                  role="slider"
                  tabIndex={0}
                  aria-label="position"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={Math.round(shown)}
                  data-testid={`${testId}-track`}
                  className="relative h-12 flex-1 cursor-pointer touch-none"
                  onPointerDown={(e) => {
                    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
                    setDrag(posFromEvent(e.clientX))
                  }}
                  onPointerMove={(e) => {
                    if (drag !== null) setDrag(posFromEvent(e.clientX))
                  }}
                  onPointerUp={(e) => {
                    const p = posFromEvent(e.clientX)
                    setDrag(null)
                    onSeek(p)
                  }}
                  onPointerCancel={() => setDrag(null)}
                >
                  <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-white/40" />
                  <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-amber-400" style={{ width: pct(shown) }} />
                  {chapters.map((c, i) => (
                    <div key={i} className={`absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded ${c.kind === 'song' ? 'bg-sky-300' : c.kind === 'story' ? 'bg-rose-300' : 'bg-white/70'}`} style={{ left: pct(c.at) }} aria-hidden />
                  ))}
                  <div className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-amber-500 shadow-lg" style={{ left: pct(shown) }} />
                  {drag !== null && chapters.length > 0 && (
                    <div className="pointer-events-none absolute bottom-12 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl" style={{ left: pct(drag) }} data-testid={`${testId}-preview`}>
                      <Illustration name={chapterAt(drag).illu} className="h-20 w-20 tv:h-32 tv:w-32" />
                      <div className="text-center text-sm font-black text-stone-700 tv:text-2xl">{format(drag)}</div>
                    </div>
                  )}
                </div>
                <span className="w-20 tabular-nums opacity-80">{format(total)}</span>
              </div>
              {/* buttons */}
              <div className="flex items-center justify-center gap-3 tv:gap-6">
                <Btn label="previous" testId={`${testId}-prev`} onClick={onPrev}>
                  <path d="M6 5h2v14H6zM20 5v14L9 12z" />
                </Btn>
                <Btn label={`-${step}`} testId={`${testId}-back`} onClick={() => onSeek(Math.max(0, position - step))}>
                  <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor">
                    -{step}
                  </text>
                </Btn>
                <Btn label={playing ? 'pause' : 'play'} testId={`${testId}-toggle`} onClick={onToggle} big>
                  {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
                </Btn>
                <Btn label={`+${step}`} testId={`${testId}-fwd`} onClick={() => onSeek(Math.min(total, position + step))}>
                  <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor">
                    +{step}
                  </text>
                </Btn>
                <Btn label="next" testId={`${testId}-next`} onClick={onNext}>
                  <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Btn({ children, label, onClick, big, testId }: { children: ReactNode; label: string; onClick: () => void; big?: boolean; testId: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-testid={testId}
      className={`flex items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-lg active:scale-95 ${big ? 'h-20 w-20 tv:h-28 tv:w-28' : 'h-16 w-16 tv:h-24 tv:w-24'}`}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </button>
  )
}
