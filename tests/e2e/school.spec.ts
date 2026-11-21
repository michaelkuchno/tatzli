import { test, expect, type Page } from '@playwright/test'
import { createProfile, passGate } from './helpers'
import { SCHOOL_TOPICS, STAGES, schoolLessons } from '../../content/school'

// time-lapse: speech and pauses run 16× faster, so whole games and films take seconds
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => ((window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 16))
})

async function openSchool(page: Page) {
  await page.getByTestId('school-button').click()
  await expect(page.getByTestId('school')).toBeVisible()
}

/** after the end of an activity: close the sticker, take the big home button of the suggestions */
async function leaveToMap(page: Page) {
  await finished(page)
  const sticker = page.getByTestId('sticker-earned')
  if (await sticker.isVisible()) await sticker.click()
  await expect(page.getByTestId('next-up')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('next-home').click()
}

/** waits for the end of an activity: a sticker (first time) or the "what next" suggestions */
async function finished(page: Page) {
  await expect(page.getByTestId('sticker-earned').or(page.getByTestId('next-up'))).toBeVisible({ timeout: 30_000 })
}

test('the school opens from the map; the stage follows the age and can be switched (and is kept) @mobile', async ({ page }) => {
  await createProfile(page, 'Sch', 2)
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'kg1')
  for (const l of schoolLessons('kg1')) await expect(page.getByTestId(`lesson-${l.id}`)).toBeVisible()
  await expect(page.locator('[data-testid^="lesson-"]')).toHaveCount(5)
  for (const s of STAGES) {
    await page.getByTestId(`school-stage-${s}`).click()
    await expect(page.getByTestId('school')).toHaveAttribute('data-stage', s)
    await expect(page.getByTestId(`school-stage-${s}`)).toHaveAttribute('aria-selected', 'true')
    for (const l of schoolLessons(s)) await expect(page.getByTestId(`lesson-${l.id}`)).toBeVisible()
    await expect(page.locator('[data-testid^="lesson-"]')).toHaveCount(5)
  }
  await page.reload()
  await page.getByTestId('profile-Sch').click()
  await expect(page.getByTestId('world-map')).toBeVisible()
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'k3')
  // the map itself is unchanged: no school lesson appears there
  await page.getByTestId('home').click()
  for (const t of SCHOOL_TOPICS.slice(0, 3)) await expect(page.getByTestId(`tile-${t.id}`)).toHaveCount(0)
})

test('a 6-year-old starts in the 1st class; a grown-up sets the stage in the profile', async ({ page }) => {
  await createProfile(page, 'Six', 3)
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'k1')
  await page.getByTestId('home').click()
  await passGate(page)
  await page.getByTestId('tab-profiles').click()
  await page.getByTestId('edit-Six').click()
  await expect(page.getByTestId('stage-picker')).toBeVisible()
  await expect(page.getByTestId('stage-k1')).toBeChecked()
  await page.getByTestId('stage-kg2').check({ force: true })
  await page.getByTestId('save-profile').click()
  await page.getByTestId('to-child').click()
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'kg2')
})

for (const stage of STAGES) {
  test(`every lesson of ${stage}: the teacher opens it and every activity starts without errors`, async ({ page }) => {
    test.setTimeout(180_000)
    await createProfile(page, `St${stage}`, 2)
    await openSchool(page)
    await page.getByTestId(`school-stage-${stage}`).click()
    for (const l of schoolLessons(stage)) {
      await page.getByTestId(`lesson-${l.id}`).click()
      await expect(page.getByTestId('teacher')).toBeVisible()
      await expect(page.getByTestId('teacher')).toContainText(/\S/)
      const kinds = await page.locator('[data-testid^="activity-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(9)).filter((k) => k !== 's'))
      for (const g of l.games) expect(kinds, `${l.id} offers ${g}`).toContain(g)
      for (const k of kinds) {
        await page.getByTestId(`activity-${k}`).click()
        await expect(page.getByTestId(`activity-screen-${k}`)).toBeVisible()
        await expect(page.getByTestId('screen-error')).toHaveCount(0)
        await page.waitForTimeout(300)
        await expect(page.getByTestId('screen-error')).toHaveCount(0)
        await page.getByTestId('back').click()
        await expect(page.getByTestId('teacher')).toBeVisible()
      }
      await page.getByTestId('back').click()
      await expect(page.getByTestId('school')).toBeVisible()
    }
  })
}

test('maths: dots, plus/minus, times tables and the clock can be solved to the end; wrong answers are gentle', async ({ page }) => {
  test.setTimeout(180_000)
  await createProfile(page, 'Mat', 2)
  await openSchool(page)
  for (const [stage, id] of [['kg1', 'sch-kg1-zelle'], ['k1', 'sch-k1-rechne'], ['k2', 'sch-k2-mau'], ['k3', 'sch-k3-uhr']] as const) {
    await page.getByTestId(`school-stage-${stage}`).click()
    await page.getByTestId(`lesson-${id}`).click()
    await page.getByTestId('activity-math').click()
    const m = page.getByTestId('math')
    for (let r = 0; r < 5; r++) {
      await expect(m).toHaveAttribute('data-round', String(r))
      const ans = Number(await m.getAttribute('data-answer'))
      const kind = await m.getAttribute('data-kind')
      if (kind === 'dots') await expect(page.getByTestId('math-dots')).toHaveAttribute('data-n', String(ans))
      if (kind === 'clock') await expect(page.getByTestId('math-clock')).toHaveAttribute('data-hour', String(ans))
      if (r === 0) {
        // a wrong answer first: nothing advances
        const opts = await page.locator('[data-testid^="math-option-"]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-testid')!.slice(12))))
        await page.getByTestId(`math-option-${opts.find((o) => o !== ans)}`).click()
        await page.waitForTimeout(600)
        await expect(m).toHaveAttribute('data-round', '0')
      }
      await page.getByTestId(`math-option-${ans}`).click()
    }
    await leaveToMap(page)
    await expect(page.getByTestId('world-map')).toBeVisible()
    await openSchool(page)
  }
})

