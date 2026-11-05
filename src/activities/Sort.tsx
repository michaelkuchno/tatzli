import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { recordExposure } from '@/lib/progress'
import { speak, speakChain, speakIn } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, type ActivityProps } from './common'

/** Sorting: drag (or tap item, then tap bin) into the right box. Wrong drops gently return. */
export function Sort({ topicId, onComplete, onHint }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const spec = topic.sort!
  const level = profile?.level ?? 2
  const items = useMemo(() => shuffle(spec.bins.flatMap((b, bi) => shuffle(b.words).slice(0, level === 1 ? 2 : 3).map((w) => ({ w, bi })))), [spec, level])
  const [placed, setPlaced] = useState<Record<string, number>>({})
  const [sel, setSel] = useState<string | null>(null)
  const [bump, setBump] = useState<string | null>(null)
  const binRefs = useRef<(HTMLDivElement | null)[]>([])
  const remaining = items.filter((i) => placed[i.w] === undefined)

  const drop = async (w: string, bi: number) => {
    const it = items.find((x) => x.w === w)
    if (!it) return
    setSel(null)
    if (it.bi === bi) {
      sfx.success()
      const next = { ...placed, [w]: bi }
      setPlaced(next)
      if (profile?.id) void recordExposure(profile.id, w, 'word', 'recognised')
      void speak(profile, `w.${w}`)
      if (Object.keys(next).length === items.length) {
        await speak(profile, 'ui.super')
        onComplete()
      }
    } else {
      onHint()
      setBump(w)
      sfx.soft()
      await speakChain(profile, [`w.${w}`, 'ui.sort'])
      setBump(null)
    }
  }

  const binAt = (x: number, y: number) =>
    binRefs.current.findIndex((el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    })

  return (
    <div className="flex flex-col items-center gap-6" data-testid="sort">
      <div className="flex min-h-[22vh] flex-wrap items-center justify-center gap-4">
        {remaining.map(({ w }) => (
          <motion.div
            key={w}
            data-nav
            tabIndex={0}
            role="button"
            data-testid={`sort-item-${w}`}
            aria-label={WORD_BY_ID[w].text.de}
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.15, zIndex: 50 }}
            animate={bump === w ? { x: [0, -14, 14, -8, 0] } : sel === w ? { scale: 1.12 } : { scale: 1 }}
            className={`h-32 w-32 cursor-grab rounded-3xl bg-white p-2 shadow-lg tv:h-48 tv:w-48 ${sel === w ? 'ring-8 ring-amber-300' : ''}`}
            style={{ touchAction: 'none' }}
            onTap={() => {
              setSel(w)
              sfx.tap()
              void speak(profile, `w.${w}`)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSel(w)
            }}
            onDragEnd={(_, info) => {
              const bi = binAt(info.point.x - window.scrollX, info.point.y - window.scrollY)
              if (bi >= 0) void drop(w, bi)
            }}
          >
            <Illustration name={WORD_BY_ID[w].illu} className="pointer-events-none h-full w-full" />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {spec.bins.map((b, bi) => (
          <div
            key={bi}
            ref={(el) => {
              binRefs.current[bi] = el
            }}
            data-nav
            tabIndex={0}
            role="button"
            data-testid={`sort-bin-${bi}`}
            aria-label={b.label.de}
            className="flex min-h-[26vh] w-[40vw] max-w-md flex-col items-center rounded-[2.5rem] border-8 border-dashed border-amber-300 bg-white/70 p-3 shadow-inner"
            onClick={() => {
              if (sel) void drop(sel, bi)
              else void speakIn(`w.${b.illu}`, profile?.audioLangs?.[0] ?? profile?.audioLang ?? 'be')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && sel) void drop(sel, bi)
            }}
          >
            <div className="h-24 w-24 tv:h-36 tv:w-36">
              <Illustration name={b.illu} className="h-full w-full" live />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {items
                .filter((i) => placed[i.w] === bi)
                .map((i) => (
                  <motion.div key={i.w} initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-16 w-16 tv:h-24 tv:w-24">
                    <Illustration name={WORD_BY_ID[i.w].illu} className="h-full w-full" />
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
