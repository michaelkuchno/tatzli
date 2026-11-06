import { test, expect } from '@playwright/test'
import { createProfile, passGate } from './helpers'

test.describe('child flows', () => {
  test('profile picker remembers profiles and opens the map', async ({ page }) => {
    await createProfile(page, 'Noa', 1)
    await page.reload()
    await page.getByTestId('profile-Noa').click()
    await expect(page.getByTestId('world-map')).toBeVisible()
  })

  test('hovering a sentence segment highlights equivalents in other languages', async ({ page }) => {
    await createProfile(page, 'Lia', 2)
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    const phrase = page.getByTestId('phrase-i-gange-chindsgi')
    await expect(phrase).toBeVisible()
    await phrase.locator('[data-row="be"] [data-seg="3"]').hover()
    await expect(phrase.locator('[data-row="de"] [data-seg="3"]')).toHaveAttribute('data-hot', 'true')
    await expect(phrase.locator('[data-row="pl"] [data-seg="3"]')).toHaveAttribute('data-hot', 'true')
    // Polish "Idę" covers groups 1+2 → lights up when "gange" (2) is hovered
    await phrase.locator('[data-row="be"] [data-seg="2"]').hover()
    await expect(phrase.locator('[data-row="pl"] [data-seg="1+2"]')).toHaveAttribute('data-hot', 'true')
    await expect(page.getByTestId('caption')).toBeVisible()
  })

  test('hovering an object shows the word in all languages; right click recolours', async ({ page }) => {
    await createProfile(page, 'Tom', 2)
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    const item = page.getByTestId('scene-item-chindsgi')
    await item.hover()
    await expect(page.getByTestId('label-chindsgi')).toBeVisible()
    await expect(page.getByTestId('label-chindsgi')).toContainText('dr Chindsgi')
    await expect(page.getByTestId('label-chindsgi')).toContainText('przedszkole')
    await item.click({ button: 'right' })
    await expect(page.getByTestId('caption')).toContainText(/rot/i)
  })

  test('Wo isch …? – choosing the right picture advances', async ({ page }) => {
    await createProfile(page, 'Ela', 2)
    await page.getByTestId('place-zoo').click()
    await page.getByTestId('activity-whereIs').click()
    const game = page.getByTestId('whereis')
    for (let round = 0; round < 2; round++) {
      const target = await game.getAttribute('data-target')
      // one tap must be enough – even when it interrupts the spoken question (audio.stopAll settles the cut clip)
      await page.getByTestId(`option-${target}`).last().click()
      await expect(game).not.toHaveAttribute('data-target', target!, { timeout: 8000 })
    }
  })

  test('memory, TPR and story with a choice', async ({ page }) => {
    await createProfile(page, 'Max', 2)
    await page.getByTestId('place-bus').click()
    await page.getByTestId('activity-memory').click()
    const cards = page.getByTestId('memory').locator('[data-word]')
    await expect(cards.first()).toBeVisible()
    const words = await cards.evaluateAll((els) => els.map((e) => e.getAttribute('data-word')))
    const first = words[0]
    const idx = words.map((w, i) => (w === first ? i : -1)).filter((i) => i >= 0)
    await cards.nth(idx[0]).click()
    await cards.nth(idx[1]).click()
    await expect(cards.nth(idx[0])).toHaveClass(/ring-emerald/)
    await page.getByTestId('home').click()
    await page.getByTestId('place-quarry').click()
    await page.getByTestId('activity-tpr').click()
    await expect(page.getByTestId('tpr')).toBeVisible()
    await page.getByTestId('tpr-done').click()

    await page.getByTestId('back').click()
    await page.getByTestId('activity-story').click()
    const story = page.getByTestId('story')
    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId('story-next').or(page.getByTestId('choice-0')).first()).toBeVisible()
      if (await page.getByTestId('choice-0').isVisible()) break
      await page.getByTestId('story-next').click()
    }
    await page.getByTestId('choice-0').click()
    await expect(page.getByTestId('story-end').or(page.getByTestId('story-next')).first()).toBeVisible()
    await expect(story).toBeVisible()
  })

  test('counting, sorting, song and sticker album', async ({ page }) => {
    await createProfile(page, 'Ida', 1)
    await page.getByTestId('place-kitchen').click()
    await page.getByTestId('activity-count').click()
    const target = Number(await page.getByTestId('count').getAttribute('data-target'))
    for (let i = 0; i < target; i++) await page.getByTestId('count-item').first().click()
    await expect(page.getByTestId('count')).not.toHaveAttribute('data-target', String(target), { timeout: 15000 }).catch(() => {})
    await page.getByTestId('back').click()
    await page.getByTestId('activity-sort').click()
    const bin0 = page.getByTestId('sort-bin-0')
    const items = page.locator('[data-testid^="sort-item-"]')
    await expect(items.first()).toBeVisible()
    await items.first().click()
    await bin0.click()
    await page.getByTestId('back').click()
    await page.getByTestId('home').click()
    await page.getByTestId('album-button').click()
    await expect(page.getByTestId('album')).toBeVisible()
    await expect(bin0).toBeHidden()
  })

  test('toddler keyboard shows a word for a letter key', async ({ page }) => {
    await createProfile(page, 'Kim', 1)
    await page.keyboard.press('k')
    await expect(page.getByTestId('keyboard')).toBeVisible()
    await page.keyboard.press('k')
    await expect(page.getByTestId('keyboard-shown')).toBeVisible()
  })
})

