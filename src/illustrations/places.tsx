import type { ReactElement, ReactNode } from 'react'
import type { PlaceId, Season } from '@content/types'
import { C, line, origin } from './kit'

/**
 * Place backgrounds (160×90 viewBox). Characters/props are drawn on top by the scene renderer,
 * so every scene keeps a calm, mostly empty ground plane in the lower middle (y 55–85) and keeps
 * important details inside the overscan-safe area (x 8–152, y 5–85).
 */
export const PLACE_IDS: PlaceId[] = [
  'home',
  'kitchen',
  'room',
  'garden',
  'quarry',
  'bus',
  'zytglogge',
  'baerepark',
  'aare',
  'gurten',
  'zoo',
  'market',
  'chindsgi',
  'school',
  'playground',
]

export type PlaceTime = 'day' | 'evening' | 'night'

/* ------------------------------------------------------------------------------------------ */
/* Shared helpers                                                                              */
/* ------------------------------------------------------------------------------------------ */

/** Softer outline colour for backgrounds, so foreground characters pop. */
const SOFT = '#8a6a55'
const ol = (w = 1.3) => ({ ...line(w), stroke: SOFT })

/** Linear mix of two #rrggbb colours (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ca = [(pa >> 16) & 255, (pa >> 8) & 255, pa & 255]
  const cb = [(pb >> 16) & 255, (pb >> 8) & 255, pb & 255]
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

/** Deterministic pseudo-random numbers (stable between renders / SSR). */
const RND: number[] = (() => {
  let s = 11
  return Array.from({ length: 120 }, () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  })
})()

interface Pal {
  grass: string
  grassDark: string
  grassLight: string
  leaf: string
  leafDark: string
  leafLight: string
  hill: string
  hillFar: string
  bloom: string
}

const PALS: Record<Season, Pal> = {
  spring: {
    grass: '#b7e095', grassDark: '#9cce7b', grassLight: '#cfeab0',
    leaf: '#a9db84', leafDark: '#88c468', leafLight: '#c9eba6',
    hill: '#c2e4a2', hillFar: '#d5ecc6', bloom: '#f7b3cd',
  },
  summer: {
    grass: '#a2d47e', grassDark: '#86c065', grassLight: '#bde29f',
    leaf: '#73bd5d', leafDark: '#58a24a', leafLight: '#97d27e',
    hill: '#acd98d', hillFar: '#c6e5b9', bloom: '#e2493b',
  },
  autumn: {
    grass: '#cbd58e', grassDark: '#b4c174', grassLight: '#dde4ab',
    leaf: '#f3a540', leafDark: '#e27a36', leafLight: '#f8c66c',
    hill: '#d9d394', hillFar: '#e6e0b8', bloom: '#e2493b',
  },
  winter: {
    grass: '#f3f7fa', grassDark: '#dde8f0', grassLight: '#ffffff',
    leaf: '#78a78a', leafDark: '#5f8f73', leafLight: '#9cc2a8',
    hill: '#e9f0f5', hillFar: '#dbe6ee', bloom: '#e2493b',
  },
}

const SKY: Record<PlaceTime, Record<Season, [string, string]>> = {
  day: {
    spring: ['#c6eafa', '#e6f6fc'],
    summer: ['#a9dcf6', '#d8f1fb'],
    autumn: ['#c9dfea', '#e8f0f2'],
    winter: ['#d3e4ef', '#eef4f8'],
  },
  evening: {
    spring: ['#f5b48b', '#fcdcae'],
    summer: ['#f6ad7f', '#fdd8a6'],
    autumn: ['#efa77f', '#f9d4a8'],
    winter: ['#e9b2a0', '#f6d6bf'],
  },
  night: {
    spring: ['#2c3f6e', '#3d5387'],
    summer: ['#2c3f6e', '#3d5387'],
    autumn: ['#2a3a66', '#3a4e80'],
    winter: ['#2a3c6a', '#3e5488'],
  },
}

interface Ctx {
  season: Season
  time: PlaceTime
  p: Pal
  winter: boolean
  night: boolean
  sky: string
  skyLow: string
  /** lit windows, drawn above the night tint */
  lights: ReactNode[]
}

const WIN_DAY = '#d8eef8'
const WIN_LIT = '#ffd86e'
const TRUNK = '#a8774a'
const SNOW = '#ffffff'
const SNOW_EDGE = '#c9d8e4'

/** A window pane; at night it is also queued as a warm lit window above the tint. */
function win(c: Ctx, x: number, y: number, w: number, h: number, r = 0.8, bars = true): ReactNode {
  const k = `${x}-${y}`
  if (c.night) {
    c.lights.push(
      <g key={`l${k}-${c.lights.length}`}>
        <rect x={x} y={y} width={w} height={h} rx={r} fill={WIN_LIT} {...ol(0.8)} />
        {bars && <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke="#e8b54a" strokeWidth={0.6} />}
      </g>,
    )
  }
  return (
    <g key={`w${k}`}>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={WIN_DAY} {...ol(0.8)} />
      {bars && <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke={SOFT} strokeWidth={0.6} />}
    </g>
  )
}

