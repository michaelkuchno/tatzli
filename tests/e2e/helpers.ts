import { expect, type Page } from '@playwright/test'

/** Opens the parent gate (hold 3 s + task) from whatever screen shows a parent button. */
export async function passGate(page: Page, button = 'parent-button') {
  const btn = page.getByTestId(button).first()
  await btn.hover()
  await page.mouse.down()
  await page.waitForTimeout(3300)
  await page.mouse.up()
  const gate = page.getByTestId('parent-gate')
  await expect(gate).toBeVisible()
  const q = page.getByTestId('gate-question')
  if (await q.count()) {
    const a = Number(await q.getAttribute('data-a'))
    const b = Number(await q.getAttribute('data-b'))
    await page.getByTestId('gate-input').fill(String(a * b))
    await page.getByTestId('gate-submit').click()
  } else {
    // three dots: press all three with separate touch-like pointers
    await page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        const el = document.querySelector(`[data-testid="gate-dot-${i}"]`)!
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: i + 1 }))
      }
    })
  }
  await expect(gate).toBeHidden()
}

/** Fresh app with one child profile, landing on the map. */
export async function createProfile(page: Page, nick = 'Mia', level: 1 | 2 | 3 = 2) {
  await page.goto('./')
  await expect(page.getByTestId('no-profiles')).toBeVisible()
  await passGate(page)
  await page.getByTestId('new-profile').click()
  await page.getByTestId('nickname').fill(nick)
  await page.getByTestId(`level-${level}`).check({ force: true })
  await page.getByTestId('save-profile').click()
  await page.getByTestId('to-child').click()
  await expect(page.getByTestId('world-map')).toBeVisible()
}
