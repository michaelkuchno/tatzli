import { test, expect } from '@playwright/test'
import { createProfile } from '../e2e/helpers'

/** Smoke test of the published site (run manually after a release): npx playwright test -c tests/live/pw.live.config.ts */
test('published site: map, lesson, cinema menu and a film', async ({ page }) => {
  const errs: string[] = []
  page.on('pageerror', (e) => errs.push(e.message))
  await createProfile(page, 'Live', 2)
  await page.getByTestId('place-chindsgi').click()
  await expect(page.getByTestId('activities')).toBeVisible()
  await page.getByTestId('home').click()
  await page.getByTestId('kino-button').click()
  await expect(page.getByTestId('kino-menu')).toBeVisible()
  await page.getByTestId('kino-ch-cat-animals').click()
  await expect(page.getByTestId('kino-picture')).toBeVisible({ timeout: 20_000 })
  expect(errs).toEqual([])
})