/** Outline-union of circles: stroked pass underneath, fill pass on top (no inner seams). */
function blob(circles: [number, number, number][], fill: string, w = 1.3, hl?: [number, number, number, string]): ReactNode {
  return (
    <g>
      <g {...ol(w * 2)} fill={fill}>
        {circles.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      <g fill={fill}>
        {circles.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      {hl && <circle cx={hl[0]} cy={hl[1]} r={hl[2]} fill={hl[3]} />}
    </g>
  )
}

function rrPath(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`
}

/** Snow cap on a triangular roof given apex and the two eave corners. */
function roofSnow(ax: number, ay: number, lx: number, ly: number, rx: number, ry: number, f = 0.42): ReactNode {
  const L = [ax + (lx - ax) * f, ay + (ly - ay) * f]
  const R = [ax + (rx - ax) * f, ay + (ry - ay) * f]
  const n = 4
  let d = `M${L[0]} ${L[1]} L${ax} ${ay} L${R[0]} ${R[1]}`
  for (let i = 1; i <= n; i++) {
    const x = R[0] + ((L[0] - R[0]) * i) / n
    const y = R[1] + ((L[1] - R[1]) * i) / n
    const mx = R[0] + ((L[0] - R[0]) * (i - 0.5)) / n
    const my = R[1] + ((L[1] - R[1]) * (i - 0.5)) / n
    d += ` Q${mx} ${my + (i % 2 ? 2.2 : 1.2)} ${x} ${y}`
  }
  return <path d={d + 'Z'} fill={SNOW} {...ol(0.9)} />
}

/** Flat-roof / ledge snow strip. */
function snowStrip(x: number, y: number, w: number, h = 1.8): ReactNode {
  const n = Math.max(2, Math.round(w / 6))
  let d = `M${x} ${y} H${x + w}`
  for (let i = 1; i <= n; i++) {
    const xe = x + w - (w * i) / n
    d += ` Q${x + w - (w * (i - 0.5)) / n} ${y + h + (i % 2 ? 1 : 0)} ${xe} ${y + (i === n ? 0 : h * 0.5)}`
  }
  return <path d={d + 'Z'} fill={SNOW} {...ol(0.7)} />
}

function tree(c: Ctx, x: number, y: number, s = 1, kind: 'round' | 'fir' = 'round', fruit = false): ReactNode {
  const key = `t${x}-${y}`
  if (kind === 'fir') {
    const g = c.winter ? '#6f9c84' : c.season === 'spring' ? '#6db47a' : '#5ea26c'
    const tiers = [0, 1, 2]
    return (
      <g key={key}>
        <rect x={x - 1.3 * s} y={y - 5 * s} width={2.6 * s} height={5 * s} fill={TRUNK} {...ol(1)} />
        {tiers.map((i) => {
          const by = y - 4 * s - i * 6.5 * s
          const hw = (9 - i * 2.3) * s
          const ay = by - 11 * s
          return (
            <g key={i}>
              <path d={`M${x - hw} ${by} Q${x} ${by + 2 * s} ${x + hw} ${by} L${x} ${ay} Z`} fill={g} {...ol(1.2)} />
              {c.winter && roofSnow(x, ay + 0.6, x - hw, by, x + hw, by, 0.45)}
            </g>
          )
        })}
      </g>
    )
  }
  const fy = y - 17 * s
  const crown: [number, number, number][] = [
    [x, fy, 8 * s],
    [x - 6.5 * s, fy + 4 * s, 6 * s],
    [x + 6.5 * s, fy + 4 * s, 6 * s],
  ]
  if (c.winter) {
    const br = `M${x} ${y - 10 * s} L${x - 6 * s} ${y - 19 * s} M${x - 3.5 * s} ${y - 15 * s} L${x - 8 * s} ${y - 15 * s} M${x} ${y - 11 * s} L${x + 6 * s} ${y - 21 * s} M${x + 3.5 * s} ${y - 15 * s} L${x + 8.5 * s} ${y - 16 * s} M${x} ${y - 11 * s} L${x} ${y - 24 * s}`
    return (
      <g key={key}>
        <path d={br} fill="none" {...ol(2.6 * s)} />
        <path d={br} fill="none" stroke={TRUNK} strokeWidth={1.4 * s} strokeLinecap="round" />
        <path d={`M${x - 1.6 * s} ${y} L${x - 1 * s} ${y - 12 * s} H${x + 1 * s} L${x + 1.6 * s} ${y} Z`} fill={TRUNK} {...ol(1)} />
        {[
          [x - 6, y - 19.3],
          [x + 6, y - 21.3],
          [x, y - 24.3],
          [x - 8, y - 15.3],
          [x + 8.5, y - 16.3],
        ].map(([sx, sy], i) => (
          <ellipse key={i} cx={x + (sx - x) * s} cy={y + (sy - y) * s} rx={1.6 * s} ry={0.9 * s} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.4} />
        ))}
      </g>
    )
  }
  const dots: [number, number][] = [
    [-4, -3], [3, -5], [6, 2], [-7, 4], [0, 2], [-2, -8], [8, 6], [-4, 8],
  ]
  return (
    <g key={key}>
      <path d={`M${x - 1.8 * s} ${y} L${x - 1.2 * s} ${y - 12 * s} H${x + 1.2 * s} L${x + 1.8 * s} ${y} Z`} fill={TRUNK} {...ol(1)} />
      {blob(crown, c.p.leaf, 0.65, [x - 3 * s, fy - 2.5 * s, 3.2 * s, c.p.leafLight])}
      {c.season === 'spring' &&
        dots.map(([dx, dy], i) => <circle key={i} cx={x + dx * s} cy={fy + dy * s} r={1.2 * s} fill={i % 3 ? C.rose : C.white} />)}
      {c.season === 'autumn' &&
        dots.slice(0, 6).map(([dx, dy], i) => <circle key={i} cx={x + dx * s} cy={fy + dy * s} r={1.3 * s} fill={i % 2 ? '#e2703b' : '#f6c945'} />)}
      {fruit &&
        (c.season === 'summer' || c.season === 'autumn') &&
        dots.slice(0, 5).map(([dx, dy], i) => <circle key={`f${i}`} cx={x + dx * s * 0.9 + 1} cy={fy + dy * s * 0.9 + 1} r={1.5 * s} fill={C.red} {...ol(0.5)} />)}
    </g>
  )
}

function bush(c: Ctx, x: number, y: number, s = 1): ReactNode {
  const circles: [number, number, number][] = [
    [x - 5 * s, y - 3.2 * s, 4.2 * s],
    [x, y - 5 * s, 5.2 * s],
    [x + 5 * s, y - 3.2 * s, 4.2 * s],
  ]
  return (
    <g key={`b${x}-${y}`}>
      {blob(circles, c.winter ? SNOW : c.p.leafDark, 0.6, c.winter ? undefined : [x - 1.5 * s, y - 7 * s, 2 * s, c.p.leaf])}
      {c.winter && <path d={`M${x - 8 * s} ${y} H${x + 8 * s}`} {...ol(0.8)} />}
      {c.season === 'spring' && [[-4, -4], [1, -7], [5, -3], [-1, -3]].map(([dx, dy], i) => <circle key={i} cx={x + dx * s} cy={y + dy * s} r={0.9 * s} fill={i % 2 ? '#fff4a8' : C.rose} />)}
    </g>
  )
}

/** Little ground flora for edges of the ground plane. */
function flora(c: Ctx, pts: [number, number][]): ReactNode {
  return (
    <g>
      {pts.map(([x, y], i) => {
        if (c.season === 'spring') {
          const col = [C.rose, C.yellow, '#f28b8b'][i % 3]
          return (
            <g key={i}>
              <path d={`M${x} ${y} V${y - 4}`} stroke={C.greenDark} strokeWidth={0.6} />
              <path d={`M${x - 1.3} ${y - 4} Q${x - 1.3} ${y - 6.5} ${x} ${y - 6} Q${x + 1.3} ${y - 6.5} ${x + 1.3} ${y - 4} Q${x} ${y - 2.8} ${x - 1.3} ${y - 4}Z`} fill={col} {...ol(0.5)} />
            </g>
          )
        }
        if (c.season === 'summer') {
          return (
            <g key={i}>
              <path d={`M${x} ${y} V${y - 3}`} stroke={C.greenDark} strokeWidth={0.6} />
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 1.2} cy={y - 4 + Math.sin((a * Math.PI) / 180) * 1.2} r={0.8} fill={C.white} />
              ))}
              <circle cx={x} cy={y - 4} r={0.7} fill={C.yellow} />
            </g>
          )
        }
        if (c.season === 'autumn') {
          return <path key={i} d={`M${x - 1.6} ${y - 1} Q${x} ${y - 3} ${x + 1.6} ${y - 1} Q${x} ${y + 0.6} ${x - 1.6} ${y - 1}Z`} fill={i % 2 ? '#e2703b' : '#f3a540'} {...ol(0.4)} />
        }
        return <ellipse key={i} cx={x} cy={y - 0.6} rx={2.4} ry={1.1} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.4} />
      })}
    </g>
  )
}

function cloud(x: number, y: number, s: number, fill: string, i: number): ReactNode {
  return (
    <g key={`c${i}`} className="illu-bob" style={{ ...origin(x, y), animationDelay: `${i * 0.37}s`, animationDuration: '3.2s' }}>
      {blob(
        [
          [x - 6 * s, y + 1 * s, 4 * s],
          [x, y - 1.5 * s, 5.5 * s],
          [x + 6 * s, y + 1 * s, 4 * s],
          [x + 2 * s, y + 2 * s, 4 * s],
        ],
        fill,
        0.5,
      )}
    </g>
  )
}

interface SkyOpts {
  sun?: [number, number]
  clouds?: [number, number, number][]
}

function skyBase(c: Ctx): ReactNode {
  return (
    <g>
      <rect x={0} y={0} width={160} height={90} fill={c.sky} />
      <ellipse cx={80} cy={62} rx={120} ry={34} fill={c.skyLow} />
    </g>
  )
}

const STARS: [number, number][] = [
  [14, 8], [30, 16], [46, 6], [60, 13], [92, 7], [108, 15], [118, 6], [150, 22], [70, 22], [22, 26],
]

function skyTop(c: Ctx, o: SkyOpts = {}): ReactNode {
  const [sx, sy] = o.sun ?? [134, 15]
  const clouds = o.clouds ?? [
    [28, 13, 1],
    [98, 9, 0.8],
  ]
  if (c.night) {
    return (
      <g>
        <circle cx={sx} cy={sy} r={5.5} fill="#fff1bf" />
        <circle cx={sx + 2.6} cy={sy - 1.8} r={4.6} fill={c.sky} />
        {STARS.map(([x, y], i) => (
          <path
            key={i}
            className="illu-twinkle"
            style={{ ...origin(x, y), animationDelay: `${(i % 4) * 0.25}s` }}
            d={`M${x} ${y - 1.4} Q${x} ${y} ${x + 1.4} ${y} Q${x} ${y} ${x} ${y + 1.4} Q${x} ${y} ${x - 1.4} ${y} Q${x} ${y} ${x} ${y - 1.4}Z`}
            fill="#fff6cf"
          />
        ))}
      </g>
    )
  }
  const evening = c.time === 'evening'
  const sunCol = evening ? '#f79a4b' : c.winter ? '#ffe6a0' : '#ffd456'
  const r = evening ? 7.5 : c.season === 'summer' ? 6.5 : 5.5
  const cy = sy
  return (
    <g>
      {!evening && (
        <g stroke={c.winter ? '#f4dc9a' : '#f7c23d'} strokeWidth={1.1} strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4
            return <line key={i} x1={sx + Math.cos(a) * (r + 1.8)} y1={cy + Math.sin(a) * (r + 1.8)} x2={sx + Math.cos(a) * (r + 3.6)} y2={cy + Math.sin(a) * (r + 3.6)} />
          })}
        </g>
      )}
      <circle cx={sx} cy={cy} r={r} fill={sunCol} />
      <circle cx={sx - r * 0.35} cy={cy - r * 0.35} r={r * 0.35} fill={evening ? '#fbb874' : '#ffe58f'} />
      {clouds.map(([x, y, s], i) => cloud(x, y, s, evening ? '#fde3cf' : C.white, i))}
    </g>
  )
}

/** Seasonal weather particles inside an area. */
function weather(c: Ctx, x0 = 8, y0 = 4, x1 = 152, y1 = 58, n = 14): ReactNode {
  const w = x1 - x0
  const h = y1 - y0
  const pts = Array.from({ length: n }, (_, i) => [x0 + RND[i * 2] * w, y0 + RND[i * 2 + 1] * h] as const)
  if (c.season === 'winter') {
    return (
      <g>
        {pts.map(([x, y], i) => (
          <circle key={i} className="illu-twinkle" style={{ ...origin(x, y), animationDelay: `${(i % 5) * 0.2}s` }} cx={x} cy={y} r={i % 3 ? 0.8 : 1.1} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.25} />
        ))}
      </g>
    )
  }
  if (c.season === 'autumn') {
    return (
      <g>
        {pts.slice(0, Math.ceil(n / 2.5)).map(([x, y], i) => (
          <g key={i} className="illu-bob" style={{ ...origin(x, y), animationDelay: `${i * 0.3}s`, animationDuration: '1.6s' }}>
            <path
              d={`M${x - 1.8} ${y} Q${x} ${y - 2} ${x + 1.8} ${y} Q${x} ${y + 2} ${x - 1.8} ${y}Z`}
              transform={`rotate(${i * 47} ${x} ${y})`}
              fill={i % 2 ? '#e2703b' : '#f3a540'}
              {...ol(0.4)}
            />
          </g>
        ))}
      </g>
    )
  }
  if (c.season === 'spring') {
    return (
      <g>
        {pts.slice(0, Math.ceil(n / 3)).map(([x, y], i) => (
          <ellipse key={i} className="illu-bob" style={{ ...origin(x, y), animationDelay: `${i * 0.3}s`, animationDuration: '2s' }} cx={x} cy={y} rx={1} ry={0.6} fill={C.rose} transform={`rotate(${i * 40} ${x} ${y})`} />
        ))}
      </g>
    )
  }
  return null
}

/** Summer/spring birds far in the sky. */
function birds(c: Ctx, pts: [number, number][]): ReactNode {
  if (c.night || c.winter) return null
  return (
    <g fill="none" stroke={SOFT} strokeWidth={0.6} strokeLinecap="round">
      {pts.map(([x, y], i) => (
        <path key={i} className="illu-bob" style={{ ...origin(x, y), animationDelay: `${i * 0.4}s` }} d={`M${x - 2} ${y} Q${x - 1} ${y - 1.2} ${x} ${y} Q${x + 1} ${y - 1.2} ${x + 2} ${y}`} />
      ))}
    </g>
  )
}

function ground(c: Ctx, y: number, fill?: string): ReactNode {
  return <path d={`M0 ${y} Q40 ${y - 2.5} 80 ${y} T160 ${y} V90 H0 Z`} fill={fill ?? c.p.grass} />
}

function hills(c: Ctx, y: number): ReactNode {
  return (
    <g>
      <path d={`M0 ${y} Q28 ${y - 15} 60 ${y - 5} Q96 ${y - 18} 126 ${y - 6} Q146 ${y - 12} 160 ${y - 8} V90 H0 Z`} fill={c.p.hillFar} />
      <path d={`M0 ${y + 4} Q34 ${y - 6} 78 ${y + 2} Q120 ${y - 7} 160 ${y + 2} V90 H0 Z`} fill={c.p.hill} />
    </g>
  )
}

/** Overlay tint for evening/night + lit windows on top. */
function tint(c: Ctx, interior = false): ReactNode {
  if (c.time === 'day') return null
  const night = c.night
  return (
    <g>
      <rect x={0} y={0} width={160} height={90} fill={night ? '#16234e' : '#ff8a3d'} opacity={night ? (interior ? 0.16 : 0.36) : interior ? 0.06 : 0.12} />
      {!interior && c.lights}
    </g>
  )
}

/** Outdoor view through an interior window (drawn within its rectangle only). */
function windowView(c: Ctx, x: number, y: number, w: number, h: number, frame = '#fff7ea'): ReactNode {
  const s = h / 34
  const flakes = Array.from({ length: 6 }, (_, i) => [x + 2 + RND[40 + i * 2] * (w - 4), y + 2 + RND[41 + i * 2] * (h * 0.55)] as const)
  return (
    <g>
      <rect x={x - 1.6} y={y - 1.6} width={w + 3.2} height={h + 3.2} rx={1.5} fill={frame} {...ol(1.3)} />
      <rect x={x} y={y} width={w} height={h} fill={c.sky} />
      {c.night ? (
        <g>
          <circle cx={x + w * 0.74} cy={y + h * 0.24} r={2.6 * s} fill="#fff1bf" />
          <circle cx={x + w * 0.74 + 1.3 * s} cy={y + h * 0.24 - 0.9 * s} r={2.2 * s} fill={c.sky} />
          <circle cx={x + w * 0.25} cy={y + h * 0.18} r={0.6} fill="#fff6cf" />
          <circle cx={x + w * 0.45} cy={y + h * 0.32} r={0.5} fill="#fff6cf" />
        </g>
      ) : (
        <circle cx={x + w * 0.74} cy={y + h * (c.time === 'evening' ? 0.5 : 0.26)} r={3 * s} fill={c.time === 'evening' ? '#f79a4b' : c.winter ? '#ffe6a0' : '#ffd456'} />
      )}
      <path d={`M${x} ${y + h * 0.72} Q${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.62} ${y + h * 0.66} Q${x + w * 0.84} ${y + h * 0.58} ${x + w} ${y + h * 0.64} V${y + h} H${x} Z`} fill={c.p.hillFar} />
      <path d={`M${x} ${y + h * 0.84} Q${x + w * 0.5} ${y + h * 0.72} ${x + w} ${y + h * 0.82} V${y + h} H${x} Z`} fill={c.p.grass} />
      {tree(c, x + w * 0.26, y + h * 0.9, 0.62 * s)}
      {c.winter && flakes.map(([fx, fy], i) => <circle key={i} className="illu-twinkle" style={origin(fx, fy)} cx={fx} cy={fy} r={0.7} fill={SNOW} />)}
      {c.season === 'autumn' && <path d={`M${x + w * 0.6} ${y + h * 0.3} q1.5 -1.5 3 0 q-1.5 1.5 -3 0Z`} fill="#e2703b" className="illu-bob" style={origin(x + w * 0.6, y + h * 0.3)} />}
      {c.night && <rect x={x} y={y} width={w} height={h} fill="#16234e" opacity={0.25} />}
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke={frame} strokeWidth={1.6} />
      <rect x={x} y={y} width={w} height={h} fill="none" {...ol(0.8)} />
      <rect x={x - 3} y={y + h + 1} width={w + 6} height={2.6} rx={1} fill={frame} {...ol(1)} />
    </g>
  )
}

/** Seasonal decoration standing on a surface at (x, y). ~10 units tall. */
function decor(c: Ctx, x: number, y: number): ReactNode {
  if (c.season === 'spring') {
    return (
      <g>
        {[
          [-2.6, '#f28b8b'],
          [0, C.yellow],
          [2.6, C.rose],
        ].map(([dx, col], i) => {
          const fx = x + (dx as number)
          const fy = y - 9 - (i === 1 ? 1.5 : 0)
          return (
            <g key={i}>
              <path d={`M${x} ${y - 4} Q${fx} ${fy + 3} ${fx} ${fy}`} fill="none" stroke={C.greenDark} strokeWidth={0.7} />
              <path d={`M${fx - 1.5} ${fy} Q${fx - 1.6} ${fy - 3} ${fx} ${fy - 2.4} Q${fx + 1.6} ${fy - 3} ${fx + 1.5} ${fy} Q${fx} ${fy + 1.4} ${fx - 1.5} ${fy}Z`} fill={col as string} {...ol(0.5)} />
            </g>
          )
        })}
        <path d={`M${x - 2.6} ${y - 5} H${x + 2.6} L${x + 2} ${y} H${x - 2} Z`} fill="#7fb7e0" {...ol(0.8)} />
      </g>
    )
  }
  if (c.season === 'summer') {
    return (
      <g>
        <path d={`M${x - 3} ${y} Q${x} ${y - 1.5} ${x + 3} ${y} Z`} fill="#9fd0e8" {...ol(0.8)} />
        <path d={`M${x} ${y - 0.8} V${y - 5}`} stroke={SOFT} strokeWidth={1} />
        <circle cx={x} cy={y - 8} r={4.2} fill="#e6f5fb" {...ol(0.8)} />
        <g className="illu-spin" style={origin(x, y - 8)}>
          {[0, 120, 240].map((a) => (
            <ellipse key={a} cx={x} cy={y - 10} rx={1.2} ry={2} fill="#7fc6e4" transform={`rotate(${a} ${x} ${y - 8})`} />
          ))}
        </g>
        <circle cx={x} cy={y - 8} r={0.8} fill={C.yellow} />
      </g>
    )
  }
  if (c.season === 'autumn') {
    return (
      <g>
        <path d={`M${x} ${y - 5.5} q0.4 -2 1.8 -2.4`} fill="none" stroke={C.greenDark} strokeWidth={0.9} strokeLinecap="round" />
        {blob(
          [
            [x - 2.4, y - 2.8, 2.8],
            [x + 2.4, y - 2.8, 2.8],
            [x, y - 3, 3],
          ],
          C.orange,
          0.45,
        )}
        <path d={`M${x} ${y - 5.6} V${y - 0.6} M${x - 2.4} ${y - 5} Q${x - 3.6} ${y - 3} ${x - 2.4} ${y - 0.4} M${x + 2.4} ${y - 5} Q${x + 3.6} ${y - 3} ${x + 2.4} ${y - 0.4}`} fill="none" stroke="#d9741f" strokeWidth={0.5} />
        <path d={`M${x + 5} ${y - 0.4} Q${x + 6.5} ${y - 3} ${x + 8} ${y - 0.4} Q${x + 6.5} ${y + 0.4} ${x + 5} ${y - 0.4}Z`} fill="#e2703b" {...ol(0.4)} />
      </g>
    )
  }
  return (
    <g>
      <path d={`M${x - 6} ${y - 0.5} Q${x - 3} ${y - 4} ${x - 7} ${y - 6} M${x + 5} ${y - 0.5} Q${x + 3} ${y - 4} ${x + 7} ${y - 5}`} fill="none" stroke="#5f8f73" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={x - 4.5} cy={y - 2} r={0.8} fill={C.red} />
      <rect x={x - 1.4} y={y - 7} width={2.8} height={6.5} rx={0.6} fill={C.cream} {...ol(0.7)} />
      <path d={`M${x - 3} ${y} H${x + 3}`} {...ol(1.4)} />
      <path className="illu-twinkle" style={origin(x, y - 8.5)} d={`M${x} ${y - 10.6} Q${x + 1.2} ${y - 8.6} ${x} ${y - 7.4} Q${x - 1.2} ${y - 8.6} ${x} ${y - 10.6}Z`} fill={C.orange} />
    </g>
  )
}

/** Simple house with pitched roof, used in panoramas. */
function smallHouse(c: Ctx, x: number, base: number, w: number, h: number, wall: string, roof: string): ReactNode {
  const top = base - h
  return (
    <g key={`h${x}-${base}`}>
      <rect x={x} y={top} width={w} height={h} fill={wall} {...ol(1)} />
      <path d={`M${x - 1.5} ${top + 0.5} L${x + w / 2} ${top - w * 0.42} L${x + w + 1.5} ${top + 0.5} Z`} fill={roof} {...ol(1)} />
      {c.winter && roofSnow(x + w / 2, top - w * 0.42, x - 1.5, top + 0.5, x + w + 1.5, top + 0.5, 0.5)}
      {win(c, x + w * 0.2, top + h * 0.25, w * 0.22, h * 0.28, 0.4, false)}
      {win(c, x + w * 0.58, top + h * 0.25, w * 0.22, h * 0.28, 0.4, false)}
    </g>
  )
}

/** Old-town facade with arcade at street level (Bern style). */
function oldTownHouse(c: Ctx, x: number, w: number, top: number, base: number, wall: string, roof: string, arches: number, flowers = true): ReactNode {
  const arcTop = base - 14
  const aw = w / arches
  const floors = Math.max(1, Math.floor((arcTop - top - 3) / 9))
  const boxCol = c.winter ? '#5f8f73' : c.season === 'autumn' ? '#e2703b' : c.season === 'spring' ? C.rose : C.red
  return (
    <g key={`o${x}`}>
      <path d={`M${x - 1} ${top + 0.5} L${x + 3} ${top - 6} H${x + w - 3} L${x + w + 1} ${top + 0.5} Z`} fill={roof} {...ol(1.1)} />
      {c.winter && snowStrip(x + 2.6, top - 6, w - 5.2, 1.6)}
      <rect x={x} y={top} width={w} height={base - top} fill={wall} {...ol(1.1)} />
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: arches }, (_, i) => {
          const wx = x + i * aw + aw / 2 - 2.4
          const wy = top + 3 + f * 9
          return (
            <g key={`${f}-${i}`}>
              {win(c, wx, wy, 4.8, 6, 0.6)}
              {flowers && f === floors - 1 && <rect x={wx - 0.6} y={wy + 6} width={6} height={1.6} rx={0.6} fill={boxCol} {...ol(0.5)} />}
            </g>
          )
        }),
      )}
      <path d={`M${x} ${arcTop - 0.8} H${x + w}`} stroke={SOFT} strokeWidth={0.6} />
      {Array.from({ length: arches }, (_, i) => {
        const ax = x + i * aw + 1.6
        const r = aw / 2 - 1.6
        return <path key={`a${i}`} d={`M${ax} ${base} V${arcTop + r} A${r} ${r} 0 0 1 ${ax + 2 * r} ${arcTop + r} V${base} Z`} fill={mix(wall, '#6b4a33', 0.38)} {...ol(0.8)} />
      })}
    </g>
  )
}

function flag(x: number, y: number, i = 0): ReactNode {
  return (
    <g key={`fl${x}`}>
      <path d={`M${x} ${y} V${y - 9}`} stroke={SOFT} strokeWidth={0.8} strokeLinecap="round" />
      <g className="illu-wag" style={{ ...origin(x, y - 8), animationDelay: `${i * 0.2}s`, animationDuration: '1.4s' }}>
        <path d={`M${x} ${y - 9} Q${x + 3.5} ${y - 10} ${x + 7} ${y - 9} V${y - 4.6} Q${x + 3.5} ${y - 5.6} ${x} ${y - 4.6} Z`} fill={C.red} {...ol(0.7)} />
        <path d={`M${x + 0.6} ${y - 5.2} L${x + 6.4} ${y - 8.4}`} stroke={C.yellow} strokeWidth={1.3} />
      </g>
    </g>
  )
}

function cobbles(y0: number, fill: string, dot: string): ReactNode {
  const pts = Array.from({ length: 22 }, (_, i) => [8 + RND[60 + i] * 144, y0 + 3 + RND[82 + i] * (86 - y0)] as const)
  return (
    <g>
      <rect x={0} y={y0} width={160} height={90 - y0} fill={fill} />
      {pts.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.8} ry={0.8} fill={dot} />
      ))}
    </g>
  )
}

/** Interior shell: wall, floor, baseboard. */
function interior(wall: string, floor: string, floorY: number, plank?: string): ReactNode {
  return (
    <g>
      <rect x={0} y={0} width={160} height={90} fill={wall} />
      <rect x={0} y={floorY} width={160} height={90 - floorY} fill={floor} />
      {plank && (
        <g stroke={plank} strokeWidth={0.6}>
          {[floorY + 7, floorY + 16].map((y) => (
            <line key={y} x1={0} y1={y} x2={160} y2={y} />
          ))}
          {[22, 64, 110, 146].map((x, i) => (
            <line key={x} x1={x} y1={i % 2 ? floorY : floorY + 7} x2={x} y2={i % 2 ? floorY + 7 : floorY + 16} />
          ))}
        </g>
      )}
      <rect x={0} y={floorY - 1.6} width={160} height={2.2} fill={mix(wall, '#ffffff', 0.5)} {...ol(0.6)} />
    </g>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Places                                                                                      */
/* ------------------------------------------------------------------------------------------ */

function outdoor(c: Ctx, scene: ReactNode, sky: SkyOpts = {}, fx = true): ReactNode {
  return (
    <>
      {scene}
      {tint(c)}
      {skyTop(c, sky)}
      {fx && weather(c)}
    </>
  )
}

function Home(c: Ctx): ReactNode {
  const wall = '#fbe3bf'
  const roof = '#d9674e'
  const box = c.winter ? '#5f8f73' : c.season === 'autumn' ? C.orange : c.season === 'spring' ? C.rose : C.red
  const pickets = Array.from({ length: 13 }, (_, i) => 72 + i * 6.4)
  const smoke = c.winter || c.season === 'autumn' || c.time !== 'day'
  if (c.night) c.lights.push(<circle key="attic" cx={40} cy={21} r={3} fill={WIN_LIT} {...ol(0.9)} />)
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {hills(c, 48)}
      {tree(c, 142, 51, 1.35, 'fir')}
      {tree(c, 118, 50, 1.15)}
      {ground(c, 54)}
      {bush(c, 96, 50, 0.9)}
      {/* fence */}
      <g>
        <rect x={68} y={45} width={86} height={1.8} rx={0.8} fill="#e6b980" {...ol(0.7)} />
        <rect x={68} y={50} width={86} height={1.8} rx={0.8} fill="#e6b980" {...ol(0.7)} />
        {pickets.map((x) => (
          <g key={x}>
            <path d={`M${x} 56 V44 L${x + 1.7} 41.6 L${x + 3.4} 44 V56 Z`} fill="#f0c98f" {...ol(0.8)} />
            {c.winter && <ellipse cx={x + 1.7} cy={42.2} rx={1.9} ry={0.9} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.4} />}
          </g>
        ))}
      </g>
      {/* house */}
      <rect x={51} y={10} width={6} height={12} fill="#c98a6b" {...ol(1.1)} />
      {smoke && (
        <g fill="#eef0f2" opacity={0.85}>
          <circle className="illu-bob" style={origin(55, 7)} cx={55} cy={7} r={2} />
          <circle className="illu-bob" style={{ ...origin(58, 4), animationDelay: '0.3s' }} cx={58.5} cy={4.5} r={1.6} />
        </g>
      )}
      <rect x={18} y={27} width={44} height={31} fill={wall} {...ol(1.4)} />
      <path d={`M11 29.5 L40 8.5 L69 29.5 Q40 26.5 11 29.5 Z`} fill={roof} {...ol(1.4)} />
      {c.winter && roofSnow(40, 8.5, 11, 29.5, 69, 29.5, 0.5)}
      <circle cx={40} cy={21} r={3} fill={WIN_DAY} {...ol(0.9)} />
      {win(c, 22.5, 34, 10, 8.5)}
      {win(c, 47.5, 34, 10, 8.5)}
      <rect x={21.5} y={42.5} width={12} height={2.2} rx={1} fill="#b5764a" {...ol(0.7)} />
      <rect x={46.5} y={42.5} width={12} height={2.2} rx={1} fill="#b5764a" {...ol(0.7)} />
      {[24, 27, 30, 49, 52, 55].map((x, i) => (
        <circle key={x} cx={x + 0.5} cy={42} r={1.2} fill={i % 2 && !c.winter ? C.yellow : box} />
      ))}
      <path d="M35 58 V45.5 Q40 40.5 45 45.5 V58 Z" fill="#6fa86a" {...ol(1.1)} />
      <circle cx={43} cy={51.5} r={0.7} fill={C.yellow} />
      <path d="M33 58.5 H47" {...ol(1.2)} />
      {/* path stones */}
      {[
        [40, 61.5, 3.4],
        [42.5, 66.5, 3.8],
        [40, 72, 4.2],
      ].map(([x, y, r]) => (
        <ellipse key={y} cx={x} cy={y} rx={r} ry={r * 0.42} fill={c.winter ? '#e3ebf1' : '#e7dcc6'} />
      ))}
      {/* mailbox */}
      <path d="M65.6 58 V50" stroke={SOFT} strokeWidth={1} />
      <rect x={62.6} y={46} width={6} height={4.5} rx={1.6} fill={C.yellow} {...ol(0.8)} />
      {flora(c, [
        [10, 80], [14, 83], [7, 85], [150, 79], [146, 83], [153, 85], [24, 62], [30, 61],
      ])}
    </>,
    { sun: [134, 15], clouds: [[96, 12, 1], [150, 7, 0.6]] },
  )
}

function Garden(c: Ctx): ReactNode {
  const pickets = Array.from({ length: 26 }, (_, i) => 1 + i * 6.3)
  const bed = Array.from({ length: 6 }, (_, i) => 56 + i * 7)
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {hills(c, 44)}
      {tree(c, 74, 46, 1, 'fir')}
      {tree(c, 92, 46, 0.9)}
      {ground(c, 52)}
      {/* back fence */}
      <rect x={0} y={42} width={160} height={1.6} fill="#e6b980" {...ol(0.6)} />
      {pickets.map((x) => (
        <path key={x} d={`M${x} 52 V42 L${x + 1.6} 40 L${x + 3.2} 42 V52 Z`} fill="#f0c98f" {...ol(0.7)} />
      ))}
      {c.winter && snowStrip(0, 40, 160, 1.4)}
      {birds(c, [[84, 18], [90, 15]])}
      {/* shed */}
      <rect x={10} y={32} width={24} height={22} fill="#c98a6b" {...ol(1.3)} />
      <path d="M7 33.5 L22 22 L37 33.5 Z" fill="#7f9e6a" {...ol(1.3)} />
      {c.winter && roofSnow(22, 22, 7, 33.5, 37, 33.5, 0.55)}
      <rect x={17} y={40} width={10} height={14} fill="#a86b4f" {...ol(1)} />
      <path d="M17 40 L27 54 M27 40 L17 54" stroke="#8b5a3e" strokeWidth={0.7} />
      {win(c, 28.5, 36, 4, 4, 0.4, false)}
      {/* apple tree */}
      {tree(c, 128, 55, 1.65, 'round', true)}
      {/* veg bed */}
      <rect x={52} y={50} width={44} height={6} rx={2.5} fill={c.winter ? SNOW : '#a87956'} {...ol(1)} />
      {bed.map((x, i) => {
        if (c.winter) return <ellipse key={x} cx={x + 1} cy={50} rx={2.4} ry={1.2} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.4} />
        if (c.season === 'spring') return <path key={x} d={`M${x} 50.5 q-1.2 -2.6 -2.2 -2.4 M${x} 50.5 q1.2 -2.6 2.2 -2.4`} fill="none" stroke={C.green} strokeWidth={0.9} strokeLinecap="round" />
        if (c.season === 'summer')
          return i % 2 ? (
            <g key={x}>
              {blob([[x - 1.6, 49, 2], [x + 1.6, 49, 2], [x, 47.6, 2.2]], '#8fd06a', 0.4)}
            </g>
          ) : (
            <path key={x} d={`M${x} 50 l-1.5 -4 M${x} 50 l0 -4.5 M${x} 50 l1.5 -4`} stroke={C.green} strokeWidth={0.9} strokeLinecap="round" />
          )
        return i % 2 ? (
          <g key={x}>
            {blob([[x - 1.6, 48.4, 2.2], [x + 1.6, 48.4, 2.2], [x, 48.2, 2.4]], C.orange, 0.4)}
            <path d={`M${x} 46 v-1.2`} stroke={C.greenDark} strokeWidth={0.8} />
          </g>
        ) : (
          <path key={x} d={`M${x - 1.5} 50 q1.5 -3 3 0`} fill="none" stroke="#b4a05a" strokeWidth={0.8} />
        )
      })}
      {/* flower strip along the fence */}
      {flora(c, [
        [42, 52], [45, 51.5], [48, 52.5], [102, 52], [105, 51.5], [108, 52.5], [148, 52], [8, 84], [152, 84],
      ])}
      {/* watering can */}
      <g>
        <path d="M140 66 h7 v5 h-7 z" fill={C.blue} {...ol(0.8)} />
        <path d="M140 67 l-4 -3" stroke={C.blue} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M141.5 66 q2 -3 4 0" fill="none" stroke={SOFT} strokeWidth={0.8} />
      </g>
    </>,
    { sun: [60, 13], clouds: [[100, 10, 0.9], [150, 16, 0.6]] },
  )
}

function Quarry(c: Ctx): ReactNode {
  const stone = c.winter ? '#e6d2ad' : '#ebcd92'
  const band = c.winter ? '#d9c39b' : '#dfb878'
  const shade = c.winter ? '#cbb08a' : '#cfa266'
  const pondFill = c.winter ? '#dcecf4' : '#82cfd8'
  const reed = c.winter ? '#c8b89a' : c.season === 'autumn' ? '#c79a4e' : '#6faf5a'
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {/* far forest */}
      <path d="M40 46 Q60 34 80 40 Q100 32 124 44 V60 H40 Z" fill={c.p.hillFar} />
      {tree(c, 70, 44, 0.8, 'fir')}
      {tree(c, 84, 43, 0.95, 'fir')}
      {tree(c, 98, 44, 0.8)}
      <g transform="translate(0 9)">
      {/* left cliff */}
      <path d="M0 14 Q8 12 16 15 Q26 13 34 18 Q44 20 50 30 Q54 42 58 56 H0 Z" fill={stone} {...ol(1.4)} />
      <path d="M0 26 Q20 24 42 28 M0 38 Q24 35 50 40 M0 48 Q28 46 55 50" fill="none" stroke={band} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M12 28 V37 M30 29 V38 M22 40 V47 M40 41 V48 M8 16 V25" stroke={shade} strokeWidth={0.8} strokeLinecap="round" />
      {/* right cliff */}
      <path d="M160 10 Q150 8 140 12 Q128 10 120 18 Q112 26 108 40 Q104 50 102 56 H160 Z" fill={stone} {...ol(1.4)} />
      <path d="M160 22 Q138 20 118 26 M160 34 Q134 32 112 38 M160 46 Q132 44 106 50" fill="none" stroke={band} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M146 24 V33 M128 27 V36 M138 37 V45 M120 40 V48 M152 12 V21" stroke={shade} strokeWidth={0.8} strokeLinecap="round" />
      {c.winter && (
        <>
          <path d="M0 14 Q8 12 16 15 Q26 13 34 18 L32 20 Q26 16 16 18 Q8 15 0 17 Z" fill={SNOW} {...ol(0.8)} />
          <path d="M160 10 Q150 8 140 12 Q128 10 120 18 L122 20 Q130 13 140 15 Q150 11 160 13 Z" fill={SNOW} {...ol(0.8)} />
        </>
      )}
      {/* trees on top of the cliffs */}
      {tree(c, 14, 15.5, 0.75, 'fir')}
      {tree(c, 26, 15, 0.7)}
      {tree(c, 134, 12, 0.7)}
      {tree(c, 147, 10, 0.75, 'fir')}
      </g>
      {/* ground */}
      {ground(c, 55)}
      <path d="M30 90 Q60 70 76 58 Q80 56 86 58 Q96 70 112 90 Z" fill={c.winter ? '#eef3f7' : '#ecd9a9'} opacity={0.75} />
      {/* fallen sandstone blocks */}
      <rect x={6} y={52} width={10} height={6} rx={1.5} fill={stone} {...ol(1)} />
      <rect x={13} y={54} width={8} height={5} rx={1.5} fill={band} {...ol(1)} />
      {c.winter && snowStrip(6, 52, 10, 1.2)}
      {/* pond */}
      <ellipse cx={130} cy={64} rx={20} ry={5.5} fill={pondFill} {...ol(1.2)} />
      {c.winter ? (
        <path d="M118 63 l5 -1.5 M128 66 l7 -2" stroke={C.white} strokeWidth={0.9} strokeLinecap="round" />
      ) : (
        <g stroke="#c9f0f2" strokeWidth={0.8} strokeLinecap="round" fill="none">
          <path className="illu-bob" style={origin(122, 63)} d="M118 63 q2 -1 4 0 q2 1 4 0" />
          <path className="illu-bob" style={{ ...origin(136, 65), animationDelay: '0.4s' }} d="M132 65 q2 -1 4 0 q2 1 4 0" />
        </g>
      )}
      {[111, 113, 115, 147, 149].map((x, i) => (
        <path key={x} d={`M${x} ${64 + (i % 2)} q${i % 2 ? 1 : -1} -4 ${i % 2 ? 0.5 : -0.4} -7`} fill="none" stroke={reed} strokeWidth={0.9} strokeLinecap="round" />
      ))}
      {!c.winter && <ellipse cx={113.2} cy={57.4} rx={0.7} ry={1.6} fill="#8b5a2b" />}
      {flora(c, [
        [26, 70], [22, 75], [148, 80], [152, 76], [8, 82],
      ])}
    </>,
    { sun: [80, 12], clouds: [[52, 10, 0.8], [112, 8, 0.6]] },
  )
}

function ZytgloggeScene(c: Ctx): ReactNode {
  const roof = '#c9654a'
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {/* far roofs behind tower */}
      <path d="M50 30 L56 24 H104 L110 30 Z" fill={mix(roof, c.sky, 0.45)} />
      {/* Zytglogge tower */}
      <rect x={67} y={22} width={26} height={38} fill="#ead2a1" {...ol(1.4)} />
      <rect x={67} y={22} width={26} height={3} fill="#dcbf89" {...ol(0.8)} />
      <path d="M63 23 L80 5.5 L97 23 Z" fill={roof} {...ol(1.4)} />
      {c.winter && roofSnow(80, 5.5, 63, 23, 97, 23, 0.4)}
      <rect x={77.6} y={8} width={4.8} height={5} fill="#ead2a1" {...ol(0.8)} />
      <path d="M76.6 8.6 L80 4.4 L83.4 8.6 Z" fill={roof} {...ol(0.8)} />
      <circle cx={80} cy={4.2} r={1} fill={C.yellow} {...ol(0.5)} />
      {/* clock */}
      <circle cx={80} cy={33} r={6.4} fill={C.yellow} {...ol(1)} />
      <circle cx={80} cy={33} r={5} fill="#3f6fa8" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        return <circle key={i} cx={80 + Math.cos(a) * 4.1} cy={33 + Math.sin(a) * 4.1} r={0.35} fill={C.yellow} />
      })}
      <path d="M80 33 V29.6 M80 33 L82.6 34.2" stroke={C.yellow} strokeWidth={0.9} strokeLinecap="round" />
      {/* astronomical clock window + arch */}
      {win(c, 76.5, 41.5, 7, 4.5, 2, false)}
      <path d="M73.5 60 V52 A6.5 6.5 0 0 1 86.5 52 V60 Z" fill="#a78560" {...ol(1)} />
      {/* left row */}
      {oldTownHouse(c, 0, 30, 18, 60, '#eedcb6', '#c15f45', 2)}
      {oldTownHouse(c, 30, 30, 24, 60, '#e4d0a4', roof, 2)}
      {/* right row */}
      {oldTownHouse(c, 96, 32, 23, 60, '#e9d5ab', '#b85a44', 2)}
      {oldTownHouse(c, 128, 32, 17, 60, '#f0dfbc', roof, 2)}
      {flag(9, 12, 0)}
      {flag(140, 11, 2)}
      {/* street */}
      {cobbles(60, c.winter ? '#eef2f5' : '#e3d6bd', c.winter ? '#dde6ed' : '#d6c6a7')}
      <path d="M0 60 H160" {...ol(1)} />
      {/* fountain-free central lane hint */}
      <path d="M80 62 Q79 74 78 88" fill="none" stroke={c.winter ? '#dbe6ee' : '#d8c8aa'} strokeWidth={2.2} strokeLinecap="round" />
      {c.winter &&
        [14, 44, 112, 144].map((x, i) => (
          <circle key={x} className="illu-twinkle" style={{ ...origin(x, 44), animationDelay: `${i * 0.3}s` }} cx={x} cy={44} r={0.9} fill={C.yellow} />
        ))}
    </>,
    { sun: [118, 10], clouds: [[24, 9, 0.8], [146, 8, 0.6]] },
  )
}

function Baerepark(c: Ctx): ReactNode {
  const river = c.winter ? '#8fc9d6' : '#62c7c9'
  const rock = c.winter ? '#cfd4d8' : '#bdb3a6'
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {/* far bank: old town */}
      <path d="M0 40 V34 H160 V40 Z" fill={c.p.hillFar} />
      {[
        [4, 12, 8, '#efdcb6'], [16, 10, 10, '#e4cfa3'], [26, 12, 7, '#eedcb6'], [38, 9, 11, '#f0e1c0'], [47, 12, 8, '#e4cfa3'],
        [62, 11, 9, '#ead6ad'], [100, 12, 9, '#eedcb6'], [112, 10, 7, '#e4cfa3'], [122, 13, 10, '#f0e1c0'], [135, 10, 8, '#ead6ad'], [145, 12, 9, '#eedcb6'],
      ].map(([x, w, h, col]) => smallHouse(c, x as number, 38, w as number, h as number, col as string, '#c9654a'))}
      {/* Nydegg church spire */}
      <rect x={78} y={20} width={8} height={18} fill="#e8d3a6" {...ol(1)} />
      <path d="M76.5 21 L82 8 L87.5 21 Z" fill="#7f9e8f" {...ol(1)} />
      {c.winter && roofSnow(82, 8, 76.5, 21, 87.5, 21, 0.35)}
      {win(c, 80.5, 25, 3, 5, 1.5, false)}
      {/* river */}
      <rect x={0} y={38} width={160} height={9} fill={river} />
      <g stroke={c.winter ? '#d9eef3' : '#b8eeee'} strokeWidth={0.8} strokeLinecap="round" fill="none">
        {[12, 52, 92, 132].map((x, i) => (
          <path key={x} className="illu-bob" style={{ ...origin(x, 42), animationDelay: `${i * 0.3}s`, animationDuration: '1.8s' }} d={`M${x} ${41 + (i % 2) * 2} q2 -1 4 0 q2 1 4 0`} />
        ))}
      </g>
      {/* near slope */}
      <path d="M0 44 Q40 46 80 48 T160 52 V90 H0 Z" fill={c.p.grassDark} />
      <path d="M0 50 Q50 50 90 54 T160 58 V90 H0 Z" fill={c.p.grass} />
      {/* climbing tree (bear enclosure) */}
      <path d="M22 60 L24 30 M24 40 L16 32 M24 36 L32 27 M23.5 48 L31 42" fill="none" {...ol(4.6)} />
      <path d="M22 60 L24 30 M24 40 L16 32 M24 36 L32 27 M23.5 48 L31 42" fill="none" stroke="#c9b49a" strokeWidth={2.8} strokeLinecap="round" />
      {c.winter && (
        <>
          <ellipse cx={16} cy={31.5} rx={1.8} ry={0.9} fill={SNOW} />
          <ellipse cx={32} cy={26.5} rx={1.8} ry={0.9} fill={SNOW} />
          <ellipse cx={24} cy={29.5} rx={1.6} ry={0.8} fill={SNOW} />
        </>
      )}
      {tree(c, 44, 54, 1.1)}
      {/* rocks with a cave */}
      <path d="M112 59 Q111 49 120 47 Q124 40 133 40 Q143 39 147 46 Q155 48 155 59 Z" fill={rock} {...ol(1.2)} />
      <path d="M120 47 Q126 49 128 54 M147 46 Q142 49 141 53" fill="none" stroke={mix(rock, '#6b4a33', 0.25)} strokeWidth={0.8} strokeLinecap="round" />
      <ellipse cx={131} cy={44} rx={4} ry={1.8} fill={mix(rock, '#ffffff', 0.35)} />
      <path d="M130 59 V55 A4.5 4.5 0 0 1 139 55 V59 Z" fill="#7b6a5a" {...ol(0.8)} />
      {c.winter && (
        <path d="M120 47 Q124 40 133 40 Q143 39 147 46 Q141 44.5 137 45.5 Q132 43.5 127 46 Q123 45 120 47 Z" fill={SNOW} {...ol(0.6)} />
      )}
      {bush(c, 100, 56, 0.9)}
      {flora(c, [
        [10, 80], [14, 84], [150, 82], [146, 78], [64, 60],
      ])}
    </>,
    { sun: [118, 12], clouds: [[36, 10, 0.9], [150, 18, 0.5]] },
  )
}

function AareScene(c: Ctx): ReactNode {
  const river = c.winter ? '#8fcfd8' : '#5ccbca'
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {birds(c, [[96, 14], [103, 17]])}
      {/* skyline */}
      <path d="M0 44 Q30 36 60 40 Q100 34 160 42 V60 H0 Z" fill={c.p.hill} />
      {/* Münster */}
      <rect x={44} y={20} width={10} height={22} fill="#d9caa6" {...ol(1.1)} />
      <rect x={45.5} y={13} width={7} height={8} fill="#d9caa6" {...ol(1)} />
      <path d="M45 13.5 L49 5.5 L53 13.5 Z" fill="#a9b7a6" {...ol(1)} />
      {c.winter && roofSnow(49, 5.5, 45, 13.5, 53, 13.5, 0.4)}
      <rect x={30} y={28} width={16} height={12} fill="#d9caa6" {...ol(1)} />
      <path d="M29 28.5 L33 23 H44 L47 28.5 Z" fill="#b85a44" {...ol(1)} />
      {win(c, 47.3, 26, 3.4, 6, 1.7, false)}
      {/* old-town houses */}
      {[
        [8, 10, 10, '#efdcb6'], [19, 10, 8, '#e4cfa3'], [56, 10, 9, '#efdcb6'], [67, 11, 11, '#e9d5ab'], [79, 9, 8, '#f0e1c0'],
        [126, 10, 9, '#e4cfa3'], [137, 11, 10, '#efdcb6'], [149, 9, 8, '#e9d5ab'],
      ].map(([x, w, h, col]) => smallHouse(c, x as number, 42, w as number, h as number, col as string, '#c9654a'))}
      {/* Federal-palace-like domed building */}
      <rect x={92} y={28} width={32} height={14} fill="#e2d4b2" {...ol(1.1)} />
      <rect x={104} y={22} width={8} height={7} fill="#e2d4b2" {...ol(1)} />
      <path d="M103 22.5 Q108 12 113 22.5 Z" fill="#7fae95" {...ol(1)} />
      <circle cx={108} cy={14.6} r={0.9} fill={C.yellow} />
      {c.winter && <path d="M104.2 19.5 Q108 12.6 111.8 19.5 Q108 18 104.2 19.5Z" fill={SNOW} />}
      {[95, 101, 113, 119].map((x) => win(c, x, 32, 3, 5, 0.6, false))}
      {/* tree belt under the town */}
      {[14, 34, 62, 88, 120, 146].map((x, i) => bush(c, x, 48 + (i % 2), 1.1))}
      {/* river */}
      <path d="M0 48 Q80 45 160 49 V60 Q80 57 0 60 Z" fill={river} {...ol(1)} />
      {c.winter && <path d="M0 48 Q80 45 160 49 V50.5 Q80 47 0 49.6 Z" fill="#e8f3f6" />}
      <g stroke={c.winter ? '#e6f4f7' : '#b9f1ee'} strokeWidth={0.9} strokeLinecap="round" fill="none">
        {[10, 40, 70, 100, 130].map((x, i) => (
          <path key={x} className="illu-bob" style={{ ...origin(x, 53), animationDelay: `${i * 0.25}s`, animationDuration: '1.6s' }} d={`M${x} ${52 + (i % 2) * 3} q2 -1 4 0 q2 1 4 0 q2 -1 4 0`} />
        ))}
      </g>
      {/* near bank */}
      <path d="M0 60 Q80 57 160 60 V90 H0 Z" fill={c.p.grass} />
      <path d="M0 60 Q80 57 160 60 V62.4 Q80 59.6 0 62.6 Z" fill={c.winter ? '#dfe7ec' : '#d9d0bd'} />
      {/* life-ring post */}
      <rect x={143} y={50} width={2.6} height={22} rx={0.8} fill="#a8774a" {...ol(1)} />
      <rect x={140.5} y={49} width={7.6} height={2} rx={0.8} fill="#a8774a" {...ol(0.8)} />
      <circle cx={144.3} cy={57} r={4.4} fill="none" stroke={SOFT} strokeWidth={4.2} />
      <circle cx={144.3} cy={57} r={4.4} fill="none" stroke={C.white} strokeWidth={3} />
      <circle cx={144.3} cy={57} r={4.4} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="3.45 3.45" />
      {c.winter && <ellipse cx={144.3} cy={49} rx={4.2} ry={1} fill={SNOW} />}
      {flora(c, [
        [10, 80], [16, 84], [126, 82], [132, 85], [154, 80],
      ])}
    </>,
    { sun: [132, 13], clouds: [[22, 12, 0.9], [80, 8, 0.7]] },
  )
}

function Gurten(c: Ctx): ReactNode {
  const mtn = c.winter ? '#cdd9e6' : '#b9c7da'
  const peaks: [number, number, number][] = [
    [40, 22, 18], [62, 28, 14], [82, 20, 18], [104, 25, 16], [124, 19, 20], [148, 26, 16],
  ]
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {birds(c, [[66, 12], [73, 15], [112, 9]])}
      {/* Alps */}
      {peaks.map(([x, top, hw], i) => (
        <g key={i}>
          <path d={`M${x - hw} 46 L${x - 1.6} ${top + 0.8} Q${x} ${top - 0.6} ${x + 1.6} ${top + 0.8} L${x + hw} 46 Z`} fill={mtn} {...ol(1)} />
          <path
            d={`M${x - hw * (c.winter ? 0.55 : 0.32)} ${top + (46 - top) * (c.winter ? 0.55 : 0.32)} L${x - 1.6} ${top + 0.8} Q${x} ${top - 0.6} ${x + 1.6} ${top + 0.8} L${x + hw * (c.winter ? 0.55 : 0.32)} ${top + (46 - top) * (c.winter ? 0.55 : 0.32)} Q${x + hw * 0.12} ${top + (46 - top) * (c.winter ? 0.42 : 0.24)} ${x} ${top + (46 - top) * (c.winter ? 0.5 : 0.3)} Q${x - hw * 0.15} ${top + (46 - top) * (c.winter ? 0.42 : 0.24)} ${x - hw * (c.winter ? 0.55 : 0.32)} ${top + (46 - top) * (c.winter ? 0.55 : 0.32)} Z`}
            fill={SNOW}
          />
        </g>
      ))}
      {/* valley + city far away */}
      <path d="M0 44 Q40 40 80 44 T160 43 V60 H0 Z" fill={c.p.hillFar} />
      {[52, 58, 64, 70, 96, 102, 108].map((x, i) => (
        <rect key={x} x={x} y={42 - (i % 3)} width={4} height={3 + (i % 3)} fill={mix('#e4cfa3', c.p.hillFar, 0.3)} />
      ))}
      {/* Gurten meadow */}
      <path d="M0 50 Q50 42 100 48 Q130 52 160 49 V90 H0 Z" fill={c.p.grass} />
      <path d="M0 50 Q50 42 100 48 Q130 52 160 49" fill="none" {...ol(1)} />
      {/* lookout tower */}
      <g>
        <path d="M14 47 L19 16 M26 47 L21 16 M14.8 42 L25.2 42 M15.6 36 L24.4 36 M16.6 29 L23.4 29 M17.4 22 L22.6 22 M14.8 42 L24.4 36 M25.2 42 L15.6 36 M15.6 36 L23.4 29 M24.4 36 L16.6 29 M16.6 29 L22.6 22 M23.4 29 L17.4 22" fill="none" stroke="#9c7b62" strokeWidth={0.9} strokeLinecap="round" />
        <rect x={16.6} y={13} width={6.8} height={3.6} fill="#c98a6b" {...ol(0.9)} />
        <path d="M16 13.4 L20 9.6 L24 13.4 Z" fill="#b85a44" {...ol(0.9)} />
        {c.winter && roofSnow(20, 9.6, 16, 13.4, 24, 13.4, 0.6)}
      </g>
      {tree(c, 36, 49, 1.1)}
      {tree(c, 150, 52, 1.2, 'fir')}
      {/* picnic blanket */}
      {!c.winter ? (
        <g>
          <path d="M112 62 L146 60 L150 70 L110 72 Z" fill="#f2d7d0" {...ol(1)} />
          <path d="M120.5 61.5 L119 71.6 M129 61 L128.5 71.2 M137.5 60.6 L138 70.8 M111 65.4 L147.4 63.4 M111.4 68.6 L148.6 66.6" stroke={C.red} strokeWidth={1.4} opacity={0.6} />
          <path d="M126 60 h9 l-1 -4.5 h-7 z" fill="#d9a66b" {...ol(0.8)} />
          <path d="M127 55.5 q3.5 -4 7 0" fill="none" stroke={SOFT} strokeWidth={0.9} />
        </g>
      ) : (
        <g>
          {/* sled */}
          <path d="M120 66 H140 Q143 66 143 63" fill="none" stroke="#a8774a" strokeWidth={1.4} strokeLinecap="round" />
          <rect x={121} y={61} width={18} height={2.6} rx={1} fill="#c9573f" {...ol(0.8)} />
          <path d="M124 63.6 V66 M136 63.6 V66" stroke="#a8774a" strokeWidth={1} />
        </g>
      )}
      {flora(c, [
        [8, 70], [12, 76], [6, 84], [56, 58], [62, 60], [96, 56], [152, 80], [148, 85],
      ])}
    </>,
    { sun: [96, 11], clouds: [[56, 8, 0.7], [134, 9, 0.6]] },
  )
}

function Zoo(c: Ctx): ReactNode {
  const pond = c.winter ? '#dcecf4' : '#8fd0dc'
  const posts = Array.from({ length: 14 }, (_, i) => 2 + i * 12)
  return outdoor(
    c,
    <>
      {skyBase(c)}
      <path d="M0 46 Q40 30 80 38 Q120 28 160 40 V60 H0 Z" fill={c.p.hillFar} />
      {/* forest */}
      {tree(c, 10, 46, 1.0, 'fir')}
      {tree(c, 26, 44, 1.15, 'fir')}
      {tree(c, 44, 44, 1.1)}
      {tree(c, 60, 44, 1.1, 'fir')}
      {tree(c, 78, 44, 1.0)}
      {tree(c, 94, 44, 1.05, 'fir')}
      {tree(c, 150, 46, 1.1, 'fir')}
      {ground(c, 49)}
      {/* wooden hut */}
      <rect x={112} y={31} width={28} height={18} fill="#c49166" {...ol(1.2)} />
      {[34, 38, 42, 46].map((y) => (
        <path key={y} d={`M112 ${y} H140`} stroke="#a8774a" strokeWidth={0.6} />
      ))}
      <path d="M108 32.5 L126 20 L144 32.5 Z" fill="#8a6a4e" {...ol(1.2)} />
      {c.winter && roofSnow(126, 20, 108, 32.5, 144, 32.5, 0.55)}
      <path d="M121 49 V41 A5 5 0 0 1 131 41 V49 Z" fill="#6b4a33" {...ol(0.9)} />
      {/* log fence */}
      <rect x={0} y={44} width={160} height={2.4} rx={1.2} fill="#c49166" {...ol(0.8)} />
      <rect x={0} y={49.5} width={160} height={2.4} rx={1.2} fill="#c49166" {...ol(0.8)} />
      {posts.map((x) => (
        <g key={x}>
          <rect x={x} y={41} width={3} height={14} rx={1.2} fill="#b07e55" {...ol(0.8)} />
          {c.winter && <ellipse cx={x + 1.5} cy={41.2} rx={2} ry={0.9} fill={SNOW} stroke={SNOW_EDGE} strokeWidth={0.4} />}
        </g>
      ))}
      {c.winter && snowStrip(0, 43.4, 160, 1)}
      {/* pond */}
      <ellipse cx={28} cy={66} rx={20} ry={5.5} fill={pond} {...ol(1.2)} />
      {c.winter ? (
        <path d="M18 65 l6 -1.5 M30 68 l6 -1.6" stroke={C.white} strokeWidth={0.9} strokeLinecap="round" />
      ) : (
        <g>
          <g stroke="#d3f2f6" strokeWidth={0.8} strokeLinecap="round" fill="none">
            <path className="illu-bob" style={origin(20, 65)} d="M16 65 q2 -1 4 0 q2 1 4 0" />
            <path className="illu-bob" style={{ ...origin(34, 68), animationDelay: '0.5s' }} d="M30 68 q2 -1 4 0 q2 1 4 0" />
          </g>
          {/* lily pads */}
          <ellipse cx={38} cy={64.5} rx={2.6} ry={1} fill={c.p.leafDark} />
          <ellipse cx={14} cy={67.5} rx={2.2} ry={0.9} fill={c.p.leafDark} />
          {c.season !== 'autumn' && <circle cx={38.6} cy={64} r={0.8} fill={C.rose} />}
        </g>
      )}
      {[7, 9, 48, 50].map((x, i) => (
        <path key={x} d={`M${x} ${66 + (i % 2)} q${i % 2 ? 1 : -1} -4 ${i % 2 ? 0.5 : -0.4} -7`} fill="none" stroke={c.winter ? '#c8b89a' : c.season === 'autumn' ? '#c79a4e' : '#6faf5a'} strokeWidth={0.9} strokeLinecap="round" />
      ))}
      {bush(c, 150, 62, 1)}
      {flora(c, [
        [120, 78], [126, 82], [150, 84], [100, 85],
      ])}
    </>,
    { sun: [128, 9], clouds: [[40, 10, 0.8], [96, 8, 0.6]] },
  )
}

function produce(c: Ctx, x0: number, y: number, n: number): ReactNode {
  const sets: Record<Season, string[]> = {
    spring: ['#e2493b', '#7cc36b', '#f7a8c8'],
    summer: ['#e2493b', '#f6c945', '#8e5bbf'],
    autumn: ['#f28c28', '#e2493b', '#e8d29a'],
    winter: ['#f28c28', '#c9573f', '#e8d29a'],
  }
  const cols = sets[c.season]
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * 8
        const col = cols[i % cols.length]
        return (
          <g key={i}>
            <rect x={x} y={y} width={7} height={4.5} rx={0.6} fill="#d9a66b" {...ol(0.8)} />
            {blob(
              [
                [x + 1.8, y - 0.2, 1.7],
                [x + 5.2, y - 0.2, 1.7],
                [x + 3.5, y - 1.4, 1.8],
              ],
              col,
              0.35,
            )}
          </g>
        )
      })}
    </g>
  )
}

function stall(c: Ctx, x: number, w: number, a: string, flip: boolean): ReactNode {
  const n = 6
  const sw = w / n
  return (
    <g key={`st${x}`}>
      <path d={`M${x + 2} 34 V58 M${x + w - 2} 34 V58`} stroke="#a8774a" strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M${x + 2} 34 V58 M${x + w - 2} 34 V58`} fill="none" stroke={SOFT} strokeWidth={0.4} />
      {/* awning stripes */}
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={`M${x + i * sw} 34 L${x + 3 + i * (sw - 1)} 26 H${x + 3 + (i + 1) * (sw - 1)} L${x + (i + 1) * sw} 34 Q${x + (i + 0.5) * sw} 37 ${x + i * sw} 34 Z`}
          fill={(i + (flip ? 1 : 0)) % 2 ? C.white : a}
          {...ol(0.8)}
        />
      ))}
      {c.winter && snowStrip(x + 3, 26, w - 6, 1.2)}
      {/* table */}
      <rect x={x} y={49} width={w} height={3} rx={0.8} fill="#c49166" {...ol(0.9)} />
      <rect x={x + 1} y={52} width={w - 2} height={6} fill="#efe2c8" {...ol(0.8)} />
      {produce(c, x + 2, 44.5, Math.floor((w - 2) / 8))}
      {c.season === 'autumn' && (
        <g>
          {/* onion braid (Zibelemärit) */}
          <path d={`M${x + w / 2} 36 V44`} stroke="#b4a05a" strokeWidth={0.8} />
          {[37.5, 40, 42.5].map((y, i) => (
            <circle key={y} cx={x + w / 2 + (i % 2 ? 1 : -1)} cy={y} r={1.4} fill="#e8c27a" {...ol(0.4)} />
          ))}
        </g>
      )}
      {c.winter && (
        <g>
          <path d={`M${x + 4} 36 Q${x + w / 2} 40 ${x + w - 4} 36`} fill="none" stroke="#5f8f73" strokeWidth={1.4} />
          {[0.25, 0.5, 0.75].map((t) => (
            <circle key={t} className="illu-twinkle" style={origin(x + w * t, 38)} cx={x + w * t} cy={37.6 + (t === 0.5 ? 0.6 : 0)} r={0.8} fill={C.yellow} />
          ))}
        </g>
      )}
    </g>
  )
}

