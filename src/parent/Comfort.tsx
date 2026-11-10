import { useEffect, useState } from 'react'
import { startKinoSession } from '@/lib/kinoChannels'
import { useLiveQuery } from 'dexie-react-hooks'
import { loadManifest } from '@/lib/audio'
import { soundLangs } from '@/lib/speak'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { STORY_BY_ID, SONG_BY_ID, UI_PROMPTS, allAudioItems } from '@/lib/content'
import { surpriseCandidates } from '@/screens/SurpriseScreen'
import type { AiStory } from '@/lib/ai/pipeline'

function Toggle({ label, value, onChange, testId }: { label: string; value: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <label className="flex items-center gap-3 py-1">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} data-testid={testId} className="h-5 w-5" />
      <span>{label}</span>
    </label>
  )
}

export function Comfort() {
  const { settings, update, t, profile } = useApp()
  return (
    <section className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">{t('comfort')}</h2>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow">
        <label className="block">
          <span className="label">{t('volume')}</span>
          <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => update({ volume: Number(e.target.value) })} className="w-64" data-testid="volume" />
        </label>
        <Toggle label={t('music')} value={settings.music} onChange={(v) => update({ music: v })} testId="toggle-music" />
        <Toggle label={t('trail')} value={settings.trail} onChange={(v) => update({ trail: v })} testId="toggle-trail" />
        <Toggle label={t('captions')} value={settings.captions} onChange={(v) => update({ captions: v })} />
        <Toggle label={t('parentTips')} value={settings.parentTips} onChange={(v) => update({ parentTips: v })} testId="toggle-tips" />
        <label className="flex items-center gap-3">
          <span>{t('reducedMotion')}</span>
          <select className="input w-36" value={settings.reducedMotion} onChange={(e) => update({ reducedMotion: e.target.value as 'system' | 'on' | 'off' })} data-testid="reduced-motion">
            <option value="system">{t('auto')}</option>
            <option value="on">{t('on')}</option>
            <option value="off">{t('off')}</option>
          </select>
        </label>
        <label className="flex items-center gap-3">
          <span>{t('tvMode')}</span>
          <select className="input w-36" value={settings.tvMode} onChange={(e) => update({ tvMode: e.target.value as 'auto' | 'on' | 'off' })} data-testid="tv-mode">
            <option value="auto">{t('auto')}</option>
            <option value="on">{t('on')}</option>
            <option value="off">{t('off')}</option>
          </select>
        </label>
      </div>
      {profile && (
        <div className="rounded-2xl bg-white p-4 shadow">
          <label className="block">
            <span className="label">
              {t('sessionMinutes')} · {profile.nickname}
            </span>
            <input type="number" min={3} max={60} className="input w-28" value={profile.sessionMinutes} onChange={(e) => void db.profiles.update(profile.id!, { sessionMinutes: Number(e.target.value) || 10 })} data-testid="session-minutes" />
          </label>
          <p className="mt-2 text-sm text-stone-500">{t('sessionHint')}</p>
        </div>
      )}
    </section>
  )
}

