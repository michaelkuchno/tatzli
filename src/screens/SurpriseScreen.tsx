import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useApp } from '@/state/AppContext'
import { STORIES, SONGS, STORY_BY_ID, SONG_BY_ID } from '@/lib/content'
import { db, today } from '@/lib/db'
import { ChildBar } from '@/components/ui'
import { StoryView } from '@/activities/StoryPlayer'
import { SongPlayer } from '@/activities/SongPlayer'
import { aiStoryToStory } from '@/lib/ai/pipeline'
import { logSession } from '@/lib/progress'

/** All surprise candidates for a level: built-in stories/songs + approved AI scenes. */
export function surpriseCandidates(level: number, approvedAi: number[]): string[] {
  return [
    ...STORIES.filter((s) => s.level <= level).map((s) => `story:${s.id}`),
    ...SONGS.filter((s) => s.level <= level).map((s) => `song:${s.id}`),
    ...approvedAi.map((id) => `ai:${id}`),
  ]
}

function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return Math.abs(h)
}

/** Daily "Überraschung": one short scene per day from the pool the parent approved. */
export function SurpriseScreen() {
  const { profile, settings } = useApp()
  const level = profile?.level ?? 2
  const approvedAi = useLiveQuery(async () => (await db.aiQueue.where('status').equals('approved').toArray()).filter((x) => x.kind === 'scene'), []) ?? []
  const pool = useMemo(() => {
    const cands = surpriseCandidates(
      level,
      approvedAi.map((x) => x.id!),
    )
    // Parent-curated pool; if nothing chosen yet, everything built-in for the level is pre-approved.
    const chosen = settings.surprisePool.filter((x) => cands.includes(x))
    return chosen.length ? chosen : cands.filter((c) => !c.startsWith('ai:'))
  }, [level, approvedAi, settings.surprisePool])
  const pick = pool.length ? pool[hash(`${today()}:${profile?.id}`) % pool.length] : null
  const done = () => {
    if (profile?.id) void logSession(profile.id, { completions: 1 })
  }

  let body = null
  if (pick?.startsWith('story:')) body = <StoryView story={STORY_BY_ID[pick.slice(6)]} onComplete={done} onHint={() => {}} />
  else if (pick?.startsWith('song:') && SONG_BY_ID[pick.slice(5)]) body = <SongPlayer topicId="" songId={pick.slice(5)} onComplete={done} onHint={() => {}} />
  else if (pick?.startsWith('ai:')) {
    const item = approvedAi.find((x) => `ai:${x.id}` === pick)
    if (item) body = <StoryView story={aiStoryToStory(item)} audioPrefix="ai" onComplete={done} onHint={() => {}} />
  }
  return (
    <div className="flex h-full flex-col" data-testid="surprise" data-pick={pick ?? ''}>
      <ChildBar />
      <div className="safe-x flex-1 overflow-auto pb-6">{body}</div>
    </div>
  )
}
