import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import './index.css'
import './illustrations/illustrations.css'
import './illustrations/characters.css'
import App from './App'

if ('serviceWorker' in navigator && import.meta.env.PROD && !__TATZLI_ANDROID__) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
