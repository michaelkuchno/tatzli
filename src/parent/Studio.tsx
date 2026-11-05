import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Lang } from '@content/types'
import { LANGS } from '@content/types'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { allAudioItems } from '@/lib/content'
import { play } from '@/lib/audio'
import { LANG_META, LangBadge } from '@/components/LangBadge'
import { saveFile, blobToBase64, base64ToBlob, pickFile } from './files'

/** Family recording studio: record → listen → save (overrides generated audio). Local only. */
export function Studio() {
  const { t } = useApp()
  const items = useMemo(() => allAudioItems().filter((a) => a.kind !== 'sound'), [])
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string>(items[0]?.id ?? '')
  const [lang, setLang] = useState<Lang>('be')
  const [author, setAuthor] = useState('Mami')
  const [state, setState] = useState<'idle' | 'rec' | 'have'>('idle')
  const [err, setErr] = useState('')
  const blob = useRef<Blob | null>(null)
  const mr = useRef<MediaRecorder | null>(null)
  const recs = useLiveQuery(() => db.recordings.toArray(), []) ?? []
  const filtered = items.filter((a) => !q || a.text.be.toLowerCase().includes(q.toLowerCase()) || a.text.de.toLowerCase().includes(q.toLowerCase()) || a.id.includes(q)).slice(0, 60)
  const item = items.find((a) => a.id === sel)

  const start = async () => {
    setErr('')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      const r = new MediaRecorder(s)
      const chunks: Blob[] = []
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      r.onstop = () => {
        blob.current = new Blob(chunks, { type: r.mimeType || 'audio/webm' })
        s.getTracks().forEach((x) => x.stop())
        setState('have')
      }
      mr.current = r
      r.start()
      setState('rec')
    } catch (e) {
      setErr(String((e as Error).message ?? e))
    }
  }
  const stop = () => mr.current?.state === 'recording' && mr.current.stop()
  const listen = () => {
    if (!blob.current) return
    const u = URL.createObjectURL(blob.current)
    const a = new Audio(u)
    a.onended = () => URL.revokeObjectURL(u)
    void a.play()
  }
  const save = async () => {
    if (!blob.current || !item) return
    await db.recordings.put({ key: `${item.id}:${lang}`, audioId: item.id, lang, blob: blob.current, mime: blob.current.type, author, createdAt: Date.now() })
    blob.current = null
    setState('idle')
  }

  return (
    <section className="max-w-5xl space-y-4" data-testid="studio">
      <h2 className="text-2xl font-bold">{t('studio')}</h2>
      <p className="text-sm text-stone-600">{t('micPermission')}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-3 shadow">
          <input className="input mb-2" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} data-testid="studio-search" />
          <ul className="max-h-80 overflow-auto">
            {filtered.map((a) => (
              <li key={a.id}>
                <button type="button" className={`w-full rounded px-2 py-1 text-left ${sel === a.id ? 'bg-amber-100' : 'hover:bg-stone-100'}`} onClick={() => setSel(a.id)} data-testid={`studio-item-${a.id}`}>
                  <b>{a.text.be}</b> <span className="text-stone-500">· {a.text.de}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow">
          {item && (
            <>
              <div className="text-lg">
                <LangBadge lang={lang} /> <b style={{ color: LANG_META[lang].color }}>{item.text[lang]}</b>
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button key={l} type="button" className={`btn-mini ${lang === l ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setLang(l)}>
                    {LANG_META[l].short}
                  </button>
                ))}
                <button type="button" className="btn-secondary" onClick={() => void play(item.id, lang)}>
                  ▶ {t('listen')} (Tatzli)
                </button>
              </div>
              <label className="block">
                <span className="label">{t('author')}</span>
                <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </label>
              <div className="flex flex-wrap gap-2">
                {state !== 'rec' ? (
                  <button type="button" className="btn-danger" onClick={() => void start()} data-testid="studio-record">
                    ● {t('record')}
                  </button>
                ) : (
                  <button type="button" className="btn-danger" onClick={stop} data-testid="studio-stop">
                    ■ {t('stop')}
                  </button>
                )}
                <button type="button" className="btn-secondary" disabled={state !== 'have'} onClick={listen} data-testid="studio-listen">
                  ▶ {t('listen')}
                </button>
                <button type="button" className="btn-primary" disabled={state !== 'have'} onClick={() => void save()} data-testid="studio-save">
                  {t('save')}
                </button>
              </div>
              {err && <p className="text-red-700">{err}</p>}
            </>
          )}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              const pack = await Promise.all(recs.map(async (r) => ({ ...r, blob: await blobToBase64(r.blob) })))
              await saveFile('tatzli-recordings.json', new Blob([JSON.stringify({ format: 'tatzli-recordings', version: 1, items: pack })], { type: 'application/json' }))
            }}
          >
            {t('exportPack')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              const f = await pickFile('application/json')
              if (!f) return
              const j = JSON.parse(await f.text()) as { format: string; items: { key: string; audioId: string; lang: Lang; blob: string; mime: string; author: string; createdAt: number }[] }
              if (j.format !== 'tatzli-recordings') return
              await db.recordings.bulkPut(j.items.map((r) => ({ ...r, blob: base64ToBlob(r.blob, r.mime) })))
            }}
          >
            {t('importPack')}
          </button>
        </div>
        <ul className="divide-y" data-testid="recordings">
          {recs.map((r) => (
            <li key={r.key} className="flex items-center gap-2 py-1">
              <LangBadge lang={r.lang} />
              <span className="flex-1">
                {items.find((a) => a.id === r.audioId)?.text[r.lang] ?? r.audioId} <span className="text-stone-500">· {r.author}</span>
              </span>
              <button type="button" className="btn-mini" onClick={() => void play(r.audioId, r.lang)}>
                ▶
              </button>
              <button type="button" className="btn-mini" onClick={() => void db.recordings.delete(r.key)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
