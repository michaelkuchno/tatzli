import { db, pkey, today, type ItemProgress } from './db'
import { applyOutcome, newProgress, type Outcome } from './srs'

export async function recordExposure(profileId: number, itemId: string, kind: 'word' | 'phrase', outcome: Outcome = 'exposed') {
  const now = Date.now()
  await db.transaction('rw', db.progress, async () => {
    const key = pkey(profileId, itemId)
    const cur = (await db.progress.get(key)) ?? newProgress(profileId, itemId, kind, now)
    await db.progress.put(applyOutcome(cur, outcome, now))
  })
}

export async function progressMap(profileId: number): Promise<Map<string, ItemProgress>> {
  const rows = await db.progress.where('profileId').equals(profileId).toArray()
  return new Map(rows.map((r) => [r.itemId, r]))
}

/** Marks an activity as done in a topic; returns true when this completion earns the topic sticker. */
export async function markActivity(profileId: number, topicId: string, kind: string, stickerId: string): Promise<boolean> {
  const key = pkey(profileId, topicId)
  let earned = false
  await db.transaction('rw', db.topics, db.stickers, async () => {
    const cur = (await db.topics.get(key)) ?? { key, profileId, topicId, visits: 0, done: [], lastVisit: Date.now() }
    if (!cur.done.includes(kind)) cur.done = [...cur.done, kind]
    cur.lastVisit = Date.now()
    await db.topics.put(cur)
    // sticker for participation: after two different activities in a topic (not for a "score")
    const skey = pkey(profileId, stickerId)
    if (cur.done.length >= 2 && !(await db.stickers.get(skey))) {
      await db.stickers.put({ key: skey, profileId, stickerId, earnedAt: Date.now() })
      earned = true
    }
  })
  return earned
}

export async function visitTopic(profileId: number, topicId: string) {
  const key = pkey(profileId, topicId)
  const cur = (await db.topics.get(key)) ?? { key, profileId, topicId, visits: 0, done: [], lastVisit: Date.now() }
  cur.visits++
  cur.lastVisit = Date.now()
  await db.topics.put(cur)
}

/** Session/engagement log of today for a profile (one row per profile per day). */
export async function logSession(profileId: number, patch: { seconds?: number; skips?: number; hints?: number; completions?: number }) {
  const date = today()
  await db.transaction('rw', db.sessions, async () => {
    const row = await db.sessions.where('[profileId+date]').equals([profileId, date]).first()
    if (row) {
      await db.sessions.update(row.id!, {
        seconds: row.seconds + (patch.seconds ?? 0),
        skips: row.skips + (patch.skips ?? 0),
        hints: row.hints + (patch.hints ?? 0),
        completions: row.completions + (patch.completions ?? 0),
      })
    } else {
      await db.sessions.add({ profileId, date, seconds: patch.seconds ?? 0, skips: patch.skips ?? 0, hints: patch.hints ?? 0, completions: patch.completions ?? 0 })
    }
  })
}

/** Engagement over the last 14 days (feeds adaptive difficulty). */
export async function engagement(profileId: number) {
  const rows = await db.sessions.where('profileId').equals(profileId).toArray()
  const cutoff = today(new Date(Date.now() - 14 * 86400000))
  const recent = rows.filter((r) => r.date >= cutoff)
  return recent.reduce((a, r) => ({ skips: a.skips + r.skips, hints: a.hints + r.hints, completions: a.completions + r.completions }), { skips: 0, hints: 0, completions: 0 })
}
