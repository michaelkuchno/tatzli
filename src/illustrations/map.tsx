import type { ReactElement, ReactNode } from 'react'
import type { PlaceId, Season } from '@content/types'
import { C, line, origin } from './kit'
import { mix } from './places'

/**
 * Fairytale world map (160×90 viewBox): Ostermundigen on the left, Bern old town in the
 * Aare loop on the right. MAP_SPOTS are the landmark centres; the map keeps ~7 units of
 * free radius around each so tappable bubbles can be drawn on top.
 */
export const MAP_SPOTS: { place: PlaceId; x: number; y: number }[] = [
  { place: 'room', x: 17, y: 14 },
  { place: 'kitchen', x: 36, y: 13 },
  { place: 'home', x: 25, y: 33 },
  { place: 'garden', x: 16, y: 53 },
  { place: 'quarry', x: 52, y: 24 },
  { place: 'chindsgi', x: 40, y: 55 },
  { place: 'playground', x: 18, y: 75 },
  { place: 'school', x: 43, y: 76 },
  { place: 'bus', x: 65, y: 45 },
  { place: 'market', x: 89, y: 36 },
  { place: 'zytglogge', x: 111, y: 36 },
  { place: 'baerepark', x: 145, y: 36 },
  { place: 'aare', x: 103, y: 67 },
  { place: 'zoo', x: 128, y: 67 },
  { place: 'gurten', x: 146, y: 77 },
]

const SOFT = '#8a6a55'
const ol = (w = 1) => ({ ...line(w), stroke: SOFT })

type P = [number, number]
type Seg = [P, P, P, P]

const RIVER: Seg[] = [
  [[100, 93], [100, 80], [96, 68], [104, 60]],
  [[104, 60], [112, 54], [126, 58], [134, 51]],
  [[134, 51], [142, 44], [142, 28], [134, 22]],
  [[134, 22], [124, 14], [104, 17], [96, 11]],
  [[96, 11], [90, 7], [84, 4], [80, -3]],
]

const ROAD: Seg[] = [
  [[25, 40], [34, 44], [50, 49], [65, 47]],
  [[65, 47], [76, 45], [80, 39], [89, 37]],
  [[89, 37], [96, 35], [104, 37], [111, 37]],
]

/** footpaths from the road / house to the other spots */
const PATHS: Seg[] = [
  [[25, 33], [22, 26], [18, 20], [17, 14]],
  [[25, 33], [30, 26], [34, 20], [36, 13]],
  [[25, 33], [20, 40], [16, 46], [16, 53]],
  [[34, 44], [40, 38], [46, 30], [52, 24]],
  [[36, 45], [38, 48], [40, 51], [40, 55]],
  [[16, 53], [17, 62], [17, 68], [18, 75]],
  [[40, 55], [42, 62], [43, 70], [43, 76]],
  [[111, 37], [124, 37], [134, 36], [145, 36]],
  [[104, 52], [104, 56], [103, 62], [103, 67]],
  [[126, 56], [128, 60], [128, 63], [128, 67]],
  [[128, 67], [136, 70], [140, 74], [146, 77]],
]

function bez([a, b, c, d]: Seg, t: number): P {
  const u = 1 - t
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ]
}
const segD = (segs: Seg[]): string =>
  segs.map(([a, b, c, d], i) => `${i === 0 ? `M${a[0]} ${a[1]} ` : ''}C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`).join(' ')
const sample = (segs: Seg[]): P[] => segs.flatMap((s) => Array.from({ length: 12 }, (_, i) => bez(s, i / 12)))

const RIVER_PTS = sample(RIVER)
const ROAD_PTS = sample(ROAD)
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const near = (p: P, pts: P[], r: number) => pts.some((q) => dist(p, q) < r)

/** Deterministic forest: candidates inside forest zones, away from spots, river and road. */
const TREES: { x: number; y: number; fir: boolean; s: number }[] = (() => {
  const zones: [number, number, number][] = [
    [70, 72, 15], [70, 16, 11], [6, 34, 8], [152, 10, 10], [120, 84, 8], [84, 56, 7], [152, 56, 7], [30, 87, 6], [4, 64, 6],
  ]
  let s = 5
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const out: { x: number; y: number; fir: boolean; s: number }[] = []
  for (let gx = 2; gx < 160; gx += 5.5) {
    for (let gy = 4; gy < 90; gy += 5) {
      const p: P = [gx + rnd() * 3, gy + rnd() * 3]
      const r = rnd()
      if (!zones.some(([zx, zy, zr]) => dist(p, [zx, zy]) < zr)) continue
      if (MAP_SPOTS.some((m) => dist(p, [m.x, m.y]) < 10.5)) continue
      if (near(p, RIVER_PTS, 7) || near(p, ROAD_PTS, 5)) continue
      if (p[0] > 78 && p[0] < 138 && p[1] > 18 && p[1] < 54) continue // old town
      if (r < 0.2) continue
      out.push({ x: p[0], y: p[1], fir: r > 0.55, s: 0.8 + rnd() * 0.35 })
    }
  }
  return out.sort((a, b) => a.y - b.y)
})()

