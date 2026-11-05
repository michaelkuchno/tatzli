import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Story } from '@content/types'
import { STORY_BY_ID, TOPIC_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { SceneView } from '@/components/SceneView'
import { AlignedSentence } from '@/components/AlignedSentence'
import { KidButton } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { recordExposure } from '@/lib/progress'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { wait, type ActivityProps } from './common'
import { plainAll } from '@/lib/align'

/** Picture story with choices (one simple choice for 4–5, several + questions for 6–7). */
export function StoryPlayer({ topicId, onComplete, onHint, storyId }: ActivityProps & { storyId?: string }) {
  const story = STORY_BY_ID[storyId ?? TOPIC_BY_ID[topicId]?.story ?? '']
  if (!story) return null
  return <StoryView story={story} onComplete={onComplete} onHint={onHint} />
}

export function StoryView({ story, onComplete, onHint, audioPrefix = 's' }: { story: Story; onComplete: () => void; onHint: () => void; audioPrefix?: string }) {
  const { profile } = useApp()
  const level = profile?.level ?? 2
  const [i, setI] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [qState, setQState] = useState<'ask' | 'ok' | null>(null)
  const [wrongQ, setWrongQ] = useState<number | null>(null)
  const page = story.pages[i]
  const aid = (suffix: string) => `${audioPrefix}.${story.id}.${i}${suffix}`
  const isLast = page.end || i === story.pages.length - 1

  useEffect(() => {
    setQState(page.question ? 'ask' : null)
    setWrongQ(null)
    void (async () => {
      await speak(profile, aid(''), plainAll(page.text))
      if (page.choice) await speak(profile, aid('.c'), plainAll(page.choice.prompt))
      else if (page.question) await speak(profile, aid('.q'), plainAll(page.question.prompt))
    })()
    if (profile?.id) for (const w of story.words) void recordExposure(profile.id, w, 'word', 'exposed')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, story.id])

  const next = (to?: number) => {
    sfx.whoosh()
    if (isLast && to === undefined) {
      onComplete()
      return
    }
    setHistory((h) => [...h, i])
    setI(to ?? i + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4" data-testid="story" data-page={i}>
      <AnimatePresence mode="wait">
        <motion.div key={i} className="w-full max-w-6xl" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
          <SceneView scene={page.scene} testId="story-scene" />
        </motion.div>
      </AnimatePresence>
      {level > 1 ? (
        <div className="w-full max-w-6xl rounded-3xl bg-white/85 p-4 shadow tv:p-8">
          <AlignedSentence src={page.text} audioId={aid('')} testId="story-text" />
        </div>
      ) : (
        <KidButton illu="ohr" label="nochmal" size={80} onClick={() => void speak(profile, aid(''), plainAll(page.text))} testId="story-replay" />
      )}

      {page.choice && (
        <div className="flex w-full max-w-6xl flex-col items-center gap-3 rounded-3xl bg-amber-100/80 p-4" data-testid="story-choice">
          {level > 1 && <AlignedSentence src={page.choice.prompt} audioId={aid('.c')} size="md" />}
          <div className="flex flex-wrap justify-center gap-6">
            {page.choice.options.map((o, k) => (
              <div key={k} className="flex flex-col items-center gap-2">
                <KidButton
                  illu={o.illu}
                  label={o.label.de}
                  size={140}
                  testId={`choice-${k}`}
                  onClick={async () => {
                    sfx.success()
                    await speak(profile, aid(`.o${k}`), plainAll(o.label))
                    next(o.next)
                  }}
                />
                {level > 1 && <span className="max-w-[12rem] text-center text-lg font-bold text-stone-700">{o.label[profile?.langs[0] ?? 'be'].replace(/\[([^\]]+)\]\d+(\+\d+)*/g, '$1')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {page.question && qState === 'ask' && (
        <div className="flex w-full max-w-6xl flex-col items-center gap-3 rounded-3xl bg-sky-100/80 p-4" data-testid="story-question">
          <AlignedSentence src={page.question.prompt} audioId={aid('.q')} size="md" />
          <div className="flex flex-wrap justify-center gap-6">
            {page.question.options.map((o, k) => (
              <motion.div key={k} animate={wrongQ === k ? { x: [0, -10, 10, 0] } : {}}>
                <KidButton
                  illu={o.illu}
                  label={o.label.de}
                  size={130}
                  testId={`question-${k}`}
                  onClick={async () => {
                    if (k === page.question!.answer) {
                      sfx.success()
                      setQState('ok')
                      await speakChain(profile, ['ui.yes'])
                    } else {
                      onHint()
                      setWrongQ(k)
                      sfx.soft()
                      await speak(profile, 'ui.try-again')
                      await wait(300)
                      setWrongQ(null)
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!page.choice && qState !== 'ask' && (
        <div className="flex gap-4">
          {history.length > 0 && (
            <KidButton
              label="zurück"
              size={84}
              testId="story-prev"
              onClick={() => {
                setI(history[history.length - 1])
                setHistory((h) => h.slice(0, -1))
              }}
            >
              <svg viewBox="0 0 48 48" className="h-1/2 w-1/2" aria-hidden>
                <path d="M30 10 L16 24 L30 38" fill="none" stroke="#4a3326" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </KidButton>
          )}
          <KidButton label={isLast ? 'fertig' : 'weiter'} size={110} color={isLast ? '#c9f2c7' : '#fff3c4'} testId={isLast ? 'story-end' : 'story-next'} onClick={() => next()}>
            {isLast ? (
              <Illustration name="sleeping-tatzli" className="h-[80%] w-[80%]" />
            ) : (
              <svg viewBox="0 0 48 48" className="h-1/2 w-1/2" aria-hidden>
                <path d="M18 10 L32 24 L18 38" fill="none" stroke="#4a3326" strokeWidth="6" strokeLinecap="round" />
              </svg>
            )}
          </KidButton>
        </div>
      )}
    </div>
  )
}