function Market(c: Ctx): ReactNode {
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {oldTownHouse(c, 0, 34, 16, 58, '#eedcb6', '#c15f45', 3)}
      {oldTownHouse(c, 34, 30, 21, 58, '#e4d0a4', '#c9654a', 3)}
      {oldTownHouse(c, 64, 32, 14, 58, '#f0dfbc', '#b85a44', 3)}
      {oldTownHouse(c, 96, 30, 20, 58, '#e9d5ab', '#c9654a', 3)}
      {oldTownHouse(c, 126, 34, 15, 58, '#eedcb6', '#c15f45', 3)}
      {flag(38, 15, 1)}
      {cobbles(58, c.winter ? '#eef2f5' : '#e3d6bd', c.winter ? '#dde6ed' : '#d6c6a7')}
      <path d="M0 58 H160" {...ol(1)} />
      {stall(c, 8, 42, '#7fb77e', false)}
      {stall(c, 110, 42, '#e86f5e', true)}
    </>,
    { sun: [100, 6.5], clouds: [[24, 6, 0.6], [146, 6, 0.55]] },
  )
}

function Playground(c: Ctx): ReactNode {
  const sand = c.winter ? SNOW : C.sand
  return outdoor(
    c,
    <>
      {skyBase(c)}
      {hills(c, 46)}
      {tree(c, 70, 48, 1.3)}
      {tree(c, 92, 47, 1.05, 'fir')}
      {ground(c, 52)}
      {/* swing set */}
      <path d="M12 60 L18 22 M26 60 L20 22 M56 60 L52 22 M66 60 L58 22" fill="none" {...ol(3)} />
      <path d="M12 60 L18 22 M26 60 L20 22 M56 60 L52 22 M66 60 L58 22" fill="none" stroke="#5f9bd1" strokeWidth={1.8} strokeLinecap="round" />
      <rect x={15} y={20} width={47} height={3} rx={1.4} fill="#e2493b" {...ol(1)} />
      {c.winter && snowStrip(15, 20, 47, 1)}
      {[29, 45].map((x, i) => (
        <g key={x} className="illu-wag" style={{ ...origin(x + 3, 23), animationDuration: '1.6s', animationDelay: `${i * 0.5}s` }}>
          <path d={`M${x} 23 V45 M${x + 6} 23 V45`} stroke={SOFT} strokeWidth={0.7} />
          <rect x={x - 1} y={44.5} width={8} height={2} rx={0.9} fill={i ? C.yellow : C.orange} {...ol(0.8)} />
        </g>
      ))}
      {/* slide */}
      <path d="M112 60 V24 M120 60 V24" fill="none" {...ol(2.4)} />
      <path d="M112 60 V24 M120 60 V24" fill="none" stroke="#f6c945" strokeWidth={1.4} strokeLinecap="round" />
      {[30, 36, 42, 48, 54].map((y) => (
        <path key={y} d={`M112 ${y} H120`} stroke={SOFT} strokeWidth={1} strokeLinecap="round" />
      ))}
      <rect x={110} y={22} width={14} height={3} rx={1} fill="#5f9bd1" {...ol(0.9)} />
      <path d="M110 22 V16 M124 22 V16 M110 17 H124" fill="none" stroke={SOFT} strokeWidth={1} strokeLinecap="round" />
      <path d="M123 22 Q134 24 140 42 Q144 54 152 57 L152 61 Q141 58 136 44 Q131 28 123 26 Z" fill="#e86f5e" {...ol(1.1)} />
      {c.winter && <path d="M123 22 Q134 24 140 42 Q144 54 152 57 L152 58.4 Q142 55 138 43 Q133 26 123 23.4 Z" fill={SNOW} />}
      {/* sandpit */}
      <rect x={8} y={64} width={36} height={12} rx={3} fill="#c49166" {...ol(1.1)} />
      <rect x={10.5} y={66} width={31} height={8} rx={2} fill={sand} />
      {!c.winter && (
        <g>
          <path d="M34 72 h5 l-0.8 -4.5 h-3.4 z" fill={C.red} {...ol(0.7)} />
          <path d="M18 70 q3 -2.6 6 0" fill={mix(C.sand, '#c49166', 0.3)} />
          <path d="M28 70 l-4 -4" stroke={C.blue} strokeWidth={1.1} strokeLinecap="round" />
        </g>
      )}
      {c.winter && (
        <g>
          {/* little snowman */}
          <circle cx={30} cy={69} r={3} fill={SNOW} {...ol(0.8)} />
          <circle cx={30} cy={64.6} r={2.2} fill={SNOW} {...ol(0.8)} />
          <path d="M30 64.8 l2 0.5 l-2 0.4z" fill={C.orange} />
        </g>
      )}
      {flora(c, [
        [148, 76], [152, 82], [140, 84], [56, 82], [60, 86],
      ])}
    </>,
    { sun: [86, 11], clouds: [[38, 9, 0.8], [140, 8, 0.6]] },
  )
}

