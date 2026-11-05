import type { ReactNode } from 'react'
import type { Pose } from '@content/types'
import type { IlluMap, IlluProps } from './types'
import { C, line, origin, Shadow, Eyes } from './kit'

/* =====================================================================================
 * Tatzli & cast. Everything is drawn on one shared "skeleton" (100×100, feet on y≈91):
 *   shoulders SL/SR, hips HL/HR, head centred at (50,35), body at (50,69).
 * A pose is a small `Rig` (hand / foot positions, face, tilt, props), so every character
 * built on the skeleton (bears, Kasia, Freddie) can do every pose cheaply.
 * Animated groups (classes tz-fig / tz-head / tz-al / tz-ar / tz-ll / tz-lr / tz-fx) never carry a
 * transform attribute themselves – static transforms live on a wrapping <g>, so CSS keyframes
 * in characters.css don't clobber them.
 * ===================================================================================== */

type P = readonly [number, number]
type Face =
  | 'smile' | 'grin' | 'laugh' | 'love' | 'sleep' | 'sad' | 'cry' | 'o' | 'sing' | 'chew' | 'sip'
  | 'grumpy' | 'startled' | 'surprised' | 'tired' | 'tongue' | 'pant' | 'teeth' | 'focus' | 'side' | 'down'
type PawKind = 'paw' | 'open' | 'count' | 'flat' | 'point' | 'fist' | 'none'
type Species = 'bear' | 'squirrel' | 'fox'

interface Rig {
  lh: P
  rh: P
  le?: P
  re?: P
  lf: P
  rf: P
  lk?: P
  rk?: P
  lsole?: boolean
  rsole?: boolean
  lp?: PawKind
  rp?: PawKind
  lpa?: number
  rpa?: number
  face?: Face
  tilt?: number
  lean?: number
  dx?: number
  dy?: number
  sx?: number
  sy?: number
  rot?: number
  shadow?: number
  shadowX?: number
  back?: boolean
  neck?: number
  noScarf?: boolean
  under?: ReactNode
  mid?: ReactNode
  over?: ReactNode
  fx?: ReactNode
  hat?: ReactNode
}

interface Look {
  species: Species
  fur: string
  light: string
  scarf?: readonly [string, string] | null
  lashes?: boolean
  tuft?: boolean
  tail?: ReactNode
  body?: ReactNode
  head?: ReactNode
  headBack?: ReactNode
  front?: ReactNode
}

const SL: P = [38, 61]
const SR: P = [62, 61]
const HL: P = [44, 79]
const HR: P = [56, 79]
const MOUTH_DARK = '#7d3a33'

/* ------------------------------- small shape helpers ------------------------------- */

const pt = (p: P) => `${p[0]} ${p[1]}`

function Limb({ a, c, b, w, fur }: { a: P; c?: P; b: P; w: number; fur: string }) {
  const d = c ? `M${pt(a)} Q${pt(c)} ${pt(b)}` : `M${pt(a)} L${pt(b)}`
  return (
    <>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={w + 4.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fur} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

function Paw({ at, kind, fur, light, angle = 0 }: { at: P; kind: PawKind; fur: string; light: string; angle?: number }) {
  const [x, y] = at
  if (kind === 'none') return null
  if (kind === 'flat') {
    return <ellipse cx={x} cy={y} rx={7.5} ry={3.6} transform={`rotate(${angle} ${x} ${y})`} fill={fur} {...line(2.2)} />
  }
  const finger = (fx: number, fy: number, rot: number) => (
    <ellipse key={`${fx}-${fy}`} cx={fx} cy={fy} rx={2.4} ry={4.4} transform={`rotate(${rot} ${fx} ${fy})`} fill={fur} {...line(1.8)} />
  )
  const rad = (angle * Math.PI) / 180
  return (
    <g>
      {kind === 'count' && [finger(x - 4, y - 6.6, -20), finger(x, y - 8.4, 0), finger(x + 4, y - 6.6, 20)]}
      {kind === 'point' && (
        <Limb a={[x, y]} b={[x + Math.cos(rad) * 7.5, y + Math.sin(rad) * 7.5]} w={3} fur={fur} />
      )}
      <circle cx={x} cy={y} r={5.3} fill={fur} {...line(2.2)} />
      {kind === 'open' && (
        <g fill={light}>
          <ellipse cx={x} cy={y + 1.3} rx={2.7} ry={2.1} />
          <circle cx={x - 2.7} cy={y - 2.2} r={1.05} />
          <circle cx={x} cy={y - 3.1} r={1.05} />
          <circle cx={x + 2.7} cy={y - 2.2} r={1.05} />
        </g>
      )}
      {kind === 'fist' && <path d={`M${x - 2.6} ${y - 1} q1.3 1.6 2.6 0 q1.3 1.6 2.6 0`} fill="none" {...line(1.3)} />}
    </g>
  )
}

function Foot({ at, sole, fur, light }: { at: P; sole?: boolean; fur: string; light: string }) {
  const [x, y] = at
  if (sole) {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={6.2} ry={7} fill={fur} {...line(2.2)} />
        <ellipse cx={x} cy={y + 1.8} rx={3.4} ry={2.8} fill={light} />
        <circle cx={x - 3} cy={y - 3.2} r={1.3} fill={light} />
        <circle cx={x} cy={y - 4.4} r={1.3} fill={light} />
        <circle cx={x + 3} cy={y - 3.2} r={1.3} fill={light} />
      </g>
    )
  }
  return <ellipse cx={x} cy={y} rx={7.2} ry={4.4} fill={fur} {...line(2.2)} />
}

export function Heart({ x, y, s = 5, fill = C.red }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      d={`M${x} ${y + s * 0.95} C${x - s * 1.5} ${y - s * 0.1} ${x - s * 0.75} ${y - s * 1.25} ${x} ${y - s * 0.45} C${x + s * 0.75} ${y - s * 1.25} ${x + s * 1.5} ${y - s * 0.1} ${x} ${y + s * 0.95} Z`}
      fill={fill}
      {...line(1.6)}
    />
  )
}

function Sparkle({ x, y, s = 3, fill = C.yellow }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g className="illu-twinkle" style={origin(x, y)}>
      <path d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`} fill={fill} {...line(1.1)} />
    </g>
  )
}

function Note({ x, y, fill = C.purple, s = 1 }: { x: number; y: number; fill?: string; s?: number }) {
  return (
    <g transform={s === 1 ? undefined : `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <g className="illu-twinkle" style={origin(x, y)}>
        <path d={`M${x + 2.2} ${y} V${y - 9} Q${x + 5} ${y - 7.5} ${x + 6} ${y - 5}`} fill="none" {...line(1.6)} />
        <ellipse cx={x} cy={y} rx={2.8} ry={2.1} transform={`rotate(-20 ${x} ${y})`} fill={fill} {...line(1.4)} />
      </g>
    </g>
  )
}

