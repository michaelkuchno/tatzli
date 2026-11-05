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

export function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-32 w-32 animate-bounce">
        <Illustration name="tatzli" className="h-full w-full" />
      </div>
    </div>
  )
}

export function ActivityScreen({ topicId, kind }: { topicId: string; kind: ActivityKind }) {
  const { profile, back } = useApp()
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

  const onComplete = useCallback(async () => {
    if (!profile?.id || completed.current) return
    completed.current = true
    void logSession(profile.id, { completions: 1 })
    const earned = await markActivity(profile.id, topicId, kind, topic.sticker)
    if (earned) setSticker(topic.sticker)
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
          back()
        }}
      />
    </div>
  )
}
