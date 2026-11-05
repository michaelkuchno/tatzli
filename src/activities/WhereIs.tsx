import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { WordLabel } from '@/components/WordLabel'
import { progressMap, recordExposure } from '@/lib/progress'
import { pickItems } from '@/lib/srs'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, useDifficulty, wait, type ActivityProps } from './common'

/**
 * "Wo isch …?" – show the right picture. Errorless for 2–3 (every tap gets a joyful reaction and the
 * correct model); gentle "almost, try again" for older children. Animated hint after a few seconds.
 */
export function WhereIs({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const level = profile?.level ?? 2
  const diff = useDifficulty(profile?.id, level)
  const [targets, setTargets] = useState<string[] | null>(null)
  const [round, setRound] = useState(0)
  const [hint, setHint] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const hinted = useRef(false)
  const missed = useRef(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      const pm = profile?.id ? await progressMap(profile.id) : new Map()
      const t = pickItems(topic.words, pm, Math.min(diff.rounds, topic.words.length), Date.now())
      if (alive) setTargets(t)
    })()
    return () => {
      alive = false
    }
  }, [topic.words, diff.rounds, profile?.id])

  const target = targets?.[round]
  const options = useMemo(() => {
    if (!target) return []
    const others = shuffle(topic.words.filter((w) => w !== target)).slice(0, Math.max(1, diff.choices - 1))
    return shuffle([target, ...others])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, round])

  const ask = useCallback(() => {
    if (target) void speakChain(profile, ['ui.where', `w.${target}`])
  }, [target, profile])

  useEffect(() => {
    if (!target) return
    hinted.current = false
    missed.current = false
    setHint(false)
    setSolved(false)
    ask()
    const id = window.setTimeout(() => {
      setHint(true)
      hinted.current = true
      onHint()
      void speakChain(profile, ['ui.look-here', `w.${target}`])
    }, diff.hintAfter * 1000 + 2000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const choose = async (w: string) => {
    if (solved || !target) return
    if (w === target) {
      setSolved(true)
      sfx.success()
      if (profile?.id) void recordExposure(profile.id, target, 'word', hinted.current || missed.current ? 'hinted' : 'recognised')
      await speakChain(profile, ['ui.yes', `w.${target}`])
      await wait(400)
      if (round + 1 >= (targets?.length ?? 0)) onComplete()
      else setRound((r) => r + 1)
    } else {
      missed.current = true
      setWrong(w)
      if (level === 1) {
        // errorless: the tapped picture says its own name joyfully, then we show the target
        sfx.boing()
        await speak(profile, `w.${w}`)
        setHint(true)
        await speakChain(profile, ['ui.look-here', `w.${target}`])
      } else {
        sfx.soft()
        await speakChain(profile, [`w.${w}`, 'ui.try-again'])
      }
      setWrong(null)
    }
  }

  if (!targets) return null
  if (!target) return null
  const big = level === 1 ? 'min(38vw, 42vh)' : `min(${Math.floor(80 / options.length)}vw, 36vh)`

  return (
    <div className="flex flex-col items-center gap-6" data-testid="whereis" data-target={target}>
      <button type="button" className="flex items-center gap-3 rounded-full bg-white px-6 py-3 text-3xl font-extrabold shadow tv:text-5xl" onClick={ask} data-testid="whereis-ask" aria-label="repeat">
        <span className="inline-block h-14 w-14 tv:h-24 tv:w-24">
          <Illustration name="tatzli" pose="look" className="h-full w-full" live />
        </span>
        {level > 1 && <span>Wo isch {WORD_BY_ID[target].text.be}?</span>}
      </button>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {options.map((w) => {
          const isT = w === target
          return (
            <motion.button
              key={`${round}-${w}`}
              type="button"
              data-nav
              data-testid={`option-${w}`}
              aria-label={WORD_BY_ID[w].text.de}
              className="relative rounded-[2.5rem] bg-white p-3 shadow-xl outline-none focus-visible:ring-8 focus-visible:ring-amber-300"
              style={{ width: big, height: big }}
              animate={
                solved && isT
                  ? { scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }
                  : hint && isT
                    ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 #ffd54a', '0 0 0 18px #ffd54a88', '0 0 0 0 #ffd54a'] }
                    : wrong === w
                      ? { y: [0, -16, 0] }
                      : { scale: 1 }
              }
              transition={hint && isT && !solved ? { repeat: Infinity, duration: 1.2 } : { duration: 0.6 }}
              onClick={() => void choose(w)}
            >
              <Illustration name={WORD_BY_ID[w].illu} className="h-full w-full" live={(solved && isT) || wrong === w} />
            </motion.button>
          )
        })}
      </div>
      {solved && level > 1 && <WordLabel wordId={target} />}
    </div>
  )
}
