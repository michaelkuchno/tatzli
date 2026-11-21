import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, wait, type ActivityProps } from './common'

/**
 * Put things in order (a day, the seasons, the water cycle, yesterday – today – tomorrow): the pictures are mixed,
 * the child taps them one after the other; every right picture moves into the next free place and says its name.
 */
export function OrderGame({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const spec = topic.school?.order
  const ROUNDS = 2
  const [round, setRound] = useState(0)
  const items = spec?.items ?? []
  const mixed = useMemo(() => {
    // never start already in order
    let m = shuffle(items)
    for (let i = 0; i < 10 && m.every((x, k) => x === items[k]); i++) m = shuffle(items)
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, topicId])
  const [placed, setPlaced] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setPlaced([])
    if (spec) void speak(profile, `p.${spec.prompt}`)
    const id = window.setTimeout(onHint, 25000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  if (!spec) return null
  const next = items[placed.length]
  // taps are never swallowed while a word is spoken: a quick child places picture after picture,
  // only the final celebration (the whole order read aloud) holds the game
  const tap = async (w: string) => {
    if (busy || placed.includes(w)) return
    if (w !== next) {
      setWrong(w)
      sfx.soft()
      void speak(profile, 'ui.try-again')
      window.setTimeout(() => setWrong(null), 500)
      return
    }
    sfx.pop()
    const now = [...placed, w]
    setPlaced(now)
    if (now.length < items.length) {
      void speak(profile, `w.${w}`)
      return
    }
    setBusy(true)
    sfx.success()
    await speakChain(profile, ['ui.yes', ...items.map((x) => `w.${x}`)])
    await wait(500)
    setBusy(false)
    if (round + 1 >= ROUNDS) onComplete()
    else setRound((r) => r + 1)
  }

  return (
    <div className="flex flex-col items-center gap-6" data-testid="order" data-next={next ?? ''} data-placed={placed.length}>
      <div className="flex flex-wrap items-center justify-center gap-3" data-testid="order-slots">
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-dashed border-emerald-300 bg-white/70 tv:h-44 tv:w-44" data-testid={`order-slot-${i}`} data-filled={placed[i] ?? ''}>
              {placed[i] ? (
                <motion.span className="h-full w-full p-2" initial={{ scale: 0.3 }} animate={{ scale: 1 }}>
                  <Illustration name={WORD_BY_ID[placed[i]].illu} className="h-full w-full" live />
                </motion.span>
              ) : (
                <span className="text-4xl font-black text-emerald-300">{i + 1}</span>
              )}
            </div>
            {i < items.length - 1 && <span className="text-3xl font-black text-emerald-400">→</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5">
        {mixed.map((w) => (
          <motion.button
            key={`${round}-${w}`}
            type="button"
            data-nav
            data-testid={`order-item-${w}`}
            aria-label={WORD_BY_ID[w].text.de}
            disabled={placed.includes(w)}
            className={`rounded-[2rem] bg-white p-2 shadow-xl outline-none focus-visible:ring-8 focus-visible:ring-amber-300 ${placed.includes(w) ? 'opacity-20' : ''}`}
            style={{ width: 'min(22vw, 26vh)', aspectRatio: '1' }}
            animate={wrong === w ? { x: [0, -10, 10, 0] } : { scale: 1 }}
            onClick={() => void tap(w)}
          >
            <Illustration name={WORD_BY_ID[w].illu} className="h-full w-full" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
