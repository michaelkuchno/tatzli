import { test } from '@playwright/test'
import { createProfile } from '../e2e/helpers'

test('live site: map, topic, kino', async ({ page }) => {
  const errs: string[] = []
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()) })
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message))
  page.on('requestfailed', (r) => errs.push('FAIL ' + r.url()))
  page.on('response', (r) => { if (r.status() >= 400 || r.url().includes('manifest')) errs.push(r.status() + ' ' + r.url()) })
  await createProfile(page, 'Live', 2)
  await page.getByTestId('kino-button').click()
  await page.waitForTimeout(6000)
  await page.screenshot({ path: 'test-results/live-kino.png' })
  console.log('SEG', await page.getByTestId('kino').getAttribute('data-segment'), await page.getByTestId('kino-empty').count())
  await page.goto('./')
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'test-results/live-reload.png' })
  console.log(errs.join('\n'))
})
