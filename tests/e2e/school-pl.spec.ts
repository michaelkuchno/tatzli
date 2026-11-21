import { test, expect, type Page } from '@playwright/test'
import { createProfile, passGate } from './helpers'
import { STAGES, schoolLessons } from '../../content/school'

// time-lapse: speech and pauses run 16× faster, so whole games and films take seconds
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => ((window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 16))
})

async function openSchool(page: Page) {
  await page.getByTestId('school-button').click()
  await expect(page.getByTestId('school')).toBeVisible()
}
async function polishSchool(page: Page) {
  await openSchool(page)
  await page.getByTestId('school-cur-pl').click()
  await expect(page.getByTestId('school')).toHaveAttribute('data-school', 'pl')
}
/** the teacher on screen (the bar on phones, beside the game on larger screens) */
const teacher = (page: Page) => page.locator('[data-testid="lesson-teacher"]:visible').first()
async function finished(page: Page) {
  await expect(page.getByTestId('sticker-earned').or(page.getByTestId('next-up'))).toBeVisible({ timeout: 30_000 })
}
async function leaveToMap(page: Page) {
  await finished(page)
  const sticker = page.getByTestId('sticker-earned')
  if (await sticker.isVisible()) await sticker.click()
  await expect(page.getByTestId('next-up')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('next-home').click()
}

test('two schools: Swiss by default, the Polish school with its own stages and lessons; the choice is kept @mobile', async ({ page }) => {
  await createProfile(page, 'Pol', 2)
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-school', 'ch')
  await expect(page.getByTestId('school-stage-kg1')).toHaveText('Chindsgi 1')
  for (const l of schoolLessons('kg1', 'ch')) await expect(page.getByTestId(`lesson-${l.id}`)).toBeVisible()
  await page.getByTestId('school-cur-pl').click()
  await expect(page.getByTestId('school')).toHaveAttribute('data-school', 'pl')
  await expect(page.getByTestId('school-cur-pl')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('school-stage-kg1')).toHaveText('Przedszkole')
  await expect(page.getByTestId('school-stage-kg2')).toHaveText('Zerówka')
  await expect(page.getByTestId('school-stage-k1')).toHaveText('Klasa 1')
  for (const s of STAGES) {
    await page.getByTestId(`school-stage-${s}`).click()
    await expect(page.getByTestId('school')).toHaveAttribute('data-stage', s)
    await expect(page.locator('[data-testid^="lesson-"]')).toHaveCount(5)
    for (const l of schoolLessons(s, 'pl')) await expect(page.getByTestId(`lesson-${l.id}`)).toBeVisible()
    // no Swiss lesson is mixed in
    for (const l of schoolLessons(s, 'ch')) await expect(page.getByTestId(`lesson-${l.id}`)).toHaveCount(0)
  }
  await page.reload()
  await page.getByTestId('profile-Pol').click()
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-school', 'pl')
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'k3')
  // and back: the Swiss school is exactly as before
  await page.getByTestId('school-cur-ch').click()
  for (const l of schoolLessons('k3', 'ch')) await expect(page.getByTestId(`lesson-${l.id}`)).toBeVisible()
})

test('a grown-up chooses the Polish school in the profile; the stage names follow the school', async ({ page }) => {
  await createProfile(page, 'Par', 2)
  await passGate(page)
  await page.getByTestId('tab-profiles').click()
  await page.getByTestId('edit-Par').click()
  await expect(page.getByTestId('school-picker')).toBeVisible()
  await expect(page.getByTestId('school-ch')).toBeChecked()
  await page.getByTestId('school-pl').check({ force: true })
  await expect(page.getByTestId('stage-picker')).toContainText('Zerówka')
  await page.getByTestId('stage-kg2').check({ force: true })
  await page.getByTestId('save-profile').click()
  await page.getByTestId('to-child').click()
  await openSchool(page)
  await expect(page.getByTestId('school')).toHaveAttribute('data-school', 'pl')
  await expect(page.getByTestId('school')).toHaveAttribute('data-stage', 'kg2')
})