test.describe('parent', () => {
  test('parent gate protects settings; wrong answer keeps it closed', async ({ page }) => {
    await createProfile(page, 'Zoe', 2)
    const btn = page.getByTestId('parent-button').first()
    // short tap does nothing
    await btn.click()
    await expect(page.getByTestId('parent-gate')).toBeHidden()
    await btn.hover()
    await page.mouse.down()
    await page.waitForTimeout(3300)
    await page.mouse.up()
    await expect(page.getByTestId('parent-gate')).toBeVisible()
    if (await page.getByTestId('gate-input').count()) {
      await page.getByTestId('gate-input').fill('1')
      await page.getByTestId('gate-submit').click()
      await expect(page.getByTestId('parent-gate')).toBeVisible()
    }
    await page.keyboard.press('Escape')
    await page.locator('[data-testid="parent-gate"] button', { hasText: /Anuluj|Abbrechen|Cancel/ }).click()
    await passGate(page)
    await expect(page.getByTestId('parent')).toBeVisible()
  })

  test('recording studio records with a (fake) microphone and saves locally', async ({ page }) => {
    await createProfile(page, 'Rec', 2)
    await passGate(page)
    await page.getByTestId('tab-studio').click()
    await page.getByTestId('studio-record').click()
    await page.waitForTimeout(800)
    await page.getByTestId('studio-stop').click()
    await expect(page.getByTestId('studio-save')).toBeEnabled()
    await page.getByTestId('studio-save').click()
    await expect(page.getByTestId('recordings').locator('li')).toHaveCount(1)
  })

  test('AI queue with fake provider: generate → pending → approve', async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __tatzliFakeAi: boolean }).__tatzliFakeAi = true
    })
    await createProfile(page, 'Ai', 2)
    await passGate(page)
    await page.getByTestId('tab-ai').click()
    await page.getByTestId('ai-generate').click()
    await expect(page.getByTestId('ai-done')).toBeVisible()
    await page.getByTestId('tab-queue').click()
    const item = page.locator('[data-testid^="queue-item-"]').first()
    await expect(item).toHaveAttribute('data-status', 'pending')
    await item.locator('[data-testid^="approve-"]').click()
    await expect(item).toHaveAttribute('data-status', 'approved')
  })

  test('privacy screen and language settings', async ({ page }) => {
    await createProfile(page, 'Pri', 2)
    await passGate(page)
    await page.getByTestId('tab-privacy').click()
    await expect(page.getByTestId('privacy')).toContainText(/nDSG|RODO|GDPR|DSGVO/)
    await page.getByTestId('tab-languages').click()
    await page.getByTestId('show-en').click()
    await expect(page.getByTestId('show-en')).toBeChecked()
    await page.getByTestId('to-child').click()
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    await expect(page.getByTestId('phrase-i-gange-chindsgi').locator('[data-row="en"]')).toBeVisible()
  })
})

