import { defineConfig, devices } from '@playwright/test'

const PORT = 4179
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'retain-on-failure',
    permissions: ['microphone'],
    launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'tv-1080p', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } }, grep: /@tv/ },
    { name: 'tv-4k', use: { ...devices['Desktop Chrome'], viewport: { width: 3840, height: 2160 } }, grep: /@tv/ },
    { name: 'phone-portrait', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
    { name: 'phone-landscape', use: { ...devices['Pixel 7 landscape'] }, grep: /@mobile/ },
    { name: 'tablet', use: { ...devices['Galaxy Tab S4'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
