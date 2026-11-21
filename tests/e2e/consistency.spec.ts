import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createProfile } from './helpers'
import { schoolLessons } from '../../content/school'

/**
 * Picture, text and sound always belong together: every recording the app plays is the one of the thing on screen
 * (never a cat's word under a tree). Checked while the app runs (time-lapse 16×): cinema films of the map, a channel,
 * the Swiss and the Polish school, "Where is …?" and exploring a scene.
 */
const manifest = JSON.parse(readFileSync('public/audio/manifest.json', 'utf8')) as { items: Record<string, Record<string, string>> }
const idsOf = new Map<string, string[]>()
for (const [id, langs] of Object.entries(manifest.items)) for (const f of Object.values(langs)) idsOf.set(f, [...(idsOf.get(f) ?? []), id])
const clipIds = (src: string) => idsOf.get(src.slice(src.indexOf('/audio/') + 7)) ?? []

type Clip = { src: string; seg: string | null; target: string | null; t: number }
async function record(page: Page) {
  await page.addInitScript(() => {
    ;(window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 16
    const w = window as unknown as { __clips: Clip[] }
    w.__clips = []
    const orig = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (this.src.includes('/audio/'))
        w.__clips.push({
          src: this.src,
          seg: document.querySelector('[data-testid="kino"]')?.getAttribute('data-seg') ?? null,
          target: document.querySelector('[data-testid="whereis"]')?.getAttribute('data-target') ?? null,
          t: performance.now(),
        })
      return orig.call(this)
    }
  })
}
const clips = (page: Page) => page.evaluate(() => (window as unknown as { __clips: Clip[] }).__clips)

/** every word/sentence recording of a film belongs to the picture shown at that moment */
function expectFilmMatches(list: Clip[], what: string) {
  let checked = 0
  for (const c of list) {
    const ids = clipIds(c.src)
    expect(ids.length, `${what}: unknown recording ${c.src}`).toBeGreaterThan(0)
    const content = ids.filter((i) => i.startsWith('w.') || i.startsWith('p.'))
    if (!content.length || !c.seg) continue
    expect(content, `${what}: ${ids.join(',')} played while ${c.seg} was shown`).toEqual(expect.arrayContaining([expect.stringMatching(new RegExp(`^(w|p)\\.${c.seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))]))
    checked++
  }
  expect(checked, `${what}: recordings checked`).toBeGreaterThan(0)
}

async function watchFilm(page: Page, what: string) {
  const kino = page.getByTestId('kino')
  await expect(kino).toBeVisible()
  await expect(page.getByTestId('kino-upnext').or(page.getByTestId('kino-end'))).toBeVisible({ timeout: 180_000 })
  expectFilmMatches(await clips(page), what)
}

test('cinema: a map lesson film – every picture with its own word and sentence', async ({ page }) => {
  test.setTimeout(240_000)
  await record(page)
  await createProfile(page, 'Co1', 2)
  await page.getByTestId('kino-button').click()
  const first = page.getByTestId('kino-lessons').locator('[data-testid^="kino-lesson-"]').first()
  const id = (await first.getAttribute('data-testid'))!.replace('kino-lesson-', '')
  await first.click()
  await watchFilm(page, id)
})

test('cinema: the mixed channel – every picture with its own word and sentence', async ({ page }) => {
  test.setTimeout(240_000)
  await record(page)
  await createProfile(page, 'Co2', 2)
  await page.getByTestId('kino-button').click()
  await page.getByTestId('kino-ch-phrases').click()
  await expect(page.getByTestId('kino')).toBeVisible()
  // a channel runs long: check the first two minutes of pictures
  await page.waitForTimeout(60_000)
  expectFilmMatches(await clips(page), 'channel phrases')
})

for (const cur of ['ch', 'pl'] as const)
  test(`cinema: a ${cur} school film – the teacher's words and every picture match`, async ({ page }) => {
    test.setTimeout(240_000)
    await record(page)
    await createProfile(page, `Co${cur}`, 2)
    await page.getByTestId('school-button').click()
    await page.getByTestId(`school-cur-${cur}`).click()
    await page.getByTestId('school-stage-k2').click()
    const l = schoolLessons('k2', cur)[0]
    await page.getByTestId(`lesson-${l.id}`).click()
    await page.getByTestId('lesson-show').click()
    await watchFilm(page, l.id)
    // the film starts with the lesson's title and the teacher's sentence
    const ids = (await clips(page)).flatMap((c) => clipIds(c.src))
    expect(ids).toContain(`t.${l.id}`)
    expect(ids).toContain(`p.${l.school.intro}`)
  })

test('"Where is …?": the word asked is always the picture to find', async ({ page }) => {
  test.setTimeout(120_000)
  await record(page)
  await createProfile(page, 'Co3', 2)
  await page.getByTestId('place-zoo').click()
  await page.getByTestId('activity-whereIs').click()
  const g = page.getByTestId('whereis')
  for (let r = 0; r < 3; r++) {
    await expect(g).toBeVisible()
    const target = (await g.getAttribute('data-target'))!
    // the question names the target
    await expect.poll(async () => (await clips(page)).filter((c) => c.target === target).flatMap((c) => clipIds(c.src)), { timeout: 15_000 }).toContain(`w.${target}`)
    for (const c of (await clips(page)).filter((x) => x.target === target)) {
      const words = clipIds(c.src).filter((i) => i.startsWith('w.'))
      // before any tap, only the target's word is spoken
      if (words.length) expect(words, `asked ${words} while ${target} was the picture to find`).toContain(`w.${target}`)
    }
    await page.getByTestId(`option-${target}`).last().click()
    await expect(g).not.toHaveAttribute('data-target', target, { timeout: 15_000 }).catch(() => undefined)
    if (!(await g.isVisible())) break
  }
})

test('exploring a scene: a tapped thing says its own word', async ({ page }) => {
  await record(page)
  await createProfile(page, 'Co4', 2)
  await page.getByTestId('place-zoo').click()
  await page.getByTestId('activity-discover').click()
  const items = page.locator('[data-testid^="scene-item-"]')
  const n = Math.min(await items.count(), 6)
  for (let i = 0; i < n; i++) {
    const key = (await items.nth(i).getAttribute('data-testid'))!.replace('scene-item-', '')
    const before = (await clips(page)).length
    await items.nth(i).click()
    await expect.poll(async () => (await clips(page)).slice(before).flatMap((c) => clipIds(c.src)), { timeout: 10_000 }).toContain(`w.${key}`)
    await page.waitForTimeout(1500)
    const words = (await clips(page)).slice(before).flatMap((c) => clipIds(c.src)).filter((i) => i.startsWith('w.'))
    for (const w of words) expect(w, `tapped ${key}`).toBe(`w.${key}`)
  }
})
