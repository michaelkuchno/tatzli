import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: '.',
  reporter: [['list']],
  workers: 7,
  fullyParallel: true,
  use: { ...devices['Pixel 7'], baseURL: 'http://localhost:4179/', launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } },
  webServer: { command: 'npx vite preview --port 4179 --strictPort', cwd: '../..', url: 'http://localhost:4179/', reuseExistingServer: true },
})
