import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { ParentHoldButton } from './ParentGate'
import { sfx } from '@/lib/sound'
import { stopAll } from '@/lib/audio'

/** Huge round icon button for children (min 64 px; 96 px for 2–3-year-olds). */
export function KidButton({ illu, onClick, label, testId, size, color = '#fff', children, pose }: { illu?: string; onClick: () => void; label: string; testId?: string; size?: number; color?: string; children?: ReactNode; pose?: Parameters<typeof Illustration>[0]['pose'] }) {
  const { profile } = useApp()
  const s = size ?? (profile?.level === 1 ? 112 : 92)
  return (
    <button
      type="button"
      data-nav
      data-testid={testId}
      aria-label={label}
      title={label}
      className="kid-btn group relative flex shrink-0 items-center justify-center rounded-[40%] shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:ring-8 focus-visible:ring-amber-300 outline-none"
      style={{ width: s, height: s, background: color }}
      onClick={() => {
        sfx.tap()
        onClick()
      }}
    >
      {illu && <Illustration name={illu} pose={pose} className="h-[82%] w-[82%]" live />}
      {children}
    </button>
  )
}

function ArrowIcon({ dir }: { dir: 'left' | 'home' }) {
  return dir === 'left' ? (
    <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" aria-hidden>
      <path d="M30 10 L16 24 L30 38" fill="none" stroke="#4a3326" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" aria-hidden>
      <path d="M8 24 L24 9 L40 24 V40 H8 Z" fill="#f6c945" stroke="#4a3326" strokeWidth="4" strokeLinejoin="round" />
      <rect x="20" y="28" width="8" height="12" fill="#b8763e" stroke="#4a3326" strokeWidth="3" />
    </svg>
  )
}

/** Child top bar: back, map/home, parent hold-button. */
export function ChildBar({ title, onBack, right }: { title?: ReactNode; onBack?: () => void; right?: ReactNode }) {
  const { back, go, t } = useApp()
  return (
    <div className="safe-x flex items-center gap-3 py-2 tv:py-6">
      <button
        type="button"
        data-nav
        data-testid="back"
        aria-label={t('back')}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md active:scale-95 tv:h-24 tv:w-24"
        onClick={() => {
          stopAll()
          sfx.whoosh()
          if (onBack) onBack()
          else back()
        }}
      >
        <ArrowIcon dir="left" />
      </button>
      <button
        type="button"
        data-nav
        data-testid="home"
        aria-label="Map"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md active:scale-95 tv:h-24 tv:w-24"
        onClick={() => {
          stopAll()
          go({ name: 'map' })
        }}
      >
        <ArrowIcon dir="home" />
      </button>
      <div className="min-w-0 flex-1 truncate text-center text-2xl font-extrabold text-stone-700 tv:text-5xl">{title}</div>
      {right}
      <ParentHoldButton onPass={() => go({ name: 'parent' })} />
    </div>
  )
}

/** Celebration overlay for a sticker earned through participation. */
export function StickerCelebration({ stickerId, onDone }: { stickerId: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!stickerId) return
    sfx.sticker()
    const id = window.setTimeout(onDone, 3200)
    return () => clearTimeout(id)
  }, [stickerId, onDone])
  return (
    <AnimatePresence>
      {stickerId && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-amber-50/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          data-testid="sticker-earned"
        >
          <motion.div initial={{ scale: 0.2, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }} className="relative h-72 w-72 rounded-full bg-white p-6 shadow-2xl ring-8 ring-amber-300">
            <Illustration name={stickerId} className="h-full w-full" live />
            <div className="absolute -right-6 -top-6 h-24 w-24">
              <Illustration name="sticker-star" className="h-full w-full" live />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Small "done for grown-ups" style button. */
export function GrownupButton({ children, onClick, testId }: { children: ReactNode; onClick: () => void; testId?: string }) {
  return (
    <button type="button" data-nav data-testid={testId} className="rounded-full bg-emerald-600 px-6 py-3 text-xl font-bold text-white shadow-lg active:scale-95 tv:px-10 tv:py-5 tv:text-3xl" onClick={onClick}>
      {children}
    </button>
  )
}

/** Hook: true after `ms` milliseconds (resets when deps change). */
export function useAfter(ms: number, deps: unknown[]) {
  const [v, setV] = useState(false)
  useEffect(() => {
    setV(false)
    const id = window.setTimeout(() => setV(true), ms)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return v
}
