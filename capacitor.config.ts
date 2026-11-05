import type { CapacitorConfig } from '@capacitor/cli'

/**
 * TATZLI_LIVE=1 → the native app loads the published PWA (GitHub Pages) and keeps it offline via the
 * service worker. New recordings and content arrive automatically without reinstalling the app.
 * Without it the web assets bundled in the APK/IPA are used (fully offline from the first start).
 */
const live = process.env.TATZLI_LIVE === '1'

const config: CapacitorConfig = {
  appId: 'ch.tatzli.app',
  appName: 'Tatzli',
  webDir: 'dist',
  android: { allowMixedContent: false },
  ...(live ? { server: { url: 'https://michaelkuchno.github.io/tatzli/', cleartext: false, androidScheme: 'https' } } : {}),
}

export default config