test('letters: the big letter matches the word of the right picture in the first language', async ({ page }) => {
  await createProfile(page, 'Abc', 3)
  await openSchool(page)
  await page.getByTestId('lesson-sch-k1-buechstabe').click()
  await page.getByTestId('activity-letters').click()
  const g = page.getByTestId('letters')
  for (let r = 0; r < 5; r++) {
    await expect(g).toBeVisible()
    const target = (await g.getAttribute('data-target'))!
    const letter = (await g.getAttribute('data-letter'))!
    await expect(page.getByTestId('letters-letter')).toHaveText(letter)
    await page.getByTestId(`letters-option-${target}`).click()
    if (r < 4) await expect(g).not.toHaveAttribute('data-target', target, { timeout: 15_000 })
  }
  await finished(page)
})

test('order: pictures are put in the right order (day, seasons, water cycle, yesterday–today–tomorrow)', async ({ page }) => {
  test.setTimeout(120_000)
  await createProfile(page, 'Ord', 2)
  await openSchool(page)
  for (const [stage, id] of [['kg2', 'sch-kg2-tag'], ['k2', 'sch-k2-wasser']] as const) {
    await page.getByTestId(`school-stage-${stage}`).click()
    await page.getByTestId(`lesson-${id}`).click()
    await page.getByTestId('activity-order').click()
    const o = page.getByTestId('order')
    const items = schoolLessons(stage).find((l) => l.id === id)!.school.order!.items
    for (let round = 0; round < 2; round++) {
      await expect(o).toHaveAttribute('data-placed', '0', { timeout: 15_000 })
      // a wrong tap does not place anything
      await page.getByTestId(`order-item-${items[items.length - 1]}`).click()
      await page.waitForTimeout(500)
      await expect(o).toHaveAttribute('data-placed', '0')
      for (let i = 0; i < items.length; i++) {
        await expect(o).toHaveAttribute('data-next', items[i])
        await page.getByTestId(`order-item-${items[i]}`).click()
        await expect(page.getByTestId(`order-slot-${i}`)).toHaveAttribute('data-filled', items[i])
      }
    }
    await leaveToMap(page)
    await expect(page.getByTestId('world-map')).toBeVisible()
    await openSchool(page)
  }
})

test('cinema: school lessons as films – the teacher opens, the next lesson of the same stage follows @mobile', async ({ page }) => {
  test.setTimeout(240_000)
  await createProfile(page, 'Kin', 2)
  await page.getByTestId('kino-button').click()
  await expect(page.getByTestId('kino-school')).toBeVisible()
  const kg1 = schoolLessons('kg1')
  for (const l of kg1) await expect(page.getByTestId(`kino-lesson-${l.id}`)).toBeVisible()
  await page.getByTestId(`kino-lesson-${kg1[0].id}`).click()
  const kino = page.getByTestId('kino')
  await expect(kino).toHaveAttribute('data-film', kg1[0].id)
  expect(Number(await kino.getAttribute('data-items'))).toBeGreaterThan(0)
  await expect(kino).toHaveAttribute('data-segment', 'phrase', { timeout: 30_000 })
  await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 120_000 })
  await expect(page.getByTestId('kino-upnext')).toHaveAttribute('data-next', kg1[1].id)
  await expect(kino).toHaveAttribute('data-film', kg1[1].id, { timeout: 15_000 })
  // also from the school screen
  await page.getByTestId('home').click()
  await openSchool(page)
  await page.getByTestId('school-stage-k3').click()
  await page.getByTestId('school-kino').click()
  await expect(page.getByTestId('kino')).toHaveAttribute('data-film', schoolLessons('k3')[0].id)
})

test('after a school game the suggestion is the next lesson of the same stage', async ({ page }) => {
  await createProfile(page, 'Nxs', 2)
  await openSchool(page)
  await page.getByTestId('school-stage-kg2').click()
  const ls = schoolLessons('kg2')
  await page.getByTestId(`lesson-${ls[0].id}`).click()
  await page.getByTestId('activity-order').click()
  const items = ls[0].school.order!.items
  for (let round = 0; round < 2; round++) {
    await expect(page.getByTestId('order')).toHaveAttribute('data-placed', '0', { timeout: 15_000 })
    for (const it of items) await page.getByTestId(`order-item-${it}`).click()
  }
  const sticker = page.getByTestId('sticker-earned')
  await expect(sticker.or(page.getByTestId('next-up'))).toBeVisible({ timeout: 30_000 })
  if (await sticker.isVisible()) await sticker.click()
  await expect(page.getByTestId('next-up')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('next-topic').click()
  await expect(page.getByTestId('teacher')).toBeVisible()
  await expect(page.getByTestId('topic-title')).toContainText(ls[1].title.be)
})