interface MapPal {
  land: string
  landDark: string
  field: string
  fieldB: string
  leaf: string
  fir: string
  river: string
  ripple: string
}

const MPAL: Record<Season, MapPal> = {
  spring: { land: '#cdeaa9', landDark: '#b7df90', field: '#e2f2c4', fieldB: '#f3e2a8', leaf: '#a9db84', fir: '#6db47a', river: '#7fd0d6', ripple: '#c7f0f1' },
  summer: { land: '#bfe39c', landDark: '#a7d684', field: '#f2d98a', fieldB: '#d7ec9f', leaf: '#73bd5d', fir: '#5ea26c', river: '#62c7c9', ripple: '#b9f1ee' },
  autumn: { land: '#dde0a0', landDark: '#ccd18a', field: '#e9c98a', fieldB: '#c9b27a', leaf: '#f3a540', fir: '#5ea26c', river: '#6cc4c9', ripple: '#c3eded' },
  winter: { land: '#eef3f7', landDark: '#dfe8ef', field: '#f8fafc', fieldB: '#e6edf3', leaf: '#ffffff', fir: '#6f9c84', river: '#93cbd8', ripple: '#e6f4f7' },
}

type K = (col: string) => string

const GREY = '#cfcac2'

/* ---------------------------------- landmarks ---------------------------------- */

function roofSnow(k: K, x1: number, y1: number, ax: number, ay: number, x2: number, y2: number): ReactNode {
  const f = 0.5
  return (
    <path
      d={`M${ax + (x1 - ax) * f} ${ay + (y1 - ay) * f} L${ax} ${ay} L${ax + (x2 - ax) * f} ${ay + (y2 - ay) * f} Q${ax} ${ay + (y2 - ay) * f + 1.2} ${ax + (x1 - ax) * f} ${ay + (y1 - ay) * f}Z`}
      fill={k('#ffffff')}
    />
  )
}

function house(k: K, w: boolean, x: number, y: number, s: number, wall: string, roof: string): ReactNode {
  return (
    <g>
      <rect x={x - 4 * s} y={y - 3 * s} width={8 * s} height={6 * s} fill={k(wall)} {...ol(0.7)} />
      <path d={`M${x - 5.4 * s} ${y - 2.6 * s} L${x} ${y - 7 * s} L${x + 5.4 * s} ${y - 2.6 * s} Z`} fill={k(roof)} {...ol(0.7)} />
      {w && roofSnow(k, x - 5.4 * s, y - 2.6 * s, x, y - 7 * s, x + 5.4 * s, y - 2.6 * s)}
      <rect x={x - 1.2 * s} y={y - 0.4 * s} width={2.4 * s} height={3.4 * s} fill={k('#8b5a2b')} />
    </g>
  )
}

function miniTree(k: K, season: Season, x: number, y: number, s: number, fir: boolean): ReactNode {
  const p = MPAL[season]
  if (fir) {
    return (
      <g key={`${x}-${y}`}>
        <path d={`M${x - 2.6 * s} ${y} L${x} ${y - 7 * s} L${x + 2.6 * s} ${y} Z`} fill={k(p.fir)} {...ol(0.5)} />
        {season === 'winter' && <path d={`M${x - 1.2 * s} ${y - 3.8 * s} L${x} ${y - 7 * s} L${x + 1.2 * s} ${y - 3.8 * s} Z`} fill={k('#ffffff')} />}
      </g>
    )
  }
  return (
    <g key={`${x}-${y}`}>
      <path d={`M${x} ${y} V${y - 3 * s}`} stroke={k('#a8774a')} strokeWidth={0.9} />
      {season === 'winter' ? (
        <path d={`M${x} ${y - 2.5 * s} L${x - 2 * s} ${y - 5.5 * s} M${x} ${y - 2.5 * s} L${x + 2 * s} ${y - 6 * s} M${x} ${y - 3 * s} V${y - 6.5 * s}`} stroke={k('#a8774a')} strokeWidth={0.6} strokeLinecap="round" />
      ) : (
        <circle cx={x} cy={y - 5 * s} r={2.8 * s} fill={k(p.leaf)} {...ol(0.5)} />
      )}
      {season === 'spring' && <circle cx={x + 0.8 * s} cy={y - 5.6 * s} r={0.6 * s} fill={k(C.rose)} />}
      {season === 'autumn' && <circle cx={x - 0.9 * s} cy={y - 4.6 * s} r={0.6 * s} fill={k('#e2703b')} />}
    </g>
  )
}