/* ---------- interiors ---------- */

function Kitchen(c: Ctx): ReactNode {
  return (
    <>
      {interior('#fbecd2', '#e8d2ad', 62)}
      {/* tiles */}
      <rect x={0} y={28} width={104} height={16} fill="#f7f4ec" />
      <g stroke="#e3ddcf" strokeWidth={0.5}>
        {[32, 36, 40].map((y) => <line key={y} x1={0} y1={y} x2={104} y2={y} />)}
        {Array.from({ length: 26 }, (_, i) => <line key={i} x1={i * 4} y1={28} x2={i * 4} y2={44} />)}
      </g>
      {/* floor tiles */}
      <g stroke="#dcc39a" strokeWidth={0.6}>
        <line x1={0} y1={71} x2={160} y2={71} />
        <line x1={0} y1={82} x2={160} y2={82} />
        {[20, 50, 80, 110, 140].map((x) => <line key={x} x1={x} y1={62} x2={x - 6} y2={90} />)}
      </g>
      {/* upper cabinets */}
      <rect x={4} y={4} width={44} height={20} rx={1} fill="#9ccbb4" {...ol(1.3)} />
      <path d="M26 4 V24" stroke={SOFT} strokeWidth={1} />
      <circle cx={23.5} cy={18} r={0.8} fill={C.yellow} />
      <circle cx={28.5} cy={18} r={0.8} fill={C.yellow} />
      {/* window */}
      {windowView(c, 60, 6, 32, 20)}
      {/* counter */}
      <rect x={2} y={43} width={102} height={3} rx={1} fill="#e7c49a" {...ol(1.2)} />
      <rect x={4} y={46} width={98} height={16} fill="#9ccbb4" {...ol(1.2)} />
      {[28, 52, 78].map((x) => <path key={x} d={`M${x} 46 V62`} stroke={SOFT} strokeWidth={1} />)}
      {[16, 40, 65, 90].map((x) => <rect key={x} x={x - 2} y={49} width={4} height={1} rx={0.5} fill={C.yellow} />)}
      {/* stove + pot */}
      <rect x={10} y={42} width={18} height={1.6} rx={0.6} fill="#5c5c5c" />
      <path d="M12 42 V36 H26 V42 Z" fill={C.red} {...ol(1)} />
      <path d="M10.5 37 H27.5" {...ol(1.4)} />
      <path d="M19 35 q0 -1.5 1.6 -1.5" stroke={SOFT} strokeWidth={0.8} fill="none" />
      <g fill="#ffffff" opacity={0.85}>
        <circle className="illu-bob" style={origin(16, 31)} cx={16} cy={31} r={1.6} />
        <circle className="illu-bob" style={{ ...origin(21, 29), animationDelay: '0.4s' }} cx={21} cy={29} r={1.3} />
      </g>
      {/* sink */}
      <path d="M68 43 Q76 46 84 43" fill="none" stroke={SOFT} strokeWidth={1} />
      <path d="M77 43 V38 Q77 36 80 36 V37.6" fill="none" stroke="#a7adb2" strokeWidth={1.4} strokeLinecap="round" />
      {decor(c, 97, 43)}
      {/* fridge */}
      <rect x={118} y={10} width={30} height={52} rx={3} fill="#eef5f8" {...ol(1.4)} />
      <path d="M118 28 H148" stroke={SOFT} strokeWidth={1} />
      <rect x={121} y={18} width={1.6} height={7} rx={0.8} fill="#a7adb2" />
      <rect x={121} y={32} width={1.6} height={10} rx={0.8} fill="#a7adb2" />
      <circle cx={132} cy={16} r={1.4} fill={C.red} />
      <circle cx={140} cy={20} r={1.4} fill={C.yellow} />
      <rect x={130} y={34} width={9} height={7} fill={C.white} {...ol(0.6)} transform="rotate(-6 134 37)" />
      <path d="M131.5 39.5 l2 -3 l2 2 l2 -2.5" fill="none" stroke={C.blue} strokeWidth={0.6} transform="rotate(-6 134 37)" />
      {/* hanging lamp */}
      <path d="M110 0 V10" stroke={SOFT} strokeWidth={0.7} />
      <path d="M105 15 Q110 7 115 15 Z" fill={C.orange} {...ol(0.9)} />
      {c.night && <circle cx={110} cy={16} r={1.4} fill={C.yellow} />}
      {tint(c, true)}
    </>
  )
}

