import { test, expect, type Page } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { createProfile } from '../e2e/helpers'

/**
 * Clicks EVERY object in EVERY topic's discovery scene (all levels) and records what the app tried to play.
 * Fails if any click produced no pronunciation attempt at all (a wiring bug). Items that are only "muted"
 * (no verified recording yet, strict mode) are reported, not failed.
 */
async function collect(page: Page) {
  await page.addInitScript(() => {
    ;(window as unknown as { __caps: { text: string; lang: string; source: string }[] }).__caps = []
  })
}

for (const level of [1, 2, 3] as const) {
  test(`every object in every topic plays its word – level ${level}`, async ({ page }) => {
    test.setTimeout(15 * 60_000)
    await collect(page)
    await createProfile(page, `A${level}`, level)
    const tiles = page.locator('[data-testid^="tile-"]')
    await expect(tiles.first()).toBeVisible()
    const topicIds = (await tiles.evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.replace('tile-', ''))))
    const report: { topic: string; item: string; source: string; text: string }[] = []
    for (const tid of topicIds) {
      await page.getByTestId(`tile-${tid}`).click()
      await page.getByTestId('activity-discover').click()
      await expect(page.getByTestId('discover-scene')).toBeVisible()
      const pages = await page.locator('[data-testid^="discover-page-"]').count()
      for (let pg = 0; pg < Math.max(1, pages); pg++) {
        if (pages > 1) await page.getByTestId(`discover-page-${pg}`).click()
        const items = page.locator('[data-testid^="scene-item-"]')
        const n = await items.count()
        for (let i = 0; i < n; i++) {
          const it = items.nth(i)
          const key = (await it.getAttribute('data-testid'))!.replace('scene-item-', '')
          await it.click()
          const cap = page.getByTestId('caption')
          await expect(cap, `${tid}/${key}: no pronunciation attempt`).toBeVisible({ timeout: 4000 })
          const source = (await page.getByTestId('caption-source').textContent()) ?? ''
          const text = ((await cap.textContent()) ?? '').replace(source, '').trim()
          expect(source, `${tid}/${key}: audio failed`).not.toBe('none')
          report.push({ topic: tid, item: key, source, text })
          await page.waitForTimeout(150)
        }
      }
      await page.getByTestId('home').click()
    }
    writeFileSync(`test-results/sound-audit-level${level}.json`, JSON.stringify(report, null, 1))
    const muted = report.filter((r) => r.source === 'muted')
    console.log(`level ${level}: ${report.length} clicks · recorded ${report.length - muted.length} · waiting for verified recording ${muted.length}`)
  })
}
