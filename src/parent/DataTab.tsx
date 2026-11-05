import { useState } from 'react'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { allAudioItems } from '@/lib/content'
import { prefetchAll } from '@/lib/audio'
import { saveFile, blobToBase64, base64ToBlob, pickFile } from './files'

const TABLES = ['profiles', 'progress', 'topics', 'stickers', 'favorites', 'sessions', 'settings', 'aiQueue'] as const

/** Full backup (JSON file, recordings included as base64). The encrypted AI key is not exported. */
export async function exportBackup(): Promise<Blob> {
  const out: Record<string, unknown> = { format: 'tatzli-backup', version: 2, createdAt: Date.now() }
  for (const t of TABLES) out[t] = await db.table(t).toArray()
  out.settings = (out.settings as { key: string }[]).filter((s) => s.key !== 'aiKey')
  out.recordings = await Promise.all((await db.recordings.toArray()).map(async (r) => ({ ...r, blob: await blobToBase64(r.blob) })))
  return new Blob([JSON.stringify(out)], { type: 'application/json' })
}

export async function importBackup(text: string) {
  const j = JSON.parse(text) as Record<string, unknown>
  if (j.format !== 'tatzli-backup') throw new Error('not a Tatzli backup')
  await db.transaction('rw', [...TABLES.map((t) => db.table(t)), db.recordings], async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      if (Array.isArray(j[t])) await db.table(t).bulkPut(j[t] as object[])
    }
    await db.recordings.clear()
    const recs = (j.recordings ?? []) as { blob: string; mime: string }[]
    await db.recordings.bulkPut(recs.map((r) => ({ ...r, blob: base64ToBlob(r.blob, r.mime) })) as never)
  })
}

export function DataTab() {
  const { t, update } = useApp()
  const [msg, setMsg] = useState('')
  return (
    <section className="max-w-3xl space-y-4" data-testid="data-tab">
      <h2 className="text-2xl font-bold">{t('data')}</h2>
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow">
        <button type="button" className="btn-primary" data-testid="backup" onClick={async () => saveFile(`tatzli-backup-${new Date().toISOString().slice(0, 10)}.json`, await exportBackup())}>
          {t('backup')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          data-testid="restore"
          onClick={async () => {
            const f = await pickFile('application/json')
            if (!f) return
            try {
              await importBackup(await f.text())
              setMsg('✓')
              location.reload()
            } catch (e) {
              setMsg(String((e as Error).message))
            }
          }}
        >
          {t('restore')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          data-testid="offline"
          onClick={async () => {
            setMsg('…')
            await prefetchAll(
              allAudioItems().map((a) => a.id),
              (d, n) => setMsg(`${d}/${n}`),
            )
            update({ audioPrefetched: true })
            setMsg(t('offlineDone'))
          }}
        >
          {t('offline')}
        </button>
      </div>
      {msg && <p data-testid="data-msg">{msg}</p>}
      <div className="rounded-2xl bg-white p-4 shadow">
        <button
          type="button"
          className="btn-danger"
          onClick={async () => {
            if (!confirm(t('confirmDelete'))) return
            await db.delete()
            localStorage.clear()
            location.reload()
          }}
        >
          {t('deleteAll')}
        </button>
      </div>
    </section>
  )
}
