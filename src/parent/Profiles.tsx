import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Lang, Level } from '@content/types'
import { LANGS } from '@content/types'
import { db, pkey, type Profile } from '@/lib/db'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { LANG_META, LangBadge } from '@/components/LangBadge'
import { DEFAULT_SESSION_MINUTES } from '@/lib/adapt'

export const AVATARS = ['chatz', 'hund', 'fuchs', 'eichhoernli', 'uele', 'aente', 'igu', 'haas', 'murmeli', 'pinguin', 'steibock', 'elefant']

export function Profiles() {
  const { t, setProfileId, profile: current } = useApp()
  const profiles = useLiveQuery(() => db.profiles.toArray(), []) ?? []
  const [edit, setEdit] = useState<Profile | null>(null)
  const blank = (): Profile => ({ nickname: '', level: 2, avatar: AVATARS[profiles.length % AVATARS.length], langs: ['be', 'de', 'pl'], audioLang: 'be', audioLang2: 'de', repeatSecond: false, sessionMinutes: DEFAULT_SESSION_MINUTES[2], createdAt: Date.now() })
  return (
    <section className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">{t('profiles')}</h2>
      <ul className="space-y-2">
        {profiles.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <span className="h-12 w-12">
              <Illustration name={p.avatar} className="h-full w-full" />
            </span>
            <span className="flex-1 font-semibold">
              {p.nickname} · {t(p.level === 1 ? 'level1' : p.level === 2 ? 'level2' : 'level3')}
              {current?.id === p.id && ' ✓'}
            </span>
            <button type="button" className="btn-secondary" onClick={() => setProfileId(p.id!)}>
              ✓
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEdit(p)} data-testid={`edit-${p.nickname}`}>
              ✎
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={async () => {
                if (!confirm(t('confirmDelete'))) return
                const id = p.id!
                await db.transaction('rw', [db.profiles, db.progress, db.topics, db.stickers, db.favorites, db.sessions], async () => {
                  await db.profiles.delete(id)
                  for (const tb of [db.progress, db.topics, db.stickers, db.favorites]) await tb.where('profileId').equals(id).delete()
                  await db.sessions.where('profileId').equals(id).delete()
                })
                if (current?.id === id) setProfileId(null)
              }}
            >
              {t('delete')}
            </button>
          </li>
        ))}
      </ul>
      {!edit && (
        <button type="button" className="btn-primary" onClick={() => setEdit(blank())} data-testid="new-profile">
          + {t('newProfile')}
        </button>
      )}
      {edit && <ProfileForm initial={edit} onDone={() => setEdit(null)} />}
    </section>
  )
}

function ProfileForm({ initial, onDone }: { initial: Profile; onDone: () => void }) {
  const { t, setProfileId } = useApp()
  const [p, setP] = useState<Profile>(initial)
  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-4 shadow"
      data-testid="profile-form"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!p.nickname.trim()) return
        const id = await db.profiles.put({ ...p, nickname: p.nickname.trim() })
        setProfileId(id as number)
        onDone()
      }}
    >
      <label className="block">
        <span className="label">{t('nickname')}</span>
        <input className="input" value={p.nickname} maxLength={20} onChange={(e) => setP({ ...p, nickname: e.target.value })} data-testid="nickname" required />
      </label>
      <fieldset>
        <legend className="label">{t('ageLevel')}</legend>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3] as Level[]).map((l) => (
            <label key={l} className={`cursor-pointer rounded-xl border-2 px-3 py-2 ${p.level === l ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
              <input type="radio" className="sr-only" name="level" checked={p.level === l} onChange={() => setP({ ...p, level: l, sessionMinutes: DEFAULT_SESSION_MINUTES[l] })} data-testid={`level-${l}`} />
              {t(l === 1 ? 'level1' : l === 2 ? 'level2' : 'level3')}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">{t('avatar')}</legend>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button key={a} type="button" aria-label={a} className={`h-16 w-16 rounded-2xl p-1 ${p.avatar === a ? 'bg-amber-200 ring-4 ring-amber-400' : 'bg-stone-100'}`} onClick={() => setP({ ...p, avatar: a })}>
              <Illustration name={a} className="h-full w-full" />
            </button>
          ))}
        </div>
      </fieldset>
      <LangEditor value={p} onChange={setP} />
      <label className="block">
        <span className="label">{t('sessionMinutes')}</span>
        <input type="number" min={3} max={60} className="input w-28" value={p.sessionMinutes} onChange={(e) => setP({ ...p, sessionMinutes: Number(e.target.value) || 10 })} />
        <span className="mt-1 block text-sm text-stone-500">{t('sessionHint')}</span>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" data-testid="save-profile">
          {t('save')}
        </button>
        <button type="button" className="btn-secondary" onClick={onDone}>
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}

/** Displayed languages (any combination, ordered), sound language and "repeat in second language". */
export function LangEditor({ value: p, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const { t } = useApp()
  const order: Lang[] = [...p.langs, ...LANGS.filter((l) => !p.langs.includes(l))]
  const move = (l: Lang, d: number) => {
    const arr = [...p.langs]
    const i = arr.indexOf(l)
    const j = i + d
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    onChange({ ...p, langs: arr })
  }
  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="label">{t('langsShown')}</legend>
        <ul className="space-y-1">
          {order.map((l) => {
            const on = p.langs.includes(l)
            return (
              <li key={l} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={on}
                  data-testid={`show-${l}`}
                  onChange={() => {
                    const next = on ? p.langs.filter((x) => x !== l) : [...p.langs, l]
                    if (next.length) onChange({ ...p, langs: next })
                  }}
                />
                <LangBadge lang={l} />
                <span className="w-32 font-semibold" style={{ color: LANG_META[l].color === '#e0a21b' ? '#7a5200' : LANG_META[l].color }}>
                  {LANG_META[l].name}
                </span>
                {on && (
                  <>
                    <button type="button" className="btn-mini" aria-label="up" onClick={() => move(l, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn-mini" aria-label="down" onClick={() => move(l, 1)}>
                      ↓
                    </button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </fieldset>
      <label className="block">
        <span className="label">{t('audioLang')}</span>
        <select className="input w-48" value={p.audioLang} onChange={(e) => onChange({ ...p, audioLang: e.target.value as Lang })} data-testid="audio-lang">
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_META[l].name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-wrap items-center gap-2">
        <input type="checkbox" checked={p.repeatSecond} onChange={(e) => onChange({ ...p, repeatSecond: e.target.checked })} data-testid="repeat-second" />
        <span>{t('audioLang2')}</span>
        <select className="input w-48" value={p.audioLang2 ?? 'de'} onChange={(e) => onChange({ ...p, audioLang2: e.target.value as Lang })}>
          {LANGS.filter((l) => l !== p.audioLang).map((l) => (
            <option key={l} value={l}>
              {LANG_META[l].name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export function Languages() {
  const { profile, t } = useApp()
  if (!profile) return <p>{t('noProfiles')}</p>
  return (
    <section className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">
        {t('languages')} · {profile.nickname}
      </h2>
      <div className="rounded-2xl bg-white p-4 shadow">
        <LangEditor value={profile} onChange={(p) => void db.profiles.put(p)} />
      </div>
    </section>
  )
}

export { pkey }