for (const stage of STAGES) {
  test(`Polish school ${stage}: the teacher teaches every lesson and every game; nothing fails`, async ({ page }) => {
    test.setTimeout(240_000)
    await createProfile(page, `Pl${stage}`, 2)
    await polishSchool(page)
    await page.getByTestId(`school-stage-${stage}`).click()
    for (const l of schoolLessons(stage, 'pl')) {
      await page.getByTestId(`lesson-${l.id}`).click()
      await expect(page.getByTestId('teacher')).toBeVisible()
      await expect(page.getByTestId('teacher')).toContainText(/\S/)
      await expect(teacher(page)).toBeVisible()
      const kinds = await page.locator('[data-testid^="activity-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(9)).filter((k) => k !== 's'))
      for (const g of l.games) expect(kinds, `${l.id} offers ${g}`).toContain(g)
      for (const k of kinds) {
        await page.getByTestId(`activity-${k}`).click()
        await expect(page.getByTestId(`activity-screen-${k}`)).toBeVisible()
        // the teacher is in every game of a lesson
        await expect(teacher(page)).toBeVisible()
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

test('the teacher is in the Swiss lessons too, and her mouth moves while she speaks', async ({ page }) => {
  // real time: at 16× the opening is over before the screen can be read
  await page.addInitScript(() => ((window as unknown as { __tatzliSpeed: number }).__tatzliSpeed = 1))
  await createProfile(page, 'Tea', 2)
  await openSchool(page)
  const l = schoolLessons('kg1', 'ch')[0]
  await page.getByTestId(`lesson-${l.id}`).click()
  await expect(teacher(page)).toBeVisible()
  // the opening is spoken: the teacher talks, then stops
  await expect.poll(() => teacher(page).getAttribute('data-talking'), { timeout: 20_000 }).toBe('1')
  await expect.poll(() => teacher(page).getAttribute('data-talking'), { timeout: 30_000 }).toBe('0')
  await page.getByTestId(`activity-${l.games[0]}`).click()
  await expect(teacher(page)).toBeVisible()
})

test('patterns (rytmy): what comes next – solved to the end, a wrong pick is gentle', async ({ page }) => {
  await createProfile(page, 'Ryt', 2)
  await polishSchool(page)
  await page.getByTestId('school-stage-kg1').click()
  await page.getByTestId('lesson-sch-pl-kg1-rytm').click()
  await page.getByTestId('activity-pattern').click()
  const g = page.getByTestId('pattern')
  for (let r = 0; r < 4; r++) {
    await expect(g).toHaveAttribute('data-round', String(r), { timeout: 15_000 })
    const ans = (await g.getAttribute('data-answer'))!
    if (r === 0) {
      const opts = await page.locator('[data-testid^="pattern-option-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(15)))
      await page.getByTestId(`pattern-option-${opts.find((o) => o !== ans)}`).click()
      await page.waitForTimeout(500)
      await expect(g).toHaveAttribute('data-round', '0')
    }
    await page.getByTestId(`pattern-option-${ans}`).click()
  }
  await finished(page)
})

test('Polish maths: dots to ten, sums to twenty, times 3 and 4, division – all solvable to the end', async ({ page }) => {
  test.setTimeout(180_000)
  await createProfile(page, 'Plm', 2)
  await polishSchool(page)
  for (const [stage, id, kinds] of [
    ['kg2', 'sch-pl-kg2-liczymy', ['dots']],
    ['k1', 'sch-pl-k1-dodawanie', ['add', 'sub']],
    ['k2', 'sch-pl-k2-mnozenie', ['mult']],
    ['k3', 'sch-pl-k3-dzielenie', ['div']],
  ] as const) {
    await page.getByTestId(`school-stage-${stage}`).click()
    await page.getByTestId(`lesson-${id}`).click()
    await page.getByTestId('activity-math').click()
    const m = page.getByTestId('math')
    for (let r = 0; r < 5; r++) {
      await expect(m).toHaveAttribute('data-round', String(r), { timeout: 15_000 })
      const ans = Number(await m.getAttribute('data-answer'))
      const kind = (await m.getAttribute('data-kind'))!
      expect(kinds as readonly string[]).toContain(kind)
      if (kind === 'dots') await expect(page.getByTestId('math-dots')).toHaveAttribute('data-n', String(ans))
      if (kind === 'div') await expect(page.getByTestId('math-task')).toContainText(':')
      await page.getByTestId(`math-option-${ans}`).click()
    }
    await leaveToMap(page)
    await openSchool(page)
  }
})

test('the snowman picture story is put in order; the first letters match the pictures', async ({ page }) => {
  test.setTimeout(120_000)
  await createProfile(page, 'Plo', 3)
  await polishSchool(page)
  await page.getByTestId('school-stage-k2').click()
  await page.getByTestId('lesson-sch-pl-k2-historyjka').click()
  await page.getByTestId('activity-order').click()
  const o = page.getByTestId('order')
  const items = ['schnee', 'schneema', 'glungge']
  for (let round = 0; round < 2; round++) {
    await expect(o).toHaveAttribute('data-placed', '0', { timeout: 15_000 })
    for (let i = 0; i < items.length; i++) {
      await expect(o).toHaveAttribute('data-next', items[i])
      await page.getByTestId(`order-item-${items[i]}`).click()
    }
  }
  await leaveToMap(page)
  await openSchool(page)
  await page.getByTestId('school-stage-k1').click()
  await page.getByTestId('lesson-sch-pl-k1-litery').click()
  await page.getByTestId('activity-letters').click()
  const g = page.getByTestId('letters')
  for (let r = 0; r < 5; r++) {
    const target = (await g.getAttribute('data-target'))!
    await expect(page.getByTestId('letters-letter')).toHaveText((await g.getAttribute('data-letter'))!)
    await page.getByTestId(`letters-option-${target}`).click()
    if (r < 4) await expect(g).not.toHaveAttribute('data-target', target, { timeout: 15_000 })
  }
  await finished(page)
})

test('cinema: Polish school films with the teacher; the next lesson starts by itself, and can be skipped by hand @mobile', async ({ page }) => {
  test.setTimeout(240_000)
  await createProfile(page, 'Plk', 2)
  await polishSchool(page)
  await page.getByTestId('home').click()
  await page.getByTestId('kino-button').click()
  const row = page.getByTestId('kino-school')
  const kg1 = schoolLessons('kg1', 'pl')
  for (const l of kg1) await expect(row.getByTestId(`kino-lesson-${l.id}`)).toBeVisible()
  await expect(page.getByTestId('kino-menu')).toContainText('Szkoła · Przedszkole')
  await row.getByTestId(`kino-lesson-${kg1[0].id}`).click()
  const kino = page.getByTestId('kino')
  await expect(kino).toHaveAttribute('data-film', kg1[0].id)
  await expect(page.getByTestId('kino-teacher')).toBeVisible()
  await expect(kino).toHaveAttribute('data-segment', 'phrase', { timeout: 30_000 })
  // by hand: the next picture of the film
  const idx = Number(await kino.getAttribute('data-idx'))
  await page.getByTestId('kino-picture').click({ force: true })
  await expect(page.getByTestId('kino-bar-controls')).toBeVisible()
  await page.getByTestId('kino-bar-next').click()
  await expect.poll(async () => Number(await kino.getAttribute('data-idx')), { timeout: 15_000 }).toBeGreaterThan(idx)
  await expect(page.getByTestId('kino-teacher')).toBeVisible()
  // by itself: at the end the next lesson of the same Polish stage follows
  await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 120_000 })
  await expect(page.getByTestId('kino-upnext')).toHaveAttribute('data-next', kg1[1].id)
  await expect(kino).toHaveAttribute('data-film', kg1[1].id, { timeout: 15_000 })
  await expect(page.getByTestId('kino-teacher')).toBeVisible()
  // and the next lesson can also be taken at once
  await expect(page.getByTestId('kino-upnext')).toBeVisible({ timeout: 120_000 })
  await page.getByTestId('kino-next-tile').click()
  await expect(kino).toHaveAttribute('data-film', kg1[2].id, { timeout: 15_000 })
})

test('cinema: a Swiss school film also shows the teacher, map films do not', async ({ page }) => {
  await createProfile(page, 'Chk', 2)
  await page.getByTestId('kino-button').click()
  const ch = schoolLessons('kg1', 'ch')[0]
  await page.getByTestId('kino-school').getByTestId(`kino-lesson-${ch.id}`).click()
  await expect(page.getByTestId('kino-teacher')).toBeVisible()
  await page.getByTestId('home').click()
  await page.getByTestId('kino-button').click()
  await page.getByTestId('kino-lessons').locator('[data-testid^="kino-lesson-"]').first().click()
  await expect(page.getByTestId('kino')).toBeVisible()
  await expect(page.getByTestId('kino-teacher')).toHaveCount(0)
})
