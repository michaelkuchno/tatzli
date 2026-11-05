import { lazy, Suspense, useState } from 'react'
import { useApp } from '@/state/AppContext'
import type { UiKey } from '@/lib/i18n'
import { exitFullscreen, enterFullscreen, isFullscreen } from '@/lib/hooks'
import { Loading } from '@/screens/ActivityScreen'

const tabs: { id: string; key: UiKey; C: React.LazyExoticComponent<() => React.ReactElement | null> }[] = [
  { id: 'overview', key: 'overview', C: lazy(() => import('./Overview').then((m) => ({ default: m.Overview }))) },
  { id: 'profiles', key: 'profiles', C: lazy(() => import('./Profiles').then((m) => ({ default: m.Profiles }))) },
  { id: 'languages', key: 'languages', C: lazy(() => import('./Profiles').then((m) => ({ default: m.Languages }))) },
  { id: 'comfort', key: 'comfort', C: lazy(() => import('./Comfort').then((m) => ({ default: m.Comfort }))) },
  { id: 'studio', key: 'studio', C: lazy(() => import('./Studio').then((m) => ({ default: m.Studio }))) },
  { id: 'ai', key: 'ai', C: lazy(() => import('./AiStudio').then((m) => ({ default: m.AiStudio }))) },
  { id: 'queue', key: 'queue', C: lazy(() => import('./AiStudio').then((m) => ({ default: m.AiQueue }))) },
  { id: 'surprise', key: 'surprise', C: lazy(() => import('./Comfort').then((m) => ({ default: m.SurprisePool }))) },
  { id: 'data', key: 'data', C: lazy(() => import('./DataTab').then((m) => ({ default: m.DataTab }))) },
  { id: 'be', key: 'beSources', C: lazy(() => import('./BeSources').then((m) => ({ default: m.BeSources }))) },
  { id: 'privacy', key: 'privacy', C: lazy(() => import('./Comfort').then((m) => ({ default: m.Privacy }))) },
]

export function ParentScreen({ initialTab }: { initialTab?: string }) {
  const { t, go, profile, update, settings } = useApp()
  const [tab, setTab] = useState(initialTab ?? (profile ? 'overview' : 'profiles'))
  const T = tabs.find((x) => x.id === tab) ?? tabs[0]
  return (
    <div className="parent flex h-full flex-col bg-stone-50 text-stone-800" data-testid="parent">
      <header className="flex flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <strong className="text-xl">Tatzli · {t('parent')}</strong>
        <select aria-label="UI language" className="rounded-lg border px-2 py-1" value={settings.uiLang} onChange={(e) => update({ uiLang: e.target.value as 'pl' | 'de' | 'en' })} data-testid="ui-lang">
          <option value="pl">Polski</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <div className="flex-1" />
        <button type="button" className="btn-secondary" onClick={() => void (isFullscreen() ? exitFullscreen() : enterFullscreen())}>
          {t('fullscreen')}
        </button>
        <button type="button" className="btn-primary" data-testid="to-child" onClick={() => go(profile ? { name: 'map' } : { name: 'profiles' })}>
          {t('childMode')}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-stone-200 bg-white p-2 md:w-56 md:flex-col md:border-b-0 md:border-r" aria-label={t('parent')}>
          {tabs.map((x) => (
            <button key={x.id} type="button" data-testid={`tab-${x.id}`} className={`whitespace-nowrap rounded-lg px-3 py-2 text-left ${tab === x.id ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-stone-100'}`} onClick={() => setTab(x.id)}>
              {t(x.key)}
            </button>
          ))}
        </nav>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <Suspense fallback={<Loading />}>
            <T.C />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
