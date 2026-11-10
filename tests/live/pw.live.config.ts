import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: '.', timeout: 120_000, expect: { timeout: 20_000 }, reporter: [['list']],
  use: { baseURL: process.env.LIVE_URL ?? 'https://michaelkuchno.github.io/tatzli/', launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } },
  projects: [{ name: 'phone', use: { ...devices['Pixel 7'] } }],
})
