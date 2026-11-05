import { useMemo, useState } from 'react'
import review from '@content/be-review.json'
import type { BeReviewEntry } from '@content/types'
import { useApp } from '@/state/AppContext'

export const BE_SOURCES: { id: string; name: string; url: string; note: string }[] = [
  { id: 'berndeutsch.ch', name: 'berndeutsch.ch – Wörterbuch Berndeutsch–Deutsch', url: 'https://www.berndeutsch.ch/', note: '>7000 Einträge, von Freiwilligen validiert; automatisch abgefragt (nur Stichwort/Schreibvarianten).' },
  { id: 'rules', name: 'Regeln Berner Phonologie/Morphologie', url: 'https://en.wikipedia.org/wiki/Bernese_German', note: 'l-Vokalisierung, nd-Velarisierung, Verbformen (i gange, mir göh), Abgrenzung zu Zürichdeutsch.' },
  { id: 'gemini', name: 'Zweite Kontrolle durch Gemini', url: 'https://ai.google.dev/', note: 'Unabhängige Modellprüfung auf nicht-bernische Formen.' },
  { id: 'vocab-verified', name: 'Satz besteht aus geprüften Wörtern', url: '', note: 'Anteil der im Wörterbuch bestätigten Wörter.' },
  { id: 'manual-review', name: 'Manuelle Entscheidung (docs/BAERNDUETSCH_REVIEW.md)', url: '', note: '' },
]

export function BeSources() {
  const { t, settings, update } = useApp()
  const [q, setQ] = useState('')
  const [only, setOnly] = useState<'all' | 'high' | 'medium'>('all')
  const rows = review as BeReviewEntry[]
  const stats = useMemo(() => ({ high: rows.filter((r) => r.confidence === 'high').length, medium: rows.filter((r) => r.confidence === 'medium').length, low: rows.filter((r) => r.confidence === 'low').length }), [rows])
  const shown = rows.filter((r) => (only === 'all' || r.confidence === only) && (!q || r.be.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q))).slice(0, 300)
  return (
    <section className="max-w-5xl space-y-4" data-testid="be-sources">
      <h2 className="text-2xl font-bold">{t('beSources')}</h2>
      <div className="rounded-2xl bg-white p-4 shadow">
        <p>
          {t('high')}: <b>{stats.high}</b> · {t('medium')}: <b>{stats.medium}</b> · {t('low')}: <b>{stats.low}</b>
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {BE_SOURCES.map((s) => (
            <li key={s.id}>
              {s.url ? (
                <a className="text-amber-800 underline" href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              ) : (
                s.name
              )}{' '}
              – {s.note}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className="input w-64" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-40" value={only} onChange={(e) => setOnly(e.target.value as 'all')}>
          <option value="all">*</option>
          <option value="high">{t('high')}</option>
          <option value="medium">{t('medium')}</option>
        </select>
      </div>
      <table className="w-full rounded-2xl bg-white text-sm shadow">
        <thead>
          <tr className="text-left">
            <th className="p-2">BE</th>
            <th>{t('confidence')}</th>
            <th>{t('sources')}</th>
            <th>{t('checkedByBern')}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id} className="border-t border-stone-100">
              <td className="p-2">
                <b>{r.be}</b>
                {r.note && <div className="text-xs text-stone-500">{r.note}</div>}
              </td>
              <td>{t(r.confidence === 'medium' ? 'medium' : r.confidence)}</td>
              <td className="text-xs">{r.sources.join(', ')}</td>
              <td>
                <input
                  type="checkbox"
                  checked={!!settings.beChecked[r.id]}
                  onChange={(e) => {
                    const next = { ...settings.beChecked }
                    if (e.target.checked) next[r.id] = { by: 'parent', at: Date.now() }
                    else delete next[r.id]
                    update({ beChecked: next })
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
