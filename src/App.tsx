import { lazy, Suspense, useEffect, useState } from 'react'
import type { ActivityKind } from '@content/types'
import { AppProvider, useApp } from '@/state/AppContext'
import { CursorTrail } from '@/components/CursorTrail'
import { CaptionBar } from '@/components/CaptionBar'
import { ColorBurst } from '@/components/ColorBurst'
import { GateTask } from '@/components/ParentGate'
import { ProfilesScreen } from '@/screens/ProfilesScreen'
import { Loading } from '@/screens/Loading'
const MapScreen = lazy(() => import('@/screens/MapScreen').then((m) => ({ default: m.MapScreen })))
const TopicScreen = lazy(() => import('@/screens/TopicScreen').then((m) => ({ default: m.TopicScreen })))
const ActivityScreen = lazy(() => import('@/screens/ActivityScreen').then((m) => ({ default: m.ActivityScreen })))
import { useArrowNav, useSessionTimer, exitFullscreen, isFullscreen } from '@/lib/hooks'
import { today } from '@/lib/db'
import { loadManifest, prefetchAll } from '@/lib/audio'
import { allAudioItems } from '@/lib/content'

const AlbumScreen = lazy(() => import('@/screens/AlbumScreen').then((m) => ({ default: m.AlbumScreen })))
const SleepScreen = lazy(() => import('@/screens/SleepScreen').then((m) => ({ default: m.SleepScreen })))
const KeyboardScreen = lazy(() => import('@/screens/KeyboardScreen').then((m) => ({ default: m.KeyboardScreen })))
const SurpriseScreen = lazy(() => import('@/screens/SurpriseScreen').then((m) => ({ default: m.SurpriseScreen })))
const KinoScreen = lazy(() => import('@/screens/KinoScreen').then((m) => ({ default: m.KinoScreen })))
const ParentScreen = lazy(() => import('@/parent/ParentScreen').then((m) => ({ default: m.ParentScreen })))

function Router() {
  const { screen, profile, go, settings, ready, update } = useApp()
  const [escGate, setEscGate] = useState(false)
  const childScreen = screen.name !== 'parent' && screen.name !== 'profiles' && screen.name !== 'sleep' && screen.name !== 'kino'
  useArrowNav(true)

  // Session limit → gentle sleep ritual (WHO-aligned defaults per age level).
  const extend = settings.extendToday[`${profile?.id}:${today()}`] ?? 0
  useSessionTimer(profile?.id, childScreen, (sec) => {
    if (profile && sec >= (profile.sessionMinutes + extend) * 60) go({ name: 'sleep' })
  })

  // No browser context menu in the app (right click = recolour).
  useEffect(() => {
    const prevent = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.parent input, .parent textarea')) e.preventDefault()
    }
    window.addEventListener('contextmenu', prevent)
    return () => window.removeEventListener('contextmenu', prevent)
  }, [])

  // Esc leaves full screen only through the parent gate (where the browser lets us intercept it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen.name !== 'parent' && isFullscreen()) {
        e.preventDefault()
        setEscGate(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen.name])

  // Toddler keyboard: a letter key on the map opens the keyboard screen.
  useEffect(() => {
    if (screen.name !== 'map') return
    const onKey = (e: KeyboardEvent) => {
      if (/^[a-zäöü]$/i.test(e.key) && !e.ctrlKey && !e.metaKey) go({ name: 'keyboard' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen.name, go])

  // Offline readiness: fetch all audio once in the background (service worker caches it).
  useEffect(() => {
    // every start: fetch recordings that are not cached yet (new verified audio arrives continuously)
    if (!ready || !navigator.onLine) return
    const id = window.setTimeout(() => {
      void loadManifest().then(async (m) => {
        if (!m) return
        await prefetchAll(allAudioItems().map((a) => a.id))
        update({ audioPrefetched: true })
      })
    }, 8000)
    return () => clearTimeout(id)
  }, [ready, update])

  if (!ready) return <Loading />
  let body
  switch (screen.name) {
    case 'profiles':
      body = <ProfilesScreen />
      break
    case 'map':
      body = profile ? <MapScreen /> : <ProfilesScreen />
      break
    case 'topic':
      body = <TopicScreen topicId={screen.topicId} />
      break
    case 'activity':
      body = <ActivityScreen key={`${screen.topicId}-${screen.kind}`} topicId={screen.topicId} kind={screen.kind as ActivityKind} />
      break
    case 'album':
      body = <AlbumScreen />
      break
    case 'surprise':
      body = <SurpriseScreen />
      break
    case 'sleep':
      body = <SleepScreen />
      break
    case 'keyboard':
      body = <KeyboardScreen />
      break
    case 'kino':
      body = <KinoScreen key={screen.topicId ?? 'kino'} topicId={screen.topicId} />
      break
    case 'parent':
      body = <ParentScreen initialTab={screen.tab} />
      break
  }
  return (
    <>
      {settings.trail && screen.name !== 'parent' && <CursorTrail />}
      <div className="app-screen h-full" data-screen={screen.name}>
        <Suspense fallback={<Loading />}>{body}</Suspense>
      </div>
      <CaptionBar />
      <ColorBurst />
      {escGate && (
        <GateTask
          onCancel={() => setEscGate(false)}
          onPass={() => {
            setEscGate(false)
            void exitFullscreen()
          }}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
