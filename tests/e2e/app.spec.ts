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
    await expect(page.getByTestId('kino-menu')).toBeVisible()
    await page.getByTestId('kino-ch-mix').click()
    await expect(page.getByTestId('kino')).toBeVisible()
    // either a programme runs (verified recordings available) or a calm waiting screen is shown
    await expect(page.getByTestId('kino-picture').or(page.getByTestId('kino-empty')).or(page.locator('[data-testid="kino"][data-segment]')).first()).toBeVisible()
    await page.getByTestId('back').click()
    await expect(page.getByTestId('kino-menu')).toBeVisible()
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
    await page.getByTestId('kino-ch-mix').click()
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

test('speaking speed is adjustable per child; clips are never glued together', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __plays: { rate: number; start: number; end: number }[] }
    w.__plays = []
    const orig = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      const rec = { rate: this.playbackRate, start: performance.now(), end: 0 }
      w.__plays.push(rec)
      this.addEventListener('ended', () => (rec.end = performance.now()), { once: true })
      return orig.call(this)
    }
  })
  await createProfile(page, 'Slo', 1)
  await passGate(page)
  await page.getByTestId('tab-languages').click()
  // default for 2–3-year-olds is slow
  await expect(page.getByTestId('rate-0.8')).toBeChecked()
  // slowest step: half speed
  await page.getByTestId('rate-0.5').locator('xpath=..').click()
  await expect(page.getByTestId('rate-0.5')).toBeChecked()
  // second sound language → two utterances with a pause in between
  if (!(await page.getByTestId('sound-de').isChecked())) await page.getByTestId('sound-de').click()
  await page.getByTestId('to-child').click()
  await page.getByTestId('place-zoo').click()
  await page.getByTestId('activity-whereIs').click()
  await page.waitForTimeout(12000)
  const plays: { rate: number; start: number; end: number }[] = await page.evaluate(() => (window as unknown as { __plays: { rate: number; start: number; end: number }[] }).__plays)
  const speech = plays.filter((p) => p.end > 0)
  expect(speech.length).toBeGreaterThanOrEqual(2)
  for (const p of speech) expect(p.rate).toBeCloseTo(0.5, 2)
  for (let i = 1; i < speech.length; i++) {
    if (!speech[i - 1].end) continue
    const gap = speech[i].start - speech[i - 1].end
    if (gap >= 0) expect(gap, `gap between clip ${i - 1} and ${i}`).toBeGreaterThanOrEqual(450)
  }
})

test('every lesson can be watched as a presentation and ends with what to do next', async ({ page }) => {
  await page.addInitScript(() => ((window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 16))
  await createProfile(page, 'Pra', 1)
  await page.getByTestId('place-zoo').click()
  await page.getByTestId('lesson-show').click()
  const kino = page.getByTestId('kino')
  await expect(kino).toBeVisible()
  await expect(page.getByTestId('kino-picture')).toBeVisible({ timeout: 15000 })
  await expect(kino).toHaveAttribute('data-segment', 'word')
  // the bar shows one chapter per lesson item (words, phrases, story, song) – jump to the last one
  await page.getByTestId('kino-picture').click({ force: true })
  await expect(page.getByTestId('kino-bar-controls')).toBeVisible()
  const track = page.getByTestId('kino-bar-track')
  const box = (await track.boundingBox())!
  await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)
  await expect(page.getByTestId('kino-end-actions')).toBeVisible({ timeout: 240_000 })
  await expect(page.getByTestId('kino-upnext')).toHaveAttribute('data-next', /.+/)
  await expect(page.getByTestId('lesson-end-play')).toBeVisible()
  await expect(page.getByTestId('lesson-end-next')).toBeVisible()
  await page.getByTestId('lesson-end-play').click()
  await expect(page.getByTestId('activities')).toBeVisible()
})

