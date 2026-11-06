import { test, expect, type Page } from '@playwright/test'
import { createProfile, passGate } from '../e2e/helpers'
import gaps from '../unit/audio-gaps.json'

// known gaps (no verified recording yet) are silent + caption by design
const KNOWN = new Set<string>(gaps as string[])

type Cap = { text: string; lang: string; source: string }

const COMBOS: { name: string; display: string[]; sound: string[] }[] = [
  { name: 'only BE', display: ['be'], sound: ['be'] },
  { name: 'PL + BE', display: ['pl', 'be'], sound: ['be', 'pl'] },
  { name: 'DE + EN', display: ['de', 'en'], sound: ['de', 'en'] },
  { name: 'all four', display: ['be', 'de', 'pl', 'en'], sound: ['be', 'de', 'pl', 'en'] },
]

async function setLanguages(page: Page, display: string[], sound: string[]) {
  await passGate(page)
  await page.getByTestId('tab-languages').click()
  for (const l of ['be', 'de', 'pl', 'en']) {
    const show = page.getByTestId(`show-${l}`)
    if ((await show.isChecked()) !== display.includes(l)) await show.click()
  }
  // sound: tick the wanted languages in order first (at least one must always stay selected), then untick the rest
  for (const l of sound) if (!(await page.getByTestId(`sound-${l}`).isChecked())) {
    await page.getByTestId(`sound-${l}`).click()
    await expect(page.getByTestId(`sound-${l}`)).toBeChecked()
  }
  for (const l of ['be', 'de', 'pl', 'en']) if (!sound.includes(l) && (await page.getByTestId(`sound-${l}`).isChecked())) {
    await page.getByTestId(`sound-${l}`).click()
    await expect(page.getByTestId(`sound-${l}`)).not.toBeChecked()
  }
  await page.getByTestId('to-child').click()
}

for (const combo of COMBOS) {
  test(`sound in every language of "${combo.name}" from real recordings`, async ({ page }) => {
    test.setTimeout(10 * 60_000)
    await page.addInitScript(() => {
      const w = window as unknown as { __caps: Cap[] }
      w.__caps = []
      window.addEventListener('tatzli-caption', (e) => w.__caps.push((e as CustomEvent<Cap>).detail))
    })
    await createProfile(page, `C${combo.sound.join('')}`, 1)
    await setLanguages(page, combo.display, combo.sound)
    const tiles = page.locator('[data-testid^="tile-"]')
    await expect(tiles.first()).toBeVisible()
    const ids = (await tiles.evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.replace('tile-', '')))).slice(0, 4)
    const problems: string[] = []
    for (const tid of ids) {
      await page.getByTestId(`tile-${tid}`).click()
      await page.getByTestId('activity-discover').click()
      const items = page.locator('[data-testid^="scene-item-"]')
      await expect(items.first()).toBeVisible()
      const n = await items.count()
      for (let i = 0; i < n; i++) {
        const key = (await items.nth(i).getAttribute('data-testid'))!.replace('scene-item-', '')
        // desktop: hovering already says the name – let that finish, then count only what the click plays
        await items.nth(i).hover()
        await page.waitForTimeout(1800 * combo.sound.length)
        await page.evaluate(() => ((window as unknown as { __caps: Cap[] }).__caps = []))
        await items.nth(i).click()
        // wait until every chosen language was played (or failed)
        await page.waitForFunction((k) => (window as unknown as { __caps: Cap[] }).__caps.length >= k, combo.sound.length, { timeout: 30_000 }).catch(() => {})
        // some items play a sound first (animal noise, Tatzli's growl) → wait until nothing new is spoken for 3 s
        for (let n = -1, t = 0; t < 30; t++) {
          const len = await page.evaluate(() => (window as unknown as { __caps: Cap[] }).__caps.length)
          if (len === n) break
          n = len
          await page.waitForTimeout(3000)
        }
        const caps: Cap[] = await page.evaluate(() => (window as unknown as { __caps: Cap[] }).__caps)
        const langs = caps.map((c) => c.lang)
        const order = combo.sound.every((l, k) => langs.slice(-combo.sound.length)[k] === l)
        if (!order) problems.push(`${tid}/${key}: languages ${langs.join(',')} ≠ ${combo.sound.join(',')}`)
        for (const c of caps) if (c.source !== 'bundled' && c.source !== 'family' && !(c.source === 'muted' && KNOWN.has(`w.${key}:${c.lang}`))) problems.push(`${tid}/${key} ${c.lang}: ${c.source} «${c.text}»`)
      }
      await page.getByTestId('home').click()
    }
    expect(problems.slice(0, 25), `${problems.length} problems`).toEqual([])
  })
}