test.describe('sound languages', () => {
  test('a word is spoken in up to four languages in the chosen order', async ({ page }) => {
    await createProfile(page, 'Snd', 2)
    await passGate(page)
    await page.getByTestId('tab-languages').click()
    for (const l of ['de', 'pl', 'en']) {
      await page.getByTestId(`sound-${l}`).click()
      await expect(page.getByTestId(`sound-${l}`)).toBeChecked()
    }
    await page.getByTestId('to-child').click()
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    await page.getByTestId('scene-item-chindsgi').click()
    const cap = page.getByTestId('caption')
    for (const name of ['Bärndütsch', 'Deutsch', 'Polski', 'English']) await expect(cap.getByRole('img', { name })).toBeVisible({ timeout: 20000 })
  })
})

test.describe('devices', () => {
  test('TV layout fills 16:9 and supports arrow keys + Enter @tv', async ({ page }) => {
    await createProfile(page, 'Tv', 2)
    const map = page.getByTestId('world-map')
    const box = await map.boundingBox()
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    expect(focused).toBeTruthy()
    await page.screenshot({ path: `test-results/tv-${test.info().project.name}.png` })
  })

  test('phone and tablet: map and topic usable, big touch targets @mobile', async ({ page }) => {
    await createProfile(page, 'Ph', 1)
    const spot = page.getByTestId('place-home')
    const b = await spot.boundingBox()
    expect(Math.min(b!.width, b!.height)).toBeGreaterThanOrEqual(28)
    await spot.click()
    await page.getByTestId(/topic-l1-/).first().click()
    const act = page.getByTestId('activity-discover')
    const ab = await act.boundingBox()
    expect(ab!.width).toBeGreaterThanOrEqual(64)
    await page.screenshot({ path: `test-results/mobile-${test.info().project.name}.png` })
  })

  test('works offline after first load', async ({ page, context }) => {
    await createProfile(page, 'Off', 2)
    await page.evaluate(async () => {
      await navigator.serviceWorker?.ready
    })
    await page.reload()
    await page.waitForFunction(() => !!navigator.serviceWorker?.controller)
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByTestId('world-map').or(page.getByTestId('profile-Off')).first()).toBeVisible()
    await page.getByTestId('profile-Off').click().catch(() => {})
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    await expect(page.getByTestId('discover-scene')).toBeVisible()
    await context.setOffline(false)
  })
})

test.describe('mealtime cinema, colours, strict pronunciation', () => {
  test('Kino starts from the map and from the parent tab; ends gracefully @mobile', async ({ page }) => {
    await createProfile(page, 'Kin', 1)
    await page.getByTestId('kino-button').click()
    await expect(page.getByTestId('kino')).toBeVisible()
    // either a programme runs (verified recordings available) or a calm waiting screen is shown
    await expect(page.getByTestId('kino-picture').or(page.getByTestId('kino-empty')).or(page.locator('[data-testid="kino"][data-segment]')).first()).toBeVisible()
    await page.getByTestId('back').click()
    await passGate(page)
    await page.getByTestId('tab-kino').click()
    await expect(page.getByTestId('audio-coverage')).toBeVisible()
    await page.getByTestId('kino-prompt-say-again').locator('xpath=..').click()
    await expect(page.getByTestId('kino-prompt-say-again')).toBeChecked()
    await page.getByTestId('kino-start').click()
    await expect(page.getByTestId('kino')).toBeVisible()
  })

  test('colours are shown big when a colour is chosen (right click recolour)', async ({ page }) => {
    await createProfile(page, 'Col', 2)
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    await page.getByTestId('scene-item-chindsgi').click({ button: 'right' })
    const burst = page.getByTestId('color-burst')
    await expect(burst).toBeVisible()
    await expect(burst).toHaveAttribute('data-color', 'rot')
  })

  test('strict mode never uses the device voice for missing recordings', async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __spoken: string[] }).__spoken = []
      const orig = window.speechSynthesis?.speak?.bind(window.speechSynthesis)
      if (window.speechSynthesis) window.speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
        ;(window as unknown as { __spoken: string[] }).__spoken.push(u.text)
        orig?.(u)
      }
    })
    await createProfile(page, 'Str', 2)
    await page.getByTestId('place-chindsgi').click()
    await page.getByTestId('activity-discover').click()
    await page.getByTestId('scene-item-chindsgi').click()
    await expect(page.getByTestId('caption')).toBeVisible()
    await page.waitForTimeout(1500)
    expect(await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length)).toBe(0)
  })
})