function Zed({ x, y, s = 4 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x} ${y} h${s} l${-s} ${s * 1.1} h${s}`} fill="none" stroke={C.navy} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
}

function Zzz({ x, y }: { x: number; y: number }) {
  return (
    <g className="tz-zzz">
      <Zed x={x} y={y + 8} s={3.2} />
      <Zed x={x + 5} y={y + 2} s={4.2} />
      <Zed x={x + 11} y={y - 5} s={5.2} />
    </g>
  )
}

function Drop({ x, y, s = 1, fill = C.water }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      d={`M${x} ${y - 3.6 * s} Q${x + 3.2 * s} ${y + 0.6 * s} ${x} ${y + 2.6 * s} Q${x - 3.2 * s} ${y + 0.6 * s} ${x} ${y - 3.6 * s} Z`}
      fill={fill}
      {...line(1.3)}
    />
  )
}

function Lines({ d, w = 1.8 }: { d: string; w?: number }) {
  return <path d={d} fill="none" stroke={C.inkSoft} strokeWidth={w} strokeLinecap="round" />
}

function Arrow({ d, head, color = C.orange }: { d: string; head: string; color?: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <path d={head} fill={color} {...line(1.4)} />
    </g>
  )
}

/** Soft glowing highlight ring for body-part words. */
function Halo({ x, y, rx, ry = rx, rot = 0 }: { x: number; y: number; rx: number; ry?: number; rot?: number }) {
  return (
    <g transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      <g className="tz-glow">
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.yellow} fillOpacity={0.22} stroke={C.yellow} strokeOpacity={0.35} strokeWidth={7} />
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={C.orange} strokeWidth={3.4} />
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={C.yellow} strokeWidth={1.8} />
      </g>
    </g>
  )
}

/* ------------------------------------ props ------------------------------------ */

function Book({ x, y, w = 30, h = 17, cover = C.blue }: { x: number; y: number; w?: number; h?: number; cover?: string }) {
  const l = x - w / 2
  const t = y - h / 2
  return (
    <g>
      <path d={`M${l - 1.5} ${t + 2} L${x} ${t + 4} L${l + w + 1.5} ${t + 2} L${l + w + 1.5} ${t + h + 2} L${x} ${t + h + 4} L${l - 1.5} ${t + h + 2} Z`} fill={cover} {...line(2)} />
      <path d={`M${l} ${t} Q${x - w / 4} ${t - 1.5} ${x} ${t + 2} Q${x + w / 4} ${t - 1.5} ${l + w} ${t} L${l + w} ${t + h} Q${x + w / 4} ${t + h - 1.5} ${x} ${t + h + 2} Q${x - w / 4} ${t + h - 1.5} ${l} ${t + h} Z`} fill={C.white} {...line(2)} />
      <path d={`M${x} ${t + 2} V${t + h + 2}`} {...line(1.4)} />
      <g stroke={C.greyLight} strokeWidth={1.4} strokeLinecap="round">
        {[0.3, 0.5, 0.7].map((f) => (
          <g key={f}>
            <path d={`M${l + 3} ${t + h * f} H${x - 3}`} />
            <path d={`M${x + 3} ${t + h * f} H${l + w - 3}`} />
          </g>
        ))}
      </g>
    </g>
  )
}

function Cup({ x, y, fill = C.sky, tilt = 0, drink = C.water }: { x: number; y: number; fill?: string; tilt?: number; drink?: string | null }) {
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <path d={`M${x + 5} ${y - 3} q5 0 5 4 q0 4 -5.5 4`} fill="none" {...line(2)} />
      <path d={`M${x - 6} ${y - 6} L${x + 6} ${y - 6} L${x + 5} ${y + 7} Q${x} ${y + 9} ${x - 5} ${y + 7} Z`} fill={fill} {...line(2)} />
      {drink && <ellipse cx={x} cy={y - 6} rx={5.6} ry={1.6} fill={drink} {...line(1.4)} />}
      {!drink && <ellipse cx={x} cy={y - 6} rx={5.6} ry={1.6} fill={C.white} {...line(1.4)} />}
    </g>
  )
}

function Cookie({ x, y, r = 5.5 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={`M${x + r} ${y} A${r} ${r} 0 1 1 ${x + r * 0.5} ${y - r * 0.85} q-1.6 1.4 -0.2 2.6 q-1.6 1 0 2.6 Z`} fill="#d9a05b" {...line(1.8)} />
      <circle cx={x - 2} cy={y - 1} r={0.9} fill={C.ink} />
      <circle cx={x + 1} cy={y + 2} r={0.9} fill={C.ink} />
      <circle cx={x - 2.4} cy={y + 2.6} r={0.8} fill={C.ink} />
    </g>
  )
}

function Apple({ x, y, r = 5.5 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={`M${x} ${y - r * 0.7} C${x - r * 1.5} ${y - r * 1.4} ${x - r * 1.4} ${y + r * 1.1} ${x} ${y + r * 0.95} C${x + r * 1.4} ${y + r * 1.1} ${x + r * 1.5} ${y - r * 1.4} ${x} ${y - r * 0.7} Z`} fill={C.red} {...line(1.8)} />
      <path d={`M${x} ${y - r * 0.7} q0.5 -2.4 2 -3.2`} fill="none" {...line(1.6)} />
      <path d={`M${x + 0.6} ${y - r * 1.05} q3 -2.6 5 -0.8 q-2.6 2 -5 0.8 Z`} fill={C.leaf} {...line(1.2)} />
      <ellipse cx={x - r * 0.45} cy={y - r * 0.15} rx={r * 0.18} ry={r * 0.32} fill={C.white} opacity={0.6} />
    </g>
  )
}

function Gift({ x, y, s = 10 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <rect x={x - s} y={y - s * 0.7} width={s * 2} height={s * 1.5} rx={1.5} fill={C.rose} {...line(2)} />
      <rect x={x - s - 1} y={y - s * 0.95} width={s * 2 + 2} height={s * 0.45} rx={1.2} fill={C.rose} {...line(2)} />
      <path d={`M${x} ${y - s * 0.95} V${y + s * 0.8}`} stroke={C.yellow} strokeWidth={3} />
      <path d={`M${x} ${y - s * 0.95} q-5 -5 -6.5 -1.5 q1 2.5 6.5 1.5 q5 -5 6.5 -1.5 q-1 2.5 -6.5 1.5`} fill={C.yellow} {...line(1.5)} />
    </g>
  )
}

function Ball({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.yellow} {...line(2)} />
      <path d={`M${x - r} ${y} Q${x} ${y + r * 0.6} ${x + r} ${y}`} fill="none" stroke={C.red} strokeWidth={2.4} />
      <path d={`M${x} ${y - r} Q${x - r * 0.6} ${y} ${x} ${y + r}`} fill="none" stroke={C.blue} strokeWidth={2.4} />
      <circle cx={x} cy={y} r={r} fill="none" {...line(2)} />
    </g>
  )
}

function Block({ x, y, s = 9, fill = C.blue, mark = C.white }: { x: number; y: number; s?: number; fill?: string; mark?: string }) {
  return (
    <g>
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={1.6} fill={fill} {...line(2)} />
      <circle cx={x} cy={y} r={s * 0.2} fill={mark} />
    </g>
  )
}

/* --------------------------------- face & head --------------------------------- */

const EY = 32
const EX1 = 40.5
const EX2 = 59.5

function FaceParts({ f, fur, lashes }: { f: Face; fur: string; lashes?: boolean }) {
  const ink = C.ink
  const eyeHappy = (x: number) => <path key={x} d={`M${x - 3.8} ${EY + 1.2} Q${x} ${EY - 3.6} ${x + 3.8} ${EY + 1.2}`} fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
  const eyeShut = (x: number) => <path key={x} d={`M${x - 3.8} ${EY - 0.4} Q${x} ${EY + 3.4} ${x + 3.8} ${EY - 0.4}`} fill="none" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
  const eyeWide = (x: number) => (
    <g key={x}>
      <circle cx={x} cy={EY} r={5.2} fill={C.white} {...line(1.8)} />
      <circle cx={x} cy={EY + 0.4} r={2.5} fill={ink} />
      <circle cx={x + 0.9} cy={EY - 0.5} r={0.8} fill={C.white} />
    </g>
  )
  const eyeLid = (x: number) => (
    <g key={x}>
      <circle cx={x} cy={EY + 0.6} r={3.4} fill={ink} />
      <path d={`M${x - 4.8} ${EY + 0.6} A4.8 4.8 0 0 1 ${x + 4.8} ${EY + 0.6} Z`} fill={fur} />
      <path d={`M${x - 4.2} ${EY + 0.6} Q${x} ${EY + 1.6} ${x + 4.2} ${EY + 0.6}`} fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
    </g>
  )

  let eyes: ReactNode
  switch (f) {
    case 'laugh':
    case 'love':
    case 'sing':
    case 'chew':
    case 'sip':
      eyes = [eyeHappy(EX1), eyeHappy(EX2)]
      break
    case 'sleep':
      eyes = [eyeShut(EX1), eyeShut(EX2)]
      break
    case 'startled':
    case 'surprised':
      eyes = [eyeWide(EX1), eyeWide(EX2)]
      break
    case 'tired':
      eyes = [eyeLid(EX1), eyeLid(EX2)]
      break
    case 'side':
      eyes = <Eyes x1={EX1 + 1.8} x2={EX2 + 1.8} y={EY} r={3.6} />
      break
    case 'down':
    case 'focus':
      eyes = <Eyes x1={EX1} x2={EX2} y={EY + 1.4} r={3.4} />
      break
    default:
      eyes = <Eyes x1={EX1} x2={EX2} y={EY} r={3.7} />
  }

  let brows: ReactNode = null
  if (f === 'sad' || f === 'cry' || f === 'pant') {
    brows = <path d="M36.5 26.6 Q40 25.6 44 23.4 M63.5 26.6 Q60 25.6 56 23.4" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
  } else if (f === 'grumpy') {
    brows = <path d="M36 24 Q40.5 24.6 44.8 27.4 M64 24 Q59.5 24.6 55.2 27.4" fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" />
  } else if (f === 'startled' || f === 'surprised') {
    brows = <path d="M36.5 24.2 Q40.5 20.4 44.5 23.6 M63.5 24.2 Q59.5 20.4 55.5 23.6" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
  }

  const wMouth = <path d="M50 41.8 V44.2 M45.6 44 Q47.8 47.2 50 44.2 Q52.2 47.2 54.4 44" fill="none" stroke={ink} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  const tongue = <path d="M47.6 45.2 Q47.4 50.8 50 50.8 Q52.6 50.8 52.4 45.2 Z" fill={C.pink} {...line(1.5)} />
  let mouth: ReactNode
  switch (f) {
    case 'grin':
    case 'laugh':
      mouth = (
        <g>
          <path d="M50 41.8 V43.6" stroke={ink} strokeWidth={1.9} strokeLinecap="round" />
          <path d="M44.4 43.6 Q50 45 55.6 43.6 Q55.2 51.8 50 51.8 Q44.8 51.8 44.4 43.6 Z" fill={MOUTH_DARK} {...line(1.8)} />
          <path d="M46.6 49.6 Q50 47.4 53.4 49.6 Q52.4 51.2 50 51.2 Q47.6 51.2 46.6 49.6 Z" fill={C.pink} />
        </g>
      )
      break
    case 'teeth':
      mouth = (
        <g>
          <path d="M50 41.8 V43.6" stroke={ink} strokeWidth={1.9} strokeLinecap="round" />
          <path d="M43.6 43.6 Q50 45 56.4 43.6 Q56 52.6 50 52.6 Q44 52.6 43.6 43.6 Z" fill={MOUTH_DARK} {...line(1.8)} />
          <path d="M44.6 44.4 Q50 45.6 55.4 44.4 L55.1 47.2 Q50 48.2 44.9 47.2 Z" fill={C.white} />
          <path d="M48 45.2 V47.6 M52 45.2 V47.6" stroke={C.greyLight} strokeWidth={0.9} />
          <path d="M47 51.2 Q50 49.2 53 51.2" fill="none" stroke={C.pink} strokeWidth={2} strokeLinecap="round" />
        </g>
      )
      break
    case 'sad':
    case 'cry':
      mouth = <path d="M50 41.8 V44.4 M45.4 48.2 Q50 43.6 54.6 48.2" fill="none" stroke={ink} strokeWidth={1.9} strokeLinecap="round" />
      break
    case 'grumpy':
      mouth = <path d="M50 41.8 V44.6 M46.4 47.6 Q50 44.8 53.6 47.6" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
      break
    case 'o':
    case 'sing':
      mouth = (
        <g>
          <path d="M50 41.8 V43" stroke={ink} strokeWidth={1.8} strokeLinecap="round" />
          <ellipse cx={50} cy={46.6} rx={2.8} ry={3.3} fill={MOUTH_DARK} {...line(1.7)} />
        </g>
      )
      break
    case 'surprised':
    case 'tired':
      mouth = (
        <g>
          <ellipse cx={50} cy={47.2} rx={3.8} ry={4.6} fill={MOUTH_DARK} {...line(1.8)} />
          <ellipse cx={50} cy={49.6} rx={2.2} ry={1.4} fill={C.pink} />
        </g>
      )
      break
    case 'startled':
      mouth = <path d="M45 46.6 q1.25 -1.8 2.5 0 t2.5 0 t2.5 0 t2.5 0" fill="none" stroke={ink} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      break
    case 'tongue':
    case 'pant':
      mouth = (
        <g>
          {tongue}
          <path d="M50 46.4 V49" stroke="#d97f85" strokeWidth={1} strokeLinecap="round" />
          {wMouth}
        </g>
      )
      break
    case 'focus':
      mouth = (
        <g>
          <ellipse cx={54.8} cy={45.8} rx={1.7} ry={2.1} fill={C.pink} {...line(1.2)} />
          {wMouth}
        </g>
      )
      break
    case 'sleep':
      mouth = <path d="M50 41.8 V43.6 M47.6 44.4 Q50 46.4 52.4 44.4" fill="none" stroke={ink} strokeWidth={1.7} strokeLinecap="round" />
      break
    case 'chew':
      mouth = <path d="M50 41.8 V44 M46.6 44.4 Q48.3 46.6 50 44 Q51.7 46.6 53.4 44.4" fill="none" stroke={ink} strokeWidth={1.8} strokeLinecap="round" />
      break
    case 'sip':
      mouth = null
      break
    default:
      mouth = wMouth
  }

  const bigCheeks = f === 'love' || f === 'chew' || f === 'grumpy'
  return (
    <g>
      <g opacity={f === 'love' ? 0.8 : 0.55}>
        <circle cx={34.5} cy={41.5} r={bigCheeks ? 4.6 : 3.4} fill={C.cheek} />
        <circle cx={65.5} cy={41.5} r={bigCheeks ? 4.6 : 3.4} fill={C.cheek} />
      </g>
      {eyes}
      {lashes && (f === 'smile' || f === 'grin' || f === 'side' || f === 'down') && (
        <path d="M36.4 30 l-2.4 -1.2 M37.2 28.2 l-1.8 -1.8 M63.6 30 l2.4 -1.2 M62.8 28.2 l1.8 -1.8" stroke={ink} strokeWidth={1.4} strokeLinecap="round" />
      )}
      {brows}
      <ellipse cx={50} cy={39.3} rx={4.2} ry={2.9} fill={ink} />
      <ellipse cx={48.7} cy={38.4} rx={1.3} ry={0.8} fill={C.white} opacity={0.8} />
      {mouth}
      {f === 'cry' && (
        <g className="tz-tear">
          <Drop x={62} y={39} s={1.05} />
        </g>
      )}
      {f === 'startled' && <Drop x={73} y={24} s={1} fill={C.sky} />}
      {f === 'pant' && <Drop x={73} y={26} s={0.9} fill={C.sky} />}
    </g>
  )
}

function HeadShape({ look, back }: { look: Look; back?: boolean }) {
  const { fur, light, species } = look
  const tuft = look.tuft !== false && species === 'bear'
  let ears: ReactNode
  if (species === 'bear') {
    ears = (
      <g>
        <circle cx={31.5} cy={19.5} r={7.8} fill={fur} {...line(2.3)} />
        <circle cx={68.5} cy={19.5} r={7.8} fill={fur} {...line(2.3)} />
        {!back && <circle cx={32} cy={20} r={4.2} fill={light} />}
        {!back && <circle cx={68} cy={20} r={4.2} fill={light} />}
      </g>
    )
  } else if (species === 'squirrel') {
    ears = (
      <g>
        <path d="M30 27 Q27 14 31 6 Q37 10 42 20 Z" fill={fur} {...line(2.3)} />
        <path d="M70 27 Q73 14 69 6 Q63 10 58 20 Z" fill={fur} {...line(2.3)} />
        <path d="M31 6 q-2 -3 0 -4 M31 6 q1 -3.4 3 -3" fill="none" {...line(1.8)} />
        <path d="M69 6 q2 -3 0 -4 M69 6 q-1 -3.4 -3 -3" fill="none" {...line(1.8)} />
        {!back && <path d="M32.5 22 Q31 15 32.5 11 Q36 14 38 19 Z" fill={light} />}
        {!back && <path d="M67.5 22 Q69 15 67.5 11 Q64 14 62 19 Z" fill={light} />}
      </g>
    )
  } else {
    ears = (
      <g>
        <path d="M29 28 L29.5 5 L45 18 Z" fill={fur} {...line(2.3)} />
        <path d="M71 28 L70.5 5 L55 18 Z" fill={fur} {...line(2.3)} />
        <path d="M29.4 12 L29.5 5 L35 9.6 Z" fill={C.ink} />
        <path d="M70.6 12 L70.5 5 L65 9.6 Z" fill={C.ink} />
        {!back && <path d="M32 24 L32 13 L40 19 Z" fill={light} />}
        {!back && <path d="M68 24 L68 13 L60 19 Z" fill={light} />}
      </g>
    )
  }
  return (
    <g>
      {look.headBack}
      {ears}
      {tuft && <path d="M45 17 Q44.5 10.5 50 10 Q47.6 12.6 49.6 15.4 Q51 9.6 56.5 11.6 Q53.2 12.8 54.6 17 Z" fill={fur} {...line(2)} />}
      <ellipse cx={50} cy={35} rx={22.5} ry={20.5} fill={fur} {...line(2.4)} />
      {!back && <ellipse cx={39} cy={22.5} rx={6} ry={2.8} transform="rotate(-24 39 22.5)" fill={C.white} opacity={0.2} />}
      {!back && species === 'fox' && <path d="M28 37 Q36 54 50 55 Q64 54 72 37 Q62 43 50 37.5 Q38 43 28 37 Z" fill={light} />}
      {!back && species === 'squirrel' && <ellipse cx={50} cy={44} rx={9} ry={6.8} fill={light} />}
      {!back && species === 'bear' && <ellipse cx={50} cy={43.6} rx={10.6} ry={7.6} fill={light} />}
      {back && <path d="M46 22 q4 -3 6 1 q1 3 -3 3" fill="none" stroke={C.inkSoft} strokeWidth={1.4} strokeLinecap="round" />}
    </g>
  )
}

/* ------------------------------------- critter ------------------------------------- */

function figTransform(r: Rig): string | undefined {
  const t: string[] = []
  if (r.dx || r.dy) t.push(`translate(${r.dx ?? 0} ${r.dy ?? 0})`)
  if (r.rot) t.push(`rotate(${r.rot} 50 62)`)
  if (r.lean) t.push(`rotate(${r.lean} 50 90)`)
  if (r.sx || r.sy) t.push(`translate(50 91) scale(${r.sx ?? 1} ${r.sy ?? 1}) translate(-50 -91)`)
  return t.length ? t.join(' ') : undefined
}

function Scarf({ colors, back }: { colors: readonly [string, string]; back?: boolean }) {
  const [base, stripe] = colors
  return (
    <g>
      <path d="M36 53.5 Q50 61 64 53.5 L65 58.4 Q50 67 35 58.4 Z" fill={base} {...line(2.1)} />
      <path d="M35.8 56.1 Q50 64.2 64.4 56.1" fill="none" stroke={stripe} strokeWidth={2.2} />
      {!back && (
        <g>
          <path d="M57.5 60.5 L64.5 59.2 L66.8 72.5 L60 73.8 Z" fill={base} {...line(2.1)} />
          <path d="M61 60.2 L63.4 73.2" stroke={stripe} strokeWidth={2.2} />
          <path d="M60.8 74 l-0.4 2.4 M63.4 73.6 l0 2.4 M66 73 l0.4 2.4" stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      )}
      {back && <circle cx={50} cy={62.5} r={3.4} fill={base} {...line(2)} />}
    </g>
  )
}

function Critter({ rig, look, pose, className }: { rig: Rig; look: Look; pose: string; className?: string }) {
  const { fur, light } = look
  const sh = rig.shadow ?? 1
  const tilt = rig.tilt ?? 0
  const neck = rig.neck ?? 0
  const face: Face = rig.face ?? 'smile'
  const scarf = rig.noScarf ? null : look.scarf
  return (
    <g className={`tz tz-${pose}${className ? ` ${className}` : ''}`}>
      {sh > 0 && <Shadow x={rig.shadowX ?? 50} y={91.5} rx={22 * sh} ry={3.6 * Math.min(1, sh + 0.2)} />}
      {rig.under}
      <g transform={figTransform(rig)}>
        <g className="tz-fig" style={origin(50, 91)}>
          {look.tail}
          <g className="tz-ll" style={origin(HL[0], HL[1])}>
            <Limb a={HL} c={rig.lk} b={rig.lf} w={8.6} fur={fur} />
            <Foot at={rig.lf} sole={rig.lsole} fur={fur} light={light} />
          </g>
          <g className="tz-lr" style={origin(HR[0], HR[1])}>
            <Limb a={HR} c={rig.rk} b={rig.rf} w={8.6} fur={fur} />
            <Foot at={rig.rf} sole={rig.rsole} fur={fur} light={light} />
          </g>
          <ellipse cx={50} cy={69} rx={16.5} ry={16.5} fill={fur} {...line(2.4)} />
          {!rig.back && <ellipse cx={50} cy={72.5} rx={10.5} ry={10} fill={light} />}
          {rig.back && <circle cx={50} cy={82} r={4.2} fill={fur} {...line(2)} />}
          {!rig.back && look.body}
          {neck > 0 && (
            <g>
              <rect x={42} y={50 - neck} width={16} height={neck + 6} fill={fur} />
              <path d={`M42 ${51 - neck} V${55.5} M58 ${51 - neck} V${55.5}`} {...line(2.2)} />
            </g>
          )}
          {scarf && <Scarf colors={scarf} back={rig.back} />}
          <g transform={tilt || neck ? `translate(0 ${-neck}) rotate(${tilt} 50 54)` : undefined}>
            <g className="tz-head" style={origin(50, 54)}>
              <HeadShape look={look} back={rig.back} />
              {!rig.back && <FaceParts f={face} fur={fur} lashes={look.lashes} />}
              {look.head}
              {rig.hat}
            </g>
          </g>
          {rig.mid}
          <g className="tz-al" style={origin(SL[0], SL[1])}>
            <Limb a={SL} c={rig.le} b={rig.lh} w={6.8} fur={fur} />
            <Paw at={rig.lh} kind={rig.lp ?? 'paw'} fur={fur} light={light} angle={rig.lpa} />
          </g>
          <g className="tz-ar" style={origin(SR[0], SR[1])}>
            <Limb a={SR} c={rig.re} b={rig.rh} w={6.8} fur={fur} />
            <Paw at={rig.rh} kind={rig.rp ?? 'paw'} fur={fur} light={light} angle={rig.rpa} />
          </g>
          {rig.over}
          {look.front}
        </g>
      </g>
      {rig.fx && <g className="tz-fx">{rig.fx}</g>}
    </g>
  )
}

/* -------------------------------------- poses -------------------------------------- */

const BASE: Rig = { lh: [30.5, 76], rh: [69.5, 76], lf: [41, 87.5], rf: [59, 87.5], face: 'smile' }
const rig = (r: Partial<Rig>): Rig => ({ ...BASE, ...r })

const SIT: Partial<Rig> = {
  dy: 6, lf: [31, 81], rf: [69, 81], lk: [36, 84], rk: [64, 84], lsole: true, rsole: true,
  lh: [31, 70], le: [32, 74], rh: [69, 70], re: [68, 74], face: 'grin', shadow: 1.25,
}

const LADDER = (
  <g>
    <path d="M28 92 L32 10 M72 92 L68 10" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <path d="M28 92 L32 10 M72 92 L68 10" stroke="#c98d55" strokeWidth={3.2} strokeLinecap="round" />
    {[22, 40, 58, 76].map((y) => (
      <g key={y}>
        <path d={`M31 ${y} H69`} stroke={C.ink} strokeWidth={5.4} strokeLinecap="round" />
        <path d={`M31 ${y} H69`} stroke="#d9a56b" strokeWidth={2.8} strokeLinecap="round" />
      </g>
    ))}
  </g>
)

const BIKE = (
  <g>
    <g className="illu-spin" style={origin(26, 79)}>
      <circle cx={26} cy={79} r={11} fill="none" stroke={C.ink} strokeWidth={4.4} />
      <circle cx={26} cy={79} r={11} fill="none" stroke={C.black} strokeWidth={2} />
      <path d="M26 69 V89 M16 79 H36 M19 72 L33 86 M33 72 L19 86" stroke={C.grey} strokeWidth={1} />
      <circle cx={26} cy={79} r={2} fill={C.ink} />
    </g>
    <g className="illu-spin" style={origin(76, 79)}>
      <circle cx={76} cy={79} r={11} fill="none" stroke={C.ink} strokeWidth={4.4} />
      <circle cx={76} cy={79} r={11} fill="none" stroke={C.black} strokeWidth={2} />
      <path d="M76 69 V89 M66 79 H86 M69 72 L83 86 M83 72 L69 86" stroke={C.grey} strokeWidth={1} />
      <circle cx={76} cy={79} r={2} fill={C.ink} />
    </g>
    <path d="M26 79 L48 79 L42 60 Z M48 79 L68 58 L42 60 M68 58 L76 79 M68 58 L66 52" fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M26 79 L48 79 L42 60 Z M48 79 L68 58 L42 60 M68 58 L76 79 M68 58 L66 52" fill="none" stroke={C.red} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M62 52 H70" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <circle cx={48} cy={79} r={3} fill={C.grey} {...line(1.6)} />
  </g>
)

const RIGS: Record<Pose, Rig> = {
  idle: rig({}),
  stand: rig({
    lh: [33, 78], rh: [67, 78], lf: [42.5, 87.5], rf: [57.5, 87.5], face: 'grin',
    fx: (
      <g>
        <Arrow d="M14 74 V52" head="M9.5 55 L14 47.5 L18.5 55 Z" />
        <Arrow d="M86 74 V52" head="M81.5 55 L86 47.5 L90.5 55 Z" />
      </g>
    ),
  }),
  jump: rig({
    dy: -9, lh: [24, 44], rh: [76, 44], le: [28, 58], re: [72, 58], lf: [38, 84], rf: [62, 84], lk: [38, 86], rk: [62, 86],
    face: 'laugh', shadow: 0.6,
    fx: <Lines d="M38 92 v-3 M50 93 v-4 M62 92 v-3" />,
  }),
  clap: rig({
    lh: [47.5, 62], rh: [52.5, 60], le: [30, 74], re: [70, 74], lp: 'open', rp: 'open', face: 'laugh',
    fx: <Lines d="M50 51 v-4 M42 53 l-3 -3 M58 53 l3 -3 M39 60 h-4 M61 60 h4" w={2} />,
  }),
  nose: rig({ rh: [56.5, 47.5], re: [74, 60], rp: 'point', rpa: -138, face: 'o', fx: <Sparkle x={41} y={47} s={2.6} /> }),
  wave: rig({
    rh: [77, 42], re: [76, 60], rp: 'open', face: 'grin',
    fx: <Lines d="M84 34 q4 4 0 9 M88 31 q6 7 0 15" />,
  }),
  turn: rig({
    face: 'side', tilt: 4,
    fx: <Arrow d="M18 86 Q50 100 80 88" head="M76 83.5 L84.5 87 L78.5 93 Z" />,
  }),
  sit: rig({
    ...SIT,
  }),
  sleep: rig({
    rot: -84, dx: 9, dy: 2, face: 'sleep', lh: [44, 76], le: [34, 80], rh: [66, 74], lf: [43, 87.5], rf: [58, 86.5], shadow: 0,
    under: (
      <g>
        <ellipse cx={54} cy={90} rx={40} ry={4} fill={C.shadow} />
        <path d="M12 84 Q10 74 22 74 H38 Q46 74 46 82 Q46 90 30 90 Q12 90 12 84 Z" fill={C.white} {...line(2.2)} />
      </g>
    ),
    fx: <Zzz x={34} y={28} />,
  }),
  dance: rig({
    lean: 7, lh: [26, 40], le: [24, 58], rh: [78, 66], re: [70, 72], rf: [68, 79], rk: [66, 86], face: 'laugh',
    fx: (
      <g>
        <Note x={18} y={30} />
        <Note x={82} y={30} fill={C.blue} />
        <Note x={88} y={50} fill={C.green} s={0.8} />
      </g>
    ),
  }),
  stomp: rig({
    lf: [40, 87.5], rf: [63, 71], rk: [66, 80], lh: [28, 64], rh: [72, 60], le: [30, 74], re: [74, 70], lp: 'fist', rp: 'fist', face: 'grin',
    fx: <Lines d="M26 90 l-5 -2 M28 85 l-5 -4 M34 82 l-2 -5" w={2} />,
  }),
  armsUp: rig({ lh: [31, 30], rh: [69, 30], le: [32, 46], re: [68, 46], lp: 'open', rp: 'open', face: 'grin', dy: 2 }),
  big: rig({
    sy: 1.06, sx: 1.04, lh: [15, 45], rh: [85, 45], le: [24, 52], re: [76, 52], lp: 'open', rp: 'open', lf: [39, 88], rf: [61, 88], face: 'grin', shadow: 1.2,
    fx: (
      <g>
        <Arrow d="M10 76 V62" head="M6 64.5 L10 57.5 L14 64.5 Z" />
        <Arrow d="M90 76 V62" head="M86 64.5 L90 57.5 L94 64.5 Z" />
      </g>
    ),
  }),
  small: rig({
    sx: 0.8, sy: 0.72, lh: [44, 79], rh: [56, 79], le: [34, 74], re: [66, 74], lf: [39, 88], rf: [61, 88], face: 'o', shadow: 0.8,
    fx: (
      <g>
        <Arrow d="M16 36 V52" head="M12 49.5 L16 56.5 L20 49.5 Z" />
        <Arrow d="M84 36 V52" head="M80 49.5 L84 56.5 L88 49.5 Z" />
      </g>
    ),
  }),
  fly: rig({
    dy: -7, lh: [13, 48], rh: [87, 48], le: [24, 50], re: [76, 50], lp: 'open', rp: 'open', lf: [45, 87], rf: [55, 87], lk: [44, 84], rk: [56, 84],
    face: 'laugh', shadow: 0.55,
    fx: (
      <g>
        <Lines d="M10 60 q4 2 8 0 M82 60 q4 2 8 0 M12 38 q4 -3 8 -1 M80 37 q4 -2 8 1" />
        <g transform="translate(0 0)">
          <path d="M30 94 q-6 0 -6 -5 q0 -5 6 -4 q2 -5 8 -3 q5 -3 8 2 q6 -1 6 4 q0 6 -6 6 Z" fill={C.white} {...line(1.8)} transform="translate(8 -2) scale(0.8) translate(10 22)" />
        </g>
      </g>
    ),
  }),
  swim: rig({
    dy: 6, lh: [22, 58], le: [28, 62], rh: [76, 40], re: [76, 56], lp: 'open', rp: 'open', face: 'laugh', shadow: 0,
    over: (
      <g>
        <path d="M4 80 Q12 75 20 80 T36 80 T52 80 T68 80 T84 80 T100 80 V95 H4 Z" fill={C.water} {...line(2)} transform="translate(-2 -6)" />
        <path d="M14 82 q4 -2 8 0 M44 84 q4 -2 8 0 M72 82 q4 -2 8 0" fill="none" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    ),
    fx: (
      <g fill={C.white} {...line(1.3)}>
        <circle cx={14} cy={52} r={2.4} />
        <circle cx={10} cy={44} r={1.6} />
        <circle cx={88} cy={56} r={2} />
      </g>
    ),
  }),
  eat: rig({
    rh: [55.5, 49], re: [74, 64], face: 'chew',
    over: <Cookie x={56} y={47} r={5.8} />,
    fx: <g fill="#d9a05b" {...line(1)}><circle cx={60} cy={58} r={1} /><circle cx={65} cy={54} r={0.9} /><circle cx={44} cy={57} r={1} /></g>,
  }),
  drink: rig({
    rh: [58, 50], re: [76, 66], lh: [44, 52], le: [30, 66], tilt: -6, face: 'sip',
    mid: <Cup x={52} y={47} tilt={-25} fill={C.sky} />,
  }),
  run: rig({
    lean: 10, dy: -2, lh: [30, 50], le: [26, 62], rh: [74, 72], re: [74, 64], lf: [30, 82], lk: [34, 78], rf: [68, 88], rk: [64, 82], face: 'grin', shadow: 1.1,
    fx: <Lines d="M6 54 h10 M4 64 h12 M8 74 h9" w={2.2} />,
  }),
  walk: rig({
    lean: 3, lh: [32, 70], le: [30, 66], rh: [70, 78], lf: [38, 87.5], rf: [62, 86], rk: [60, 82], face: 'smile',
  }),
  sing: rig({
    lh: [26, 62], le: [28, 70], rh: [74, 62], re: [72, 70], lp: 'open', rp: 'open', face: 'sing', tilt: -4,
    fx: (
      <g>
        <Note x={74} y={26} />
        <Note x={84} y={16} fill={C.blue} s={0.8} />
        <Note x={18} y={22} fill={C.green} s={0.9} />
      </g>
    ),
  }),
  laugh: rig({
    lh: [43, 72], le: [33, 74], rh: [57, 72], re: [67, 74], face: 'laugh', tilt: -5,
    fx: (
      <g>
        <Sparkle x={18} y={24} s={3.4} />
        <Sparkle x={82} y={22} s={3.4} />
        <Lines d="M14 40 l-5 -2 M86 40 l5 -2" w={2} />
      </g>
    ),
  }),
  cry: rig({ lh: [40, 37.5], le: [26, 54], face: 'cry', tilt: 5, rh: [68, 78] }),
  look: rig({
    rh: [58, 25.5], re: [80, 42], rp: 'flat', rpa: -8, tilt: 3, lh: [33, 73], le: [26, 66], face: 'side',
    fx: <Lines d="M84 30 h6 M83 24 l5 -3 M83 36 l5 3" w={1.8} />,
  }),
  listen: rig({
    rh: [74, 35], re: [77, 54], rp: 'open', face: 'side', tilt: 6,
    fx: <Lines d="M82 30 q3 5 0 10 M86 27 q5 8 0 16 M90 24 q7 11 0 22" w={1.8} />,
  }),
  hug: rig({
    lh: [39, 66], le: [30, 76], rh: [61, 66], re: [70, 76], lp: 'open', rp: 'open', face: 'love',
    mid: <Heart x={50} y={68} s={11} fill={C.red} />,
    fx: <g><Heart x={18} y={30} s={3.4} fill={C.rose} /><Heart x={82} y={24} s={4} fill={C.rose} /></g>,
  }),
  climb: rig({
    dy: -6, lh: [34, 40], le: [30, 52], rh: [66, 22], re: [70, 40], lp: 'paw', lf: [42, 76], lk: [38, 82], rf: [58, 94], face: 'grin', shadow: 0,
    under: LADDER,
  }),
  paint: rig({
    dx: -13, rh: [70, 56], re: [70, 70], lh: [30, 72], face: 'focus',
    under: (
      <g>
        <path d="M70 92 L78 30 M92 92 L84 30" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M70 92 L78 30 M92 92 L84 30" stroke="#c98d55" strokeWidth={2.6} strokeLinecap="round" />
        <rect x={64} y={28} width={30} height={34} rx={2} fill={C.white} {...line(2.2)} />
        <circle cx={75} cy={40} r={5} fill={C.yellow} />
        <path d="M68 56 Q76 48 86 54 Q90 56 92 52 V60 H68 Z" fill={C.leaf} />
        <path d="M84 36 q3 -3 6 0" fill="none" stroke={C.blue} strokeWidth={2} strokeLinecap="round" />
      </g>
    ),
    over: (
      <g>
        <path d="M57 56 L68 46" stroke={C.ink} strokeWidth={4.4} strokeLinecap="round" />
        <path d="M57 56 L68 46" stroke={C.yellow} strokeWidth={2.2} strokeLinecap="round" />
        <path d="M67 47 l3 -3 l2 2 l-3 3 Z" fill={C.red} {...line(1.4)} />
        <ellipse cx={26} cy={74} rx={9} ry={6} fill="#e8c38f" {...line(1.8)} />
        <circle cx={22} cy={72} r={1.6} fill={C.red} />
        <circle cx={26} cy={70.5} r={1.6} fill={C.blue} />
        <circle cx={30} cy={72} r={1.6} fill={C.green} />
      </g>
    ),
  }),
  wash: rig({
    lh: [44, 70], rh: [56, 69], le: [32, 72], re: [68, 72], lp: 'open', rp: 'open', face: 'laugh',
    over: (
      <g>
        <path d="M30 74 H70 Q70 88 50 88 Q30 88 30 74 Z" fill={C.sky} {...line(2.2)} />
        <ellipse cx={50} cy={74} rx={20} ry={3} fill={C.water} {...line(1.8)} />
      </g>
    ),
    fx: (
      <g fill={C.white} {...line(1.3)}>
        <circle cx={38} cy={60} r={3.2} />
        <circle cx={62} cy={58} r={2.6} />
        <circle cx={50} cy={56} r={2} />
        <circle cx={30} cy={66} r={2} />
        <circle cx={70} cy={64} r={3} />
      </g>
    ),
  }),
  count: rig({
    rh: [72, 40], re: [74, 58], rp: 'count', face: 'grin',
    fx: (
      <g fill={C.orange} {...line(1.2)}>
        <circle cx={65} cy={22} r={1.8} />
        <circle cx={72} cy={19} r={1.8} />
        <circle cx={79} cy={22} r={1.8} />
      </g>
    ),
  }),
  read: rig({
    lh: [36, 71], rh: [64, 71], le: [30, 70], re: [70, 70], face: 'down',
    mid: <Book x={50} y={68} w={28} h={14} />,
  }),
  build: rig({
    dx: -12, rh: [70, 50], re: [72, 66], face: 'focus',
    under: (
      <g>
        <Block x={82} y={84.5} s={12} fill={C.blue} />
        <Block x={82} y={72.5} s={12} fill={C.yellow} mark={C.red} />
        <Block x={82} y={60.5} s={12} fill={C.green} />
      </g>
    ),
    over: <Block x={70} y={45} s={10} fill={C.red} mark={C.yellow} />,
  }),
  cook: rig({
    dx: -10, rh: [64, 60], re: [70, 72], face: 'smile',
    hat: (
      <g>
        <path d="M36 20 Q32 8 41 8 Q44 1 50 4 Q56 1 59 8 Q68 8 64 20 Z" fill={C.white} {...line(2)} />
        <path d="M36.5 17 H63.5" {...line(1.6)} />
      </g>
    ),
    under: (
      <g>
        <path d="M72 62 q-2 -4 0 -8 q2 -4 0 -8 M80 62 q-2 -4 0 -8 q2 -4 0 -8" fill="none" stroke={C.greyLight} strokeWidth={2} strokeLinecap="round" />
      </g>
    ),
    over: (
      <g>
        <path d="M62 52 L70 70" stroke={C.ink} strokeWidth={4.4} strokeLinecap="round" />
        <path d="M62 52 L70 70" stroke="#c98d55" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M58 68 H96 L93 88 Q77 92 61 88 Z" fill={C.red} {...line(2.2)} transform="translate(-6 0)" />
        <ellipse cx={71} cy={68} rx={19} ry={3.2} fill="#f3d27a" {...line(2)} />
        <path d="M50 72 h-3 M92 72 h3" {...line(3)} />
      </g>
    ),
  }),
  ride: rig({
    dy: -10, lf: [46, 89], rf: [52, 87], lk: [38, 86], rk: [60, 84], rh: [66, 61], re: [68, 72], lh: [62, 63], le: [44, 74], face: 'grin', shadow: 0,
    under: (
      <g>
        <ellipse cx={51} cy={91.5} rx={34} ry={3.4} fill={C.shadow} />
        {BIKE}
      </g>
    ),
    fx: <Lines d="M4 60 h8 M2 70 h8" w={2} />,
  }),
  give: rig({
    dx: -10, lh: [66, 64], le: [44, 76], rh: [78, 62], re: [74, 72], face: 'grin',
    over: <Gift x={73} y={58} s={8} />,
    fx: <Arrow d="M78 82 H88" head="M86 78 L93 82 L86 86 Z" color={C.green} />,
  }),
  take: rig({
    dx: -8, rh: [74, 58], re: [72, 70], rp: 'open', lh: [32, 74], face: 'side',
    under: (
      <g>
        <path d="M72 70 H96 M84 70 V92" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M72 70 H96 M84 70 V92" stroke="#c98d55" strokeWidth={2.6} strokeLinecap="round" />
      </g>
    ),
    fx: (
      <g>
        <Apple x={86} y={62} r={5} />
        <Arrow d="M88 46 Q80 38 72 44" head="M74 39.5 L67.5 46 L76 47.5 Z" color={C.green} />
      </g>
    ),
  }),
  point: rig({
    rh: [80, 54], re: [72, 56], rp: 'point', rpa: -10, lh: [33, 72], le: [26, 64], face: 'side',
    fx: <Sparkle x={92} y={50} s={3.4} />,
  }),
  write: rig({
    lh: [36, 70], le: [28, 70], rh: [55, 66], re: [70, 74], face: 'focus',
    mid: (
      <g>
        <rect x={34} y={58} width={28} height={22} rx={2} fill="#c98d55" {...line(2)} transform="rotate(-6 48 69)" />
        <rect x={36.5} y={61} width={23} height={17} rx={1} fill={C.white} transform="rotate(-6 48 69)" />
        <path d="M39 66 q2 -2 4 0 t4 0 t4 0 M39 71 q2 -2 4 0 t4 0" fill="none" stroke={C.blue} strokeWidth={1.4} strokeLinecap="round" transform="rotate(-6 48 69)" />
      </g>
    ),
    over: (
      <g>
        <path d="M56 66 L66 52" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M56 66 L66 52" stroke={C.orange} strokeWidth={2.8} strokeLinecap="round" />
        <path d="M54.2 68.6 L55.2 65 L57.6 66.6 Z" fill={C.ink} />
      </g>
    ),
  }),
  tidy: rig({
    dx: -10, rh: [74, 54], re: [74, 68], face: 'grin',
    over: <Ball x={74} y={48} r={6} />,
    fx: (
      <g>
        <Block x={78} y={70} s={8} fill={C.green} />
        <path d="M66 72 H94 L92 91 H68 Z" fill="#d9a05b" {...line(2.2)} />
        <path d="M66 72 L60 66 M94 72 L98 65" {...line(2.2)} />
        <path d="M74 80 H86" {...line(1.6)} />
        <Lines d="M62 40 q-2 4 0 8" />
      </g>
    ),
  }),
}

/* ------------------------------------ the cast ------------------------------------ */

const TATZLI_LOOK = (fur: string): Look => ({ species: 'bear', fur, light: C.cream, scarf: [C.red, C.yellow] })

export function Tatzli(props: { pose?: Pose; color?: string; className?: string }) {
  const pose = props.pose ?? 'idle'
  return <Critter rig={RIGS[pose]} look={TATZLI_LOOK(props.color ?? C.fur)} pose={pose} className={props.className} />
}

const place = (x: number, s: number, node: ReactNode, flip = false) => (
  <g transform={`translate(${x + (flip ? 50 : -50) * s} ${91 - 91 * s}) scale(${flip ? -s : s} ${s})`}>{node}</g>
)

const FLOWER = (x: number, y: number, petal: string = C.rose) => (
  <g>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={x} cy={y - 3.6} rx={2.4} ry={3.4} transform={`rotate(${a} ${x} ${y})`} fill={petal} {...line(1.3)} />
    ))}
    <circle cx={x} cy={y} r={2.3} fill={C.yellow} {...line(1.3)} />
  </g>
)

const BOW = (x: number, y: number, fill: string = C.rose, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 L-8 -5 Q-10 0 -8 5 Z M0 0 L8 -5 Q10 0 8 5 Z" fill={fill} {...line(1.8)} />
    <circle cx={0} cy={0} r={2.4} fill={fill} {...line(1.6)} />
  </g>
)

const GLASSES = (
  <g>
    <circle cx={40.5} cy={32} r={6.4} fill={C.white} fillOpacity={0.25} stroke={C.ink} strokeWidth={1.8} />
    <circle cx={59.5} cy={32} r={6.4} fill={C.white} fillOpacity={0.25} stroke={C.ink} strokeWidth={1.8} />
    <path d="M46.9 31.4 Q50 29.6 53.1 31.4 M34.1 31 L28.5 29 M65.9 31 L71.5 29" fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
  </g>
)

const CAP = (fill: string) => (
  <g>
    <path d="M29 26 Q30 9 50 9 Q70 9 71 26 Q50 20 29 26 Z" fill={fill} {...line(2.2)} />
    <path d="M60 23.5 Q76 20 84 25 Q76 28.5 66 27 Z" fill={fill} {...line(2.2)} />
    <circle cx={50} cy={9.6} r={2} fill={fill} {...line(1.6)} />
    <path d="M40 11.5 Q38 18 39 24" fill="none" stroke={C.white} strokeOpacity={0.5} strokeWidth={1.4} />
  </g>
)

const DRESS = (fill: string) => (
  <g>
    <path d="M38 60 Q50 57 62 60 L67 82 Q50 88 33 82 Z" fill={fill} {...line(2.2)} />
    <path d="M35 80 Q50 85.5 65 80" fill="none" stroke={C.white} strokeWidth={1.8} strokeDasharray="1 3" strokeLinecap="round" />
  </g>
)

const MAMI_LOOK: Look = {
  species: 'bear', fur: '#c4854b', light: C.cream, lashes: true, tuft: false,
  head: FLOWER(28, 15, C.rose),
  body: (
    <g>
      <path d="M38.5 62 Q50 58 61.5 62 L64 82 Q50 87 36 82 Z" fill={C.white} {...line(2)} />
      <path d="M38.5 62 Q50 58 61.5 62" fill="none" stroke={C.rose} strokeWidth={2.6} />
      <path d="M45 70 h10 v5 q0 3 -5 3 q-5 0 -5 -3 Z" fill={C.rose} {...line(1.6)} />
      <Heart x={50} y={73.6} s={1.8} fill={C.red} />
      <path d="M36.5 81 Q50 86 63.5 81" fill="none" stroke={C.rose} strokeWidth={1.8} strokeDasharray="2 2.4" />
    </g>
  ),
  scarf: null,
}

const PAPI_LOOK: Look = {
  species: 'bear', fur: '#9a6034', light: '#f6e3c6', tuft: false,
  body: (
    <g>
      <path d="M34 58 Q50 54 66 58 Q69 74 64 82 Q50 88 36 82 Q31 74 34 58 Z" fill={C.green} {...line(2.2)} />
      <path d="M34.6 64 Q50 69 65.4 64 M33.4 71 Q50 76 66.6 71" fill="none" stroke={C.white} strokeWidth={1.8} />
      <path d="M43 56 L50 62 L57 56" fill={C.greenDark} {...line(1.8)} />
    </g>
  ),
  head: GLASSES,
  scarf: null,
}

const GROSI_LOOK: Look = {
  species: 'bear', fur: '#b8916e', light: '#fbefdd', tuft: false,
  headBack: (
    <g>
      <circle cx={50} cy={12} r={7} fill="#b8916e" {...line(2.2)} />
      <path d="M44 15.5 Q50 18.6 56 15.5" fill="none" stroke={C.purple} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  ),
  head: (
    <g>
      <path d="M41.5 38 a4.4 3.8 0 1 1 0.1 0 M58.5 38 a4.4 3.8 0 1 1 0.1 0" fill="none" />
      <path d="M33 35 h15 v1 q-1 4.4 -7.5 4.4 q-6.5 0 -7.5 -4.4 Z M52 35 h15 v1 q-1 4.4 -7.5 4.4 q-6.5 0 -7.5 -4.4 Z" fill={C.white} fillOpacity={0.35} stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M48 35.4 Q50 34 52 35.4" fill="none" stroke={C.ink} strokeWidth={1.6} />
    </g>
  ),
  body: (
    <g>
      <path d="M31 56 Q50 50 69 56 L66 66 L50 78 L34 66 Z" fill={C.purple} {...line(2.2)} />
      <path d="M50 78 l-2 4 M50 78 l2 4 M50 78 v4.6" stroke={C.purple} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M38 62 l3 2 M45 66 l3 2 M55 64 l3 -2 M61 61 l2 -1" stroke={C.rose} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  ),
  front: (
    <g>
      <path d="M40 70 L58 60 M46 76 L64 66" stroke={C.ink} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M40 70 L58 60 M46 76 L64 66" stroke={C.greyLight} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M44 74 Q50 82 58 76 Q56 70 50 70 Z" fill={C.rose} {...line(1.8)} />
      <path d="M46 75 l3 -3 M49 77 l4 -4 M53 77 l2 -3" stroke="#e88ab0" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={70} cy={86} r={5} fill={C.rose} {...line(1.8)} />
      <path d="M66.5 84 q3.5 3 7 0 M66.6 88 q3.4 -3 6.8 0" fill="none" stroke="#e88ab0" strokeWidth={1.1} />
      <path d="M65 85 Q58 84 56 77" fill="none" stroke="#e88ab0" strokeWidth={1.2} />
    </g>
  ),
  scarf: null,
}

const GROSSAETTI_LOOK: Look = {
  species: 'bear', fur: '#a3734c', light: '#fbefdd', tuft: false,
  head: (
    <g>
      <path d="M24 20 Q50 12 76 20 Q72 24 50 23 Q28 24 24 20 Z" fill={C.greenDark} {...line(2.2)} />
      <path d="M32 19.5 Q32 5 50 5 Q68 5 68 19.5 Q50 16 32 19.5 Z" fill={C.greenDark} {...line(2.2)} />
      <path d="M32.5 16.5 Q50 13.4 67.5 16.5" fill="none" stroke={C.red} strokeWidth={2.4} />
      <path d="M64 15 Q72 4 76 2 Q73 10 66 15.5" fill={C.white} {...line(1.4)} />
      <path d="M43.5 44.6 Q46 41.6 50 43.2 Q54 41.6 56.5 44.6 Q53 46.8 50 45 Q47 46.8 43.5 44.6 Z" fill={C.white} {...line(1.4)} />
      <path d="M35.5 26.2 Q40 23.4 45 25.6 M64.5 26.2 Q60 23.4 55 25.6" fill="none" stroke={C.white} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  ),
  body: (
    <g>
      <path d="M36 58 Q50 54 64 58 L66 78 Q58 82 50 70 Q42 82 34 78 Z" fill={C.red} {...line(2.2)} />
      <circle cx={46} cy={64} r={1.1} fill={C.yellow} />
      <circle cx={54} cy={64} r={1.1} fill={C.yellow} />
    </g>
  ),
  front: (
    <g>
      <path d="M74 91 L72 60 Q71.5 55 76 55 Q80 55 80 60" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d="M74 91 L72 60 Q71.5 55 76 55 Q80 55 80 60" fill="none" stroke="#8a5428" strokeWidth={2.6} strokeLinecap="round" />
    </g>
  ),
  scarf: null,
}

const LOTTI_LOOK: Look = {
  species: 'bear', fur: '#c88b52', light: C.cream,
  head: BOW(66, 13, C.rose),
  body: DRESS(C.rose),
  scarf: null,
}

const BRUEDER_LOOK: Look = { species: 'bear', fur: '#a96a37', light: C.cream, scarf: [C.blue, C.white] }
const CHIND_LOOK: Look = { species: 'bear', fur: '#bd7d45', light: C.cream, scarf: null }
const GIEL_LOOK: Look = { species: 'bear', fur: '#b0723c', light: C.cream, tuft: false, head: CAP(C.blue), scarf: [C.green, C.yellow] }
const MEITSCHI_LOOK: Look = {
  species: 'bear', fur: '#c4834a', light: C.cream, lashes: true,
  head: (
    <g>
      {BOW(30, 12, C.yellow, 0.75)}
      {BOW(70, 12, C.yellow, 0.75)}
    </g>
  ),
  body: DRESS(C.orange),
  scarf: null,
}

const KASIA_FUR = '#c0582b'
const KASIA_LOOK = (fur: string = KASIA_FUR): Look => ({
  species: 'squirrel', fur, light: '#fde9cf', scarf: [C.white, C.red],
  tail: (
    <g className="illu-wag" style={origin(62, 82)}>
      <path d="M58 84 C78 92 96 78 90 58 C86 44 92 32 82 22 C74 14 60 20 64 30 C67 37 76 36 74 46 C72 56 62 60 62 72 Z" fill={fur} {...line(2.4)} />
      <path d="M68 78 C82 80 88 68 85 58 C82 48 86 40 80 30" fill="none" stroke="#e58a55" strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
})

const FREDDIE_FUR = '#ee8a36'
const FREDDIE_LOOK = (fur: string = FREDDIE_FUR): Look => ({
  species: 'fox', fur, light: C.white, scarf: null,
  head: CAP(C.blue),
  tail: (
    <g className="illu-wag" style={origin(60, 82)}>
      <path d="M58 82 C70 90 88 86 94 70 C92 62 86 58 82 60 C80 70 70 74 60 72 Z" fill={fur} {...line(2.4)} />
      <path d="M94 70 C92 62 86 58 82 60 C82 66 86 70 92 72 Z" fill={C.white} {...line(2)} />
    </g>
  ),
})

/** Tante Ottilie – the wise owl aunt. */
function Ottilie({ color, pointer = false, wave = false }: { color?: string; pointer?: boolean; wave?: boolean }) {
  const fur = color ?? '#9a7cc0'
  const light = '#fbefdd'
  return (
    <g className="tz tz-owl">
      <Shadow y={91.5} rx={22} />
      <g className="tz-fig" style={origin(50, 91)}>
        <path d="M33 30 L28 14 L42 24 Z M67 30 L72 14 L58 24 Z" fill={fur} {...line(2.2)} />
        <ellipse cx={50} cy={56} rx={26} ry={31} fill={fur} {...line(2.4)} />
        <ellipse cx={40} cy={30} rx={6} ry={3} transform="rotate(-24 40 30)" fill={C.white} opacity={0.22} />
        <ellipse cx={50} cy={70} rx={16} ry={15} fill={light} />
        <path d="M43 64 l2 2 l2 -2 M51 64 l2 2 l2 -2 M47 71 l2 2 l2 -2 M55 71 l2 2 l2 -2 M43 78 l2 2 l2 -2 M51 78 l2 2 l2 -2" fill="none" stroke="#c9a98a" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={40} cy={42} r={10.5} fill={light} />
        <circle cx={60} cy={42} r={10.5} fill={light} />
        <Eyes x1={40} x2={60} y={42} r={3.8} />
        <circle cx={40} cy={42} r={7.6} fill="none" stroke={C.ink} strokeWidth={2.2} />
        <circle cx={60} cy={42} r={7.6} fill="none" stroke={C.ink} strokeWidth={2.2} />
        <path d="M47.6 41 Q50 39 52.4 41" fill="none" stroke={C.ink} strokeWidth={2.2} />
        <path d="M46.6 50 L53.4 50 L50 56 Z" fill={C.orange} {...line(1.8)} />
        <g opacity={0.55}>
          <circle cx={31} cy={52} r={3.2} fill={C.cheek} />
          <circle cx={69} cy={52} r={3.2} fill={C.cheek} />
        </g>
        <path d="M43 87 v4 M47 87 v4 M53 87 v4 M57 87 v4" stroke={C.orange} strokeWidth={3} strokeLinecap="round" />
        {FLOWER(66, 60, C.yellow)}
        <g className="tz-al" style={origin(28, 52)}>
          <path d="M28 50 Q16 62 24 80 Q32 74 32 58 Z" fill={fur} {...line(2.2)} />
        </g>
        <g className="tz-ar" style={origin(72, 52)}>
          {wave ? (
            <path d="M72 52 Q84 42 88 28 Q78 30 70 46 Z" fill={fur} {...line(2.2)} />
          ) : (
            <path d="M72 50 Q84 62 76 80 Q68 74 68 58 Z" fill={fur} {...line(2.2)} />
          )}
        </g>
        {!wave && !pointer && (
          <g transform="rotate(-8 64 78)">
            <rect x={56} y={70} width={17} height={13} rx={1.5} fill={C.red} {...line(2)} />
            <path d="M59 73.5 h10 M59 77 h7" stroke={C.yellow} strokeWidth={1.5} strokeLinecap="round" />
          </g>
        )}
        {pointer && (
          <g>
            <path d="M24 72 L12 30" stroke={C.ink} strokeWidth={4.4} strokeLinecap="round" />
            <path d="M24 72 L12 30" stroke="#c98d55" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={12} cy={30} r={2} fill={C.red} {...line(1.2)} />
          </g>
        )}
      </g>
    </g>
  )
}

/* -------------------------------- illus helpers -------------------------------- */

type CritterOpts = { pose?: Pose; scale?: number; x?: number; flip?: boolean }
function critterIllu(look: (color?: string) => Look, defPose: Pose, scale = 1): (p: IlluProps) => ReturnType<typeof Critter> {
  return (p) => {
    const pose = p.pose ?? defPose
    const node = <Critter rig={RIGS[pose]} look={look(p.color)} pose={pose} />
    return scale === 1 ? node : place(50, scale, node)
  }
}
const withFur = (l: Look) => (color?: string): Look => (color ? { ...l, fur: color } : l)

function Member({ look, pose, x, scale, flip }: { look: Look } & Required<Pick<CritterOpts, 'x' | 'scale'>> & CritterOpts) {
  const ps = pose ?? 'idle'
  return place(x, scale, <Critter rig={RIGS[ps]} look={look} pose={ps} />, flip)
}

/** Tatzli with a custom rig (body-part & emotion words). */
function TatzliRig({ r, color, pose = 'idle', extra }: { r: Rig; color?: string; pose?: Pose; extra?: ReactNode }) {
  return (
    <g>
      <Critter rig={r} look={TATZLI_LOOK(color ?? C.fur)} pose={pose} />
      {extra}
    </g>
  )
}

const bodyWord = (r: Partial<Rig>, halo: ReactNode, pose: Pose = 'idle') => (p: IlluProps) => (
  <TatzliRig r={rig(r)} color={p.color} pose={pose} extra={halo} />
)

/* ------------------------------------ the map ------------------------------------ */

const POSE_KEYS: Pose[] = [
  'jump', 'walk', 'run', 'dance', 'sing', 'eat', 'drink', 'sleep', 'build', 'look', 'listen', 'laugh', 'cry', 'clap', 'wave', 'swim',
  'paint', 'cook', 'wash', 'sit', 'stand', 'turn', 'climb', 'ride', 'fly', 'give', 'take', 'point', 'count', 'read', 'write', 'tidy',
  'hug', 'stomp',
]

const poseIllus: IlluMap = Object.fromEntries(
  POSE_KEYS.map((k) => [`pose-${k}`, (p: IlluProps) => <Tatzli pose={k} color={p.color} />]),
)

const mamiLook = withFur(MAMI_LOOK)
const papiLook = withFur(PAPI_LOOK)
const grosiLook = withFur(GROSI_LOOK)
const grossaettiLook = withFur(GROSSAETTI_LOOK)
const lottiLook = withFur(LOTTI_LOOK)

function Bebe({ color }: { color?: string }) {
  const look: Look = { species: 'bear', fur: color ?? '#c98d58', light: C.cream, scarf: null }
  return (
    <g>
      <Shadow y={90} rx={24} />
      <path d="M26 64 Q24 90 50 90 Q76 90 74 64 Q74 50 50 50 Q26 50 26 64 Z" fill={C.sky} {...line(2.4)} />
      <path d="M30 60 Q50 76 72 58" fill="none" {...line(1.8)} />
      <path d="M50 68 Q60 66 70 70" fill="none" {...line(1.6)} />
      <g fill={C.white}>
        <circle cx={38} cy={80} r={1.6} />
        <circle cx={52} cy={84} r={1.6} />
        <circle cx={62} cy={78} r={1.6} />
        <circle cx={44} cy={72} r={1.4} />
      </g>
      <g transform="translate(50 40) scale(0.78) translate(-50 -35)">
        <HeadShape look={look} />
        <FaceParts f="love" fur={look.fur} />
      </g>
      <g transform="translate(50 40) scale(0.78) translate(-50 -35)">
        <circle cx={50} cy={50.5} r={3.4} fill={C.yellow} {...line(1.6)} />
        <ellipse cx={50} cy={47.8} rx={5} ry={2} fill={C.rose} {...line(1.6)} />
      </g>
    </g>
  )
}

function SleepingTatzli({ color }: { color?: string }) {
  const look = TATZLI_LOOK(color ?? C.fur)
  return (
    <g>
      <path d="M77 12 A11 11 0 1 0 88 28 A8.5 8.5 0 1 1 77 12 Z" fill={C.yellow} {...line(2)} />
      <Sparkle x={14} y={14} s={3} />
      <Sparkle x={30} y={8} s={2.2} />
      <Sparkle x={62} y={10} s={2.4} />
      <Shadow y={91} rx={42} />
      <path d="M8 90 V40 Q8 30 18 30 H22 Q30 30 30 40 V90" fill="#c98d55" {...line(2.4)} />
      <path d="M92 90 V58 Q92 52 86 52 Q80 52 80 58 V90" fill="#c98d55" {...line(2.4)} />
      <rect x={10} y={62} width={80} height={16} rx={4} fill={C.white} {...line(2.2)} />
      <path d="M14 56 Q12 46 24 46 H40 Q48 46 46 56 Q46 64 30 64 Q14 64 14 56 Z" fill={C.white} {...line(2.2)} />
      <g transform="translate(30 50) scale(0.6) rotate(-12 50 35) translate(-50 -35)">
        <HeadShape look={look} />
        <FaceParts f="sleep" fur={look.fur} />
      </g>
      <path d="M34 60 Q60 54 90 60 V80 Q60 86 30 80 Q28 70 34 60 Z" fill={C.navy} {...line(2.4)} />
      <path d="M34 60 Q60 54 90 60 L89 65 Q60 59 33 65 Z" fill={C.white} {...line(1.6)} />
      <g fill={C.yellow}>
        <circle cx={48} cy={72} r={1.6} />
        <circle cx={62} cy={68} r={1.4} />
        <circle cx={74} cy={74} r={1.6} />
        <circle cx={84} cy={68} r={1.3} />
      </g>
      <circle cx={40} cy={61} r={4.4} fill={look.fur} {...line(2)} />
      <Zzz x={46} y={22} />
    </g>
  )
}

/* body-part words: halos placed on the standard skeleton */
const bodyIllus: IlluMap = {
  chopf: bodyWord({ face: 'grin' }, <Halo x={50} y={33} rx={30} ry={27} />),
  nase: bodyWord({ face: 'smile' }, <><Halo x={50} y={39.4} rx={7.5} ry={6} /><Sparkle x={62} y={44} s={2.4} /></>),
  oug: bodyWord({ face: 'smile' }, <><Halo x={40.5} y={32} rx={7.5} /><Sparkle x={30} y={26} s={2.4} /></>),
  ohr: bodyWord({ face: 'smile', tilt: -5 }, <><Halo x={31} y={20} rx={11} /><Sparkle x={18} y={12} s={2.6} /></>),
  muu: bodyWord({ face: 'grin' }, <Halo x={50} y={47} rx={9.5} ry={7.5} />),
  zahn: bodyWord({ face: 'teeth' }, <><Halo x={50} y={46.4} rx={9} ry={6.4} /><Sparkle x={61} y={45} s={2.4} fill={C.white} /></>),
  hand: bodyWord({ rh: [77, 42], re: [76, 60], rp: 'open', face: 'grin' }, <Halo x={77} y={42} rx={9.5} />, 'wave'),
  fuess: bodyWord({ rf: [64, 80], rk: [62, 86], rsole: true, lh: [26, 64], le: [28, 74], face: 'grin' }, <Halo x={64} y={80} rx={10} ry={10.5} />),
  bei: bodyWord(
    { rf: [72, 84], rk: [64, 82], lh: [26, 66], le: [28, 74], rh: [72, 66], face: 'grin' },
    <Halo x={65} y={82} rx={14} ry={7.5} rot={10} />,
  ),
  buuch: bodyWord({ lh: [40, 70], le: [32, 74], rh: [60, 70], re: [68, 74], face: 'laugh' }, <Halo x={50} y={73} rx={14} ry={13} />),
  haar: bodyWord({ face: 'grin' }, <><Halo x={50.5} y={13} rx={8.6} ry={6.4} /><Sparkle x={38} y={8} s={2.4} /></>),
  finger: bodyWord({ rh: [72, 44], re: [74, 60], rp: 'point', rpa: -90, face: 'grin' }, <><Halo x={72} y={34} rx={4.6} ry={6.4} /><Sparkle x={82} y={30} s={2.4} /></>),
  chnoei: bodyWord(
    { rf: [61, 89], rk: [74, 78], lh: [27, 66], le: [28, 74], rh: [70, 72], face: 'grin' },
    <Halo x={67} y={81} rx={7.5} />,
  ),
  arm: bodyWord({ rh: [86, 52], re: [76, 56], rp: 'open', face: 'grin' }, <Halo x={74} y={57} rx={16} ry={7.5} rot={-12} />),
  ruegge: bodyWord({ back: true, lh: [30, 76], rh: [70, 76] }, <><Halo x={50} y={68} rx={15} ry={14} /><Sparkle x={74} y={58} s={2.6} /></>),
  bagge: bodyWord({ face: 'love', lh: [26, 50], le: [26, 66], lp: 'open' }, <><Halo x={65.5} y={41.5} rx={6.6} /><Sparkle x={76} y={36} s={2.4} /></>),
  zunge: bodyWord({ face: 'tongue' }, <Halo x={50} y={48.5} rx={6} ry={5.2} />),
  haus: bodyWord({ neck: 6, noScarf: true, face: 'grin' }, <Halo x={50} y={52} rx={13} ry={6.5} />),
  zeche: bodyWord(
    SIT,
    <><Halo x={69} y={82.6} rx={3.6} /><Sparkle x={76} y={76} s={2.4} /></>,
    'sit',
  ),
}

const PLATE = (x: number, y: number) => (
  <g>
    <ellipse cx={x} cy={y} rx={10} ry={3.4} fill={C.white} {...line(2)} />
    <ellipse cx={x} cy={y - 0.4} rx={6} ry={1.8} fill="none" stroke={C.greyLight} strokeWidth={1.2} />
  </g>
)

const emotionIllus: IlluMap = {
  froehlech: (p) => (
    <TatzliRig r={rig({ face: 'laugh', lh: [26, 42], le: [26, 58], rh: [74, 42], re: [74, 58], lp: 'open', rp: 'open' })} color={p.color} pose="jump"
      extra={<g><Sparkle x={14} y={28} s={3.4} /><Sparkle x={86} y={26} s={3.4} /><Sparkle x={86} y={70} s={2.4} /></g>} />
  ),
  truurig: (p) => (
    <TatzliRig r={rig({ face: 'sad', tilt: 7, lh: [34, 79], rh: [66, 79] })} color={p.color} pose="cry"
      extra={
        <g>
          <path d="M70 18 q-6 0 -6 -5 q0 -5 6 -4.4 q2 -5 8 -4 q5 -3 8 2 q5 0 5 5 q0 6 -6 6 Z" fill={C.greyLight} {...line(1.8)} />
          <Drop x={72} y={25} s={0.6} />
          <Drop x={80} y={27} s={0.6} />
          <Drop x={86} y={24} s={0.6} />
        </g>
      } />
  ),
  mueed: (p) => (
    <TatzliRig r={rig({ face: 'tired', tilt: -6, rh: [57.5, 50], re: [74, 64], rp: 'open', lh: [32, 79] })} color={p.color} pose="sleep"
      extra={<g><Zed x={76} y={22} s={3.4} /><Zed x={82} y={14} s={4.2} /></g>} />
  ),
  haessig: (p) => (
    <TatzliRig r={rig({ face: 'grumpy', lh: [58, 68], le: [36, 74], rh: [42, 67], re: [64, 74] })} color={p.color} pose="stomp"
      extra={
        <g fill={C.greyLight} {...line(1.6)}>
          <path d="M18 24 q-4 -1 -3 -5 q1 -3 5 -2 q2 -4 6 -1 q3 2 0 6 Q22 26 18 24 Z" />
          <path d="M82 24 q4 -1 3 -5 q-1 -3 -5 -2 q-2 -4 -6 -1 q-3 2 0 6 Q78 26 82 24 Z" />
        </g>
      } />
  ),
  erchluepft: (p) => (
    <TatzliRig r={rig({ face: 'startled', lean: -6, lh: [32, 50], le: [28, 64], rh: [68, 50], re: [72, 64], lp: 'open', rp: 'open' })} color={p.color} pose="small"
      extra={<Lines d="M16 22 l5 4 M12 36 h6 M84 22 l-5 4 M88 36 h-6" w={2} />} />
  ),
  ueberrascht: (p) => (
    <TatzliRig r={rig({ face: 'surprised', lh: [24, 48], le: [26, 62], rh: [76, 48], re: [74, 62], lp: 'open', rp: 'open', dx: 0 })} color={p.color} pose="jump"
      extra={
        <g>
          <Sparkle x={14} y={30} s={3.6} fill={C.yellow} />
          <Sparkle x={86} y={30} s={3.6} fill={C.rose} />
          <Sparkle x={12} y={70} s={2.6} fill={C.sky} />
          <Sparkle x={88} y={68} s={2.6} fill={C.yellow} />
        </g>
      } />
  ),
  lieb: (p) => (
    <TatzliRig r={{ ...RIGS.hug, fx: undefined }} color={p.color} pose="hug"
      extra={
        <g className="tz-float">
          <Heart x={16} y={30} s={4} fill={C.rose} />
          <Heart x={84} y={22} s={5} fill={C.red} />
          <Heart x={88} y={44} s={3} fill={C.rose} />
          <Heart x={12} y={52} s={3} fill={C.red} />
        </g>
      } />
  ),
  hungrig: (p) => (
    <TatzliRig
      r={rig({ face: 'tongue', lh: [48, 71], le: [34, 76], rh: [76, 62], re: [72, 70], tilt: 4, over: PLATE(80, 59) })}
      color={p.color} pose="eat"
      extra={<Lines d="M34 82 q2 -3 4 0 q2 3 4 0 M58 82 q2 -3 4 0 q2 3 4 0" w={1.6} />} />
  ),
  duerschtig: (p) => (
    <TatzliRig
      r={rig({ face: 'pant', rh: [72, 56], re: [72, 70], lh: [32, 76], tilt: -4, over: <Cup x={76} y={52} tilt={150} fill={C.sky} drink={null} /> })}
      color={p.color} pose="drink"
      extra={<g><circle cx={84} cy={12} r={6} fill={C.yellow} {...line(1.8)} /><Lines d="M84 2 v2 M92 6 l-1.4 1.4 M94 12 h-2 M76 6 l1.4 1.4" w={1.6} /></g>} />
  ),
}

const familyIllus: IlluMap = {
  'mami-baer': critterIllu(mamiLook, 'wave'),
  'papi-baer': critterIllu(papiLook, 'idle'),
  'grosi-baer': critterIllu(grosiLook, 'idle'),
  'grossaetti-baer': critterIllu(grossaettiLook, 'idle'),
  lotti: critterIllu(lottiLook, 'wave', 0.84),
  'bebe-baer': (p) => <Bebe color={p.color} />,
  kasia: critterIllu(KASIA_LOOK, 'wave', 0.92),
  freddie: critterIllu(FREDDIE_LOOK, 'wave', 0.92),
  'tante-ottilie': (p) => <Ottilie color={p.color} wave={p.pose === 'wave'} pointer={p.pose === 'point'} />,

  mami: critterIllu(mamiLook, 'wave'),
  papi: critterIllu(papiLook, 'idle'),
  grosi: critterIllu(grosiLook, 'idle'),
  grossaetti: critterIllu(grossaettiLook, 'idle'),
  schwoeschter: critterIllu(lottiLook, 'wave', 0.84),
  brueder: critterIllu(withFur(BRUEDER_LOOK), 'point'),
  bebe: (p) => <Bebe color={p.color} />,
  chind: critterIllu(withFur(CHIND_LOOK), 'wave', 0.86),
  giel: critterIllu(withFur(GIEL_LOOK), 'idle', 0.92),
  meitschi: critterIllu(withFur(MEITSCHI_LOOK), 'wave', 0.9),
  fruend: (p) => (
    <g>
      <Member look={TATZLI_LOOK(p.color ?? C.fur)} pose="wave" x={30} scale={0.66} flip />
      <Member look={FREDDIE_LOOK()} pose="wave" x={70} scale={0.66} />
      <Heart x={50} y={30} s={5} fill={C.red} />
    </g>
  ),
  gspaenli: (p) => (
    <g>
      <Member look={KASIA_LOOK()} pose="armsUp" x={73} scale={0.62} />
      <Member look={TATZLI_LOOK(p.color ?? C.fur)} pose="armsUp" x={28} scale={0.66} />
      <Ball x={50} y={24} r={7} />
      <Lines d="M41 34 q-3 3 -4 7 M59 34 q3 3 4 7" />
    </g>
  ),
  lehrerin: (p) => (
    <g>
      <g transform="translate(14 0) scale(0.9) translate(5.5 9)">
        <Ottilie color={p.color} pointer />
      </g>
      <rect x={6} y={14} width={36} height={26} rx={2} fill={C.greenDark} {...line(2.2)} transform="translate(0 0)" />
      <circle cx={16} cy={24} r={4} fill="none" stroke={C.white} strokeWidth={1.6} />
      <path d="M26 30 L31 21 L36 30 Z" fill="none" stroke={C.white} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M11 35 h12" stroke={C.yellow} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  ),
  familie: (p) => (
    <g>
      <Member look={papiLook()} pose="idle" x={20} scale={0.62} />
      <Member look={mamiLook()} pose="idle" x={42} scale={0.58} />
      <Member look={TATZLI_LOOK(p.color ?? C.fur)} pose="wave" x={64} scale={0.48} />
      <Member look={lottiLook()} pose="wave" x={83} scale={0.4} />
    </g>
  ),
}

export const characterIllus: IlluMap = {
  tatzli: (p) => <Tatzli pose={p.pose} color={p.color} />,
  'sleeping-tatzli': (p) => <SleepingTatzli color={p.color} />,
  ...poseIllus,
  ...familyIllus,
  ...bodyIllus,
  ...emotionIllus,
}
