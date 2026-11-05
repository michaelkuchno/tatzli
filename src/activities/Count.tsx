import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { LANG_META } from '@/components/LangBadge'
import { recordExposure } from '@/lib/progress'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { useDifficulty, wait, type ActivityProps } from './common'

/** Counting: put N objects into the container (drag or tap). Each one is counted aloud. */
export function Count({ topicId, onComplete }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const spec = topic.count ?? { word: topic.words[0], targets: [3], container: 'basket' }
  const level = profile?.level ?? 2
  const diff = useDifficulty(profile?.id, level)
  const rounds = useMemo(() => {
    const ok = spec.targets.filter((n) => n <= diff.maxCount)
    const base = ok.length ? ok : [Math.min(3, diff.maxCount)]
    return base.slice(0, level === 1 ? 2 : 3)
  }, [spec.targets, diff.maxCount, level])
  const [r, setR] = useState(0)
  const target = rounds[r]
  const total = Math.min(20, target + (level === 1 ? 1 : 3))
  const [inBasket, setIn] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const basketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIn([])
    setDone(false)
    void speakChain(profile, ['ui.count', `w.n${target}`, `w.${spec.word}`, 'ui.put-in'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r])

  const add = async (i: number) => {
    if (done || inBasket.includes(i)) return
    const next = [...inBasket, i]
    setIn(next)
    sfx.pop()
    void speak(profile, `w.n${next.length}`)
    if (next.length === target) {
      setDone(true)
      await wait(900)
      sfx.success()
      if (profile?.id) {
        void recordExposure(profile.id, `n${target}`, 'word', 'recognised')
        void recordExposure(profile.id, spec.word, 'word', 'exposed')
      }
      await speakChain(profile, ['ui.super', `w.n${target}`, `w.${spec.word}`])
      if (r + 1 >= rounds.length) onComplete()
      else setR(r + 1)
    }
  }
  const remove = (i: number) => {
    if (done) return
    setIn(inBasket.filter((x) => x !== i))
    sfx.soft()
  }

  const inside = (x: number, y: number) => {
    const b = basketRef.current?.getBoundingClientRect()
    return !!b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom
  }
  const lang = profile?.langs[0] ?? 'be'

  return (
    <div className="flex flex-col items-center gap-6" data-testid="count" data-target={target}>
      <div className="flex items-center gap-4 rounded-full bg-white px-6 py-2 shadow">
        <span className="text-6xl font-black tv:text-8xl" style={{ color: LANG_META[lang].color === '#e0a21b' ? '#7a5200' : LANG_META[lang].color }}>
          {level > 1 ? target : ''}
        </span>
        <div className="h-16 w-16 tv:h-24 tv:w-24">
          <Illustration name={WORD_BY_ID[spec.word].illu} className="h-full w-full" />
        </div>
        {level > 1 && <span className="text-3xl font-bold tv:text-5xl">{WORD_BY_ID[`n${target}`]?.text[lang]}</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: total }, (_, i) => i)
          .filter((i) => !inBasket.includes(i))
          .map((i) => (
            <motion.div
              key={`${r}-${i}`}
              data-nav
              tabIndex={0}
              role="button"
              data-testid="count-item"
              aria-label={WORD_BY_ID[spec.word].text.de}
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              className="h-24 w-24 cursor-grab tv:h-36 tv:w-36"
              style={{ touchAction: 'none' }}
              onTap={() => void add(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void add(i)
              }}
              onDragEnd={(_, info) => {
                if (inside(info.point.x - window.scrollX, info.point.y - window.scrollY)) void add(i)
              }}
            >
              <Illustration name={WORD_BY_ID[spec.word].illu} className="pointer-events-none h-full w-full" />
            </motion.div>
          ))}
      </div>
      <div ref={basketRef} className="relative flex h-[34vh] w-[min(80vw,640px)] items-end justify-center" data-testid="count-basket">
        <Illustration name={spec.container} className="absolute inset-0 h-full w-full" live={done} />
        <div className="relative z-10 mb-[12%] flex max-w-[70%] flex-wrap justify-center gap-1">
          {inBasket.map((i, k) => (
            <motion.button type="button" key={i} initial={{ y: -60, scale: 0.5 }} animate={{ y: 0, scale: 1 }} className="relative h-14 w-14 tv:h-20 tv:w-20" onClick={() => remove(i)} aria-label={`${k + 1}`}>
              <Illustration name={WORD_BY_ID[spec.word].illu} className="h-full w-full" />
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-white">{k + 1}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