function Room(c: Ctx): ReactNode {
  return (
    <>
      {interior('#d4e8f1', '#e6c08f', 60, '#d8ad7a')}
      {/* wallpaper dots */}
      <g fill="#c5dfeb">
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={6 + (i % 10) * 16 + (Math.floor(i / 10) % 2) * 8} cy={6 + Math.floor(i / 10) * 16} r={0.9} />
        ))}
      </g>
      {/* window with curtains */}
      {windowView(c, 64, 12, 32, 26)}
      <path d="M58 8 H102" {...ol(1.2)} />
      <path d="M59 9 Q63 22 60 42 H66 Q64 24 66 9 Z" fill={C.yellow} {...ol(1)} />
      <path d="M101 9 Q97 22 100 42 H94 Q96 24 94 9 Z" fill={C.yellow} {...ol(1)} />
      {decor(c, 72, 39.2)}
      {/* picture */}
      <rect x={26} y={14} width={18} height={13} rx={1} fill="#fff7ea" {...ol(1.1)} />
      <path d="M28 25 L33 19 L37 23 L39 21 L42 25 Z" fill={C.leaf} />
      <circle cx={39} cy={18} r={1.6} fill={C.yellow} />
      {/* bed */}
      <rect x={4} y={30} width={6} height={32} rx={2} fill="#c98a6b" {...ol(1.2)} />
      <rect x={8} y={44} width={44} height={14} rx={2} fill="#c98a6b" {...ol(1.2)} />
      <rect x={10} y={38} width={13} height={7} rx={3} fill={C.white} {...ol(1)} />
      <path d="M20 43 H52 V53 Q36 56 20 53 Z" fill={C.pink} {...ol(1.1)} />
      {[26, 34, 42, 48].map((x, i) => <circle key={x} cx={x} cy={47 + (i % 2) * 2} r={1} fill={C.white} />)}
      <rect x={48} y={44} width={4} height={18} rx={1.5} fill="#c98a6b" {...ol(1)} />
      {/* shelf with toys */}
      <rect x={114} y={24} width={36} height={2.4} rx={1} fill="#c98a6b" {...ol(1)} />
      <circle cx={120} cy={21} r={3} fill={C.red} {...ol(0.8)} />
      <path d="M117.2 20 Q120 22 122.8 20" stroke={C.white} strokeWidth={0.6} fill="none" />
      <rect x={126} y={17} width={5} height={7} fill={C.blue} {...ol(0.8)} />
      <rect x={131} y={18.5} width={4} height={5.5} fill={C.yellow} {...ol(0.8)} />
      <rect x={135} y={16.5} width={4.5} height={7.5} fill={C.green} {...ol(0.8)} />
      <path d="M143 24 V19 L146 16.5 L149 19 V24 Z" fill={C.purple} {...ol(0.8)} />
      {/* toy box */}
      <rect x={122} y={46} width={28} height={15} rx={2} fill="#f2b56b" {...ol(1.2)} />
      <rect x={120.5} y={44} width={31} height={3.5} rx={1.4} fill="#e59a4a" {...ol(1)} />
      <circle cx={136} cy={54} r={2.6} fill={C.rose} {...ol(0.7)} />
      {/* night light + rug */}
      <ellipse cx={86} cy={75} rx={34} ry={6} fill="#f3d79e" />
      <ellipse cx={86} cy={75} rx={26} ry={4.2} fill="none" stroke="#e9c07a" strokeWidth={1} />
      {tint(c, true)}
      {c.night && (
        <g>
          <circle cx={112} cy={53} r={5} fill="#ffe9a0" opacity={0.35} />
          <rect x={110} y={51} width={4} height={4.4} rx={1} fill={C.cream} {...ol(0.6)} />
          <path d="M112.9 51.8 A1.7 1.7 0 1 0 112.9 54.6 A1.3 1.3 0 1 1 112.9 51.8 Z" fill={C.yellow} />
        </g>
      )}
    </>
  )
}

