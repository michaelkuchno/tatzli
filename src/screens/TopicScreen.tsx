import { useEffect, useMemo, useState } from 'react'
import { startKinoSession } from '@/lib/kinoChannels'
import { useLiveQuery } from 'dexie-react-hooks'
import type { ActivityKind } from '@content/types'
import { useApp } from '@/state/AppContext'
import { TOPIC_BY_ID, PHRASE_BY_ID } from '@/lib/content'
import { db, pkey } from '@/lib/db'
import { visitTopic } from '@/lib/progress'
import { ChildBar, KidButton } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { AlignedSentence } from '@/components/AlignedSentence'
import { speak } from '@/lib/speak'

export const ACTIVITY_ICON: Record<ActivityKind, { illu: string; pose?: Parameters<typeof Illustration>[0]['pose']; color: string; label: string }> = {
  discover: { illu: 'sparkle', color: '#fff3c4', label: 'Entdecke' },
  whereIs: { illu: 'pose-look', color: '#d9f0ff', label: 'Wo isch?' },
  tpr: { illu: 'pose-jump', color: '#ffe0e6', label: 'Mach mit!' },
  memory: { illu: 'kloetzli', color: '#e6f7df', label: 'Memory' },
  sort: { illu: 'bin-a', color: '#f2e6ff', label: 'Sortiere' },
  count: { illu: 'basket', color: '#ffe9d1', label: 'Zelle' },
  story: { illu: 'buech', color: '#fde3df', label: 'Gschicht' },
  song: { illu: 'pose-sing', color: '#e0f5f1', label: 'Lied' },
  speak: { illu: 'pose-listen', color: '#e8e4ff', label: 'Red wie Tatzli' },
}

export function TopicScreen({ topicId }: { topicId: string }) {
  const { profile, go, t, settings } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const tp = useLiveQuery(() => (profile?.id ? db.topics.get(pkey(profile.id, topicId)) : undefined), [profile?.id, topicId])
  const hasSticker = useLiveQuery(() => (profile?.id && topic ? db.stickers.get(pkey(profile.id, topic.sticker)) : undefined), [profile?.id, topic?.sticker])
  const [tipIdx, setTipIdx] = useState(0)

  useEffect(() => {
    if (profile?.id) void visitTopic(profile.id, topicId)
  }, [profile?.id, topicId])

  const kinds = useMemo<ActivityKind[]>(() => {
    if (!topic) return []
    const k: ActivityKind[] = ['discover', ...topic.games]
    if (topic.story) k.push('story')
    if (topic.song) k.push('song')
    k.push('speak')
    return [...new Set(k)]
  }, [topic])

  if (!topic) return null
  const offPhrase = topic.offscreen.phrase ? PHRASE_BY_ID[topic.offscreen.phrase] : undefined
  const ui = settings.uiLang

  return (
    <div className="flex h-full flex-col">
      <ChildBar
        title={
          <button type="button" className="inline-flex items-center gap-3" onClick={() => void speak(profile, `t.${topic.id}`)} data-testid="topic-title">
            <span className="inline-block h-12 w-12 tv:h-20 tv:w-20">
              <Illustration name={topic.icon} className="h-full w-full" live />
            </span>
            {(profile?.level ?? 2) > 1 && <span>{topic.title[profile?.langs[0] ?? 'be']}</span>}
          </button>
        }
        right={
          <div className={`h-14 w-14 rounded-full p-1 tv:h-20 tv:w-20 ${hasSticker ? 'bg-amber-200' : 'bg-white/50 opacity-50 grayscale'}`} aria-label={t('sticker')} data-testid="topic-sticker">
            <Illustration name={topic.sticker} className="h-full w-full" />
          </div>
        }
      />
      <div className="safe-x flex flex-1 flex-col gap-6 overflow-auto pb-6">
        <div className="flex flex-wrap justify-center gap-5 tv:gap-10" data-testid="activities">
          {/* the whole lesson as a self-running presentation (no touching needed – TV, mealtimes) */}
          <KidButton label="Aaluege" testId="lesson-show" color="#ffe58a" size={profile?.level === 1 ? 150 : 132} onClick={() => {
            startKinoSession()
            go({ name: 'kino', topicId })
          }}>
            <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" aria-hidden>
              <rect x="5" y="9" width="38" height="26" rx="5" fill="#fff" stroke="#4a3326" strokeWidth="3.5" />
              <path d="M20 15 L31 22 L20 29 Z" fill="#e2493b" />
              <path d="M17 41 H31 M24 35 V41" stroke="#4a3326" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </KidButton>
          {kinds.map((k) => {
            const a = ACTIVITY_ICON[k]
            const done = tp?.done.includes(k)
            return (
              <div key={k} className="relative">
                <KidButton illu={a.illu} label={a.label} color={a.color} testId={`activity-${k}`} size={profile?.level === 1 ? 150 : 132} onClick={() => go({ name: 'activity', topicId, kind: k })} />
                {done && (
                  <span className="absolute -right-2 -top-2 h-10 w-10">
                    <Illustration name="sticker-star" className="h-full w-full" />
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {settings.parentTips && (
          <div className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-2" data-testid="parent-tips">
            <div className="rounded-3xl bg-white/80 p-4 shadow tv:p-8">
              <div className="mb-1 text-sm font-bold uppercase tracking-wide text-stone-500 tv:text-xl">{t('askChild')}</div>
              <p className="text-lg text-stone-700 tv:text-3xl">{topic.parentTips[tipIdx % topic.parentTips.length][ui]}</p>
              {topic.parentTips.length > 1 && (
                <button type="button" className="mt-2 text-sm font-semibold text-amber-700 underline tv:text-xl" onClick={() => setTipIdx((i) => i + 1)}>
                  →
                </button>
              )}
            </div>
            <div className="rounded-3xl bg-white/80 p-4 shadow tv:p-8" data-testid="offscreen">
              <div className="mb-1 text-sm font-bold uppercase tracking-wide text-stone-500 tv:text-xl">{t('offscreen')}</div>
              <p className="mb-2 text-lg text-stone-700 tv:text-3xl">{topic.offscreen[ui]}</p>
              {offPhrase && <AlignedSentence src={offPhrase.src} audioId={`p.${offPhrase.id}`} size="md" />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
