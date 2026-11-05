import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'motion/react'
import type { PlaceId, Topic } from '@content/types'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { WorldMap, MAP_SPOTS } from '@/illustrations/map'
import { Illustration } from '@/illustrations/registry'
import { ParentHoldButton } from '@/components/ParentGate'
import { KidButton } from '@/components/ui'
import { seasonOf } from '@/lib/calendar'
import { byPlace, topicsFor } from '@/lib/topics'
import { speak } from '@/lib/speak'
import { sfx } from '@/lib/sound'

export function MapScreen() {
  const { profile, go, t } = useApp()
  const level = profile?.level ?? 2
  const topics = useMemo(() => topicsFor(level), [level])
  const places = useMemo(() => byPlace(topics), [topics])
  const visited = useLiveQuery(async () => (profile?.id ? (await db.topics.where('profileId').equals(profile.id).toArray()).map((x) => x.topicId) : []), [profile?.id]) ?? []
  const [picker, setPicker] = useState<{ place: PlaceId; topics: Topic[] } | null>(null)
  const season = seasonOf(new Date())
  const unlocked: PlaceId[] = useMemo(() => {
    const s = new Set<PlaceId>(['home'])
    for (const tp of topics) if (visited.includes(tp.id)) s.add(tp.place)
    return [...s]
  }, [topics, visited])

  const open = (tp: Topic) => {
    sfx.success()
    void speak(profile, `t.${tp.id}`)
    go({ name: 'topic', topicId: tp.id })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="safe-x flex items-center justify-between py-2 tv:py-5">
        <div className="flex gap-3">
          <KidButton illu="sticker-star" label={t('album')} testId="album-button" size={72} onClick={() => go({ name: 'album' })} />
          <KidButton illu="gschaenk" label={t('surprise')} testId="surprise-button" size={72} onClick={() => go({ name: 'surprise' })} />
          <KidButton illu="buechstabe" label="ABC" testId="keyboard-button" size={72} onClick={() => go({ name: 'keyboard' })} />
        </div>
        <ParentHoldButton onPass={() => go({ name: 'parent' })} />
      </div>
      <div className="safe-x flex min-h-0 flex-1 items-center justify-center pb-3">
        <div className="relative w-full max-h-full" style={{ aspectRatio: '16 / 9', maxWidth: 'calc((100dvh - 120px) * 16 / 9)' }} data-testid="world-map">
          <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full rounded-[2rem] shadow-xl" aria-hidden>
            <WorldMap season={season} unlocked={unlocked} highlight={picker?.place} />
          </svg>
          {MAP_SPOTS.filter((s) => places.has(s.place)).map((s) => {
            const tps = places.get(s.place)!
            const seasonal = tps.some((x) => x.seasonal)
            return (
              <motion.button
                key={s.place}
                type="button"
                data-nav
                data-testid={`place-${s.place}`}
                aria-label={tps.map((x) => x.title.de).join(', ')}
                className="absolute flex items-center justify-center rounded-full bg-white/90 shadow-lg outline-none ring-amber-300 focus-visible:ring-8"
                style={{ left: `${(s.x / 160) * 100}%`, top: `${(s.y / 90) * 100}%`, width: '11%', aspectRatio: '1', translate: '-50% -50%' }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                animate={seasonal ? { y: [0, -6, 0] } : undefined}
                transition={seasonal ? { repeat: Infinity, duration: 1.6 } : undefined}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') void speak(profile, `t.${tps[0].id}`)
                }}
                onClick={() => {
                  if (tps.length === 1) open(tps[0])
                  else {
                    sfx.pop()
                    setPicker({ place: s.place, topics: tps })
                  }
                }}
              >
                <Illustration name={tps[0].icon} className="h-[80%] w-[80%]" live />
                {tps.length > 1 && <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-white shadow">{tps.length}</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
      <AnimatePresence>
        {picker && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicker(null)} data-testid="topic-picker">
            <motion.div className="flex flex-wrap justify-center gap-6 rounded-[2.5rem] bg-amber-50 p-8 shadow-2xl" initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              {picker.topics.map((tp) => (
                <KidButton key={tp.id} illu={tp.icon} label={tp.title.de} testId={`topic-${tp.id}`} size={150} onClick={() => open(tp)} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
