import { Component, type ReactNode } from 'react'

const KEY = 'tatzli-reloaded-at'
/** A part of the app that cannot be loaded (old cached version after an update, network hiccup) → reload once, quietly. */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* storage blocked: still reload */
  }
  window.location.reload()
  return true
}

export function installReloadOnChunkError() {
  if (typeof window === 'undefined') return
  // Vite: a lazily loaded part of the new version is missing → fetch the current version
  window.addEventListener('vite:preloadError', (e) => {
    e.preventDefault()
    reloadOnce()
  })
}

const isChunkError = (e: unknown) => /dynamically imported module|Importing a module script failed|Failed to fetch|Loading chunk|error loading dynamically/i.test(String((e as Error)?.message ?? e))

/** Never a blank screen: a failed screen is reloaded once, otherwise a friendly retry + home button is shown. */
export class ErrorBoundary extends Component<{ children: ReactNode; onHome: () => void; resetKey: string }, { error: unknown }> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) {
    return { error }
  }
  componentDidCatch(error: unknown) {
    console.error('[tatzli] screen failed', error)
    if (isChunkError(error)) reloadOnce()
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center" data-testid="screen-error">
        <div className="text-7xl" aria-hidden>
          🐻
        </div>
        <div className="flex gap-4">
          <button type="button" className="rounded-3xl bg-amber-400 px-8 py-5 text-2xl font-black text-white shadow-lg" onClick={() => window.location.reload()} data-testid="screen-error-reload">
            ↻
          </button>
          <button
            type="button"
            className="rounded-3xl bg-white px-8 py-5 text-2xl font-black shadow-lg"
            onClick={() => {
              this.setState({ error: null })
              this.props.onHome()
            }}
            data-testid="screen-error-home"
          >
            🏠
          </button>
        </div>
      </div>
    )
  }
}
