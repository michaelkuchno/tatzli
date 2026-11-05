import { test, expect } from '@playwright/test'
import { createProfile } from './helpers'

test('start, profile, map, topic @tv @mobile', async ({ page }, info) => {
  await createProfile(page)
  await page.screenshot({ path: `test-results/shot-map-${info.project.name}.png` })
  await page.getByTestId('place-chindsgi').click()
  await expect(page.getByTestId('activities')).toBeVisible()
  await page.screenshot({ path: `test-results/shot-topic-${info.project.name}.png` })
  await page.getByTestId('activity-discover').click()
  await expect(page.getByTestId('discover-scene')).toBeVisible()
  await page.screenshot({ path: `test-results/shot-discover-${info.project.name}.png` })
})
