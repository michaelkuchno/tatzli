import { useEffect, useMemo, useRef, useState } from 'react'
import type { SceneSpec } from '@content/types'
import { TOPIC_BY_ID, PHRASE_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { SceneView } from '@/components/SceneView'
import { AlignedSentence } from '@/components/AlignedSentence'
import { KidButton } from '@/components/ui'
import type { ActivityProps } from './common'

const SLOTS = [
  { x: 14, y: 86 },
  { x: 32, y: 78 },
  { x: 50, y: 88 },
  { x: 68, y: 78 },
  { x: 86, y: 86 },
  { x: 41, y: 56 },
  { x: 60, y: 56 },
]

/** "Touch and discover": the topic's objects live in the place scene; each says its name. */
export function Discover({ topicId, onComplete }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const perPage = profile?.level === 1 ? 4 : profile?.level === 2 ? 5 : 7
  const [page, setPage] = useState(0)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const pages = Math.ceil(topic.words.length / perPage)
  const words = topic.words.slice(page * perPage, page * perPage + perPage)
  const scene: SceneSpec = useMemo(
    () => ({
      place: topic.place,
      items: [{ key: 'tatzli', x: 6, y: 96, scale: 0.9, pose: 'wave' as const }, ...words.map((w, i) => ({ key: w, x: SLOTS[i].x, y: SLOTS[i].y, scale: perPage > 5 ? 1 : 1.2 }))],
    }),
    [topic.place, words, perPage],
  )
  const completed = useRef(false)
  useEffect(() => {
    if (!completed.current && touched.size >= Math.min(3, topic.words.length)) {
      completed.current = true
      onComplete()
    }
  }, [touched, topic.words.length, onComplete])
  const phrases = topic.phrases.map((id) => PHRASE_BY_ID[id]).filter((p) => p && p.level <= (profile?.level ?? 2))

  return (
    <div className="flex flex-col gap-4" data-testid="discover">
      <div
        onClickCapture={(e) => {
          const el = (e.target as HTMLElement).closest('[data-testid^="scene-item-"]')
          const key = el?.getAttribute('data-testid')?.replace('scene-item-', '')
          if (key && WORD_BY_ID[key]) {
            setTouched((s) => new Set(s).add(key))
          }
        }}
      >
        <SceneView scene={scene} testId="discover-scene" />
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-4">
          {Array.from({ length: pages }, (_, i) => (
            <KidButton key={i} illu={topic.words[i * perPage]} label={`${i + 1}`} size={72} color={i === page ? '#ffe58a' : '#fff'} testId={`discover-page-${i}`} onClick={() => setPage(i)} />
          ))}
        </div>
      )}
      {(profile?.level ?? 2) > 1 && phrases.length > 0 && (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl bg-white/85 p-4 shadow tv:p-8">
          {phrases.slice(0, 3).map((p) => (
            <AlignedSentence key={p.id} src={p.src} audioId={`p.${p.id}`} testId={`phrase-${p.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
