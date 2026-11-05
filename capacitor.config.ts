import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ch.tatzli.app',
  appName: 'Tatzli',
  webDir: 'dist',
  android: { allowMixedContent: false },
}

export default config