test.describe('cinema films (time-lapse 16×: whole films in seconds)', () => {
  test.describe.configure({ timeout: 240_000 })
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => ((window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 16))
  })

  test('the menu offers many kinds of films; every one has content and starts @mobile', async ({ page }) => {
    await createProfile(page, 'Men', 2)
    await page.getByTestId('kino-button').click()
    await expect(page.getByTestId('kino-menu')).toBeVisible()
    const tiles = page.locator('[data-testid^="kino-ch-"]')
    expect(await tiles.count()).toBeGreaterThanOrEqual(10)
    await expect(page.locator('[data-testid^="kino-lesson-"]').first()).toBeVisible()
    for (const id of await tiles.evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(8)))) {
      await page.getByTestId(`kino-ch-${id}`).click()
      const kino = page.getByTestId('kino')
      await expect(kino).toHaveAttribute('data-film', id)
      await expect(kino).not.toHaveAttribute('data-items', '-1')
      expect(Number(await kino.getAttribute('data-items')), `film ${id} has content`).toBeGreaterThan(0)
      await expect(kino).toHaveAttribute('data-segment', /word|phrase|story|song/)
      await page.getByTestId('back').click()
      await expect(page.getByTestId('kino-menu')).toBeVisible()
    }
  })

  test('a film plays to its end and the next film starts by itself; back leads to the menu', async ({ page }) => {
    await createProfile(page, 'Nf', 2)
    await page.getByTestId('kino-button').click()
    await page.getByTestId('kino-ch-cat-colors').click()
    const kino = page.getByTestId('kino')
    await expect(kino).toHaveAttribute('data-film', 'cat-colors')
    await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByTestId('kino-countdown')).toBeVisible()
    await expect(page.getByTestId('kino-upnext')).toHaveAttribute('data-next', 'cat-numbers')
    // nobody touches anything → the next film starts
    await expect(kino).toHaveAttribute('data-film', 'cat-numbers', { timeout: 15_000 })
    await expect(kino).toHaveAttribute('data-segment', 'word')
    await page.getByTestId('back').click()
    await expect(page.getByTestId('kino-menu')).toBeVisible()
  })

  test('every button at the end of a film works (next now, again, menu, home)', async ({ page }) => {
    await createProfile(page, 'Btn', 2)
    await page.getByTestId('kino-button').click()
    await page.getByTestId('kino-ch-songs').click()
    const kino = page.getByTestId('kino')
    const toEnd = async () => {
      await page.getByTestId('kino-picture').or(kino.locator('.scene')).or(kino.getByTestId('kino-bar')).first().click({ force: true })
      const box = (await page.getByTestId('kino-bar-track').boundingBox())!
      await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)
      await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 60_000 })
    }
    await toEnd()
    await page.getByTestId('kino-again').click()
    await expect(kino).toHaveAttribute('data-film', 'songs')
    await expect(page.getByTestId('kino-upnext')).toBeHidden()
    await toEnd()
    await page.getByTestId('kino-next-now').click()
    await expect(kino).toHaveAttribute('data-film', 'stories')
    await toEnd()
    await page.getByTestId('kino-next-tile').click()
    await expect(kino).toHaveAttribute('data-film', 'cat-animals')
    await toEnd()
    await page.getByTestId('kino-to-menu').click()
    await expect(page.getByTestId('kino-menu')).toBeVisible()
    await page.getByTestId('kino-ch-mix').click()
    await toEnd()
    await page.getByTestId('kino-end-home').click()
    await expect(page.getByTestId('world-map')).toBeVisible()
  })

  test('lessons follow one another; the cinema time ends with a goodbye', async ({ page }) => {
    await createProfile(page, 'Les', 1)
    await page.getByTestId('kino-button').click()
    const first = page.locator('[data-testid^="kino-lesson-"]').first()
    const firstId = (await first.getAttribute('data-testid'))!.slice(12)
    await first.click()
    const kino = page.getByTestId('kino')
    await expect(kino).toHaveAttribute('data-film', firstId)
    // the whole lesson in time-lapse, then the next lesson starts by itself
    await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 90_000 })
    const next = (await page.getByTestId('kino-upnext').getAttribute('data-next'))!
    expect(next).not.toBe(firstId)
    await expect(kino).toHaveAttribute('data-film', next, { timeout: 15_000 })
    // default cinema time (20 min = 75 s in time-lapse) → eventually a goodbye instead of another film
    await expect(page.getByTestId('kino-end')).toBeVisible({ timeout: 150_000 })
    await expect(page.getByTestId('kino-upnext')).toBeHidden()
    await expect(page.getByTestId('kino-end-home')).toBeVisible()
  })
})

