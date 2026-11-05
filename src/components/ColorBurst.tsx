import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { LANG_META, LangBadge } from './LangBadge'

/** Colour hex for each colour word id (same palette as the illustrations). */
export const COLOR_HEX: Record<string, string> = {
  rot: '#e2493b',
  blau: '#3f8fd8',
  gaeub: '#f6c945',
  grueen: '#5fae4f',
  orangsch: '#f28c28',
  violett: '#8e5bbf',
  rosa: '#f7a8c8',
  bruun: '#8b5a2b',
  schwarz: '#2b2b2b',
  wyss: '#ffffff',
  grau: '#9aa0a6',
}

const listeners = new Set<(id: string) => void>()
/** Show a big, friendly colour splash with the colour's name (used by every colour action). */
export function showColor(colorWordId: string) {
  if (!COLOR_HEX[colorWordId]) return
  for (const l of listeners) l(colorWordId)
}
export const isColorWord = (id?: string) => !!id && id in COLOR_HEX

export function ColorBurst() {
  const { profile } = useApp()
  const [shown, setShown] = useState<{ id: string; n: number } | null>(null)
  useEffect(() => {
    let t = 0
    const fn = (id: string) => {
      setShown({ id, n: Date.now() })
      clearTimeout(t)
      t = window.setTimeout(() => setShown(null), 2200)
    }
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
      clearTimeout(t)
    }
  }, [])
  const langs = profile?.langs ?? ['be']
  const showText = (profile?.level ?? 2) > 1
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.n}
          className="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="color-burst"
          data-color={shown.id}
        >
          <motion.div
            className="flex flex-col items-center justify-center gap-3 rounded-full shadow-2xl"
            style={{ width: 'min(70vw, 70vh)', height: 'min(70vw, 70vh)', background: COLOR_HEX[shown.id], border: shown.id === 'wyss' ? '10px solid #e7d8c3' : '10px solid rgba(255,255,255,.85)' }}
            initial={{ scale: 0.2, rotate: -25 }}
            animate={{ scale: [0.2, 1.08, 1], rotate: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {showText &&
              langs.map((l) => (
                <div key={l} className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-1 text-3xl font-black md:text-5xl" style={{ color: l === 'de' ? '#7a5200' : LANG_META[l].color }}>
                  <LangBadge lang={l} size={30} />
                  {WORD_BY_ID[shown.id]?.text[l]}
                </div>
              ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