type Landmark = (k: K, season: Season, x: number, y: number) => ReactNode

const LANDMARKS: Record<PlaceId, Landmark> = {
  home: (k, s, x, y) => (
    <g>
      <rect x={x - 5.5} y={y - 3} width={11} height={7.5} fill={k('#fbe3bf')} {...ol(0.9)} />
      <path d={`M${x - 7.5} ${y - 2.4} L${x} ${y - 9} L${x + 7.5} ${y - 2.4} Z`} fill={k('#d9674e')} {...ol(0.9)} />
      {s === 'winter' && roofSnow(k, x - 7.5, y - 2.4, x, y - 9, x + 7.5, y - 2.4)}
      <rect x={x - 1.5} y={y + 0.2} width={3} height={4.3} rx={1.2} fill={k('#6fa86a')} />
      <rect x={x - 4.6} y={y - 1.5} width={2.4} height={2.2} fill={k('#d8eef8')} {...ol(0.4)} />
      <rect x={x + 2.2} y={y - 1.5} width={2.4} height={2.2} fill={k('#d8eef8')} {...ol(0.4)} />
      <circle cx={x} cy={y - 5} r={1} fill={k(C.yellow)} />
    </g>
  ),
  kitchen: (k, _s, x, y) => (
    <g>
      <ellipse cx={x} cy={y + 3.5} rx={6} ry={1.6} fill={k('#e9d3b0')} />
      <path d={`M${x - 4.5} ${y - 1.5} H${x + 4.5} V${y + 2} Q${x + 4.5} ${y + 3.6} ${x + 3} ${y + 3.6} H${x - 3} Q${x - 4.5} ${y + 3.6} ${x - 4.5} ${y + 2} Z`} fill={k(C.red)} {...ol(0.8)} />
      <path d={`M${x - 5.5} ${y - 1.6} H${x + 5.5}`} {...ol(1.1)} />
      <path d={`M${x - 0.8} ${y - 2.6} h1.6`} {...ol(1)} />
      <g fill={k('#ffffff')} stroke={k('#c9d8e4')} strokeWidth={0.3}>
        <circle className="illu-bob" style={origin(x - 1.5, y - 5)} cx={x - 1.5} cy={y - 5} r={1.3} />
        <circle className="illu-bob" style={{ ...origin(x + 1.5, y - 7), animationDelay: '0.4s' }} cx={x + 1.4} cy={y - 7} r={1} />
      </g>
    </g>
  ),
  room: (k, _s, x, y) => (
    <g>
      <rect x={x - 6} y={y - 4} width={2} height={8} rx={0.8} fill={k('#c98a6b')} {...ol(0.6)} />
      <rect x={x - 5} y={y} width={11} height={3.2} rx={1} fill={k('#c98a6b')} {...ol(0.6)} />
      <rect x={x - 4.4} y={y - 2} width={3.4} height={2.2} rx={1} fill={k('#ffffff')} {...ol(0.5)} />
      <path d={`M${x - 1.6} ${y - 1.2} H${x + 6} V${y + 1.4} H${x - 1.6} Z`} fill={k(C.pink)} {...ol(0.6)} />
      <path className="illu-twinkle" style={origin(x + 3, y - 5)} d={`M${x + 3} ${y - 7} l0.6 1.4 l1.4 0.6 l-1.4 0.6 l-0.6 1.4 l-0.6 -1.4 l-1.4 -0.6 l1.4 -0.6 z`} fill={k(C.yellow)} />
    </g>
  ),
  garden: (k, s, x, y) => (
    <g>
      <rect x={x - 6} y={y + 0.5} width={9} height={3.4} rx={1.4} fill={k(s === 'winter' ? '#e4ebf0' : '#a87956')} {...ol(0.7)} />
      {s !== 'winter' &&
        [x - 4.2, x - 1.5, x + 1.2].map((cx) => (
          <path key={cx} d={`M${cx} ${y + 1} q-0.6 -1.6 -1.2 -1.6 M${cx} ${y + 1} q0.6 -1.6 1.2 -1.6`} fill="none" stroke={k(C.green)} strokeWidth={0.7} strokeLinecap="round" />
        ))}
      <path d={`M${x + 5} ${y + 4} V${y - 1}`} stroke={k('#a8774a')} strokeWidth={1.2} />
      {s === 'winter' ? (
        <path d={`M${x + 5} ${y - 1} l-2 -3 M${x + 5} ${y - 1} l2 -3.4 M${x + 5} ${y - 1} v-4`} stroke={k('#a8774a')} strokeWidth={0.7} strokeLinecap="round" />
      ) : (
        <g>
          <circle cx={x + 5} cy={y - 3.4} r={3.4} fill={k(MPAL[s].leaf)} {...ol(0.6)} />
          <circle cx={x + 4} cy={y - 3.8} r={0.7} fill={k(s === 'spring' ? C.rose : C.red)} />
          <circle cx={x + 6.3} cy={y - 2.6} r={0.7} fill={k(s === 'spring' ? C.rose : C.red)} />
        </g>
      )}
    </g>
  ),
  quarry: (k, s, x, y) => (
    <g>
      <path d={`M${x - 7.5} ${y + 4} V${y - 1} Q${x - 7.5} ${y - 2} ${x - 6.5} ${y - 2} H${x - 3.5} V${y - 5} Q${x - 3.5} ${y - 6} ${x - 2.5} ${y - 6} H${x + 2} V${y - 3.6} H${x + 6} Q${x + 7} ${y - 3.6} ${x + 7} ${y - 2.6} V${y + 4} Z`} fill={k(s === 'winter' ? '#e6d2ad' : '#ebcd92')} {...ol(0.9)} />
      {s === 'winter' && (
        <path d={`M${x - 7.3} ${y - 1.4} Q${x - 7.3} ${y - 2} ${x - 6.5} ${y - 2} H${x - 3.6} M${x - 3.4} ${y - 5.4} Q${x - 3.4} ${y - 6} ${x - 2.5} ${y - 6} H${x + 1.8} M${x + 2.2} ${y - 3.6} H${x + 6.4}`} fill="none" stroke={k('#ffffff')} strokeWidth={1.2} strokeLinecap="round" />
      )}
      <path d={`M${x - 7} ${y + 1} H${x + 6.6} M${x - 3} ${y - 2.4} H${x + 1.6} M${x - 1} ${y + 1} V${y + 4} M${x + 3.6} ${y - 3.4} V${y + 1} M${x - 5} ${y - 2} V${y + 1}`} fill="none" stroke={k('#d6ad6c')} strokeWidth={0.6} />
      {miniTree(k, s, x - 0.5, y - 6, 0.6, true)}
      <ellipse cx={x + 1.5} cy={y + 4.6} rx={4.2} ry={1.3} fill={k(s === 'winter' ? '#dcecf4' : '#82cfd8')} {...ol(0.5)} />
    </g>
  ),
  bus: (k, _s, x, y) => (
    <g>
      <rect x={x - 7} y={y - 4} width={14} height={7} rx={2} fill={k('#e2493b')} {...ol(0.9)} />
      {[x - 5.4, x - 2, x + 1.4].map((wx) => (
        <rect key={wx} x={wx} y={y - 2.8} width={2.8} height={2.6} rx={0.5} fill={k('#d8eef8')} />
      ))}
      <rect x={x + 4.6} y={y - 2.8} width={1.6} height={4.6} rx={0.4} fill={k('#d8eef8')} />
      <circle cx={x - 4} cy={y + 3} r={1.4} fill={k('#4a4a4a')} />
      <circle cx={x + 4} cy={y + 3} r={1.4} fill={k('#4a4a4a')} />
      <path d={`M${x - 2} ${y - 4} L${x - 3} ${y - 6.5} M${x + 2} ${y - 4} L${x + 3} ${y - 6.5} M${x - 4} ${y - 6.5} H${x + 4}`} stroke={k(SOFT)} strokeWidth={0.5} />
    </g>
  ),
  zytglogge: (k, s, x, y) => (
    <g>
      <rect x={x - 4} y={y - 5} width={8} height={12} fill={k('#ead2a1')} {...ol(0.9)} />
      <path d={`M${x - 5.2} ${y - 4.6} L${x} ${y - 11} L${x + 5.2} ${y - 4.6} Z`} fill={k('#c9654a')} {...ol(0.9)} />
      {s === 'winter' && roofSnow(k, x - 5.2, y - 4.6, x, y - 11, x + 5.2, y - 4.6)}
      <circle cx={x} cy={y - 11.4} r={0.7} fill={k(C.yellow)} />
      <circle cx={x} cy={y - 1} r={2.6} fill={k(C.yellow)} {...ol(0.5)} />
      <circle cx={x} cy={y - 1} r={1.9} fill={k('#3f6fa8')} />
      <path d={`M${x} ${y - 1} V${y - 2.4} M${x} ${y - 1} L${x + 1} ${y - 0.5}`} stroke={k(C.yellow)} strokeWidth={0.4} strokeLinecap="round" />
      <path d={`M${x - 1.8} ${y + 7} V${y + 4} A1.8 1.8 0 0 1 ${x + 1.8} ${y + 4} V${y + 7} Z`} fill={k('#a78560')} />
    </g>
  ),
  market: (k, s, x, y) => (
    <g>
      {[
        [x - 6.6, '#7fb77e'],
        [x + 0.6, '#e86f5e'],
      ].map(([sx, col]) => (
        <g key={sx as number}>
          <path d={`M${(sx as number) + 0.6} ${y - 1} V${y + 4.5} M${(sx as number) + 5.4} ${y - 1} V${y + 4.5}`} stroke={k('#a8774a')} strokeWidth={0.7} />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${(sx as number) + i * 2} ${y - 1} L${(sx as number) + 0.4 + i * 1.8} ${y - 4.5} H${(sx as number) + 0.4 + (i + 1) * 1.8} L${(sx as number) + (i + 1) * 2} ${y - 1} Z`}
              fill={k(i % 2 ? '#ffffff' : (col as string))}
              {...ol(0.4)}
            />
          ))}
          <rect x={sx as number} y={y + 1.6} width={6} height={1.6} rx={0.5} fill={k('#c49166')} {...ol(0.4)} />
          <circle cx={(sx as number) + 1.6} cy={y + 1} r={0.9} fill={k(s === 'autumn' || s === 'winter' ? C.orange : C.red)} />
          <circle cx={(sx as number) + 3.8} cy={y + 1} r={0.9} fill={k(s === 'summer' ? C.yellow : '#7cc36b')} />
        </g>
      ))}
    </g>
  ),
  baerepark: (k, s, x, y) => (
    <g>
      <ellipse cx={x} cy={y + 3} rx={6.6} ry={2.6} fill={k(s === 'winter' ? '#ffffff' : '#a7d684')} {...ol(0.6)} />
      <path d={`M${x + 3} ${y + 3} V${y - 4} M${x + 3} ${y - 1} L${x + 5.5} ${y - 3.5} M${x + 3} ${y - 2.4} L${x + 1} ${y - 5}`} stroke={k('#c9b49a')} strokeWidth={1} strokeLinecap="round" />
      {/* friendly bear head */}
      <circle cx={x - 4.6} cy={y - 4.6} r={1.4} fill={k(C.fur)} {...ol(0.5)} />
      <circle cx={x - 0.4} cy={y - 4.6} r={1.4} fill={k(C.fur)} {...ol(0.5)} />
      <circle cx={x - 2.5} cy={y - 1.8} r={3.5} fill={k(C.fur)} {...ol(0.7)} />
      <ellipse cx={x - 2.5} cy={y - 0.8} rx={1.6} ry={1.1} fill={k(C.furLight)} />
      <circle cx={x - 2.5} cy={y - 1.3} r={0.5} fill={k(C.ink)} />
      <circle cx={x - 3.8} cy={y - 2.8} r={0.45} fill={k(C.ink)} />
      <circle cx={x - 1.2} cy={y - 2.8} r={0.45} fill={k(C.ink)} />
    </g>
  ),
  aare: (k, s, x, y) => (
    <g>
      <path d={`M${x - 5} ${y - 1} q1.5 -1 3 0 q1.5 1 3 0 M${x - 3} ${y + 2.4} q1.5 -1 3 0 q1.5 1 3 0`} fill="none" stroke={k('#e6f8f8')} strokeWidth={0.8} strokeLinecap="round" />
      <path d={`M${x + 5.5} ${y + 5} V${y - 4}`} stroke={k('#a8774a')} strokeWidth={1.1} strokeLinecap="round" />
      <circle cx={x + 5.5} cy={y - 1.8} r={2} fill="none" stroke={k('#ffffff')} strokeWidth={1.4} />
      <circle cx={x + 5.5} cy={y - 1.8} r={2} fill="none" stroke={k(C.red)} strokeWidth={1.4} strokeDasharray="1.57 1.57" />
      {/* little duck */}
      <path d={`M${x - 3.6} ${y - 3.6} q0 2 2.6 2 h2.4 q0.8 -1.8 -1 -1.6 q0.2 -2.2 -1.6 -2 q-1.6 0.2 -1.2 1.8 z`} fill={k(s === 'winter' ? '#ffffff' : C.yellow)} {...ol(0.5)} />
      <path d={`M${x - 4.3} ${y - 4.5} l-1 0.4 l1 0.4`} fill={k(C.orange)} />
    </g>
  ),
  gurten: (k, s, x, y) => (
    <g>
      <path d={`M${x - 8} ${y + 6} Q${x - 4} ${y - 3} ${x} ${y - 3} Q${x + 4} ${y - 3} ${x + 8} ${y + 6} Z`} fill={k(s === 'winter' ? '#ffffff' : s === 'autumn' ? '#d9d394' : '#97cf74')} {...ol(0.8)} />
      <path d={`M${x - 1.6} ${y - 3} L${x - 0.6} ${y - 10} M${x + 1.6} ${y - 3} L${x + 0.6} ${y - 10} M${x - 1.3} ${y - 5} H${x + 1.3} M${x - 1} ${y - 7.4} H${x + 1}`} stroke={k('#9c7b62')} strokeWidth={0.6} strokeLinecap="round" />
      <path d={`M${x - 1.6} ${y - 10} L${x} ${y - 12} L${x + 1.6} ${y - 10} Z`} fill={k('#b85a44')} />
      {s !== 'winter' && <rect x={x + 2} y={y + 1} width={3.4} height={2} fill={k('#f2d7d0')} transform={`rotate(-8 ${x + 3.7} ${y + 2})`} />}
    </g>
  ),
  zoo: (k, s, x, y) => (
    <g>
      {miniTree(k, s, x - 4.5, y + 1, 0.9, true)}
      {miniTree(k, s, x + 5, y, 0.8, true)}
      {/* deer */}
      <ellipse cx={x} cy={y + 1} rx={3} ry={1.8} fill={k('#c98a5b')} {...ol(0.5)} />
      <path d={`M${x - 1.8} ${y + 2.4} v2 M${x + 1.8} ${y + 2.4} v2`} stroke={k('#8b5a2b')} strokeWidth={0.6} />
      <circle cx={x + 2.6} cy={y - 1.6} r={1.4} fill={k('#c98a5b')} {...ol(0.5)} />
      <path d={`M${x + 2.2} ${y - 2.8} l-0.6 -2 M${x + 1.9} ${y - 3.8} l-1 -0.4 M${x + 3.2} ${y - 2.8} l0.8 -2 M${x + 3.7} ${y - 3.9} l1 -0.3`} stroke={k('#8b5a2b')} strokeWidth={0.5} strokeLinecap="round" />
      <path d={`M${x - 7} ${y + 5} H${x + 7} M${x - 7} ${y + 3.4} H${x + 7}`} stroke={k('#b07e55')} strokeWidth={0.7} />
      {[-6.4, -2, 2.4, 6.4].map((dx) => (
        <path key={dx} d={`M${x + dx} ${y + 2.4} V${y + 5.8}`} stroke={k('#8b5a2b')} strokeWidth={0.8} strokeLinecap="round" />
      ))}
    </g>
  ),
  chindsgi: (k, s, x, y) => (
    <g>
      <rect x={x - 6} y={y - 2.5} width={12} height={7} rx={1} fill={k('#fdf0c8')} {...ol(0.9)} />
      <path d={`M${x - 7.4} ${y - 2} Q${x} ${y - 9} ${x + 7.4} ${y - 2} Z`} fill={k(C.orange)} {...ol(0.9)} />
      {s === 'winter' && <path d={`M${x - 4.5} ${y - 4.6} Q${x} ${y - 9} ${x + 4.5} ${y - 4.6} Q${x} ${y - 5.6} ${x - 4.5} ${y - 4.6}Z`} fill={k('#ffffff')} />}
      <circle cx={x} cy={y - 4.6} r={1.1} fill={k(C.yellow)} />
      <rect x={x - 4.8} y={y - 0.8} width={2.4} height={2.2} fill={k(C.red)} />
      <rect x={x + 2.4} y={y - 0.8} width={2.4} height={2.2} fill={k(C.blue)} />
      <rect x={x - 1.2} y={y + 0.6} width={2.4} height={3.9} rx={1} fill={k(C.green)} />
    </g>
  ),
  school: (k, s, x, y) => (
    <g>
      <rect x={x - 7} y={y - 2} width={14} height={7} fill={k('#e3d6c1')} {...ol(0.9)} />
      <path d={`M${x - 8} ${y - 1.6} L${x - 4.5} ${y - 5} H${x + 4.5} L${x + 8} ${y - 1.6} Z`} fill={k('#8a6a8e')} {...ol(0.9)} />
      {s === 'winter' && <rect x={x - 4.2} y={y - 5} width={8.4} height={1.1} rx={0.5} fill={k('#ffffff')} />}
      <rect x={x - 1.6} y={y - 9} width={3.2} height={4.2} fill={k('#e3d6c1')} {...ol(0.6)} />
      <path d={`M${x - 2.2} ${y - 8.8} L${x} ${y - 11} L${x + 2.2} ${y - 8.8} Z`} fill={k('#8a6a8e')} {...ol(0.5)} />
      <circle cx={x} cy={y - 7} r={0.8} fill={k(C.yellow)} />
      {[x - 5.6, x - 3, x + 1.4, x + 4].map((wx) => (
        <rect key={wx} x={wx} y={y - 0.4} width={1.8} height={2} fill={k('#d8eef8')} />
      ))}
      <rect x={x - 1} y={y + 2} width={2} height={3} fill={k('#8b5a2b')} />
    </g>
  ),
  playground: (k, s, x, y) => (
    <g>
      <path d={`M${x - 7} ${y + 4} L${x - 5.6} ${y - 4} L${x - 4.2} ${y + 4} M${x - 0.8} ${y + 4} L${x + 0.2} ${y - 4}`} fill="none" stroke={k('#5f9bd1')} strokeWidth={0.9} strokeLinecap="round" />
      <path d={`M${x - 6.2} ${y - 4} H${x + 0.8}`} stroke={k(C.red)} strokeWidth={1} strokeLinecap="round" />
      <g className="illu-wag" style={origin(x - 2.6, y - 4)}>
        <path d={`M${x - 3.6} ${y - 4} V${y + 1} M${x - 1.6} ${y - 4} V${y + 1}`} stroke={k(SOFT)} strokeWidth={0.35} />
        <rect x={x - 4} y={y + 0.8} width={2.8} height={0.9} rx={0.4} fill={k(C.yellow)} />
      </g>
      <path d={`M${x + 3} ${y + 4} V${y - 3}`} stroke={k(C.yellow)} strokeWidth={0.8} />
      <path d={`M${x + 3} ${y - 3} Q${x + 6} ${y - 2} ${x + 6.4} ${y + 1.4} L${x + 7.4} ${y + 4}`} fill="none" stroke={k('#e86f5e')} strokeWidth={1.3} strokeLinecap="round" />
      <ellipse cx={x - 2} cy={y + 5.4} rx={4} ry={1} fill={k(s === 'winter' ? '#ffffff' : C.sand)} />
    </g>
  ),
}

/* ---------------------------------- map ---------------------------------- */

export function WorldMap(props: { season: Season; unlocked: PlaceId[]; highlight?: PlaceId }): ReactElement {
  const { season, unlocked, highlight } = props
  const p = MPAL[season]
  const winter = season === 'winter'
  const id: K = (col) => col
  const fade: K = (col) => (col.startsWith('#') && col.length === 7 ? mix(col, GREY, 0.62) : col)
  const riverD = segD(RIVER)
  const roadD = segD(ROAD)
  const ripples = RIVER_PTS.filter((_, i) => i % 6 === 3)

  const oldTownRoofs: [number, number, number][] = [
    [84, 25, 1], [92, 23, 0.9], [100, 22, 1], [108, 22, 0.9], [116, 22, 1], [124, 25, 0.9],
    [86, 48, 0.9], [94, 50, 1], [114, 49, 0.9], [122, 47, 1], [129, 42, 0.8], [130, 30, 0.8], [79, 40, 0.8],
  ]
  const villageRoofs: [number, number][] = [
    [8, 22], [6, 64], [30, 64], [56, 64], [58, 36], [8, 86],
  ]

  return (
    <g className={`world-map season-${season}`}>
      {/* land */}
      <rect x={0} y={0} width={160} height={90} fill={p.land} />
      {/* soft patchwork fields */}
      {[
        [56, 54, 18, 9, p.field, -8],
        [74, 26, 12, 8, p.fieldB, 6],
        [4, 40, 7, 9, p.fieldB, 0],
        [22, 82, 12, 6, p.field, 4],
        [148, 46, 10, 8, p.field, -5],
      ].map(([x, y, w, h, col, r], i) => (
        <g key={i} transform={`rotate(${r} ${(x as number) + (w as number) / 2} ${(y as number) + (h as number) / 2})`}>
          <rect x={x as number} y={y as number} width={w as number} height={h as number} rx={2.5} fill={col as string} />
          {!winter && (
            <path
              d={Array.from({ length: 3 }, (_, j) => `M${(x as number) + 2} ${(y as number) + ((j + 1) * (h as number)) / 4} H${(x as number) + (w as number) - 2}`).join(' ')}
              stroke={p.landDark}
              strokeWidth={0.5}
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
      {/* Gurten hill */}
      <path d="M118 92 Q130 70 146 68 Q156 68 166 80 V92 Z" fill={p.landDark} />
      {/* old town ground */}
      <path d="M78 26 Q100 17 126 21 Q140 30 133 46 Q118 56 96 53 Q78 50 76 40 Q75 32 78 26 Z" fill={winter ? '#f4f1ec' : '#ecdcb8'} />
      {/* river Aare */}
      <path d={riverD} fill="none" stroke={SOFT} strokeWidth={8.4} strokeLinecap="round" />
      <path d={riverD} fill="none" stroke={p.river} strokeWidth={7} strokeLinecap="round" />
      {winter && <path d={riverD} fill="none" stroke="#e8f3f6" strokeWidth={1.4} strokeDasharray="3 5" strokeLinecap="round" />}
      {ripples.map(([x, y], i) => (
        <path key={i} className="illu-bob" style={{ ...origin(x, y), animationDelay: `${i * 0.2}s`, animationDuration: '1.8s' }} d={`M${x - 1.6} ${y} q0.8 -0.7 1.6 0 q0.8 0.7 1.6 0`} fill="none" stroke={p.ripple} strokeWidth={0.6} strokeLinecap="round" />
      ))}
      {/* bridge to the bear park */}
      <rect x={135} y={34.6} width={10} height={2.8} rx={0.8} fill="#c9a77e" {...ol(0.6)} />
      <path d="M136 35 V37 M139 35 V37 M142 35 V37" stroke={SOFT} strokeWidth={0.3} />
      {/* footpaths */}
      <path d={segD(PATHS)} fill="none" stroke={winter ? '#d5dee6' : '#efe2c2'} strokeWidth={1.4} strokeDasharray="0.1 2.2" strokeLinecap="round" />
      {/* road + bus line */}
      <path d={roadD} fill="none" stroke={SOFT} strokeWidth={4.4} strokeLinecap="round" />
      <path d={roadD} fill="none" stroke={winter ? '#f2f4f6' : '#f1e3c4'} strokeWidth={3.4} strokeLinecap="round" />
      <path d={roadD} fill="none" stroke="#e2493b" strokeWidth={0.6} strokeDasharray="2 2" opacity={0.6} />
      {/* old town roofs */}
      {oldTownRoofs.map(([x, y, s]) => (
        <g key={`${x}-${y}`}>{house(id, winter, x, y, s * 0.75, '#efdcb6', '#c9654a')}</g>
      ))}
      {villageRoofs.map(([x, y]) => (
        <g key={`${x}-${y}`}>{house(id, winter, x, y, 0.62, '#f3e3c8', '#c98a6b')}</g>
      ))}
      {/* forest */}
      {TREES.map((t) => miniTree(id, season, t.x, t.y, t.s, t.fir))}
      {/* landmarks */}
      {MAP_SPOTS.map(({ place, x, y }) => {
        const alive = unlocked.includes(place)
        const draw = LANDMARKS[place]
        return (
          <g key={place} opacity={alive ? 1 : 0.75}>
            {highlight === place && (
              <g>
                <circle className="illu-twinkle" style={origin(x, y)} cx={x} cy={y} r={9.5} fill="#fff3c4" opacity={0.9} />
                <circle cx={x} cy={y} r={9.5} fill="none" stroke={C.yellow} strokeWidth={0.9} strokeDasharray="2 1.6" />
              </g>
            )}
            {!alive && <ellipse cx={x} cy={y + 4} rx={7.5} ry={2.4} fill={mix(p.land, GREY, 0.5)} />}
            {draw(alive ? id : fade, season, x, y)}
            {!alive && (
              <g fill="none" stroke={GREY} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round">
                <path d={`M${x + 4.5} ${y - 9} h1.8 l-1.8 1.8 h1.8`} />
                <path d={`M${x + 7} ${y - 11.4} h1.3 l-1.3 1.3 h1.3`} />
              </g>
            )}
          </g>
        )
      })}
      {/* frame */}
      <rect x={0.8} y={0.8} width={158.4} height={88.4} rx={4} fill="none" stroke={SOFT} strokeWidth={1.2} opacity={0.5} />
    </g>
  )
}

