import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { LANGS } from '@content/types'
import { useApp } from '@/state/AppContext'
import { db, today } from '@/lib/db'
import { TOPICS, WORD_BY_ID, TOPIC_BY_ID } from '@/lib/content'
import { dueItems } from '@/lib/srs'
import { topicsFor, seasonalNow } from '@/lib/topics'
import { LANG_META, LangBadge } from '@/components/LangBadge'
import { Illustration } from '@/illustrations/registry'

export function Overview() {
  const { profile, t, settings } = useApp()
  const [busy, setBusy] = useState(false)
  const data = useLiveQuery(async () => {
    if (!profile?.id) return null
    const [progress, sessions, topics] = await Promise.all([
      db.progress.where('profileId').equals(profile.id).toArray(),
      db.sessions.where('profileId').equals(profile.id).toArray(),
      db.topics.where('profileId').equals(profile.id).toArray(),
    ])
    return { progress, sessions, topics }
  }, [profile?.id])
  if (!profile) return <p>{t('noProfiles')}</p>
  if (!data) return null
  const met = new Set(data.progress.filter((p) => p.kind === 'word' && p.exposures > 0).map((p) => p.itemId))
  const phrasesMet = data.progress.filter((p) => p.kind === 'phrase' && p.exposures > 0).length
  const days = Array.from({ length: 7 }, (_, i) => today(new Date(Date.now() - (6 - i) * 86400000)))
  const perDay = days.map((d) => Math.round(data.sessions.filter((s) => s.date === d).reduce((a, s) => a + s.seconds, 0) / 60))
  const max = Math.max(profile.sessionMinutes, ...perDay)
  const due = dueItems(data.progress, Date.now()).slice(0, 8)
  const visited = new Set(data.topics.map((x) => x.topicId))
  const nextTopics = [...seasonalNow(), ...topicsFor(profile.level).filter((tp) => !visited.has(tp.id))].slice(0, 3)
  const ui = settings.uiLang

  return (
    <section className="max-w-5xl space-y-6" data-testid="overview">
      <h2 className="text-2xl font-bold">
        {t('overview')} · {profile.nickname}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label={t('learnedWords')} value={`${met.size}`} sub={`${phrasesMet} ${t('phrases')}`} />
        <Stat label={t('minutesToday')} value={`${perDay[6]}`} sub={`/ ${profile.sessionMinutes}`} />
        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="label">{t('minutesWeek')}</div>
          <div className="flex h-24 items-end gap-1" role="img" aria-label={perDay.join(', ')}>
            {perDay.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-amber-400" style={{ height: `${(m / max) * 80}px` }} title={`${days[i]}: ${m} min`} />
                <span className="text-[10px] text-stone-500">{days[i].slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-bold">{t('tomorrow')}</h3>
        <ul className="list-disc space-y-1 pl-5">
          {nextTopics.map((tp) => (
            <li key={tp.id}>
              {tp.title[ui]} ({tp.title.be})
            </li>
          ))}
          {due.length > 0 && <li>{due.map((d) => WORD_BY_ID[d.itemId]?.text.be ?? d.itemId).join(', ')}</li>}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          data-testid="export-pdf"
          onClick={async () => {
            setBusy(true)
            try {
              const { exportWordsPdf } = await import('./pdf')
              await exportWordsPdf(profile, [...met])
            } finally {
              setBusy(false)
            }
          }}
        >
          {t('exportPdf')}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold">{t('learnedWords')}</h3>
        {TOPICS.filter((tp) => tp.words.some((w) => met.has(w))).map((tp) => (
          <details key={tp.id} className="rounded-2xl bg-white p-3 shadow" open={visited.has(tp.id)}>
            <summary className="cursor-pointer font-semibold">
              {TOPIC_BY_ID[tp.id].title[ui]} · {tp.words.filter((w) => met.has(w)).length}/{tp.words.length}
            </summary>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr>
                  <th />
                  {LANGS.map((l) => (
                    <th key={l} className="text-left">
                      <LangBadge lang={l} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tp.words
                  .filter((w) => met.has(w))
                  .map((w) => (
                    <tr key={w} className="border-t border-stone-100">
                      <td className="w-10 py-1">
                        <Illustration name={WORD_BY_ID[w].illu} className="h-8 w-8" />
                      </td>
                      {LANGS.map((l) => (
                        <td key={l} style={{ color: l === 'de' ? '#7a5200' : LANG_META[l].color }}>
                          {WORD_BY_ID[w].text[l]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </details>
        ))}
        {met.size === 0 && <p className="text-stone-500">{t('noData')}</p>}
      </div>
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="label">{label}</div>
      <div className="text-4xl font-black text-amber-700">{value}</div>
      {sub && <div className="text-sm text-stone-500">{sub}</div>}
    </div>
  )
}
