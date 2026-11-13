import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import './index.css'
import './illustrations/illustrations.css'
import './illustrations/characters.css'
import App from './App'
import { installReloadOnChunkError } from './components/ErrorBoundary'
import { installAudioUnlock } from './lib/audio'
import { unlockSfx } from './lib/sound'

installReloadOnChunkError()
// iOS: unlock sound on every touch until it runs (shared voice element + Web Audio context)
installAudioUnlock()
for (const e of ['touchend', 'click', 'keydown']) window.addEventListener(e, () => unlockSfx(), { capture: true, passive: true })

if ('serviceWorker' in navigator && import.meta.env.PROD && !__TATZLI_ANDROID__) {
  void import('virtual:pwa-register').then(({ registerSW }) =>
    registerSW({
      immediate: true,
      // look for a new version whenever the app comes back to the screen and every hour (phones keep apps open for days)
      onRegisteredSW(_url, reg) {
        if (!reg) return
        const check = () => void reg.update().catch(() => {})
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check())
        setInterval(check, 60 * 60 * 1000)
      },
    }),
  )
}
// the native app runs bundled files: a service worker left over from the earlier web-wrapper versions must not serve old files
if ('serviceWorker' in navigator && __TATZLI_ANDROID__) {
  void navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => void r.unregister())).catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
