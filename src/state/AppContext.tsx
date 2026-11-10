import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSetting, setSetting, type Profile } from '@/lib/db'
import { translate, type UiKey } from '@/lib/i18n'
import { setVolume, setStrictAudio, loadManifest, setSpeechRate } from '@/lib/audio'
import { speechRate } from '@/lib/speak'
import { setMusic, setSfxVolume } from '@/lib/sound'
import { DEFAULT_SETTINGS, type AppSettings } from './settings'

export type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'topic'; topicId: string }
  | { name: 'activity'; topicId: string; kind: string; ref?: string }
  | { name: 'album' }
  | { name: 'surprise' }
  | { name: 'sleep' }
  | { name: 'keyboard' }
  | { name: 'kino'; topicId?: string; channel?: string; n?: number }
  | { name: 'parent'; tab?: string }

interface Ctx {
  settings: AppSettings
  update: (patch: Partial<AppSettings>) => void
  profile: Profile | null
  setProfileId: (id: number | null) => void
  screen: Screen
  go: (s: Screen) => void
  back: () => void
  swap: (from: Screen, to: Screen) => void
  t: (k: UiKey, vars?: Record<string, string | number>) => string
  reducedMotion: boolean
  tv: boolean
  ready: boolean
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)
  const [profileId, setProfileIdState] = useState<number | null>(null)
  const [stack, setStack] = useState<Screen[]>([{ name: 'profiles' }])
  const profile = useLiveQuery(() => (profileId ? db.profiles.get(profileId) : undefined), [profileId]) ?? null
  const [sysReduced, setSysReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [bigScreen, setBigScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1600)

  useEffect(() => {
    void (async () => {
      // a storage problem must never leave the app on the loading screen
      try {
      const s = await getSetting<Partial<AppSettings>>('app', {})
      const merged = { ...DEFAULT_SETTINGS, ...s }
      if (!s.uiLang && typeof navigator !== 'undefined') {
        const nl = navigator.language.slice(0, 2)
        if (nl === 'de' || nl === 'en' || nl === 'pl') merged.uiLang = nl
      }
      setSettings(merged)
      const last = await getSetting<number | null>('lastProfile', null)
      if (last && (await db.profiles.get(last))) {
        setProfileIdState(last)
      }
      } catch (e) {
        console.error('[tatzli] settings/profile load failed', e)
      } finally {
        setReady(true)
      }
    })()
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setSysReduced(mq.matches)
    mq.addEventListener?.('change', onMq)
    const onResize = () => setBigScreen(window.innerWidth >= 1600)
    window.addEventListener('resize', onResize)
    return () => {
      mq.removeEventListener?.('change', onMq)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    setStrictAudio(settings.strictAudio)
    void loadManifest()
  }, [settings.strictAudio])
  useEffect(() => {
    setSpeechRate(speechRate(profile))
  }, [profile])
  useEffect(() => {
    setVolume(settings.volume)
    setSfxVolume(settings.volume * 0.6)
  }, [settings.volume])
  useEffect(() => {
    setMusic(settings.music && ready && stack[stack.length - 1].name !== 'parent')
  }, [settings.music, ready, stack])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      void setSetting('app', next)
      return next
    })
  }, [])

  const setProfileId = useCallback((id: number | null) => {
    setProfileIdState(id)
    void setSetting('lastProfile', id)
  }, [])

  const go = useCallback((s: Screen) => {
    setStack((st) => {
      if (s.name === 'map' || s.name === 'profiles') return [s]
      // the next film replaces the current one (back always leads to the cinema menu / the lesson)
      const top = st[st.length - 1]
      if (s.name === 'kino' && top?.name === 'kino' && (top.topicId || top.channel)) return [...st.slice(0, -1), s]
      return [...st, s]
    })
  }, [])
  const back = useCallback(() => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)), [])
  /** replace `from` by `to` only if `from` is still the current screen (a timer must never navigate after the child left) */
  const swap = useCallback((from: Screen, to: Screen) => setStack((st) => (JSON.stringify(st[st.length - 1]) === JSON.stringify(from) ? [...st.slice(0, -1), to] : st)), [])

  const reducedMotion = settings.reducedMotion === 'on' || (settings.reducedMotion === 'system' && sysReduced)
  const tv = settings.tvMode === 'on' || (settings.tvMode === 'auto' && bigScreen)

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion)
    document.documentElement.classList.toggle('tv', tv)
    document.documentElement.lang = settings.uiLang
  }, [reducedMotion, tv, settings.uiLang])

  const t = useCallback((k: UiKey, vars?: Record<string, string | number>) => translate(settings.uiLang, k, vars), [settings.uiLang])

  const value = useMemo<Ctx>(
    () => ({ settings, update, profile, setProfileId, screen: stack[stack.length - 1], go, back, swap, t, reducedMotion, tv, ready }),
    [settings, update, profile, setProfileId, stack, go, back, swap, t, reducedMotion, tv, ready],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside provider')
  return c
}