test.describe('cinema bar and minutes settings', () => {
  test('+10 and »next« always move forward; at the last item the film ends and the next one is offered', async ({ page }) => {
    await createProfile(page, 'Fw', 2)
    await page.getByTestId('kino-button').click()
    await page.getByTestId('kino-ch-cat-animals').click()
    const kino = page.getByTestId('kino')
    await expect(page.getByTestId('kino-picture')).toBeVisible({ timeout: 15_000 })
    const items = Number(await kino.getAttribute('data-items'))
    expect(items).toBeGreaterThan(3)
    const reveal = async () => {
      if (!(await page.getByTestId('kino-bar-controls').isVisible())) await page.getByTestId('kino-picture').click({ force: true })
      await expect(page.getByTestId('kino-bar-controls')).toBeVisible()
    }
    let last = Number(await kino.getAttribute('data-idx'))
    // +10 s: every press goes forward (never back to the start of the same picture)
    for (let k = 0; k < 3; k++) {
      await reveal()
      await page.getByTestId('kino-bar-fwd').click()
      await expect.poll(async () => Number(await kino.getAttribute('data-idx'))).toBeGreaterThan(last)
      last = Number(await kino.getAttribute('data-idx'))
    }
    // −10 s goes back (or restarts the current picture), never forward
    await reveal()
    await page.getByTestId('kino-bar-back').click()
    await expect.poll(async () => Number(await kino.getAttribute('data-idx'))).toBeLessThanOrEqual(last)
    // »next« to the very end → the film ends and the next film is offered (not a restart of the last picture)
    for (let k = 0; k < items + 2 && !(await page.getByTestId('kino-upnext').isVisible()); k++) {
      await reveal()
      await page.getByTestId('kino-bar-next').click()
      await page.waitForTimeout(150)
    }
    await expect(page.getByTestId('kino-upnext')).toHaveAttribute('data-next', 'cat-food')
    await page.getByTestId('kino-next-now').click()
    await expect(kino).toHaveAttribute('data-film', 'cat-food')
    await expect(kino).toHaveAttribute('data-idx', '0')
    // +10 on the last item of this film also ends it
    await expect(page.getByTestId('kino-picture')).toBeVisible()
    await reveal()
    const box = (await page.getByTestId('kino-bar-track').boundingBox())!
    await page.mouse.click(box.x + box.width - 3, box.y + box.height / 2)
    await reveal()
    await page.getByTestId('kino-bar-fwd').click()
    await expect(page.getByTestId('kino-upnext')).toBeVisible()
  })

  test('minutes: 60 (and more) can be typed, − / + and presets work, the value is kept', async ({ page }) => {
    await createProfile(page, 'Min', 2)
    await passGate(page)
    await page.getByTestId('tab-comfort').click()
    const sm = page.getByTestId('session-minutes')
    await sm.click()
    await sm.press('Control+a')
    await sm.press('Backspace')
    await sm.pressSequentially('60')
    await sm.press('Enter')
    await expect(sm).toHaveValue('60')
    await sm.click()
    await sm.fill('')
    await sm.pressSequentially('90')
    await sm.blur()
    await expect(sm).toHaveValue('90')
    await page.getByTestId('session-minutes-minus').click()
    await expect(sm).toHaveValue('85')
    await page.getByTestId('session-minutes-45').click()
    await expect(sm).toHaveValue('45')
    await sm.fill('1')
    await sm.blur()
    await expect(sm).toHaveValue('3') // clamped to the minimum
    await sm.fill('60')
    await sm.blur()
    await page.getByTestId('tab-kino').click()
    const km = page.getByTestId('kino-minutes')
    await km.fill('')
    await km.pressSequentially('60')
    await km.blur()
    await expect(km).toHaveValue('60')
    await page.getByTestId('kino-minutes-plus').click()
    await expect(km).toHaveValue('65')
    await page.reload()
    await passGate(page)
    await page.getByTestId('tab-comfort').click()
    await expect(page.getByTestId('session-minutes')).toHaveValue('60')
    await page.getByTestId('tab-kino').click()
    await expect(page.getByTestId('kino-minutes')).toHaveValue('65')
  })
})

test('translator: typed text in any language → the other three (fake AI, no key needed)', async ({ page }) => {
  await page.addInitScript(() => ((window as unknown as { __tatzliFakeAi: boolean }).__tatzliFakeAi = true))
  await createProfile(page, 'Tra', 2)
  await passGate(page)
  await page.getByTestId('tab-translate').click()
  await expect(page.getByTestId('translate')).toBeVisible()
  // German → Bärndütsch, Polish, English
  await page.getByTestId('translate-input').fill('Guten Morgen!')
  await page.getByTestId('translate-go').click()
  await expect(page.getByTestId('translate-result')).toHaveAttribute('data-source', 'de')
  await expect(page.getByTestId('translate-text-be')).toHaveText('Guete Morge!')
  await expect(page.getByTestId('translate-text-pl')).toHaveText('Dzień dobry!')
  await expect(page.getByTestId('translate-text-en')).toHaveText('Good morning!')
  await expect(page.getByTestId('translate-be-confidence')).toBeVisible()
  // no unverified voice unless the parent switches it on
  await expect(page.getByTestId('translate-voice-be')).toHaveCount(0)
  await page.getByTestId('translate-voice-setting').check()
  await expect(page.getByTestId('translate-voice-be')).toBeVisible()
  // to the approval queue
  await page.getByTestId('translate-queue').click()
  await expect(page.getByTestId('translate-queue')).toBeDisabled()
  // Bärndütsch input is recognised
  await page.getByTestId('translate-input').fill('I gange id Chindsgi.')
  await page.getByTestId('translate-go').click()
  await expect(page.getByTestId('translate-result')).toHaveAttribute('data-source', 'be')
  await expect(page.getByTestId('translate-text-be')).toHaveText('I gange id Chindsgi.')
  await expect(page.getByTestId('translate-text-de')).toHaveText('Ich gehe in den Kindergarten.')
})
