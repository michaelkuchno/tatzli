import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { wait, type ActivityProps } from './common'

function mix<T>(a: readonly T[], r: () => number): T[] {
  const c = [...a]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

/** the patterns (rytmy) of the rounds: AB, ABC, AAB, ABB – always long enough to see the repetition twice */
export const PATTERNS: number[][] = [
  [0, 1],
  [0, 1, 2],
  [0, 0, 1],
  [0, 1, 1],
]
const SHOWN = 6

export interface PatternTask {
  /** the pictures shown in a row (word ids) */
  row: string[]
  /** the picture that comes next */
  answer: string
  /** three different pictures to choose from, including the answer */
  options: string[]
}

/** one round: a repeating row of lesson pictures; the child picks what comes next */
export function makePattern(words: string[], round: number, r: () => number = Math.random): PatternTask {
  const unit = PATTERNS[round % PATTERNS.length]
  const kinds = Math.max(...unit) + 1
  const pick = mix(words, r).slice(0, kinds)
  const at = (i: number) => pick[unit[i % unit.length]]
  const row = Array.from({ length: SHOWN }, (_, i) => at(i))
  const answer = at(SHOWN)
  const others = mix(words.filter((w) => w !== answer), r).slice(0, 2)
  return { row, answer, options: mix([answer, ...others], r) }
}

/** Patterns (rytmy, Polish przedszkole maths): what comes next in the row? */
export function PatternGame({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const ROUNDS = PATTERNS.length
  const [round, setRound] = useState(0)
  const task = useMemo(() => makePattern(topic.words, round), [topic.words, round])
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const prompt = topic.school?.pattern

  useEffect(() => {
    setSolved(false)
    if (round === 0 && prompt) void speak(profile, `p.${prompt}`)
    const id = window.setTimeout(onHint, 20000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const choose = async (w: string) => {
    if (solved) return
    if (w !== task.answer) {
      // never blocks the next tap
      setWrong(w)
      sfx.soft()
      void speak(profile, 'ui.try-again')
      window.setTimeout(() => setWrong(null), 500)
      return
    }
    setSolved(true)
    sfx.success()
    await speakChain(profile, ['ui.yes', `w.${w}`])
    await wait(400)
    if (round + 1 >= ROUNDS) onComplete()
    else setRound((x) => x + 1)
  }

  return (
    <div className="flex flex-col items-center gap-[min(1.5rem,3vh)]" data-testid="pattern" data-answer={task.answer} data-round={round}>
      <button type="button" className="rounded-full bg-white px-5 py-2 text-xl font-extrabold text-stone-600 shadow tv:text-3xl" onClick={() => prompt && void speak(profile, `p.${prompt}`)} data-testid="pattern-ask">
        {round + 1} / {ROUNDS}
      </button>
      <motion.div key={round} className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[2rem] bg-white/90 p-3 shadow-xl sm:gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="pattern-row">
        {task.row.map((w, i) => (
          <motion.span key={i} className="h-[min(3.5rem,11vh)] w-[min(3.5rem,11vh)] sm:h-[min(5rem,13vh)] sm:w-[min(5rem,13vh)] tv:h-32 tv:w-32" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}>
            <Illustration name={WORD_BY_ID[w].illu} className="h-full w-full" />
          </motion.span>
        ))}
        <span className="flex h-[min(3.5rem,11vh)] w-[min(3.5rem,11vh)] items-center justify-center rounded-2xl border-4 border-dashed border-amber-400 text-3xl font-black text-amber-500 sm:h-[min(5rem,13vh)] sm:w-[min(5rem,13vh)] tv:h-32 tv:w-32" data-testid="pattern-gap">
          {solved ? (
            <motion.span className="h-full w-full" initial={{ scale: 0.3 }} animate={{ scale: 1 }}>
              <Illustration name={WORD_BY_ID[task.answer].illu} className="h-full w-full" live />
            </motion.span>
          ) : (
            '?'
          )}
        </span>
      </motion.div>
      <div className="flex flex-wrap justify-center gap-5">
        {task.options.map((w) => (
          <motion.button
            key={`${round}-${w}`}
            type="button"
            data-nav
            data-testid={`pattern-option-${w}`}
            aria-label={WORD_BY_ID[w].text.de}
            className="flex h-[min(7rem,24vh)] w-[min(7rem,24vh)] items-center justify-center rounded-[2rem] bg-amber-100 p-2 shadow-lg outline-none focus-visible:ring-8 focus-visible:ring-amber-300 tv:h-44 tv:w-44"
            animate={solved && w === task.answer ? { scale: [1, 1.2, 1] } : wrong === w ? { x: [0, -10, 10, 0] } : { scale: 1 }}
            onClick={() => void choose(w)}
          >
            <Illustration name={WORD_BY_ID[w].illu} className="h-full w-full" live={solved && w === task.answer} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
