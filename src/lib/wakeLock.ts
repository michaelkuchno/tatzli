import { Capacitor } from '@capacitor/core'

/**
 * Keeps the screen on (Kino, stories, songs). Native apps use the keep-awake plugin, browsers the
 * Screen Wake Lock API (re-acquired automatically when the page becomes visible again).
 */
let sentinel: WakeLockSentinel | null = null
let wanted = false

async function acquireWeb() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        sentinel = null
      })
    }
  } catch {
    /* not allowed (battery saver, old browser) – nothing else to do */
  }
}

function onVisible() {
  if (wanted && document.visibilityState === 'visible' && !sentinel) void acquireWeb()
}

export async function keepScreenOn() {
  wanted = true
  if (Capacitor.isNativePlatform()) {
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake')
      await KeepAwake.keepAwake()
    } catch {
      /* plugin missing in an old app build – fall back to the web API */
    }
  }
  document.addEventListener('visibilitychange', onVisible)
  await acquireWeb()
}

export async function allowScreenOff() {
  wanted = false
  document.removeEventListener('visibilitychange', onVisible)
  try {
    await sentinel?.release()
  } catch {
    /* ignore */
  }
  sentinel = null
  if (Capacitor.isNativePlatform()) {
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake')
      await KeepAwake.allowSleep()
    } catch {
      /* ignore */
    }
  }
}
