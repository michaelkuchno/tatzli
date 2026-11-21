import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, wait, type ActivityProps } from './common'
import type { MathSpec } from '@content/types'

export interface MathTask {
  /** what is shown: dots, "a + b", "a − b", "a × b" or a clock */
  kind: 'dots' | 'add' | 'sub' | 'mult' | 'clock'
  a: number
  b: number
  answer: number
  options: number[]
}

const rnd = (lo: number, hi: number, r: () => number) => lo + Math.floor(r() * (hi - lo + 1))

/**
 * One task for the school maths game. Every answer lies between 1 and 20 (there are verified recordings of the
 * number words eis … zwänzg), the options are three different numbers including the answer.
 */
export function makeTask(spec: MathSpec, round: number, r: () => number = Math.random): MathTask {
  let kind: MathTask['kind'] = 'dots'
  let a: number
  let b = 0
  let answer: number
  if (spec.mode === 'dots') {
    answer = a = rnd(1, spec.max ?? 5, r)
  } else if (spec.mode === 'add') {
    const max = Math.min(spec.max ?? 10, 20)
    if (round % 2 === 0) {
      kind = 'add'
      answer = rnd(2, max, r)
      a = rnd(1, answer - 1, r)
      b = answer - a
    } else {
      kind = 'sub'
      a = rnd(2, max, r)
      b = rnd(1, a - 1, r)
      answer = a - b
    }
  } else if (spec.mode === 'mult') {
    kind = 'mult'
    const tables = spec.tables?.length ? spec.tables : [2]
    a = tables[round % tables.length]
    b = rnd(1, Math.floor(20 / a), r)
    answer = a * b
  } else {
    kind = 'clock'
    answer = a = rnd(1, 12, r)
  }
  const top = spec.mode === 'clock' ? 12 : spec.mode === 'dots' ? Math.max(5, spec.max ?? 5) : 20
  const pool = new Set<number>([answer])
  let guard = 0
  while (pool.size < 3 && guard++ < 200) {
    const d = rnd(-3, 3, r)
    const x = answer + (d === 0 ? 1 : d)
    if (x >= 1 && x <= top) pool.add(x)
  }
  for (let x = 1; pool.size < 3 && x <= top; x++) pool.add(x)
  return { kind, a, b, answer, options: shuffle([...pool]) }
}

function Dots({ n, color = '#e2493b' }: { n: number; color?: string }) {
  return (
    <div className="flex max-w-[16rem] flex-wrap justify-center gap-2" data-testid="math-dots" data-n={n}>
      {Array.from({ length: n }, (_, i) => (
        <motion.span key={i} className="h-8 w-8 rounded-full shadow tv:h-14 tv:w-14" style={{ background: color }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} />
      ))}
    </div>
  )
}

export function ClockFace({ hour }: { hour: number }) {
  const ang = ((hour % 12) / 12) * 360
  return (
    <svg viewBox="0 0 100 100" className="h-56 w-56 tv:h-96 tv:w-96" data-testid="math-clock" data-hour={hour} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#4a3326" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const t = ((i + 1) / 12) * 2 * Math.PI
        return (
          <text key={i} x={50 + 36 * Math.sin(t)} y={50 - 36 * Math.cos(t) + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#4a3326">
            {i + 1}
          </text>
        )
      })}
      {/* minute hand on 12 (full hour), hour hand on the hour */}
      <line x1="50" y1="50" x2="50" y2="14" stroke="#2f7d4a" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="50" y2="28" stroke="#e2493b" strokeWidth="5" strokeLinecap="round" transform={`rotate(${ang} 50 50)`} />
      <circle cx="50" cy="50" r="4" fill="#4a3326" />
    </svg>
  )
}

/** School maths: count dots (Chindsgi), plus and minus to 10 (1st class), times tables 2/5/10 (2nd), full hours (3rd). */
export function MathGame({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const spec = topic.school?.math
  const ROUNDS = 5
  const [round, setRound] = useState(0)
  const task = useMemo(() => (spec ? makeTask(spec, round) : null), [spec, round])
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const ask = useCallback(() => {
    if (spec) void speak(profile, `p.${spec.prompt}`)
  }, [spec, profile])
  useEffect(() => {
    setSolved(false)
    if (round === 0) ask()
    const id = window.setTimeout(onHint, 20000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  if (!spec || !task) return null
  // a wrong tap never blocks the next one (the gentle "try again" plays while the child already taps again)
  const choose = async (x: number) => {
    if (solved || busy) return
    if (x !== task.answer) {
      setWrong(x)
      sfx.soft()
      void speak(profile, 'ui.try-again')
      window.setTimeout(() => setWrong(null), 500)
      return
    }
    setBusy(true)
    setSolved(true)
    sfx.success()
    await speakChain(profile, ['ui.yes', `w.n${task.answer}`])
    await wait(400)
    setBusy(false)
    if (round + 1 >= ROUNDS) onComplete()
    else setRound((r) => r + 1)
  }
  const sign = task.kind === 'add' ? '+' : task.kind === 'sub' ? '−' : '×'

  return (
    <div className="flex flex-col items-center gap-6" data-testid="math" data-answer={task.answer} data-kind={task.kind} data-round={round}>
      <button type="button" className="flex items-center gap-3 rounded-full bg-white px-5 py-2 shadow" onClick={ask} data-testid="math-ask" aria-label="repeat">
        <span className="inline-block h-14 w-14 tv:h-24 tv:w-24">
          <Illustration name="lehrerin" className="h-full w-full" live />
        </span>
        <span className="text-xl font-extrabold text-stone-600 tv:text-3xl">
          {round + 1} / {ROUNDS}
        </span>
      </button>
      <motion.div key={round} className="flex min-h-[12rem] flex-wrap items-center justify-center gap-5 rounded-[2.5rem] bg-white/90 p-6 shadow-xl" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        {task.kind === 'dots' && <Dots n={task.a} />}
        {task.kind === 'clock' && <ClockFace hour={task.a} />}
        {(task.kind === 'add' || task.kind === 'sub' || task.kind === 'mult') && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl font-black text-stone-800 tv:text-8xl" data-testid="math-task">
              {task.a} {sign} {task.b} = {solved ? task.answer : '?'}
            </div>
            {task.kind === 'mult' ? (
              <div className="flex flex-wrap justify-center gap-3">
                {Array.from({ length: task.b }, (_, i) => (
                  <div key={i} className="rounded-2xl bg-sky-50 p-2">
                    <Dots n={task.a} color="#3a86c8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Dots n={task.a} />
                <span className="text-4xl font-black text-stone-500">{sign}</span>
                <Dots n={task.b} color={task.kind === 'sub' ? '#bbb' : '#3a86c8'} />
              </div>
            )}
          </div>
        )}
      </motion.div>
      <div className="flex flex-wrap justify-center gap-5">
        {task.options.map((x) => (
          <motion.button
            key={`${round}-${x}`}
            type="button"
            data-nav
            data-testid={`math-option-${x}`}
            className={`flex h-28 w-28 items-center justify-center rounded-[2rem] bg-amber-100 font-black text-amber-900 shadow-lg outline-none focus-visible:ring-8 focus-visible:ring-amber-300 tv:h-44 tv:w-44 ${task.kind === 'clock' ? 'text-3xl tv:text-5xl' : 'text-6xl tv:text-8xl'}`}
            animate={solved && x === task.answer ? { scale: [1, 1.2, 1] } : wrong === x ? { x: [0, -10, 10, 0] } : { scale: 1 }}
            onClick={() => void choose(x)}
          >
            {task.kind === 'clock' ? `${x}:00` : x}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
