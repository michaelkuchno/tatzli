import { useEffect, useRef, useState } from 'react'
import type { Lang } from '@content/types'
import { LANGS } from '@content/types'
import { useApp } from '@/state/AppContext'
import { LANG_META, LangBadge } from '@/components/LangBadge'
import { hasApiKey } from '@/lib/ai/crypto'
import { provider } from '@/lib/ai/provider'
import { translate, queueTranslation, TRANSLATE_MAX, type SourceLang, type Translation } from '@/lib/ai/translate'
import { aiErrorMessage } from '@/lib/ai/pipeline'
import { applySpeechRate, stopAll } from '@/lib/audio'

/** Parent tool: translate any typed text between Bärndütsch, German, Polish and English (online, Gemini). */
export function Translate() {
  const { t, settings, update } = useApp()
  const [input, setInput] = useState('')
  const [from, setFrom] = useState<SourceLang>('auto')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<Translation | null>(null)
  const [queued, setQueued] = useState(false)
  const [copied, setCopied] = useState<Lang | null>(null)
  const [keyOk, setKeyOk] = useState(true)
  const voices = useRef(new Map<string, string>())
  useEffect(() => {
    void hasApiKey().then(setKeyOk)
    const cache = voices.current
    return () => {
      for (const u of cache.values()) URL.revokeObjectURL(u)
    }
  }, [])

  const go = async () => {
    if (!input.trim()) return
    setBusy(true)
    setErr('')
    setQueued(false)
    try {
      setRes(await translate(input, from, settings.aiTextModel))
    } catch (e) {
      const k = aiErrorMessage(e)
      setErr(k ? t(k) : String((e as Error)?.message ?? e))
    } finally {
      setBusy(false)
    }
  }

  const speakAi = async (lang: Lang, text: string) => {
    stopAll()
    const k = `${lang}:${text}`
    try {
      let url = voices.current.get(k)
      if (!url) {
        url = URL.createObjectURL(await provider().tts(text, lang, settings.aiTtsModel))
        voices.current.set(k, url)
      }
      const a = new Audio(url)
      applySpeechRate(a)
      void a.play()
    } catch (e) {
      const m = aiErrorMessage(e)
      setErr(m ? t(m) : String((e as Error)?.message ?? e))
    }
  }

  const order: Lang[] = res ? [res.source, ...LANGS.filter((l) => l !== res.source)] : []
  const conf = res?.be.confidence
  return (
    <section className="max-w-4xl space-y-4" data-testid="translate">
      <h2 className="text-2xl font-bold">{t('translate')}</h2>
      <p className="text-sm text-stone-600">{t('translateHint')}</p>
      {!keyOk && (
        <p className="rounded-xl bg-amber-100 p-3 text-amber-900" data-testid="translate-nokey">
          {t('translateNoKey')}
        </p>
      )}
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow">
        <textarea
          className="input min-h-28 w-full text-lg"
          maxLength={TRANSLATE_MAX}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void go()
          }}
          placeholder="Guete Morge! · Guten Morgen! · Dzień dobry! · Good morning!"
          data-testid="translate-input"
          aria-label={t('translate')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="label !mb-0">{t('translateFrom')}</span>
            <select className="input !w-auto" value={from} onChange={(e) => setFrom(e.target.value as SourceLang)} data-testid="translate-from">
              <option value="auto">{t('translateAuto')}</option>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_META[l].name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-primary" disabled={busy || !input.trim()} onClick={() => void go()} data-testid="translate-go">
            {busy ? '…' : t('translateGo')}
          </button>
          {(input || res) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setInput('')
                setRes(null)
                setErr('')
              }}
            >
              {t('translateClear')}
            </button>
          )}
          <span className="ml-auto text-xs text-stone-400">
            {input.length}/{TRANSLATE_MAX}
          </span>
        </div>
        {err && (
          <p className="text-red-700" data-testid="translate-error">
            {err}
          </p>
        )}
      </div>

      {res && (
        <div className="space-y-3" data-testid="translate-result" data-source={res.source}>
          {order.map((l) => (
            <div key={l} className="rounded-2xl bg-white p-4 shadow" data-testid={`translate-${l}`} style={{ borderLeft: `8px solid ${LANG_META[l].color}` }}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <LangBadge lang={l} />
                <b>{LANG_META[l].name}</b>
                {l === res.source && <span className="rounded-full bg-stone-100 px-2 text-xs text-stone-600">{t('translateSource')}</span>}
                {l === 'be' && (
                  <span
                    className={`rounded-full px-2 text-xs font-bold ${conf === 'high' ? 'bg-emerald-100 text-emerald-800' : conf === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}
                    data-testid="translate-be-confidence"
                    data-confidence={conf}
                    title={res.be.issues.join(' · ')}
                  >
                    {t('translateBe')}: {conf}
                  </span>
                )}
                <span className="ml-auto flex gap-2">
                  {settings.translateVoice && (
                    <button type="button" className="btn-mini" onClick={() => void speakAi(l, res.text[l])} data-testid={`translate-voice-${l}`}>
                      🔊 {t('translateVoice')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-mini"
                    data-testid={`translate-copy-${l}`}
                    onClick={() => {
                      void navigator.clipboard?.writeText(res.text[l]).catch(() => {})
                      setCopied(l)
                      window.setTimeout(() => setCopied(null), 1500)
                    }}
                  >
                    {copied === l ? `✓ ${t('translateCopied')}` : t('translateCopy')}
                  </button>
                </span>
              </div>
              <p className="whitespace-pre-wrap text-xl" lang={l === 'be' ? 'gsw' : l} data-testid={`translate-text-${l}`}>
                {res.text[l]}
              </p>
              {l === 'be' && res.be.issues.length > 0 && <p className="mt-1 text-sm text-stone-500">{res.be.issues.join(' · ')}</p>}
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary"
              disabled={queued}
              data-testid="translate-queue"
              onClick={async () => {
                await queueTranslation(res)
                setQueued(true)
              }}
            >
              {queued ? t('translateQueued') : t('translateQueue')}
            </button>
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={settings.translateVoice} onChange={(e) => update({ translateVoice: e.target.checked })} data-testid="translate-voice-setting" />
        {t('translateVoiceSetting')}
      </label>
    </section>
  )
}
