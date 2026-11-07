import 'fake-indexeddb/auto'
import { describe, expect, it, beforeAll } from 'vitest'
import { setProvider, FakeProvider, type AiProvider } from '@/lib/ai/provider'
import { translate, translatePrompt, queueTranslation } from '@/lib/ai/translate'
import { db } from '@/lib/db'

describe('translator (any of the four languages → the others)', () => {
  beforeAll(() => setProvider(new FakeProvider()))

  it('German input → Bärndütsch, Polish, English; the input stays as typed', async () => {
    const r = await translate('Guten Morgen!', 'auto', 'fake')
    expect(r.source).toBe('de')
    expect(r.text.de).toBe('Guten Morgen!')
    expect(r.text.be).toBe('Guete Morge!')
    expect(r.text.pl).toBe('Dzień dobry!')
    expect(r.text.en).toBe('Good morning!')
    expect(['high', 'medium', 'low']).toContain(r.be.confidence)
  })

  it('Bärndütsch input is recognised and translated', async () => {
    const r = await translate('I gange id Chindsgi.', 'auto', 'fake')
    expect(r.source).toBe('be')
    expect(r.text.be).toBe('I gange id Chindsgi.')
    expect(r.text.de).toBe('Ich gehe in den Kindergarten.')
    expect(r.aligned.pl).toContain('[Idę]1+2')
  })

  it('if the model alters the source text, the typed text is kept (one block per language)', async () => {
    const r = await translate('Mir gange hüt i Zoo.', 'be', 'fake')
    expect(r.text.be).toBe('Mir gange hüt i Zoo.')
    expect(r.aligned.be).toBe('[Mir gange hüt i Zoo.]1')
    expect(r.aligned.de.startsWith('[')).toBe(true)
  })

  it('the prompt names the chosen source language and asks for Bernese (not Zurich) forms', () => {
    const p = translatePrompt('Hallo', 'pl')
    expect(p).toContain('TASK:TRANSLATE')
    expect(p).toContain('source = "pl"')
    expect(p).toMatch(/Berner Mundart/)
    expect(p).toMatch(/Zürichdeutsch/)
  })

  it('invalid model output is retried and then reported, never shown half-done', async () => {
    let calls = 0
    const bad: AiProvider = { name: 'bad', json: async () => (calls++, { nope: true }), tts: async () => new Blob(), models: async () => [] }
    setProvider(bad)
    await expect(translate('Hallo', 'auto', 'x')).rejects.toThrow()
    expect(calls).toBe(2)
    setProvider(new FakeProvider())
  })

  it('empty input is rejected', async () => {
    await expect(translate('   ', 'auto', 'fake')).rejects.toThrow()
  })

  it('queue: a translation waits for a grown-up approval', async () => {
    const r = await translate('Guten Morgen!', 'auto', 'fake')
    const id = await queueTranslation(r)
    const item = await db.aiQueue.get(id)
    expect(item?.status).toBe('pending')
    expect(item?.kind).toBe('variant')
  })
})
