import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/state/AppContext'

/**
 * Parent gate: hold the button 3 s, then solve a grown-up task (multiplication or holding three dots).
 * Children cannot enter settings or leave the app by accident.
 */
export function ParentHoldButton({ onPass, testId = 'parent-button', label }: { onPass: () => void; testId?: string; label?: string }) {
  const { t } = useApp()
  const [progress, setProgress] = useState(0)
  const [gate, setGate] = useState(false)
  const timer = useRef<number | null>(null)
  const start = useRef(0)

  const stop = () => {
    if (timer.current) cancelAnimationFrame(timer.current)
    timer.current = null
    setProgress(0)
  }
  const begin = () => {
    start.current = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / 3000)
      setProgress(p)
      if (p >= 1) {
        stop()
        setGate(true)
        return
      }
      timer.current = requestAnimationFrame(tick)
    }
    timer.current = requestAnimationFrame(tick)
  }
  useEffect(() => stop, [])

  const C = 2 * Math.PI * 22
  return (
    <>
      <button
        type="button"
        data-testid={testId}
        aria-label={`${label ?? t('parent')} – ${t('parentHold')}`}
        title={t('parentHold')}
        className="relative h-14 w-14 rounded-full bg-white/70 text-stone-600 shadow"
        onPointerDown={(e) => {
          e.preventDefault()
          begin()
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !timer.current) begin()
        }}
        onKeyUp={stop}
      >
        <svg viewBox="0 0 50 50" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="25" cy="25" r="22" fill="none" stroke="#e7d8c3" strokeWidth="4" />
          <circle cx="25" cy="25" r="22" fill="none" stroke="#b3261e" strokeWidth="4" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 24 24" className="relative mx-auto h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z" />
        </svg>
      </button>
      {gate && (
        <GateTask
          onCancel={() => setGate(false)}
          onPass={() => {
            setGate(false)
            onPass()
          }}
        />
      )}
    </>
  )
}

export function GateTask({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const { t } = useApp()
  const [mode] = useState<'math' | 'dots'>(() => (Math.random() < 0.7 ? 'math' : 'dots'))
  const [{ a, b }] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }))
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [held, setHeld] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (held.size === 3) {
      const id = window.setTimeout(onPass, 600)
      return () => clearTimeout(id)
    }
  }, [held, onPass])

  const submit = () => {
    if (Number(answer) === a * b) onPass()
    else {
      setWrong(true)
      setAnswer('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 p-4" role="dialog" aria-modal="true" data-testid="parent-gate">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-stone-800 shadow-2xl">
        <h2 className="mb-3 text-xl font-bold">{t('gateTitle')}</h2>
        {mode === 'math' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <p className="mb-3 text-lg" data-testid="gate-question" data-a={a} data-b={b}>
              {t('gateMath', { a, b })}
            </p>
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              className="mb-3 w-full rounded-xl border-2 border-stone-300 p-3 text-2xl"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
              data-testid="gate-input"
              aria-label={t('gateMath', { a, b })}
            />
            {wrong && <p className="mb-2 text-red-700">{t('gateWrong')}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                {t('cancel')}
              </button>
              <button type="submit" className="btn-primary" data-testid="gate-submit">
                {t('ok')}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-4 text-lg">{t('gateDots')}</p>
            <div className="mb-4 flex justify-around" data-testid="gate-dots">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  data-testid={`gate-dot-${i}`}
                  className={`h-16 w-16 rounded-full transition-colors ${held.has(i) ? 'bg-green-500' : 'bg-stone-300'}`}
                  style={{ touchAction: 'none' }}
                  onPointerDown={() => setHeld((h) => new Set(h).add(i))}
                  onPointerUp={() =>
                    setHeld((h) => {
                      const n = new Set(h)
                      n.delete(i)
                      return n
                    })
                  }
                  onPointerLeave={() =>
                    setHeld((h) => {
                      const n = new Set(h)
                      n.delete(i)
                      return n
                    })
                  }
                />
              ))}
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
