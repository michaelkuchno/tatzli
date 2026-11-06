import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import type { ActivityKind } from '@content/types'
import { TOPIC_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { ChildBar, StickerCelebration } from '@/components/ui'
import { logSession, markActivity } from '@/lib/progress'
import { stopAll } from '@/lib/audio'
import type { ActivityProps } from '@/activities/common'
import { ACTIVITY_ICON } from './TopicScreen'
import { Illustration } from '@/illustrations/registry'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { db, pkey } from '@/lib/db'
import { topicsFor } from '@/lib/topics'
import { KidButton } from '@/components/ui'
import { keepScreenOn, allowScreenOff } from '@/lib/wakeLock'

const L = <K extends string>(loader: () => Promise<Record<K, ComponentType<ActivityProps>>>, name: K) => lazy(async () => ({ default: (await loader())[name] }))

const ACTIVITIES: Record<ActivityKind, ComponentType<ActivityProps>> = {
  discover: L(() => import('@/activities/Discover'), 'Discover'),
  whereIs: L(() => import('@/activities/WhereIs'), 'WhereIs'),
  tpr: L(() => import('@/activities/Tpr'), 'Tpr'),
  memory: L(() => import('@/activities/Memory'), 'Memory'),
  sort: L(() => import('@/activities/Sort'), 'Sort'),
  count: L(() => import('@/activities/Count'), 'Count'),
  story: L(() => import('@/activities/StoryPlayer'), 'StoryPlayer'),
  song: L(() => import('@/activities/SongPlayer'), 'SongPlayer'),
  speak: L(() => import('@/activities/SpeakLike'), 'SpeakLike'),
}

import { Loading } from './Loading'
export { Loading }

/**
 * After an activity ends: 2–3 big picture suggestions (next step in the topic, next topic, home).
 * Nothing starts by itself – no autoplay, no countdown (no manipulative design); the session limit still applies.
 */
function NextUp({ topicId, kind, onClose }: { topicId: string; kind: ActivityKind; onClose: () => void }) {
  const { profile, go } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const done = useLiveQuery(async () => (profile?.id ? ((await db.topics.get(pkey(profile.id, topicId)))?.done ?? []) : []), [profile?.id, topicId]) ?? []
  const visited = useLiveQuery(async () => (profile?.id ? (await db.topics.where('profileId').equals(profile.id).toArray()).map((x) => x.topicId) : []), [profile?.id]) ?? []
  const order: ActivityKind[] = ['whereIs', ...topic.games, ...(topic.story ? (['story'] as const) : []), ...(topic.song ? (['song'] as const) : []), 'speak'].filter((k, i, arr) => arr.indexOf(k) === i) as ActivityKind[]
  const nextKind = order.find((k) => k !== kind && !done.includes(k)) ?? order.find((k) => k !== kind)
  const list = topicsFor(profile?.level ?? 2)
  const nextTopic = list.find((t) => t.id !== topicId && !visited.includes(t.id)) ?? list[(list.findIndex((t) => t.id === topicId) + 1) % list.length]
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-amber-50/85 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="next-up">
      <div className="flex flex-col items-center gap-6">
        <motion.div className="h-28 w-28 tv:h-44 tv:w-44" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
          <Illustration name="tatzli" pose="point" className="h-full w-full" live />
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {nextKind && (
            <KidButton illu={ACTIVITY_ICON[nextKind].illu} label={ACTIVITY_ICON[nextKind].label} size={150} color={ACTIVITY_ICON[nextKind].color} testId="next-activity" onClick={() => { onClose(); go({ name: 'activity', topicId, kind: nextKind }) }} />
          )}
          {nextTopic && nextTopic.id !== topicId && (
            <KidButton illu={nextTopic.icon} label={nextTopic.title.de} size={150} testId="next-topic" onClick={() => { onClose(); go({ name: 'topic', topicId: nextTopic.id }) }} />
          )}
          <KidButton label="Karte" size={110} testId="next-home" onClick={() => { onClose(); go({ name: 'map' }) }}>
            <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" aria-hidden>
              <path d="M8 24 L24 9 L40 24 V40 H8 Z" fill="#f6c945" stroke="#4a3326" strokeWidth="4" strokeLinejoin="round" />
              <rect x="20" y="28" width="8" height="12" fill="#b8763e" stroke="#4a3326" strokeWidth="3" />
            </svg>
          </KidButton>
        </div>
      </div>
    </motion.div>
  )
}

export function ActivityScreen({ topicId, kind }: { topicId: string; kind: ActivityKind }) {
  const { profile } = useApp()
  const [nextUp, setNextUp] = useState(false)
  const topic = TOPIC_BY_ID[topicId]
  const [sticker, setSticker] = useState<string | null>(null)
  const completed = useRef(false)
  const hints = useRef(0)
  const Comp = ACTIVITIES[kind]

  useEffect(
    () => () => {
      stopAll()
      // leaving before the natural end counts as a skip (feeds "shorter / easier")
      if (profile?.id) void logSession(profile.id, completed.current ? { hints: hints.current } : { skips: 1, hints: hints.current })
    },
    [profile?.id],
  )

  // long listening activities (story, song) keep the screen on
  useEffect(() => {
    if (kind !== 'story' && kind !== 'song') return
    void keepScreenOn()
    return () => {
      void allowScreenOff()
    }
  }, [kind])

  const onComplete = useCallback(async () => {
    if (!profile?.id || completed.current) return
    completed.current = true
    void logSession(profile.id, { completions: 1 })
    const earned = await markActivity(profile.id, topicId, kind, topic.sticker)
    if (earned) setSticker(topic.sticker)
    // exploring (discover) has no natural end → no interruption there
    else if (kind !== 'discover') window.setTimeout(() => setNextUp(true), 1200)
  }, [profile, topicId, kind, topic.sticker])
  const onHint = useCallback(() => {
    hints.current++
  }, [])

  return (
    <div className="flex h-full flex-col" data-testid={`activity-screen-${kind}`}>
      <ChildBar
        title={
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-12 w-12 tv:h-20 tv:w-20">
              <Illustration name={ACTIVITY_ICON[kind].illu} className="h-full w-full" />
            </span>
          </span>
        }
      />
      <div className="safe-x flex-1 overflow-auto pb-6">
        <Suspense fallback={<Loading />}>
          <Comp topicId={topicId} onComplete={() => void onComplete()} onHint={onHint} />
        </Suspense>
      </div>
      <StickerCelebration
        stickerId={sticker}
        onDone={() => {
          setSticker(null)
          setNextUp(true)
        }}
      />
      {nextUp && <NextUp topicId={topicId} kind={kind} onClose={() => setNextUp(false)} />}
    </div>
  )
}
