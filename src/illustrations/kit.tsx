import type { CSSProperties } from 'react'

/** Shared warm, colour-blind-safe-ish palette. */
export const C = {
  ink: '#4a3326',
  inkSoft: '#7a5a46',
  white: '#ffffff',
  cream: '#fff7e8',
  fur: '#b8763e',
  furLight: '#e2b07a',
  furDark: '#8a5428',
  pink: '#f4a3a8',
  cheek: '#f59ca0',
  red: '#e2493b',
  orange: '#f28c28',
  yellow: '#f6c945',
  green: '#5fae4f',
  greenDark: '#3e7f3a',
  blue: '#3f8fd8',
  sky: '#bfe3f7',
  navy: '#2c4a7a',
  purple: '#8e5bbf',
  rose: '#f7a8c8',
  brown: '#8b5a2b',
  grey: '#9aa0a6',
  greyLight: '#d9dde1',
  black: '#2b2b2b',
  water: '#7cc4e8',
  sand: '#f1d9a6',
  leaf: '#7cc36b',
  stone: '#b9b2a7',
  shadow: 'rgba(74,51,38,0.15)',
} as const

/** Standard outline props: round, warm dark ink. */
export const line = (w = 2.2): { stroke: string; strokeWidth: number; strokeLinejoin: 'round'; strokeLinecap: 'round' } => ({
  stroke: C.ink,
  strokeWidth: w,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
})

/** transform-origin helper for animated parts (coordinates in viewBox units). */
export const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' })

/** Soft ground shadow ellipse. */
export function Shadow({ x = 50, y = 92, rx = 30, ry = 4 }: { x?: number; y?: number; rx?: number; ry?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.shadow} />
}

/** Friendly eyes (blink-animated). */
export function Eyes({ x1, x2, y, r = 3.2 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <g className="illu-blink" style={origin((x1 + x2) / 2, y)}>
      <circle cx={x1} cy={y} r={r} fill={C.ink} />
      <circle cx={x2} cy={y} r={r} fill={C.ink} />
      <circle cx={x1 + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={C.white} />
      <circle cx={x2 + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={C.white} />
    </g>
  )
}

export function Cheeks({ x1, x2, y, r = 3 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <g opacity={0.55}>
      <circle cx={x1} cy={y} r={r} fill={C.cheek} />
      <circle cx={x2} cy={y} r={r} fill={C.cheek} />
    </g>
  )
}

export function Smile({ x, y, w = 8 }: { x: number; y: number; w?: number }) {
  return <path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.6} ${x + w / 2} ${y}`} fill="none" {...line(2)} />
}
