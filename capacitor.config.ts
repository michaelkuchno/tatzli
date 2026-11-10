import type { CapacitorConfig } from '@capacitor/cli'

/**
 * The native apps run the web app bundled inside the APK/IPA (all recordings included, fully offline) – no dependency on
 * the network or on a cached website. `hostname` keeps the origin of the earlier versions (which loaded the published PWA),
 * so children's profiles and progress stored on the device stay available after the update.
 * TATZLI_LIVE=1 (developer option only) → the app loads the published PWA instead.
 */
const live = process.env.TATZLI_LIVE === '1'

const config: CapacitorConfig = {
  appId: 'ch.tatzli.app',
  appName: 'Tatzli',
  webDir: 'dist',
  android: { allowMixedContent: false },
  server: live ? { url: 'https://michaelkuchno.github.io/tatzli/', cleartext: false, androidScheme: 'https' } : { hostname: 'michaelkuchno.github.io', androidScheme: 'https' },
}

export default config
