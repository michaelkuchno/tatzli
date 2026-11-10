import { useEffect, useState } from 'react'

/**
 * Minutes for grown-ups: type any value (the field may be empty while typing), − / + in steps of 5, or tap a preset.
 * The value is applied as soon as it is valid and clamped when the field is left.
 */
export function MinutesInput({ value, onChange, min, max, presets, testId }: { value: number; onChange: (v: number) => void; min: number; max: number; presets: number[]; testId: string }) {
  const [text, setText] = useState(String(value))
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setText(String(value))
  }, [value, editing])
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)))
  const set = (n: number) => {
    const v = clamp(n)
    setText(String(v))
    onChange(v)
  }
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={`${testId}-box`}>
      <button type="button" className="btn-mini !px-4 text-xl" aria-label="−5" onClick={() => set(value - 5)} data-testid={`${testId}-minus`}>
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={3}
        className="input w-24 text-center text-xl font-bold"
        value={text}
        onFocus={(e) => {
          setEditing(true)
          e.target.select()
        }}
        onChange={(e) => {
          const t = e.target.value.replace(/\D/g, '').slice(0, 3)
          setText(t)
          const n = Number(t)
          if (t && n >= min && n <= max) onChange(n)
        }}
        onBlur={() => {
          setEditing(false)
          set(text ? Number(text) : value)
        }}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        data-testid={testId}
        aria-label="min"
      />
      <span className="text-stone-500">min</span>
      <button type="button" className="btn-mini !px-4 text-xl" aria-label="+5" onClick={() => set(value + 5)} data-testid={`${testId}-plus`}>
        +
      </button>
      <span className="flex flex-wrap gap-1">
        {presets.map((p) => (
          <button key={p} type="button" className={`rounded-full px-3 py-1 text-sm font-bold ${p === value ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-700'}`} onClick={() => set(p)} data-testid={`${testId}-${p}`}>
            {p}
          </button>
        ))}
      </span>
    </div>
  )
}
