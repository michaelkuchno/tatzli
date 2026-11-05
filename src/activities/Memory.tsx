import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { LANG_META } from '@/components/LangBadge'
import { recordExposure } from '@/lib/progress'
import { speak } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, useDifficulty, wait, type ActivityProps } from './common'
import { showColor } from '@/components/ColorBurst'

interface Card {
  key: string
  word: string
  face: 'pic' | 'word'
}

/** Pairs: picture–picture, and picture–word for 6–7 (first reading). */
export function Memory({ topicId, onComplete }: ActivityProps) {
  const { profile } = useApp()
  const level = profile?.level ?? 2
  const topic = TOPIC_BY_ID[topicId]
  const diff = useDifficulty(profile?.id, level)
  const readLang = profile?.langs.find((l) => l === 'de' || l === 'en') ?? 'de'
  const cards = useMemo<Card[]>(() => {
    const ws = shuffle(topic.words).slice(0, Math.min(diff.pairs, topic.words.length))
    return shuffle(ws.flatMap((w) => [{ key: `${w}-a`, word: w, face: 'pic' as const }, { key: `${w}-b`, word: w, face: level === 3 ? ('word' as const) : ('pic' as const) }]))
  }, [topic.words, diff.pairs, level])
  const [open, setOpen] = useState<string[]>([])
  const [found, setFound] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  const flip = async (c: Card) => {
    if (busy || open.includes(c.key) || found.has(c.word)) return
    sfx.tap()
    const next = [...open, c.key]
    setOpen(next)
    showColor(c.word)
    void speak(profile, `w.${c.word}`)
    if (next.length === 2) {
      setBusy(true)
      const [a, b] = next.map((k) => cards.find((x) => x.key === k)!)
      await wait(900)
      if (a.word === b.word) {
        sfx.success()
        const f = new Set(found).add(a.word)
        setFound(f)
        if (profile?.id) void recordExposure(profile.id, a.word, 'word', 'recognised')
        if (f.size * 2 === cards.length) {
          await wait(600)
          onComplete()
        }
      }
      setOpen([])
      setBusy(false)
    }
  }

  const cols = cards.length <= 6 ? 3 : cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 6
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 tv:gap-8" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} data-testid="memory">
      {cards.map((c) => {
        const shown = open.includes(c.key) || found.has(c.word)
        return (
          <motion.button
            key={c.key}
            type="button"
            data-nav
            data-testid={`card-${c.key}`}
            data-word={c.word}
            aria-label={shown ? WORD_BY_ID[c.word].text.de : 'card'}
            className={`aspect-square rounded-3xl shadow-lg outline-none focus-visible:ring-8 focus-visible:ring-amber-300 ${shown ? 'bg-white' : 'bg-amber-400'} ${found.has(c.word) ? 'ring-4 ring-emerald-400' : ''}`}
            animate={{ rotateY: shown ? 0 : 180 }}
            transition={{ duration: 0.35 }}
            onClick={() => void flip(c)}
          >
            {shown ? (
              c.face === 'pic' ? (
                <Illustration name={WORD_BY_ID[c.word].illu} className="h-full w-full p-2" live={found.has(c.word)} />
              ) : (
                <span className="px-2 text-2xl font-black md:text-4xl" style={{ color: LANG_META[readLang].color === '#e0a21b' ? '#7a5200' : LANG_META[readLang].color }}>
                  {WORD_BY_ID[c.word].text[readLang]}
                </span>
              )
            ) : (
              <span className="block h-full w-full p-4">
                <Illustration name="tatzli" className="h-full w-full opacity-80" />
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