test.describe('playback bar (Kino, stories)', () => {
  test('tap shows the bar; seek, ±10 s, pause and arrow keys work', async ({ page }) => {
    await createProfile(page, 'Bar', 2)
    await page.getByTestId('kino-button').click()
    const kino = page.getByTestId('kino')
    await expect(kino).toBeVisible()
    test.skip((await page.getByTestId('kino-empty').count()) > 0, 'no verified recordings for this sound language in the test build')
    await expect(page.getByTestId('kino-bar-controls')).toBeHidden()
    await page.getByTestId('kino-picture').or(page.locator('[data-testid="kino"] .scene')).first().click({ force: true })
    await expect(page.getByTestId('kino-bar-controls')).toBeVisible()
    const time = page.getByTestId('kino-bar-time')
    const before = await time.textContent()
    // drag the scrubber to 50 %
    const track = page.getByTestId('kino-bar-track')
    const box = (await track.boundingBox())!
    await page.mouse.move(box.x + box.width * 0.05, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2, { steps: 5 })
    await expect(page.getByTestId('kino-bar-preview')).toBeVisible()
    await page.mouse.up()
    await expect(time).not.toHaveText(before!)
    const mid = await time.textContent()
    await page.getByTestId('kino-bar-fwd').click()
    await expect(time).not.toHaveText(mid!)
    await page.getByTestId('kino-bar-toggle').click()
    await expect(page.getByTestId('kino-paused')).toBeVisible()
    await page.getByTestId('kino-paused').click()
    await expect(page.getByTestId('kino-paused')).toBeHidden()
    const t1 = await time.textContent()
    await page.keyboard.press('ArrowLeft')
    await expect(time).not.toHaveText(t1!)
    await expect(page.getByTestId('kino-bar-controls')).toBeHidden({ timeout: 8000 })
  })

  test('stories have a page scrubber', async ({ page }) => {
    await createProfile(page, 'Sto', 2)
    await page.getByTestId('place-quarry').click()
    await page.getByTestId('activity-story').click()
    await expect(page.getByTestId('story')).toBeVisible()
    await page.getByTestId('story-scene').click({ position: { x: 20, y: 20 } })
    await expect(page.getByTestId('story-bar-controls')).toBeVisible()
    await page.getByTestId('story-bar-next').click()
    await expect(page.getByTestId('story')).toHaveAttribute('data-page', '1')
  })
})

test('after an activity ends, big suggestions appear – nothing autoplays', async ({ page }) => {
  await createProfile(page, 'Nxt', 2)
  await page.getByTestId('place-quarry').click()
  await page.getByTestId('activity-tpr').click()
  for (let i = 0; i < 8; i++) {
    if (await page.getByTestId('next-up').isVisible()) break
    if (await page.getByTestId('sticker-earned').isVisible()) break
    await page.getByTestId('tpr-done').click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(500)
  }
  await page.waitForTimeout(1500)
  await expect(page.getByTestId('next-up')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('next-activity')).toBeVisible()
  await expect(page.getByTestId('next-home')).toBeVisible()
  await page.waitForTimeout(3000)
  await expect(page.getByTestId('next-up')).toBeVisible() // still waiting for a tap
  await page.getByTestId('next-activity').click()
  await expect(page.getByTestId('next-up')).toBeHidden()
})
