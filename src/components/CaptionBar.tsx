import { useEffect, useState } from 'react'
import { onCaption, type CaptionEvent } from '@/lib/audio'
import { useApp } from '@/state/AppContext'
import { LangBadge } from './LangBadge'

/** Captions for every spoken sound; visible notice if audio could not play at all. */
export function CaptionBar() {
  const { settings } = useApp()
  const [cap, setCap] = useState<CaptionEvent | null>(null)
  useEffect(() => {
    let timer = 0
    const off = onCaption((e) => {
      setCap(e)
      clearTimeout(timer)
      timer = window.setTimeout(() => setCap(null), e?.failed ? 4000 : 3500)
    })
    return () => {
      off()
      clearTimeout(timer)
    }
  }, [])
  if (!cap || (!settings.captions && !cap.failed && cap.source !== 'muted')) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[80] flex justify-center px-4 tv:bottom-10" aria-live="polite" data-testid="caption">
      <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-lg font-bold shadow-lg tv:text-3xl ${cap.failed ? 'bg-red-100 text-red-900' : 'bg-white/90 text-stone-800'}`}>
        <LangBadge lang={cap.lang} size={24} />
        <span>{cap.failed ? `🔇 ${cap.text}` : cap.text}</span>
        {cap.source === 'muted' && <span aria-hidden className="text-base opacity-50">🔈</span>}
        <span className="sr-only" data-testid="caption-source">
          {cap.source}
        </span>
      </div>
    </div>
  )
}