function Bus(c: Ctx): ReactNode {
  const wins: [number, number, number, number][] = [
    [10, 14, 42, 28],
    [59, 14, 42, 28],
    [108, 14, 42, 28],
  ]
  const houses: [number, number, number, string, string][] = [
    [6, 12, 12, '#f3d3b5', '#c9654a'],
    [26, 14, 9, '#e8d3a6', '#b85a44'],
    [62, 11, 13, '#dfe6c8', '#c9654a'],
    [86, 13, 10, '#f0dfbc', '#9c6b54'],
    [112, 12, 11, '#f3d3b5', '#b85a44'],
    [134, 14, 13, '#e8d3a6', '#c9654a'],
  ]
  const wall = rrPath(0, 0, 160, 90, 0) + wins.map(([x, y, w, h]) => rrPath(x, y, w, h, 3)).join(' ')
  return (
    <>
      {/* passing outside world */}
      <rect x={0} y={10} width={160} height={36} fill={c.sky} />
      <path d="M0 36 Q40 26 80 33 T160 32 V46 H0 Z" fill={c.p.hillFar} />
      {houses.map(([x, w, h, wc, rc]) => smallHouse(c, x, 40, w, h, wc, rc))}
      {[44, 100, 156].map((x) => tree(c, x, 41, 0.75))}
      <rect x={0} y={40} width={160} height={6} fill={c.winter ? SNOW : c.p.grass} />
      {c.night && (
        <g>
          <circle cx={84} cy={19} r={2.6} fill="#fff1bf" />
          <circle cx={85.3} cy={18.2} r={2.2} fill={c.sky} />
        </g>
      )}
      {c.winter && weather(c, 10, 14, 150, 38, 12)}
      {c.season === 'autumn' && weather(c, 10, 14, 150, 38, 8)}
      {c.night && <rect x={0} y={10} width={160} height={36} fill="#16234e" opacity={0.3} />}
      {c.lights}
      {/* bus body with window holes */}
      <path d={wall} fillRule="evenodd" fill="#eef1f2" />
      {wins.map(([x, y, w, h]) => (
        <path key={x} d={rrPath(x, y, w, h, 3)} fill="none" stroke="#9aa3aa" strokeWidth={1.8} />
      ))}
      <rect x={0} y={0} width={160} height={7} fill="#dde3e7" />
      <path d="M0 7 H160" {...ol(0.8)} />
      <rect x={0} y={44} width={160} height={14} fill="#d7372d" opacity={0.85} />
      <path d="M0 44 H160 M0 58 H160" {...ol(0.8)} />
      {/* floor */}
      <path d="M0 64 H160 V90 H0 Z" fill="#b3babf" />
      <rect x={0} y={58} width={160} height={6} fill="#c6ccd1" />
      <g fill="#a2a9ae">
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={6 + i * 9} cy={76 + (i % 2) * 6} r={0.6} />)}
      </g>
      {/* seats */}
      {[4, 132].map((x) => (
        <g key={x}>
          <rect x={x} y={46} width={24} height={14} rx={3} fill="#e86f5e" {...ol(1.2)} />
          <rect x={x - 1} y={58} width={26} height={5} rx={2} fill="#c9573f" {...ol(1.1)} />
          <path d={`M${x + 4} 63 V70 M${x + 20} 63 V70`} stroke="#7a8288" strokeWidth={1.2} />
        </g>
      ))}
      {/* handrail, poles, straps */}
      <path d="M0 9.5 H160" stroke="#d9dde1" strokeWidth={1.8} />
      <path d="M0 9.5 H160" stroke={SOFT} strokeWidth={0.4} />
      {[55, 104].map((x) => (
        <g key={x}>
          <path d={`M${x} 7 V90`} {...ol(3.2)} />
          <path d={`M${x} 7 V90`} stroke={C.yellow} strokeWidth={2} />
          <rect x={x - 1.6} y={36} width={3.2} height={3.2} rx={1} fill={C.red} {...ol(0.6)} />
        </g>
      ))}
      {[30, 80, 130].map((x, i) => (
        <g key={x} className="illu-wag" style={{ ...origin(x, 9.5), animationDuration: '1.8s', animationDelay: `${i * 0.3}s` }}>
          <path d={`M${x} 9.5 V15`} stroke="#7a8288" strokeWidth={0.9} />
          <path d={`M${x - 2.2} 15 H${x + 2.2} L${x} 19.6 Z`} fill="none" stroke="#5c5c5c" strokeWidth={1.1} strokeLinejoin="round" />
        </g>
      ))}
      {tint(c, true)}
    </>
  )
}

