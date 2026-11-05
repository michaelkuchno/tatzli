import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Level, PlaceId, Lang } from '@content/types'
import { useApp } from '@/state/AppContext'
import { db, type AiItem } from '@/lib/db'
import { TOPICS } from '@/lib/content'
import { PLACE_IDS } from '@/illustrations/places'
import { saveApiKey, hasApiKey } from '@/lib/ai/crypto'
import { provider } from '@/lib/ai/provider'
import { generateScene, generateVariants, generateIdeas, generateAudio, aiErrorMessage, aiStoryToStory, type AiStory } from '@/lib/ai/pipeline'
import { seasonOf } from '@/lib/calendar'
import { StoryView } from '@/activities/StoryPlayer'
import { plain } from '@/lib/align'

function useAiError() {
  const { t } = useApp()
  const [msg, setMsg] = useState('')
  const handle = (e: unknown) => {
    const k = aiErrorMessage(e)
    setMsg(k ? t(k) : String((e as Error)?.message ?? e))
  }
  return { msg, setMsg, handle }
}

export function AiStudio() {
  const { t, settings, update, profile } = useApp()
  const [key, setKey] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [keyState, setKeyState] = useState<'' | 'ok' | 'bad'>('')
  const [busy, setBusy] = useState(false)
  const [place, setPlace] = useState<PlaceId>('garden')
  const [level, setLevel] = useState<Level>(profile?.level ?? 2)
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short')
  const [topicId, setTopicId] = useState(TOPICS[0].id)
  const [done, setDone] = useState('')
  const err = useAiError()
  useEffect(() => {
    void hasApiKey().then(setHasKey)
  }, [])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    err.setMsg('')
    setDone('')
    try {
      await fn()
      setDone('✓')
    } catch (e) {
      err.handle(e)
    } finally {
      setBusy(false)
    }
  }
  const topic = TOPICS.find((x) => x.id === topicId)!

  return (
    <section className="max-w-4xl space-y-4" data-testid="ai-studio">
      <h2 className="text-2xl font-bold">{t('ai')}</h2>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow">
        <label className="block">
          <span className="label">{t('apiKey')}</span>
          <input type="password" autoComplete="off" className="input" value={key} placeholder={hasKey ? '••••••••' : 'AIza…'} onChange={(e) => setKey(e.target.value)} data-testid="ai-key" />
        </label>
        <p className="text-sm text-stone-500">{t('apiKeyHint')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              await saveApiKey(key.trim())
              setKey('')
              setHasKey(!!key.trim())
            }}
          >
            {t('save')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              void run(async () => {
                try {
                  const m = await provider().models()
                  setModels(m)
                  setKeyState('ok')
                } catch (e) {
                  setKeyState('bad')
                  throw e
                }
              })
            }
          >
            {t('checkKey')}
          </button>
          {keyState && <span className={keyState === 'ok' ? 'text-emerald-700' : 'text-red-700'}>{t(keyState === 'ok' ? 'keyOk' : 'keyBad')}</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          <label>
            <span className="label">{t('model')} (Text)</span>
            <input className="input w-64" list="ai-models" value={settings.aiTextModel} onChange={(e) => update({ aiTextModel: e.target.value })} />
          </label>
          <label>
            <span className="label">{t('model')} (TTS)</span>
            <input className="input w-64" list="ai-models" value={settings.aiTtsModel} onChange={(e) => update({ aiTtsModel: e.target.value })} />
          </label>
          <datalist id="ai-models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow">
        <h3 className="font-bold">{t('sceneStudio')}</h3>
        <div className="flex flex-wrap gap-3">
          <label>
            <span className="label">{t('topic')}</span>
            <select className="input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              {TOPICS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.title[settings.uiLang]} ({x.level})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">{t('place')}</span>
            <select className="input" value={place} onChange={(e) => setPlace(e.target.value as PlaceId)} data-testid="ai-place">
              {PLACE_IDS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">{t('ageLevel')}</span>
            <select className="input" value={level} onChange={(e) => setLevel(Number(e.target.value) as Level)}>
              <option value={1}>{t('level1')}</option>
              <option value={2}>{t('level2')}</option>
              <option value={3}>{t('level3')}</option>
            </select>
          </label>
          <label>
            <span className="label">{t('length')}</span>
            <select className="input" value={length} onChange={(e) => setLength(e.target.value as 'short')}>
              <option value="short">{t('short')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="long">{t('long')}</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={busy} data-testid="ai-generate" onClick={() => void run(() => generateScene({ place, level, length, topicWords: topic.words }, settings.aiTextModel))}>
            {t('generate')}
          </button>
          <button type="button" className="btn-secondary" disabled={busy} data-testid="ai-variants" onClick={() => void run(() => generateVariants(topic.words, level, settings.aiTextModel))}>
            {t('variants')}
          </button>
          <button type="button" className="btn-secondary" disabled={busy} data-testid="ai-ideas" onClick={() => void run(() => generateIdeas(seasonOf(new Date()), level, settings.aiTextModel))}>
            {t('ideas')}
          </button>
          {busy && <span className="animate-pulse">…</span>}
          {done && <span className="text-emerald-700" data-testid="ai-done">{done}</span>}
        </div>
        {err.msg && (
          <p className="rounded-lg bg-red-50 p-2 text-red-800" data-testid="ai-error">
            {err.msg}
          </p>
        )}
      </div>
    </section>
  )
}

export function AiQueue() {
  const { t, settings, update } = useApp()
  const items = useLiveQuery(() => db.aiQueue.orderBy('createdAt').reverse().toArray(), []) ?? []
  const [preview, setPreview] = useState<number | null>(null)
  const [progress, setProgress] = useState('')
  const err = useAiError()
  const ui = settings.uiLang

  const approve = async (it: AiItem) => {
    await db.aiQueue.update(it.id!, { status: 'approved' })
    if (it.kind === 'scene') update({ surprisePool: [...new Set([...settings.surprisePool, `ai:${it.id}`])] })
    try {
      await generateAudio({ ...it, status: 'approved' }, settings.aiTtsModel, (d, n) => setProgress(`${d}/${n}`))
    } catch (e) {
      err.handle(e)
    }
    setProgress('')
  }

  return (
    <section className="max-w-5xl space-y-3" data-testid="ai-queue">
      <h2 className="text-2xl font-bold">{t('queue')}</h2>
      {err.msg && <p className="rounded-lg bg-red-50 p-2 text-red-800">{err.msg}</p>}
      {progress && <p>🔊 {progress}</p>}
      {items.length === 0 && <p className="text-stone-500">{t('noData')}</p>}
      {items.map((it) => (
        <article key={it.id} className="rounded-2xl bg-white p-4 shadow" data-testid={`queue-item-${it.id}`} data-status={it.status}>
          <header className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${it.status === 'pending' ? 'bg-amber-100' : it.status === 'approved' ? 'bg-emerald-100' : 'bg-stone-200'}`}>{t(it.status)}</span>
            <b>{it.kind}</b>
            <span className="text-sm text-stone-500">{new Date(it.createdAt).toLocaleString()}</span>
            <span className="text-sm">
              {t('confidence')}: <b className={it.beConfidence === 'low' ? 'text-red-700' : ''}>{it.beConfidence ? t(it.beConfidence === 'medium' ? 'medium' : it.beConfidence) : '–'}</b>
            </span>
            {it.audioReady && <span>🔊</span>}
          </header>
          <ItemBody item={it} ui={ui} />
          {it.qc && (
            <p className="mt-2 text-sm text-stone-600">
              <b>{t('qc')}:</b> {it.qc.ok ? '✓' : '✗'} {it.qc.notes} {it.qc.beIssues.length > 0 && <span className="text-red-700">· BE: {it.qc.beIssues.join(' · ')}</span>}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {it.status === 'pending' && (
              <>
                <button type="button" className="btn-primary" data-testid={`approve-${it.id}`} onClick={() => void approve(it)}>
                  {t('approve')}
                </button>
                <button type="button" className="btn-danger" data-testid={`reject-${it.id}`} onClick={() => void db.aiQueue.update(it.id!, { status: 'rejected' })}>
                  {t('reject')}
                </button>
              </>
            )}
            {it.status === 'approved' && !it.audioReady && it.kind !== 'idea' && (
              <button type="button" className="btn-secondary" onClick={() => void approve(it)}>
                {t('generateAudio')}
              </button>
            )}
            {it.kind === 'scene' && (
              <button type="button" className="btn-secondary" onClick={() => setPreview(preview === it.id ? null : it.id!)}>
                👁
              </button>
            )}
            <button type="button" className="btn-mini" onClick={() => void db.aiQueue.delete(it.id!)}>
              {t('delete')}
            </button>
          </div>
          {preview === it.id && it.kind === 'scene' && (
            <div className="mt-3 rounded-2xl bg-amber-50 p-3">
              <StoryView story={aiStoryToStory(it)} audioPrefix="ai" onComplete={() => {}} onHint={() => {}} />
            </div>
          )}
        </article>
      ))}
    </section>
  )
}

function ItemBody({ item, ui }: { item: AiItem; ui: 'pl' | 'de' | 'en' }) {
  if (item.kind === 'scene') {
    const s = item.payload as AiStory
    return (
      <div>
        <h3 className="font-semibold">
          {s.title.be} · {s.title[ui]}
        </h3>
        <ol className="list-decimal pl-5 text-sm">
          {s.pages.map((p, i) => (
            <li key={i}>
              <b>{plain(p.text.be)}</b> — {plain(p.text[ui as Lang])}
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (item.kind === 'variant') {
    const ps = (item.payload as { phrases: Record<Lang, string>[] }).phrases
    return (
      <ul className="list-disc pl-5 text-sm">
        {ps.map((p, i) => (
          <li key={i}>
            <b>{plain(p.be)}</b> — {plain(p[ui])}
          </li>
        ))}
      </ul>
    )
  }
  const ideas = item.payload as { pl: string; de: string; en: string; be: string }[]
  return (
    <ul className="list-disc pl-5 text-sm">
      {ideas.map((x, i) => (
        <li key={i}>
          {x[ui]} <i className="text-stone-500">({x.be})</i>
        </li>
      ))}
    </ul>
  )
}
