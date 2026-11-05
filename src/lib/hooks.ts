import { useEffect, useRef } from 'react'
import { logSession } from './progress'

/**
 * Spatial arrow-key navigation for TV use: arrows move focus to the nearest [data-nav] element in that
 * direction; Enter/Space activates (native button behaviour).
 */
export function useArrowNav(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      const items = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]')).filter((el) => el.offsetParent !== null && !el.closest('[inert]'))
      if (!items.length) return
      const cur = document.activeElement as HTMLElement | null
      if (!cur || !items.includes(cur)) {
        items[0].focus()
        e.preventDefault()
        return
      }
      const r = cur.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      let best: HTMLElement | null = null
      let bestScore = Infinity
      for (const el of items) {
        if (el === cur) continue
        const b = el.getBoundingClientRect()
        const x = b.left + b.width / 2
        const y = b.top + b.height / 2
        const dx = x - cx
        const dy = y - cy
        const ok = e.key === 'ArrowRight' ? dx > 4 : e.key === 'ArrowLeft' ? dx < -4 : e.key === 'ArrowDown' ? dy > 4 : dy < -4
        if (!ok) continue
        const primary = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? Math.abs(dx) : Math.abs(dy)
        const secondary = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? Math.abs(dy) : Math.abs(dx)
        const score = primary + secondary * 2.5
        if (score < bestScore) {
          bestScore = score
          best = el
        }
      }
      if (best) {
        e.preventDefault()
        best.focus()
        best.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}

/** Counts active (visible) seconds of a child session and logs them per day. */
export function useSessionTimer(profileId: number | undefined, active: boolean, onTick: (secondsThisSession: number) => void) {
  const seconds = useRef(0)
  const pending = useRef(0)
  const cb = useRef(onTick)
  cb.current = onTick
  useEffect(() => {
    if (!profileId || !active) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      seconds.current++
      pending.current++
      cb.current(seconds.current)
      if (pending.current >= 15) {
        void logSession(profileId, { seconds: pending.current })
        pending.current = 0
      }
    }, 1000)
    return () => {
      clearInterval(id)
      if (pending.current > 0) {
        void logSession(profileId, { seconds: pending.current })
        pending.current = 0
      }
    }
  }, [profileId, active])
  return seconds
}

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> }
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
type KbNav = Navigator & { keyboard?: { lock?: (keys?: string[]) => Promise<void>; unlock?: () => void } }

export function isFullscreen() {
  const d = document as FsDoc
  return !!(d.fullscreenElement ?? d.webkitFullscreenElement)
}

export async function enterFullscreen() {
  const el = document.documentElement as FsEl
  try {
    if (!isFullscreen()) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    }
    // Keyboard Lock (Chromium): Esc then needs a long press to leave fullscreen.
    await (navigator as KbNav).keyboard?.lock?.(['Escape'])
  } catch {
    /* not allowed (iOS Safari etc.) – fine */
  }
}

export async function exitFullscreen() {
  const d = document as FsDoc
  try {
    ;(navigator as KbNav).keyboard?.unlock?.()
    if (d.exitFullscreen) await d.exitFullscreen()
    else if (d.webkitExitFullscreen) await d.webkitExitFullscreen()
  } catch {
    /* ignore */
  }
}