function Chindsgi(c: Ctx): ReactNode {
  const coats: [number, string][] = [
    [12, C.red],
    [22, C.blue],
    [32, C.yellow],
    [42, C.green],
  ]
  const bunt = Array.from({ length: 11 }, (_, i) => 6 + i * 14.8)
  const buntCol = [C.red, C.yellow, C.blue, C.green, C.orange, C.rose]
  return (
    <>
      {interior('#fdf0c8', '#ead1a3', 61, '#dcbd88')}
      {/* bunting */}
      <path d="M0 4 Q80 12 160 4" fill="none" stroke={SOFT} strokeWidth={0.6} />
      {bunt.map((x, i) => {
        const y = 4 + 8 * (1 - ((x - 80) / 80) ** 2) - 0.2
        return (
          <path
            key={x}
            className="illu-wag"
            style={{ ...origin(x, y), animationDuration: '2s', animationDelay: `${i * 0.15}s` }}
            d={`M${x - 2.6} ${y} H${x + 2.6} L${x} ${y + 5} Z`}
            fill={buntCol[i % buntCol.length]}
            {...ol(0.6)}
          />
        )
      })}
      {/* coat hooks */}
      <rect x={6} y={20} width={44} height={2.6} rx={1} fill="#c98a6b" {...ol(1)} />
      {coats.map(([x, col]) => (
        <g key={x}>
          <circle cx={x} cy={23.5} r={0.9} fill={SOFT} />
          <path d={`M${x - 3} 25 Q${x} 23 ${x + 3} 25 L${x + 4} 37 H${x - 4} Z`} fill={col} {...ol(1)} />
          <path d={`M${x} 25 V37`} stroke={SOFT} strokeWidth={0.5} />
        </g>
      ))}
      <rect x={6} y={46} width={44} height={3} rx={1} fill="#c98a6b" {...ol(1)} />
      <path d="M9 49 V60 M47 49 V60" stroke="#c98a6b" strokeWidth={2} />
      {[14, 26, 38].map((x, i) => (
        <path key={x} d={`M${x} 59 h5 q1 0 1 -1 v-1 h-3 l-1 -2 h-2 z`} fill={[C.red, C.blue, C.green][i]} {...ol(0.6)} />
      ))}
      {/* window */}
      {windowView(c, 64, 14, 30, 22)}
      {decor(c, 70, 38.6)}
      {/* children's drawings */}
      {[
        [108, 17, '#fff7ea', -4],
        [124, 16, '#fff7ea', 3],
        [140, 18, '#fff7ea', -2],
      ].map(([x, y, col, r], i) => (
        <g key={i} transform={`rotate(${r} ${(x as number) + 6} ${(y as number) + 5})`}>
          <rect x={x as number} y={y as number} width={12} height={10} fill={col as string} {...ol(0.8)} />
          {i === 0 && <circle cx={(x as number) + 6} cy={(y as number) + 5} r={2.6} fill={C.yellow} />}
          {i === 1 && <path d={`M${(x as number) + 3} ${(y as number) + 8} V${(y as number) + 5} L${(x as number) + 6} ${(y as number) + 2.5} L${(x as number) + 9} ${(y as number) + 5} V${(y as number) + 8} Z`} fill={C.red} />}
          {i === 2 && <path d={`M${(x as number) + 2} ${(y as number) + 7} q2 -4 4 0 q2 -4 4 0`} fill="none" stroke={C.blue} strokeWidth={1} />}
        </g>
      ))}
      {/* low table + stools */}
      <rect x={110} y={46} width={40} height={3} rx={1.4} fill="#f2b56b" {...ol(1.1)} />
      <path d="M114 49 V60 M146 49 V60" stroke="#c98a6b" strokeWidth={2} strokeLinecap="round" />
      <rect x={106} y={53} width={7} height={2} rx={1} fill={C.blue} {...ol(0.8)} />
      <path d="M107.5 55 V61 M111.5 55 V61" stroke={C.blue} strokeWidth={1.2} />
      <rect x={147} y={53} width={7} height={2} rx={1} fill={C.green} {...ol(0.8)} />
      <path d="M148.5 55 V61 M152.5 55 V61" stroke={C.green} strokeWidth={1.2} />
      <rect x={122} y={42} width={5} height={4} fill={C.red} {...ol(0.6)} />
      <rect x={128} y={43} width={4} height={3} fill={C.yellow} {...ol(0.6)} />
      <path d="M134 46 l3 -4 l3 4 z" fill={C.blue} {...ol(0.6)} />
      {/* colourful round rug */}
      <ellipse cx={80} cy={75} rx={34} ry={7} fill="#f6c9a8" />
      <ellipse cx={80} cy={75} rx={26} ry={5.2} fill="#cde6b8" />
      <ellipse cx={80} cy={75} rx={18} ry={3.6} fill="#bfdcef" />
      <ellipse cx={80} cy={75} rx={10} ry={2} fill="#f9e2a2" />
      {tint(c, true)}
    </>
  )
}

