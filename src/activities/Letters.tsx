import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { Lang } from '@content/types'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { WordLabel } from '@/components/WordLabel'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { recordExposure } from '@/lib/progress'
import { initialLetter } from '@/lib/school'
import { shuffle, wait, type ActivityProps } from './common'

/**
 * First letters (1st class): a big letter appears; the child finds the picture whose word starts with it.
 * The letter is taken from the first displayed language, so it always matches the word the child reads.
 */
export function Letters({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const lang: Lang = profile?.langs[0] ?? 'be'
  const targets = useMemo(() => shuffle(topic.words).slice(0, 5), [topic.words])
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const target = targets[round]
  const options = useMemo(() => shuffle([target, ...shuffle(topic.words.filter((w) => w !== target)).slice(0, 2)]), [target, topic.words])
  const letter = initialLetter(WORD_BY_ID[target].text[lang])

  useEffect(() => {
    setSolved(false)
    if (round === 0 && topic.school?.letters) void speak(profile, `p.${topic.school.letters}`)
    const id = window.setTimeout(onHint, 20000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const choose = async (w: string) => {
    if (solved) return
    if (w === target) {
      setSolved(true)
      sfx.success()
      if (profile?.id) void recordExposure(profile.id, target, 'word', 'recognised')
      await speakChain(profile, ['ui.yes', `w.${target}`])
      await wait(400)
      if (round + 1 >= targets.length) onComplete()
      else setRound((r) => r + 1)
    } else {
      // never blocks the next tap
      setWrong(w)
      sfx.soft()
      void speakChain(profile, [`w.${w}`, 'ui.try-again'])
      window.setTimeout(() => setWrong(null), 500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6" data-testid="letters" data-target={target} data-letter={letter}>
      <motion.button
        key={round}
        type="button"
        className="flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-white text-9xl font-black text-rose-600 shadow-xl tv:h-64 tv:w-64 tv:text-[12rem]"
        initial={{ rotate: -10, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        onClick={() => topic.school?.letters && void speak(profile, `p.${topic.school.letters}`)}
        data-testid="letters-letter"
        aria-label={letter}
      >
        {letter}
      </motion.button>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {options.map((w) => (
          <motion.button
            key={`${round}-${w}`}
            type="button"
            data-nav
            data-testid={`letters-option-${w}`}
            aria-label={WORD_BY_ID[w].text.de}
            className="flex flex-col items-center rounded-[2.5rem] bg-white p-3 shadow-xl outline-none focus-visible:ring-8 focus-visible:ring-amber-300"
            style={{ width: 'min(26vw, 30vh)' }}
            animate={solved && w === target ? { scale: [1, 1.15, 1] } : wrong === w ? { y: [0, -14, 0] } : { scale: 1 }}
            onClick={() => void choose(w)}
          >
            <span className="aspect-square w-full">
              <Illustration name={WORD_BY_ID[w].illu} className="h-full w-full" live={solved && w === target} />
            </span>
          </motion.button>
        ))}
      </div>
      {solved && <WordLabel wordId={target} />}
    </div>
  )
}