export function SurprisePool() {
  const { settings, update, t, profile } = useApp()
  const approvedAi = useLiveQuery(async () => (await db.aiQueue.where('status').equals('approved').toArray()).filter((x) => x.kind === 'scene'), []) ?? []
  const cands = surpriseCandidates(
    profile?.level ?? 3,
    approvedAi.map((x) => x.id!),
  )
  const pool = new Set(settings.surprisePool)
  const label = (c: string) => {
    if (c.startsWith('story:')) return `📖 ${STORY_BY_ID[c.slice(6)]?.title[settings.uiLang] ?? c}`
    if (c.startsWith('song:')) return `🎵 ${SONG_BY_ID[c.slice(5)]?.title[settings.uiLang] ?? c}`
    const it = approvedAi.find((x) => `ai:${x.id}` === c)
    return `✨ AI: ${(it?.payload as AiStory | undefined)?.title[settings.uiLang] ?? c}`
  }
  return (
    <section className="max-w-3xl space-y-3">
      <h2 className="text-2xl font-bold">{t('surprise')}</h2>
      <ul className="space-y-1 rounded-2xl bg-white p-4 shadow">
        {cands.map((c) => (
          <li key={c}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pool.has(c)}
                data-testid={`pool-${c}`}
                onChange={(e) => {
                  const next = new Set(pool)
                  if (e.target.checked) next.add(c)
                  else next.delete(c)
                  update({ surprisePool: [...next] })
                }}
              />
              {label(c)}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Privacy() {
  const { t } = useApp()
  return (
    <section className="max-w-3xl space-y-3" data-testid="privacy">
      <h2 className="text-2xl font-bold">{t('privacy')}</h2>
      <p className="rounded-2xl bg-white p-4 leading-relaxed shadow">{t('privacyText')}</p>
      <p className="text-sm text-stone-500">{t('install')}</p>
      <p className="text-sm text-stone-500">Tatzli {__APP_VERSION__} · MIT · Illustrationen, Lieder & Melodien: Originalwerke dieses Projekts.</p>
    </section>
  )
}

const KINO_PROMPTS = ['your-turn', 'say-again', 'say-with-me', 'can-you'] as const

/** Mealtime cinema settings + one big start button (easy on a phone). */
export function KinoTab() {
  const { settings, update, t, go, profile } = useApp()
  const [cov, setCov] = useState<{ done: number; total: number } | null>(null)
  useEffect(() => {
    void loadManifest().then((m) => {
      const items = allAudioItems()
      const langs = soundLangs(profile)
      setCov({ done: items.filter((a) => m && langs.every((l) => m.items[a.id]?.[l])).length, total: items.length })
    })
  }, [profile])
  const ui = settings.uiLang
  return (
    <section className="max-w-3xl space-y-4" data-testid="kino-tab">
      <h2 className="text-2xl font-bold">{t('kino')}</h2>
      <p className="text-stone-600">{t('kinoHint')}</p>
      <button type="button" className="w-full rounded-3xl bg-amber-500 px-6 py-6 text-3xl font-black text-white shadow-lg active:scale-[.98]" data-testid="kino-start" onClick={() => {
          startKinoSession()
          go({ name: 'kino', channel: 'mix', n: Date.now() })
        }}>
        {t('kinoStart')}
      </button>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow">
        <label className="block">
          <span className="label">
            {t('kinoMinutes')}: <b>{settings.kinoMinutes}</b>
          </span>
          <input type="range" min={5} max={30} step={5} value={settings.kinoMinutes} onChange={(e) => update({ kinoMinutes: Number(e.target.value) })} className="w-full" data-testid="kino-minutes" />
        </label>
        <fieldset>
          <legend className="label">{t('kinoPrompt')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {KINO_PROMPTS.map((p) => {
              const tx = UI_PROMPTS.find((x) => x.id === p)!.text
              return (
                <label key={p} className={`cursor-pointer rounded-xl border-2 p-2 ${settings.kinoPrompt === p ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
                  <input type="radio" name="kino-prompt" className="sr-only" checked={settings.kinoPrompt === p} onChange={() => update({ kinoPrompt: p })} data-testid={`kino-prompt-${p}`} />
                  <b>{tx.be}</b> <span className="text-stone-500">· {tx[ui]}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">{t('kinoMix')}</legend>
          {(['songs', 'stories', 'words', 'colors'] as const).map((k) => (
            <Toggle key={k} label={t(k === 'songs' ? 'mixSongs' : k === 'stories' ? 'mixStories' : k === 'words' ? 'mixWords' : 'mixColors')} value={settings.kinoMix[k]} onChange={(v) => update({ kinoMix: { ...settings.kinoMix, [k]: v } })} />
          ))}
        </fieldset>
        <p className="text-sm text-stone-500">
          {t('languages')}: {profile ? `${profile.langs.join(' · ').toUpperCase()} / 🔊 ${soundLangs(profile).join(' → ').toUpperCase()}` : '–'}
        </p>
      </div>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow">
        <Toggle label={t('strictAudio')} value={settings.strictAudio} onChange={(v) => update({ strictAudio: v })} testId="strict-audio" />
        <p className="text-sm text-stone-500">{t('strictAudioHint')}</p>
        {cov && (
          <div data-testid="audio-coverage">
            <div className="label">
              {t('audioCoverage')}: {cov.done}/{cov.total}
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full bg-emerald-500" style={{ width: `${(cov.done / Math.max(1, cov.total)) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
