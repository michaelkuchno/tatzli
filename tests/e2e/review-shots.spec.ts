import { test, expect } from '@playwright/test'
import { createProfile, passGate } from './helpers'

// Screenshots used for the UX review (docs/REVIEW.md); also a smoke test on every device profile.
test('review screenshots @mobile @tv', async ({ page }, info) => {
  const shot = (n: string) => page.screenshot({ path: `test-results/review/${info.project.name}-${n}.png` })
  await createProfile(page, 'Rev', 1)
  await shot('1-map')
  await page.getByTestId('place-home').click()
  await page.getByTestId(/topic-l1-/).first().click()
  await expect(page.getByTestId('activities')).toBeVisible()
  await shot('2-topic')
  await page.getByTestId('activity-whereIs').click()
  await expect(page.getByTestId('whereis')).toBeVisible()
  await shot('3-whereis')
  await page.getByTestId('home').click()
  await page.getByTestId('kino-button').click()
  await expect(page.getByTestId('kino')).toBeVisible()
  await page.waitForTimeout(2500)
  await shot('4-kino')
  await page.getByTestId('back').click()
  await passGate(page)
  await page.getByTestId('tab-kino').click()
  await shot('5-parent-kino')
})
