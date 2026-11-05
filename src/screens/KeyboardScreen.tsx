import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WORDS } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { ChildBar } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { WordLabel } from '@/components/WordLabel'
import { speak } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { recordExposure } from '@/lib/progress'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Map letter → candidate words (by DE initial key), preferring the profile level and nouns with pictures. */
export function lettersIndex(level: number) {
  const m = new Map<string, string[]>()
  for (const w of WORDS) {
    if (!w.key || w.level > Math.max(level, 2)) continue
    if (w.cat === 'verbs' || w.cat === 'opposites' || w.cat === 'time') continue
    m.set(w.key, [...(m.get(w.key) ?? []), w.id])
  }
  return m
}

/** "Toddler keyboard": every letter key shows an animal/word with that letter, animated and spoken. */
export function KeyboardScreen() {
  const { profile } = useApp()
  const idx = useMemo(() => lettersIndex(profile?.level ?? 1), [profile?.level])
  const [shown, setShown] = useState<{ letter: string; word: string; n: number } | null>(null)
  const counters = useMemo(() => new Map<string, number>(), [])

  const press = (letter: string) => {
    const list = idx.get(letter)
    sfx.boing()
    if (!list?.length) {
      setShown({ letter, word: '', n: Date.now() })
      return
    }
    const c = counters.get(letter) ?? 0
    counters.set(letter, c + 1)
    const word = list[c % list.length]
    setShown({ letter, word, n: Date.now() })
    void speak(profile, `w.${word}`)
    if (profile?.id) void recordExposure(profile.id, word, 'word')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toUpperCase()
      const map: Record<string, string> = { Ä: 'A', Ö: 'O', Ü: 'U' }
      const letter = map[k] ?? k
      if (letter.length === 1 && LETTERS.includes(letter)) {
        e.preventDefault()
        press(letter)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="flex h-full flex-col" data-testid="keyboard">
      <ChildBar title="ABC" />
      <div className="safe-x flex flex-1 flex-col items-center justify-center gap-4">
        <AnimatePresence mode="popLayout">
          {shown && (
            <motion.div key={shown.n} className="flex flex-col items-center gap-3" initial={{ scale: 0.2, rotate: -15, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, y: 60 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} data-testid="keyboard-shown" data-word={shown.word}>
              <div className="flex items-center gap-6">
                <span className="text-[18vh] font-black leading-none text-amber-600 drop-shadow">{shown.letter}</span>
                {shown.word && (
                  <div className="h-[40vh] w-[40vh]">
                    <Illustration name={WORDS.find((w) => w.id === shown.word)!.illu} className="h-full w-full" live />
                  </div>
                )}
              </div>
              {shown.word && (profile?.level ?? 1) > 1 && <WordLabel wordId={shown.word} />}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex max-w-5xl flex-wrap justify-center gap-2 pb-4">
          {LETTERS.map((l) => (
            <button key={l} type="button" data-nav data-testid={`key-${l}`} className="h-14 w-14 rounded-2xl bg-white text-2xl font-black text-stone-700 shadow active:scale-90 tv:h-20 tv:w-20 tv:text-4xl" onClick={() => press(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
