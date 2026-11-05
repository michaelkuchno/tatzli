import { afterEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { TatzliDB, db } from '@/lib/db'
import { setProvider, FakeProvider, pcmToWav } from '@/lib/ai/provider'
import { generateScene, validateStory, aiStoryToStory, scenePrompt } from '@/lib/ai/pipeline'
import { recordExposure, progressMap, markActivity } from '@/lib/progress'

describe('database migrations', () => {
  it('upgrades a v1 database to v2 and fills new profile defaults', async () => {
    const name = 'tatzli-migration-test'
    const v1 = new Dexie(name)
    v1.version(1).stores({ profiles: '++id, nickname', settings: 'key' })
    await v1.table('profiles').add({ nickname: 'Old', level: 2, avatar: 'chatz', langs: ['be'], audioLang: 'be', sessionMinutes: 10, createdAt: 1 })
    v1.close()
    const v2 = new TatzliDB(name)
    const p = await v2.profiles.toArray()
    expect(p[0].repeatSecond).toBe(false)
    expect(v2.verno).toBe(2)
    await v2.aiQueue.add({ kind: 'idea', status: 'pending', createdAt: 1, request: {}, payload: [] })
    expect(await v2.aiQueue.count()).toBe(1)
    v2.close()
    await Dexie.delete(name)
  })
})

describe('progress & stickers', () => {
  it('records exposures and awards a sticker after two different activities', async () => {
    await recordExposure(7, 'chatz', 'word', 'recognised')
    const pm = await progressMap(7)
    expect(pm.get('chatz')?.strength).toBe(1)
    expect(await markActivity(7, 'l1-tier', 'whereIs', 'gueggu')).toBe(false)
    expect(await markActivity(7, 'l1-tier', 'whereIs', 'gueggu')).toBe(false)
    expect(await markActivity(7, 'l1-tier', 'memory', 'gueggu')).toBe(true)
    expect(await markActivity(7, 'l1-tier', 'sort', 'gueggu')).toBe(false)
  })
})

describe('AI pipeline (fake provider)', () => {
  afterEach(() => setProvider(null))
  it('never sends child data in prompts', () => {
    const p = scenePrompt({ place: 'garden', level: 2, length: 'short', topicWords: ['chatz'] })
    expect(p).not.toMatch(/nickname|Mia|birth|Geburtsdatum/i)
  })
  it('generates a scene into the approval queue (pending), with QC and BE confidence', async () => {
    setProvider(new FakeProvider())
    const id = await generateScene({ place: 'garden', level: 2, length: 'short', topicWords: ['chatz', 'bluem'] }, 'fake')
    const item = await db.aiQueue.get(id)
    expect(item?.status).toBe('pending')
    expect(item?.qc?.ok).toBe(true)
    expect(['high', 'medium']).toContain(item?.beConfidence)
    const story = aiStoryToStory(item!)
    expect(story.pages.length).toBe(2)
  })
  it('rejects malformed or misaligned AI output', () => {
    expect(validateStory({ title: 'x' }).story).toBeUndefined()
    const bad = validateStory({
      title: { be: 'a', de: 'a', pl: 'a', en: 'a' },
      words: ['chatz'],
      pages: [0, 1].map(() => ({ scene: { place: 'garden', items: [] }, text: { be: '[A]1 [b]2', de: '[A]1', pl: '[A]1', en: '[A]1' } })),
      parentQuestions: [{ pl: '', de: '', en: '' }],
      offscreen: { pl: '', de: '', en: '' },
    })
    expect(bad.problems.length).toBeGreaterThan(0)
  })
  it('wraps PCM into a valid WAV header', () => {
    const wav = pcmToWav(new Uint8Array(100))
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF')
    expect(wav.length).toBe(144)
  })
})
