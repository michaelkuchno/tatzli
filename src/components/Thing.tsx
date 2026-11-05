import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import type { Pose } from '@content/types'
import { WORD_BY_ID } from '@/lib/content'
import { Illustration } from '@/illustrations/registry'
import { useApp } from '@/state/AppContext'
import { speak, speakChain, COLOR_CYCLE } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { recordExposure } from '@/lib/progress'
import { WordLabel } from './WordLabel'
import { showColor, isColorWord } from './ColorBurst'

export interface ThingProps {
  illu: string
  /** word id – enables speech, labels, colour/size words and progress */
  wordId?: string
  /** explicit audio id when not a word */
  audioId?: string
  pose?: Pose
  flip?: boolean
  size?: number | string
  className?: string
  style?: CSSProperties
  /** show the multi-language label under the object on hover/tap */
  showLabel?: boolean
  onActivate?: () => void
  /** disable the built-in speech on click (games that speak themselves) */
  silentClick?: boolean
  children?: ReactNode
  testId?: string
  ariaLabel?: string
}

let lastHoverSpeech = 0

/**
 * An interactive illustrated object implementing the TV/mouse joy effects:
 * hover → moves + says its name + shows equivalents; click → main action; right-click / long-press →
 * recolour + colour name; wheel → grows/shrinks ("gross/chly"); double-click → special animation.
 */
export function Thing({ illu, wordId, audioId, pose, flip, size = 160, className, style, showLabel = true, onActivate, silentClick, children, testId, ariaLabel }: ThingProps) {
  const { profile, reducedMotion } = useApp()
  const controls = useAnimationControls()
  const [color, setColor] = useState<string | undefined>()
  const [scale, setScale] = useState(1)
  const [hover, setHover] = useState(false)
  const [live, setLive] = useState(false)
  const colorIdx = useRef(-1)
  const hoverTimer = useRef<number | null>(null)
  const pressTimer = useRef<number | null>(null)
  const longPressed = useRef(false)
  const wheelSpeech = useRef(0)
  const word = wordId ? WORD_BY_ID[wordId] : undefined
  const aid = audioId ?? (wordId ? `w.${wordId}` : undefined)
  const showText = (profile?.level ?? 2) > 1

  const bounce = useCallback(
    (kind: 'hop' | 'wiggle' | 'spin') => {
      if (reducedMotion) return
      if (kind === 'hop') void controls.start({ y: [0, -24, 0, -8, 0], transition: { duration: 0.6 } })
      if (kind === 'wiggle') void controls.start({ rotate: [0, -6, 6, -3, 0], transition: { duration: 0.5 } })
      if (kind === 'spin') void controls.start({ rotate: [0, 360], scale: [1, 1.25, 1], transition: { duration: 0.9 } })
    },
    [controls, reducedMotion],
  )

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      if (pressTimer.current) clearTimeout(pressTimer.current)
    },
    [],
  )

  const sayName = useCallback(() => {
    if (aid) void speak(profile, aid)
  }, [aid, profile])

  const activate = useCallback(() => {
    bounce('hop')
    setLive(true)
    sfx.pop()
    if (!silentClick) {
      if (word?.sound && aid) {
        // animal / vehicle sound first, then the name
        void speakChain(profile, [`snd.${word.id}`, aid])
      } else sayName()
      if (profile?.id && wordId) void recordExposure(profile.id, wordId, 'word')
    }
    if (isColorWord(wordId)) showColor(wordId!)
    onActivate?.()
    window.setTimeout(() => setLive(false), 2500)
  }, [bounce, sayName, onActivate, silentClick, profile, wordId, word, aid])

  const recolour = useCallback(() => {
    colorIdx.current = (colorIdx.current + 1) % COLOR_CYCLE.length
    const c = COLOR_CYCLE[colorIdx.current]
    setColor(c.hex)
    showColor(c.id)
    sfx.soft()
    bounce('wiggle')
    void speak(profile, `w.${c.id}`)
  }, [bounce, profile])

  return (
    <motion.div
      data-testid={testId}
      data-nav
      tabIndex={0}
      role="button"
      aria-label={ariaLabel ?? word?.text.de ?? illu}
      className={`thing relative inline-flex flex-col items-center select-none outline-none focus-visible:ring-8 focus-visible:ring-amber-300 rounded-3xl ${className ?? ''}`}
      style={{ ...style, touchAction: 'manipulation' }}
      animate={controls}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        setHover(true)
        setLive(true)
        bounce('wiggle')
        if (hoverTimer.current) clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => {
          if (Date.now() - lastHoverSpeech > 1200) {
            lastHoverSpeech = Date.now()
            sayName()
          }
        }, 280)
      }}
      onPointerLeave={() => {
        setHover(false)
        setLive(false)
        if (hoverTimer.current) clearTimeout(hoverTimer.current)
      }}
      onPointerDown={(e) => {
        longPressed.current = false
        if (e.pointerType === 'touch') {
          pressTimer.current = window.setTimeout(() => {
            longPressed.current = true
            recolour()
          }, 650)
        }
      }}
      onPointerUp={() => {
        if (pressTimer.current) clearTimeout(pressTimer.current)
      }}
      onClick={() => {
        if (longPressed.current) return
        setHover(true)
        activate()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        recolour()
      }}
      onDoubleClick={() => {
        bounce('spin')
        sfx.sparkle()
      }}
      onWheel={(e) => {
        const next = Math.max(0.6, Math.min(1.8, scale * (e.deltaY < 0 ? 1.12 : 0.89)))
        setScale(next)
        if (Date.now() - wheelSpeech.current > 900) {
          wheelSpeech.current = Date.now()
          void speak(profile, e.deltaY < 0 ? 'w.gross' : 'w.chly')
        }
      }}
    >
      <div style={{ width: size, height: size, transform: `scale(${scale})`, transition: 'transform 200ms ease-out' }}>
        <Illustration name={illu} color={color} pose={pose} live={live || hover} flip={flip} className="w-full h-full drop-shadow-sm" />
      </div>
      {children}
      {showLabel && showText && word && hover && (
        <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-1">
          <WordLabel wordId={word.id} compact />
        </div>
      )}
    </motion.div>
  )
}
