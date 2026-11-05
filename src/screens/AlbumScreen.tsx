import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { TOPICS } from '@/lib/content'
import { ChildBar } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { WorldMap } from '@/illustrations/map'
import { seasonOf } from '@/lib/calendar'
import { speak } from '@/lib/speak'
import type { PlaceId } from '@content/types'

/** Tatzli's album: stickers earned by taking part + the map places that have "woken up". */
export function AlbumScreen() {
  const { profile, t } = useApp()
  const stickers = useLiveQuery(async () => (profile?.id ? await db.stickers.where('profileId').equals(profile.id).toArray() : []), [profile?.id]) ?? []
  const visited = useLiveQuery(async () => (profile?.id ? (await db.topics.where('profileId').equals(profile.id).toArray()).map((x) => x.topicId) : []), [profile?.id]) ?? []
  const have = new Set(stickers.map((s) => s.stickerId))
  const all = [...new Map(TOPICS.map((tp) => [tp.sticker, tp])).values()]
  const unlocked = [...new Set(TOPICS.filter((tp) => visited.includes(tp.id)).map((tp) => tp.place))] as PlaceId[]
  return (
    <div className="flex h-full flex-col" data-testid="album">
      <ChildBar title={t('album')} />
      <div className="safe-x flex-1 overflow-auto pb-8">
        <div className="mx-auto mb-6 w-full max-w-4xl overflow-hidden rounded-[2rem] shadow-lg" style={{ aspectRatio: '16/9' }}>
          <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden>
            <WorldMap season={seasonOf(new Date())} unlocked={['home', ...unlocked]} />
          </svg>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
          {all.map((tp) => {
            const got = have.has(tp.sticker)
            return (
              <motion.button
                key={tp.sticker}
                type="button"
                data-nav
                data-testid={`album-sticker-${tp.sticker}`}
                data-earned={got}
                aria-label={tp.title.de}
                whileHover={got ? { scale: 1.1, rotate: 3 } : {}}
                className={`aspect-square rounded-full p-3 shadow ${got ? 'bg-white ring-4 ring-amber-300' : 'bg-white/40'}`}
                onClick={() => got && void speak(profile, `w.${tp.sticker}`)}
              >
                {got ? <Illustration name={tp.sticker} className="h-full w-full" live /> : <div className="h-full w-full rounded-full border-4 border-dashed border-stone-300" />}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
