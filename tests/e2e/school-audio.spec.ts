import { test, expect, type Page } from '@playwright/test'
import { createProfile } from './helpers'
import { STAGES, schoolLessons } from '../../content/school'

type Clip = { src: string; start: number; end: number; cut: boolean }

/** records every recording the app plays: when it started, when it ended, whether the next one started too early */
async function recordClips(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __clips: Clip[] }
    w.__clips = []
    const orig = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (!this.src.includes('/audio/')) return orig.call(this)
      const prev = w.__clips[w.__clips.length - 1]
      if (prev && !prev.end) prev.cut = true
      const rec = { src: this.src, start: performance.now(), end: 0, cut: false }
      w.__clips.push(rec)
      const src = this.src
      this.addEventListener('ended', () => this.src === src && (rec.end = performance.now()), { once: true })
      return orig.call(this)
    }
  })
}
const clips = (page: Page) => page.evaluate(() => (window as unknown as { __clips: Clip[] }).__clips)
const reset = (page: Page) => page.evaluate(() => ((window as unknown as { __clips: Clip[] }).__clips.length = 0))

function expectClean(list: Clip[], what: string) {
  expect(list.filter((c) => c.cut).map((c) => c.src), `${what}: clips cut off or spoken over`).toEqual([])
  for (let i = 1; i < list.length; i++) if (list[i - 1].end) expect(list[i].start - list[i - 1].end, `${what}: pause before clip ${i}`).toBeGreaterThanOrEqual(400)
}

// real time (no time-lapse): exactly what a child hears
for (const stage of STAGES) {
  test(`school ${stage}: the teacher's opening and a whole lesson film – every recording complete, never glued or cut`, async ({ page }) => {
    test.setTimeout(8 * 60_000)
    await recordClips(page)
    await createProfile(page, `Au${stage}`, 2)
    await page.getByTestId('school-button').click()
    await page.getByTestId(`school-stage-${stage}`).click()
    const lesson = schoolLessons(stage)[0]
    await page.getByTestId(`lesson-${lesson.id}`).click()
    // the mouse-hover preview belongs to the school screen; from the tap on, only the teacher speaks
    await reset(page)
    await expect(page.getByTestId('teacher')).toBeVisible()
    // title + opening sentence in every sound language, then silence
    await expect.poll(async () => (await clips(page)).filter((c) => c.end).length, { timeout: 30_000 }).toBeGreaterThanOrEqual(2)
    await page.waitForTimeout(4000)
    const opening = await clips(page)
    expectClean(opening, `${lesson.id} opening`)
    expect(opening.every((c) => c.end), 'every opening clip played to its end').toBe(true)

    await reset(page)
    await page.getByTestId('lesson-show').click()
    await expect(page.getByTestId('kino')).toBeVisible()
    await expect(page.getByTestId('kino-upnext').or(page.getByTestId('kino-end'))).toBeVisible({ timeout: 6 * 60_000 })
    const film = await clips(page)
    const items = Number(await page.getByTestId('kino').getAttribute('data-items'))
    expect(film.length, 'at least one recording per film item').toBeGreaterThanOrEqual(items)
    expectClean(film, `${lesson.id} film`)
  })
}