function School(c: Ctx): ReactNode {
  return (
    <>
      {interior('#e3ecd9', '#d9c4a0', 62, '#ccb48a')}
      {/* window */}
      {windowView(c, 8, 10, 26, 32)}
      {/* low bookshelf */}
      <rect x={6} y={48} width={30} height={14} rx={1} fill="#c98a6b" {...ol(1.1)} />
      <path d="M6 55 H36" stroke={SOFT} strokeWidth={0.8} />
      {[C.red, C.blue, C.yellow, C.green, C.purple, C.orange].map((col, i) => (
        <rect key={i} x={8 + i * 4.4} y={49} width={3.4} height={5.4} fill={col} opacity={0.85} />
      ))}
      {[C.green, C.orange, C.blue, C.red].map((col, i) => (
        <rect key={i} x={9 + i * 6} y={56} width={4.6} height={5} fill={col} opacity={0.85} />
      ))}
      {/* blackboard */}
      <rect x={44} y={8} width={70} height={32} rx={1.5} fill="#c98a6b" {...ol(1.3)} />
      <rect x={46.5} y={10.5} width={65} height={27} fill="#3f6b57" />
      <g fill="none" stroke="#f1f5ef" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
        <circle cx={58} cy={20} r={4} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4
          return <line key={i} x1={58 + Math.cos(a) * 5.6} y1={20 + Math.sin(a) * 5.6} x2={58 + Math.cos(a) * 7.2} y2={20 + Math.sin(a) * 7.2} />
        })}
        <path d="M74 32 V24 L80 18.5 L86 24 V32 Z M78.5 32 V27.5 H81.5 V32" />
        <path d="M94 32 L99 21 L104 32 Z" />
        <rect x={93} y={14} width={6} height={5} />
        <circle cx={105} cy={16.5} r={2.6} />
      </g>
      <rect x={52} y={40} width={54} height={1.8} rx={0.6} fill="#c98a6b" {...ol(0.7)} />
      <rect x={60} y={39} width={5} height={1.2} fill={C.white} />
      <rect x={68} y={39} width={4} height={1.2} fill={C.yellow} />
      {/* clock */}
      <circle cx={134} cy={16} r={6} fill={C.white} {...ol(1.2)} />
      <path d="M134 16 V12 M134 16 L137 17.5" stroke={SOFT} strokeWidth={1} strokeLinecap="round" />
      {/* teacher desk */}
      <rect x={116} y={44} width={38} height={3} rx={1} fill="#c98a6b" {...ol(1.1)} />
      <rect x={118} y={47} width={12} height={14} fill="#b5764a" {...ol(1)} />
      <path d="M150 47 V61" stroke="#b5764a" strokeWidth={2.2} strokeLinecap="round" />
      {/* globe */}
      <path d="M126 44 h6" stroke={SOFT} strokeWidth={1} />
      <path d="M129 44 V41" stroke={SOFT} strokeWidth={0.8} />
      <circle cx={129} cy={37} r={4} fill="#7fc6e4" {...ol(0.8)} />
      <path d="M127 35 q2 1 1 3 q2 0 2.4 2 M130.6 34 q1 1 2 1" fill="none" stroke={C.green} strokeWidth={1.1} strokeLinecap="round" />
      {decor(c, 145, 44)}
      {tint(c, true)}
    </>
  )
}

const RENDER: Record<PlaceId, (c: Ctx) => ReactNode> = {
  home: Home,
  kitchen: Kitchen,
  room: Room,
  garden: Garden,
  quarry: Quarry,
  bus: Bus,
  zytglogge: ZytgloggeScene,
  baerepark: Baerepark,
  aare: AareScene,
  gurten: Gurten,
  zoo: Zoo,
  market: Market,
  chindsgi: Chindsgi,
  school: School,
  playground: Playground,
}

export function PlaceBackground(props: { place: PlaceId; season: Season; time?: PlaceTime }): ReactElement {
  const time = props.time ?? 'day'
  const [sky, skyLow] = SKY[time][props.season]
  const c: Ctx = {
    season: props.season,
    time,
    p: PALS[props.season],
    winter: props.season === 'winter',
    night: time === 'night',
    sky,
    skyLow,
    lights: [],
  }
  const draw = RENDER[props.place] ?? RENDER.home
  return <g className={`place place-${props.place} season-${props.season} time-${time}`}>{draw(c)}</g>
}
