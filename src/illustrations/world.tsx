import type { ReactNode } from 'react'
import type { IlluMap } from './types'
import { C, Cheeks, Eyes, Shadow, Smile, line, origin } from './kit'

// World illustrations: nature, transport/places, toys, holidays, time, opposites, school + game props.
// All drawn into a 100×100 viewBox, art kept inside ~6..94.

const L = line()
const LM = line(1.8)
const LS = line(1.4)
const SKIN = '#f8d3b0'
const NIGHT = '#33406b'
const PALE = '#fff2b8'
const q = (n: number) => Math.round(n * 10) / 10

/* ------------------------------------------------------------------ shared shapes */

function starD(cx: number, cy: number, r: number, ir = r * 0.5, n = 5): string {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n
    const rr = i % 2 ? ir : r
    pts.push(`${q(cx + rr * Math.cos(a))} ${q(cy + rr * Math.sin(a))}`)
  }
  return `M${pts.join(' L')}Z`
}

function sparkleD(x: number, y: number, r: number): string {
  const k = r * 0.2
  return `M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`
}

const dropD = (x: number, y: number, s = 1): string =>
  `M${x} ${y - 6 * s} C${x + s} ${y - 3 * s} ${x + 4.5 * s} ${y - 0.5 * s} ${x + 4.5 * s} ${y + 2.5 * s} A${4.5 * s} ${4.5 * s} 0 0 1 ${x - 4.5 * s} ${y + 2.5 * s} C${x - 4.5 * s} ${y - 0.5 * s} ${x - s} ${y - 3 * s} ${x} ${y - 6 * s}Z`

const HEART_D = 'M50 84 C22 66 10 48 17 32 C24 17 43 18 50 31 C57 18 76 17 83 32 C90 48 78 66 50 84 Z'

function Twinkle({ x, y, r = 6, fill = C.yellow }: { x: number; y: number; r?: number; fill?: string }) {
  return <path className="illu-twinkle" style={origin(x, y)} d={sparkleD(x, y, r)} fill={fill} {...LS} />
}

function Star({ x, y, r, fill = C.yellow }: { x: number; y: number; r: number; fill?: string }) {
  return <path className="illu-twinkle" style={origin(x, y)} d={starD(x, y, r)} fill={fill} {...LS} />
}

function Rays({ x, y, r1, r2, n = 10, color = C.orange, w = 3.2 }: { x: number; y: number; r1: number; r2: number; n?: number; color?: string; w?: number }) {
  return (
    <g className="illu-twinkle" style={origin(x, y)}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * 2 * Math.PI) / n
        return (
          <line key={i} x1={q(x + r1 * Math.cos(a))} y1={q(y + r1 * Math.sin(a))} x2={q(x + r2 * Math.cos(a))} y2={q(y + r2 * Math.sin(a))} stroke={color} strokeWidth={w} strokeLinecap="round" />
        )
      })}
    </g>
  )
}

function Sun({ x, y, r, fill = C.yellow, face = false }: { x: number; y: number; r: number; fill?: string; face?: boolean }) {
  return (
    <g>
      <Rays x={x} y={y} r1={r + 3} r2={r + 3 + r * 0.45} />
      <circle cx={x} cy={y} r={r} fill={fill} {...L} />
      <circle cx={x - r * 0.38} cy={y - r * 0.38} r={r * 0.22} fill={C.white} opacity={0.55} />
      {face && (
        <>
          <Eyes x1={x - r * 0.32} x2={x + r * 0.32} y={y - r * 0.08} r={r * 0.13} />
          <Cheeks x1={x - r * 0.55} x2={x + r * 0.55} y={y + r * 0.25} r={r * 0.13} />
          <Smile x={x} y={y + r * 0.25} w={r * 0.45} />
        </>
      )}
    </g>
  )
}

const CLOUD_D = 'M-17 7 A8 8 0 0 1 -13 -5 A11 11 0 0 1 6 -9 A9 9 0 0 1 17 1 A6 6 0 0 1 13 7 Z'
function Cloud({ x, y, s = 1, fill = C.white }: { x: number; y: number; s?: number; fill?: string }) {
  return <path d={CLOUD_D} transform={`translate(${x} ${y}) scale(${s})`} fill={fill} {...line(2.2 / s)} />
}

function Wheel({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g className="illu-spin" style={origin(x, y)}>
      <circle cx={x} cy={y} r={r} fill={C.black} {...LM} />
      <circle cx={x} cy={y} r={r * 0.5} fill={C.greyLight} />
      <circle cx={x + r * 0.22} cy={y - r * 0.22} r={r * 0.13} fill={C.grey} />
    </g>
  )
}

function Flake({ x, y, r = 6, color = C.blue }: { x: number; y: number; r?: number; color?: string }) {
  const arms = [90, 30, -30].map((deg) => {
    const a = (deg * Math.PI) / 180
    const dx = q(r * Math.cos(a))
    const dy = q(r * Math.sin(a))
    return `M${q(x - dx)} ${q(y - dy)} L${q(x + dx)} ${q(y + dy)}`
  })
  return <path className="illu-twinkle" style={origin(x, y)} d={arms.join(' ')} stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />
}

const GROUND_D = 'M8 64 Q28 55 48 62 Q70 69 92 59 L92 76 A14 14 0 0 1 78 90 L22 90 A14 14 0 0 1 8 76 Z'
const FRAME_BOTTOM = 'L92 76 A14 14 0 0 1 78 90 L22 90 A14 14 0 0 1 8 76 Z'

/** Rounded-square vignette (sky + ground) for scenes and times of day. */
function Scene({ sky, back, ground = C.leaf, groundD = GROUND_D, front }: { sky: string; back?: ReactNode; ground?: string; groundD?: string | null; front?: ReactNode }) {
  return (
    <g>
      <rect x={8} y={10} width={84} height={80} rx={14} fill={sky} />
      {back}
      {groundD && <path d={groundD} fill={ground} {...LM} />}
      {front}
      <rect x={8} y={10} width={84} height={80} rx={14} fill="none" {...L} />
    </g>
  )
}

function House({ x, y, s = 1, wall = C.cream, roof = C.red, lit = false }: { x: number; y: number; s?: number; wall?: string; roof?: string; lit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-15} width={20} height={15} fill={wall} {...line(1.8 / s)} />
      <path d="M-13 -14 L0 -26 L13 -14 Z" fill={roof} {...line(1.8 / s)} />
      <rect x={-7} y={-11} width={6} height={5} rx={1} fill={lit ? C.yellow : C.sky} {...line(1.4 / s)} />
      <rect x={2} y={-9} width={5} height={9} rx={1} fill={C.brown} {...line(1.4 / s)} />
    </g>
  )
}

function Pine({ x, y, h, fill = C.greenDark }: { x: number; y: number; h: number; fill?: string }) {
  const w = h * 0.66
  const d = `M${x} ${y - h} L${q(x + w * 0.3)} ${q(y - h * 0.64)} L${q(x + w * 0.17)} ${q(y - h * 0.64)} L${q(x + w * 0.42)} ${q(y - h * 0.36)} L${q(x + w * 0.27)} ${q(y - h * 0.36)} L${q(x + w * 0.5)} ${q(y - h * 0.12)} L${q(x - w * 0.5)} ${q(y - h * 0.12)} L${q(x - w * 0.27)} ${q(y - h * 0.36)} L${q(x - w * 0.42)} ${q(y - h * 0.36)} L${q(x - w * 0.17)} ${q(y - h * 0.64)} L${q(x - w * 0.3)} ${q(y - h * 0.64)} Z`
  return (
    <g>
      <rect x={q(x - h * 0.06)} y={q(y - h * 0.14)} width={q(h * 0.12)} height={q(h * 0.14)} fill={C.brown} {...LM} />
      <path d={d} fill={fill} {...L} />
    </g>
  )
}

function SmallLeaf({ x, y, s = 1, rot = 0, fill = C.orange }: { x: number; y: number; s?: number; rot?: number; fill?: string }) {
  return (
    <g className="illu-wag" style={origin(x, y)}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <path d="M0 -6 Q6 0 0 6 Q-6 0 0 -6 Z" fill={fill} {...line(1.5 / s)} />
        <path d="M0 -5 L0 5" stroke={C.ink} strokeWidth={1 / s} opacity={0.5} />
      </g>
    </g>
  )
}

function Ball({ x, y, r, color = C.red }: { x: number; y: number; r: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} />
      <path d={`M${q(x - r * 0.97)} ${q(y - r * 0.25)} Q${x} ${q(y + r * 0.25)} ${q(x + r * 0.97)} ${q(y - r * 0.25)} L${q(x + r * 0.9)} ${q(y + r * 0.42)} Q${x} ${q(y + r * 0.9)} ${q(x - r * 0.9)} ${q(y + r * 0.42)} Z`} fill={C.white} />
      <circle cx={q(x - r * 0.4)} cy={q(y - r * 0.45)} r={q(r * 0.18)} fill={C.white} opacity={0.6} />
      <circle cx={x} cy={y} r={r} fill="none" {...L} />
    </g>
  )
}

function Balloon({ x, y, rx = 18, color = C.red }: { x: number; y: number; rx?: number; color?: string }) {
  const ry = rx * 1.2
  return (
    <g className="illu-bob" style={origin(x, y)}>
      <path d={`M${x} ${q(y + ry)} Q${x - 4} ${q(y + ry + 12)} ${x + 2} ${q(y + ry + 22)} Q${x + 6} ${q(y + ry + 30)} ${x} ${q(y + ry + 38)}`} fill="none" {...LS} />
      <path d={`M${x - 3} ${q(y + ry + 4)} L${x} ${q(y + ry - 1)} L${x + 3} ${q(y + ry + 4)} Z`} fill={color} {...LS} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} {...L} />
      <ellipse cx={q(x - rx * 0.4)} cy={q(y - ry * 0.4)} rx={q(rx * 0.18)} ry={q(ry * 0.25)} fill={C.white} opacity={0.6} />
    </g>
  )
}

function Teddy({ fur = C.fur, light = C.furLight, old = false }: { fur?: string; light?: string; old?: boolean }) {
  return (
    <g>
      <Shadow y={91} rx={28} />
      <circle cx={33} cy={23} r={8} fill={fur} {...L} />
      <circle cx={67} cy={23} r={8} fill={fur} {...L} />
      <circle cx={33} cy={23} r={4} fill={light} />
      <circle cx={67} cy={23} r={4} fill={light} />
      <ellipse cx={27} cy={64} rx={7} ry={12} transform="rotate(25 27 64)" fill={fur} {...L} />
      <ellipse cx={73} cy={64} rx={7} ry={12} transform="rotate(-25 73 64)" fill={fur} {...L} />
      <ellipse cx={50} cy={68} rx={20} ry={20} fill={fur} {...L} />
      <ellipse cx={50} cy={71} rx={11} ry={12} fill={light} />
      <circle cx={34} cy={84} r={8} fill={fur} {...L} />
      <circle cx={66} cy={84} r={8} fill={fur} {...L} />
      <circle cx={34} cy={85} r={4} fill={light} />
      <circle cx={66} cy={85} r={4} fill={light} />
      <circle cx={50} cy={38} r={19} fill={fur} {...L} />
      <ellipse cx={50} cy={45} rx={9} ry={7} fill={light} {...LS} />
      <ellipse cx={50} cy={42} rx={3.5} ry={2.5} fill={C.ink} />
      <Smile x={50} y={46} w={6} />
      {old ? (
        <>
          <circle cx={42} cy={34} r={3.2} fill={C.ink} />
          <circle cx={58} cy={34} r={3.6} fill={C.navy} {...LS} />
          <path d="M56.5 32.5 L59.5 35.5 M59.5 32.5 L56.5 35.5" stroke={C.white} strokeWidth={1} />
          <rect x={52} y={63} width={13} height={12} rx={2} fill={C.blue} transform="rotate(8 58 69)" {...LS} />
          <path d="M53 63 l1 -2 M57 63 l1 -2 M61 64 l1 -2 M53 76 l1 2 M57 76 l1 2" stroke={C.ink} strokeWidth={1.2} />
          <path d="M28 18 L33 22 M30 26 L35 24" stroke={C.ink} strokeWidth={1.2} strokeLinecap="round" />
        </>
      ) : (
        <Eyes x1={42} x2={58} y={34} r={3.2} />
      )}
      <Cheeks x1={37} x2={63} y={44} r={3} />
    </g>
  )
}

function Drum({ x = 50, y = 62, w = 28, color = C.red }: { x?: number; y?: number; w?: number; color?: string }) {
  const h = w * 1.05
  const ry = w * 0.32
  return (
    <g>
      <path d={`M${x - w} ${y} V${q(y + h)} A${w} ${ry} 0 0 0 ${x + w} ${q(y + h)} V${y} Z`} fill={color} {...L} />
      <path d={`M${x - w} ${q(y + h * 0.15)} L${q(x - w * 0.5)} ${q(y + h * 0.9)} L${x} ${q(y + h * 0.2)} L${q(x + w * 0.5)} ${q(y + h * 0.95)} L${x + w} ${q(y + h * 0.15)}`} fill="none" stroke={C.yellow} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={`M${x - w} ${q(y + h - 3)} A${w} ${ry} 0 0 0 ${x + w} ${q(y + h - 3)}`} fill="none" stroke={C.white} strokeWidth={3} />
      <ellipse cx={x} cy={y} rx={w} ry={ry} fill={C.cream} {...L} />
      <ellipse cx={x} cy={y} rx={w * 0.7} ry={ry * 0.6} fill="none" stroke={C.ink} strokeWidth={1} opacity={0.25} />
    </g>
  )
}

function Glass({ x = 50, level, color = C.orange }: { x?: number; level: number; color?: string }) {
  // tumbler from y=24 to y=86, top width 44, bottom width 34
  const top = 24
  const bot = 86
  const ly = bot - 4 - (bot - 4 - (top + 6)) * level
  const half = (yy: number) => 17 + ((bot - yy) / (bot - top)) * 5
  return (
    <g>
      <Shadow x={x} y={88} rx={22} />
      <path d={`M${x - 22} ${top} L${x - 17} ${bot} H${x + 17} L${x + 22} ${top} Z`} fill={C.sky} fillOpacity={0.35} />
      {level > 0 && (
        <path d={`M${q(x - half(ly) + 2)} ${q(ly)} H${q(x + half(ly) - 2)} L${x + 15} ${bot - 3} H${x - 15} Z`} fill={color} />
      )}
      {level > 0 && <ellipse cx={x} cy={q(ly)} rx={q(half(ly) - 2)} ry={3} fill={C.white} opacity={0.35} />}
      <path d={`M${x - 22} ${top} L${x - 17} ${bot} H${x + 17} L${x + 22} ${top} Z`} fill="none" {...L} />
      <path d={`M${x - 15} ${top + 6} L${x - 12} ${bot - 8}`} stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
    </g>
  )
}

function Shirt({ color = C.blue }: { color?: string }) {
  return (
    <g>
      <path d="M8 22 Q50 30 92 22" fill="none" {...LM} />
      <path d="M34 26 L22 32 L14 46 L24 52 L30 44 L30 80 H70 V44 L76 52 L86 46 L78 32 L66 26 Q58 32 50 32 Q42 32 34 26 Z" fill={color} {...L} />
      <path d="M42 28 Q50 36 58 28" fill="none" {...LS} />
      <circle cx={50} cy={56} r={6} fill={C.white} opacity={0.7} />
      <rect x={31} y={20} width={5} height={11} rx={1.5} fill={C.yellow} {...LS} />
      <rect x={64} y={20} width={5} height={11} rx={1.5} fill={C.yellow} {...LS} />
    </g>
  )
}

function Worm({ d, color = C.leaf, hx, hy }: { d: string; color?: string; hx: number; hy: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={9} fill={color} {...L} />
      <Eyes x1={hx - 3} x2={hx + 4} y={hy - 2} r={1.8} />
      <Smile x={hx + 1} y={hy + 3} w={4} />
    </g>
  )
}

function Bulb({ on }: { on: boolean }) {
  return (
    <g>
      {on && <circle cx={50} cy={42} r={30} fill={C.yellow} opacity={0.25} />}
      {on && <Rays x={50} y={42} r1={27} r2={36} n={8} />}
      <path d="M38 60 Q24 48 30 32 Q36 18 50 18 Q64 18 70 32 Q76 48 62 60 L61 66 H39 Z" fill={on ? C.yellow : C.greyLight} {...L} />
      <path d="M44 62 L44 48 Q50 42 56 48 L56 62" fill="none" stroke={on ? C.orange : C.grey} strokeWidth={2} strokeLinecap="round" />
      {on && <ellipse cx={40} cy={33} rx={3.5} ry={6} fill={C.white} opacity={0.7} transform="rotate(25 40 33)" />}
      <rect x={39} y={66} width={22} height={12} rx={3} fill={C.grey} {...L} />
      <path d="M39 70 H61 M39 74 H61" stroke={C.ink} strokeWidth={1.2} opacity={0.5} />
      <path d="M45 78 H55 L52 83 H48 Z" fill={C.ink} />
    </g>
  )
}

function Boot({ color = C.yellow, dirty = false }: { color?: string; dirty?: boolean }) {
  return (
    <g>
      <Shadow y={88} rx={30} />
      <path d="M30 14 H60 V58 Q82 58 86 72 V84 H28 Z" fill={color} {...L} />
      <rect x={26} y={10} width={38} height={10} rx={4} fill={color} {...L} />
      <rect x={26} y={78} width={62} height={8} rx={3} fill={C.ink} />
      <path d="M36 26 V52" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      {dirty ? (
        <g fill={C.brown} {...LS}>
          <path d="M28 66 Q36 58 44 66 Q52 62 54 72 Q48 80 38 76 Q28 78 28 66 Z" />
          <path d="M60 64 Q68 60 72 66 Q76 72 68 74 Q60 74 60 64 Z" />
          <circle cx={46} cy={44} r={4} />
          <circle cx={56} cy={30} r={3} />
          <circle cx={18} cy={84} r={3} />
          <path d="M84 80 Q92 76 92 84 Q88 88 84 80 Z" />
        </g>
      ) : (
        <>
          <Twinkle x={74} y={26} r={8} />
          <Twinkle x={86} y={46} r={5} />
          <Twinkle x={16} y={40} r={5} />
        </>
      )}
    </g>
  )
}

function Block({ x, y, s, fill, children }: { x: number; y: number; s: number; fill: string; children?: ReactNode }) {
  const d = s * 0.22
  return (
    <g>
      <path d={`M${x} ${y} L${x + d} ${y - d} H${x + s + d} L${x + s} ${y} Z`} fill={C.white} {...LM} />
      <path d={`M${x} ${y} L${x + d} ${y - d} H${x + s + d} L${x + s} ${y} Z`} fill={fill} opacity={0.55} />
      <path d={`M${x + s} ${y} L${x + s + d} ${y - d} V${y + s - d} L${x + s} ${y + s} Z`} fill={fill} {...LM} />
      <path d={`M${x + s} ${y} L${x + s + d} ${y - d} V${y + s - d} L${x + s} ${y + s} Z`} fill={C.ink} opacity={0.18} />
      <rect x={x} y={y} width={s} height={s} rx={2} fill={fill} {...L} />
      <rect x={x + 3} y={y + 3} width={s - 6} height={s - 6} rx={2} fill="none" stroke={C.white} strokeWidth={1.4} opacity={0.6} />
      {children}
    </g>
  )
}

function Door({ open, color = C.red }: { open: boolean; color?: string }) {
  return (
    <g>
      <Shadow y={88} rx={36} />
      <rect x={24} y={10} width={52} height={78} rx={4} fill={C.brown} {...L} />
      {open ? (
        <>
          <rect x={30} y={16} width={40} height={72} fill={PALE} {...LM} />
          <path d="M30 88 H70 L86 94 H14 Z" fill={C.yellow} opacity={0.5} />
          <Rays x={50} y={50} r1={8} r2={14} n={8} color={C.yellow} w={2.6} />
          <path d="M30 16 L12 22 V84 L30 88 Z" fill={color} {...L} />
          <circle cx={16} cy={54} r={2.4} fill={C.yellow} {...LS} />
        </>
      ) : (
        <>
          <rect x={30} y={16} width={40} height={72} fill={color} {...L} />
          <rect x={35} y={22} width={30} height={26} rx={2} fill="none" stroke={C.ink} strokeWidth={1.4} opacity={0.4} />
          <rect x={35} y={54} width={30} height={28} rx={2} fill="none" stroke={C.ink} strokeWidth={1.4} opacity={0.4} />
          <circle cx={63} cy={52} r={3} fill={C.yellow} {...LS} />
          <rect x={44} y={52} width={12} height={10} rx={2} fill={C.yellow} {...LS} />
          <path d="M46 52 V48 A4 4 0 0 1 54 48 V52" fill="none" {...LS} />
        </>
      )}
    </g>
  )
}

/** Market stand frame: striped canopy, poles, table. Goods go in children. */
function Stand({ stripe = C.red, children }: { stripe?: string; children?: ReactNode }) {
  const scallop = Array.from({ length: 6 }, (_, i) => `A6.5 6 0 0 1 ${90 - (i + 1) * 13} 34`).join(' ')
  const canopy = `M12 34 L18 14 H82 L90 34 ${scallop} Z`
  return (
    <g>
      <Shadow y={90} rx={42} />
      <path d="M17 32 V88 M83 32 V88" {...line(3.4)} />
      <path d="M17 32 V88 M83 32 V88" stroke={C.brown} strokeWidth={1.6} strokeLinecap="round" />
      <path d={canopy} fill={C.white} />
      <g fill={stripe}>
        <path d="M18 14 H30 L27 34 H14 Z" />
        <path d="M44 14 H56 V34 H44 Z" />
        <path d="M70 14 H82 L86 34 H73 Z" />
      </g>
      <path d={canopy} fill="none" {...L} />
      {children}
      <rect x={10} y={66} width={80} height={8} rx={2} fill={C.furLight} {...L} />
      <rect x={14} y={74} width={72} height={14} fill={C.fur} {...L} />
      <path d="M14 81 H86" stroke={C.ink} strokeWidth={1.2} opacity={0.35} />
    </g>
  )
}

type Season = 'plain' | 'spring' | 'summer' | 'autumn' | 'winter'
const CROWN_D = 'M26 54 A14 14 0 0 1 28 30 A18 18 0 0 1 58 16 A16 16 0 0 1 76 36 A13 13 0 0 1 70 60 Q50 66 30 60 Z'
const BRANCH_D = 'M50 62 L50 24 M50 52 L34 36 L28 37 M34 36 L32 27 M50 44 L66 30 L73 31 M50 58 L68 48 M50 34 L42 25'

function Tulip({ x, y, color = C.red }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <path d={`M${x} ${y} V${y - 12}`} stroke={C.greenDark} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M${x - 5} ${y - 18} L${x - 2.5} ${y - 14} L${x} ${y - 18} L${x + 2.5} ${y - 14} L${x + 5} ${y - 18} Q${x + 5} ${y - 10} ${x} ${y - 10} Q${x - 5} ${y - 10} ${x - 5} ${y - 18} Z`} fill={color} {...LS} />
    </g>
  )
}

function Tree({ season, color }: { season: Season; color?: string }) {
  const crown = color ?? { plain: C.leaf, spring: '#a6dc8c', summer: C.green, autumn: C.orange, winter: C.leaf }[season]
  const hi = season === 'autumn' ? C.yellow : '#c4ebb0'
  return (
    <g>
      <Shadow y={89} rx={30} />
      <path d="M43 90 Q46 74 45 56 L55 56 Q54 74 57 90 Z" fill={C.brown} {...L} />
      {season === 'winter' ? (
        <g>
          <path d={BRANCH_D} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d={BRANCH_D} fill="none" stroke={C.brown} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" />
          <g fill={C.white} {...LS}>
            <ellipse cx={50} cy={22} rx={5} ry={3} />
            <ellipse cx={30} cy={34} rx={5} ry={2.6} />
            <ellipse cx={68} cy={28} rx={5} ry={2.6} />
            <ellipse cx={66} cy={46} rx={4.5} ry={2.4} />
            <ellipse cx={41} cy={24} rx={3.5} ry={2.2} />
          </g>
          <path d="M8 84 Q30 76 50 81 Q72 85 92 78 L92 88 Q50 95 8 88 Z" fill={C.white} {...LM} />
          <Flake x={18} y={20} r={5} />
          <Flake x={84} y={16} r={4.5} />
          <Flake x={84} y={58} r={5} />
          <Flake x={16} y={60} r={4} />
        </g>
      ) : (
        <g className="illu-bob" style={origin(50, 60)}>
          <path d={CROWN_D} fill={crown} {...L} />
          <circle cx={40} cy={30} r={6} fill={hi} opacity={0.75} />
          <circle cx={52} cy={23} r={3.5} fill={hi} opacity={0.75} />
          {season === 'spring' && (
            <g>
              {[[34, 42], [48, 32], [62, 26], [68, 46], [44, 52], [57, 43], [30, 52], [72, 34]].map(([bx, by], i) => (
                <g key={i}>
                  <circle cx={bx} cy={by} r={3.6} fill={C.white} {...LS} />
                  <circle cx={bx} cy={by} r={1.6} fill={C.rose} />
                </g>
              ))}
            </g>
          )}
          {season === 'summer' &&
            [[36, 44], [54, 34], [67, 48], [47, 54], [64, 25]].map(([ax, ay], i) => <circle key={i} cx={ax} cy={ay} r={3.8} fill={C.red} {...LS} />)}
          {season === 'autumn' && (
            <g fill={C.red} opacity={0.85}>
              <circle cx={36} cy={46} r={4} />
              <circle cx={60} cy={30} r={4} />
              <circle cx={66} cy={50} r={3.5} />
            </g>
          )}
        </g>
      )}
      {season === 'spring' && (
        <>
          <Tulip x={22} y={89} />
          <Tulip x={30} y={90} color={C.yellow} />
          <Tulip x={78} y={90} color={C.rose} />
        </>
      )}
      {season === 'summer' && <Sun x={16} y={17} r={6} />}
      {season === 'autumn' && (
        <>
          <SmallLeaf x={18} y={66} s={1.2} rot={30} />
          <SmallLeaf x={84} y={70} s={1.1} rot={-20} fill={C.red} />
          <SmallLeaf x={78} y={86} s={1} rot={80} fill={C.yellow} />
          <SmallLeaf x={26} y={86} s={1} rot={-60} fill={C.red} />
        </>
      )}
    </g>
  )
}

function Calendar({ dir }: { dir: -1 | 0 | 1 }) {
  const xs = [30, 50, 70]
  const t = 1 + dir
  return (
    <g>
      <Shadow y={90} rx={36} />
      <rect x={14} y={18} width={72} height={68} rx={8} fill={C.white} {...L} />
      <path d="M14 34 V26 A8 8 0 0 1 22 18 H78 A8 8 0 0 1 86 26 V34 Z" fill={C.red} {...L} />
      <rect x={28} y={11} width={6} height={13} rx={3} fill={C.grey} {...LS} />
      <rect x={66} y={11} width={6} height={13} rx={3} fill={C.grey} {...LS} />
      {xs.map((x, i) => (
        <rect key={i} x={x - 8} y={48} width={16} height={16} rx={4} fill={i === t ? C.yellow : i === 1 ? '#fbe6a6' : C.greyLight} {...(i === t ? L : LS)} />
      ))}
      {xs.map((x, i) => (
        <rect key={`b${i}`} x={x - 6} y={71} width={12} height={9} rx={3} fill={C.greyLight} opacity={0.6} />
      ))}
      <circle cx={xs[t]} cy={56} r={12} fill="none" stroke={C.orange} strokeWidth={2.6} />
      <circle cx={xs[t]} cy={56} r={3} fill={C.orange} />
      {dir !== 0 && (
        <g>
          <path d={`M50 46 Q${50 + dir * 10} 34 ${xs[t] - dir * 2} 40`} fill="none" stroke={C.ink} strokeWidth={2.8} strokeLinecap="round" />
          <path d={`M${xs[t] - dir * 7} ${37} L${xs[t] + dir * 1} ${42} L${xs[t] - dir * 5} ${45} Z`} fill={C.ink} {...LS} />
        </g>
      )}
      {dir === 0 && <Twinkle x={50} y={40} r={5} />}
    </g>
  )
}

function pieceD(x: number, y: number, s: number, right: number, bottom: number): string {
  const r = q(s * 0.17)
  let d = `M${x} ${y} H${x + s}`
  if (right) d += ` V${q(y + s * 0.35)} A${r} ${r} 0 1 ${right > 0 ? 1 : 0} ${x + s} ${q(y + s * 0.65)}`
  d += ` V${y + s}`
  if (bottom) d += ` H${q(x + s * 0.65)} A${r} ${r} 0 1 ${bottom > 0 ? 1 : 0} ${q(x + s * 0.35)} ${y + s}`
  return `${d} H${x} Z`
}

/* ------------------------------------------------------------------ nature */

const nature: IlluMap = {
  sunne: ({ color }) => <Sun x={50} y={50} r={24} fill={color ?? C.yellow} face />,
  mond: ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 50)}>
        <path d="M55.9 18.5 A34 34 0 1 0 81.9 63.6 A28 28 0 0 1 55.9 18.5 Z" fill={color ?? '#f8df8a'} {...L} />
        <circle cx={30} cy={36} r={4} fill={C.white} opacity={0.5} />
        <path d="M27 50 Q31 54 35 50" fill="none" {...LM} />
        <circle cx={38} cy={58} r={3} fill={C.cheek} opacity={0.55} />
        <path d="M29 62 Q33 65 37 62" fill="none" {...LM} />
      </g>
      <Star x={76} y={22} r={7} />
      <Star x={86} y={42} r={4.5} />
      <Twinkle x={64} y={84} r={4} />
    </g>
  ),
  staern: ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 52)}>
        <path d={starD(50, 54, 40, 19)} fill={color ?? C.yellow} {...line(3)} />
        <circle cx={38} cy={44} r={3} fill={C.white} opacity={0.6} />
        <Eyes x1={43} x2={57} y={54} r={3} />
        <Cheeks x1={38} x2={62} y={61} r={2.6} />
        <Smile x={50} y={61} w={7} />
      </g>
      <Twinkle x={16} y={18} r={5} />
      <Twinkle x={86} y={84} r={4} />
    </g>
  ),
  wouke: ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 50)}>
        <Cloud x={50} y={52} s={2.2} fill={color ?? C.white} />
        <Eyes x1={42} x2={58} y={52} r={3} />
        <Cheeks x1={36} x2={64} y={58} r={3} />
        <Smile x={50} y={58} w={7} />
      </g>
    </g>
  ),
  raege: ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 34)}>
        <Cloud x={50} y={34} s={1.9} fill={color ?? C.greyLight} />
        <Eyes x1={43} x2={57} y={35} r={2.4} />
        <Smile x={50} y={40} w={5} />
      </g>
      <g fill={C.water} {...LS}>
        <path d={dropD(28, 64)} />
        <path d={dropD(46, 72)} />
        <path d={dropD(64, 62)} />
        <path d={dropD(76, 80)} />
        <path d={dropD(36, 84)} />
        <path d={dropD(58, 88, 0.8)} />
      </g>
    </g>
  ),
  schnee: () => (
    <g>
      <Flake x={22} y={20} r={7} />
      <Flake x={50} y={14} r={5} />
      <Flake x={78} y={24} r={8} />
      <Flake x={34} y={44} r={6} />
      <Flake x={66} y={48} r={6.5} />
      <Flake x={86} y={56} r={4.5} />
      <Flake x={14} y={60} r={4.5} />
      <path d="M8 88 Q12 70 30 70 Q40 62 54 68 Q66 60 80 68 Q92 70 92 88 Z" fill={C.white} {...L} />
      <path d="M22 82 Q40 76 58 80 Q72 76 84 82" fill="none" stroke={C.sky} strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  wind: () => (
    <g>
      <g className="illu-bob" style={origin(24, 38)}>
        <Cloud x={24} y={38} s={1.15} />
        <Eyes x1={18} x2={26} y={36} r={1.8} />
        <Cheeks x1={14} x2={30} y={41} r={2.4} />
        <circle cx={33} cy={41} r={2.2} fill={C.ink} />
      </g>
      <g fill="none" stroke={C.blue} strokeWidth={3.2} strokeLinecap="round">
        <path d="M42 34 H66 A7 7 0 1 0 59 27" />
        <path d="M40 46 H80 A6 6 0 1 1 74 52" />
        <path d="M34 58 H58 A6 6 0 1 0 52 52" />
        <path d="M26 70 H64" opacity={0.6} />
      </g>
      <SmallLeaf x={84} y={22} s={1.4} rot={40} fill={C.leaf} />
      <SmallLeaf x={80} y={74} s={1.6} rot={-30} />
      <SmallLeaf x={52} y={84} s={1.2} rot={70} fill={C.red} />
    </g>
  ),
  raegeboge: () => (
    <g>
      {([
        [40, C.red],
        [34, C.orange],
        [28, C.yellow],
        [22, C.green],
        [16, C.blue],
      ] as const).map(([r, col]) => (
        <path key={r} d={`M${50 - r} 72 A${r} ${r} 0 0 1 ${50 + r} 72`} fill="none" stroke={col} strokeWidth={6.4} />
      ))}
      <path d="M7 72 A43 43 0 0 1 93 72 M37 72 A13 13 0 0 1 63 72" fill="none" {...LM} />
      <Cloud x={20} y={74} s={0.95} />
      <Cloud x={80} y={74} s={0.95} />
    </g>
  ),
  boum: ({ color }) => <Tree season="plain" color={color} />,
  bluem: ({ color }) => (
    <g>
      <Shadow y={90} rx={18} />
      <g className="illu-wag" style={origin(50, 90)}>
        <path d="M50 90 Q48 70 50 48" fill="none" stroke={C.greenDark} strokeWidth={4} strokeLinecap="round" />
        <path d="M49 74 Q34 62 28 70 Q36 80 49 76 Z" fill={C.leaf} {...LM} />
        <path d="M51 68 Q66 56 72 64 Q64 74 51 70 Z" fill={C.leaf} {...LM} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3 - Math.PI / 2
          return <circle key={i} cx={q(50 + 14 * Math.cos(a))} cy={q(34 + 14 * Math.sin(a))} r={10} fill={color ?? C.rose} {...L} />
        })}
        <circle cx={50} cy={34} r={10} fill={C.yellow} {...L} />
        <Eyes x1={46} x2={54} y={33} r={1.7} />
        <Smile x={50} y={37} w={4} />
      </g>
    </g>
  ),
  blatt: ({ color }) => (
    <g className="illu-wag" style={origin(22, 84)}>
      <path d="M30 74 L18 88" {...line(3)} />
      <path d="M80 14 C84 50 62 76 30 74 C24 46 46 20 80 14 Z" fill={color ?? C.leaf} {...L} />
      <path d="M30 74 Q52 50 78 17" fill="none" {...LM} />
      <path d="M44 58 L40 42 M54 46 L52 32 M64 34 L64 24 M44 58 L60 60 M54 46 L70 46 M64 34 L76 34" fill="none" stroke={C.ink} strokeWidth={1.3} strokeLinecap="round" opacity={0.5} />
      <path d="M40 60 C38 44 50 30 66 24" fill="none" stroke={C.white} strokeWidth={2} opacity={0.3} strokeLinecap="round" />
    </g>
  ),
  gras: ({ color }) => {
    const blades: [number, number, number, string][] = [
      [16, 30, -6, C.greenDark],
      [26, 48, 4, C.green],
      [36, 36, -3, C.leaf],
      [46, 58, 6, C.greenDark],
      [56, 40, -4, C.green],
      [66, 52, 5, C.leaf],
      [76, 34, -6, C.greenDark],
      [84, 44, 4, C.green],
    ]
    return (
      <g>
        <Shadow y={89} rx={40} />
        <g className="illu-wag" style={origin(50, 88)}>
          {blades.map(([x, h, lean, f], i) => (
            <path key={i} d={`M${x - 5} 88 Q${x - 3} ${88 - h * 0.5} ${x + lean} ${88 - h} Q${x + 3} ${88 - h * 0.5} ${x + 5} 88 Z`} fill={color ?? f} {...LM} />
          ))}
        </g>
        <circle cx={31} cy={60} r={5} fill={C.white} {...LS} />
        <circle cx={31} cy={60} r={2.2} fill={C.yellow} />
        <ellipse cx={72} cy={70} rx={4.5} ry={3.8} fill={C.red} {...LS} />
        <path d="M72 66.5 V73.5" stroke={C.ink} strokeWidth={1} />
        <circle cx={70.5} cy={69.5} r={0.9} fill={C.ink} />
        <circle cx={73.5} cy={71} r={0.9} fill={C.ink} />
      </g>
    )
  },
  stei: ({ color }) => (
    <g>
      <Shadow y={87} rx={36} />
      <path d="M16 80 Q12 56 32 44 Q52 30 70 40 Q90 50 86 74 Q84 86 50 86 Q20 86 16 80 Z" fill={color ?? C.stone} {...L} />
      <path d="M30 52 Q40 42 52 42" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <g fill={C.ink} opacity={0.25}>
        <circle cx={60} cy={56} r={2} />
        <circle cx={40} cy={68} r={1.6} />
        <circle cx={70} cy={70} r={1.4} />
        <circle cx={52} cy={74} r={1.2} />
      </g>
    </g>
  ),
  baerg: ({ color }) => (
    <g>
      <path d="M8 86 L36 34 L52 58 L66 22 L94 86 Z" fill={color ?? '#8ea3bb'} {...L} />
      <path d="M58 40 L66 22 L74 40 L69 37 L66 42 L62 37 Z" fill={C.white} {...LM} />
      <path d="M28 48 L36 34 L44 48 L40 46 L36 50 L32 46 Z" fill={C.white} {...LM} />
      <path d="M26 86 L52 46 L78 86 Z" fill="#b1c1d2" {...L} />
      <path d="M45 57 L52 46 L59 57 L55 55 L52 59 L48 55 Z" fill={C.white} {...LM} />
      <path d="M6 86 Q30 76 50 82 Q72 76 94 84 L94 90 H6 Z" fill={C.leaf} {...LM} />
      <Cloud x={84} y={18} s={0.6} />
    </g>
  ),
  see: () => (
    <Scene
      sky={C.sky}
      back={
        <>
          <path d="M8 56 L26 30 L40 48 L58 24 L80 52 L92 40 V56 Z" fill="#9fb3c8" {...LM} />
          <path d="M53 31 L58 24 L63 31 Z M22 36 L26 30 L30 36 Z" fill={C.white} />
          <Sun x={80} y={24} r={6} />
        </>
      }
      ground={C.water}
      groundD={`M8 54 H92 ${FRAME_BOTTOM}`}
      front={
        <>
          <path d="M20 66 H36 M54 74 H72 M26 82 H40 M66 62 H80" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
          <g className="illu-bob" style={origin(52, 64)}>
            <path d="M40 62 H64 L60 68 H44 Z" fill={C.red} {...LM} />
            <path d="M52 61 V40 L64 58 Z" fill={C.white} {...LM} />
          </g>
          <path d="M8 80 Q20 76 30 80 Q36 84 34 90 L22 90 A14 14 0 0 1 8 76 Z" fill={C.leaf} {...LM} />
        </>
      }
    />
  ),
  fluss: () => (
    <Scene
      sky={C.leaf}
      groundD={null}
      back={
        <>
          <path d="M30 10 C30 34 72 32 66 54 C61 74 34 68 40 90" fill="none" stroke={C.ink} strokeWidth={21} />
          <path d="M30 10 C30 34 72 32 66 54 C61 74 34 68 40 90" fill="none" stroke={C.water} strokeWidth={17} />
          <path d="M38 24 Q44 26 48 25 M60 46 Q64 48 66 46 M48 74 Q52 76 56 74" fill="none" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
          <Pine x={78} y={34} h={20} />
          <Pine x={22} y={60} h={18} fill={C.green} />
          <circle cx={84} cy={74} r={3} fill={C.white} {...LS} />
          <circle cx={84} cy={74} r={1.2} fill={C.yellow} />
          <circle cx={16} cy={34} r={3} fill={C.rose} {...LS} />
          <path d="M60 60 q4 -3 8 0 q-4 3 -8 0 l-3 -2 v4 z" fill={C.orange} {...LS} />
        </>
      }
    />
  ),
  waud: () => (
    <g>
      <Shadow y={89} rx={42} />
      <Pine x={30} y={70} h={52} fill={C.green} />
      <Pine x={70} y={68} h={56} fill={C.green} />
      <Pine x={50} y={88} h={66} />
      <Pine x={16} y={90} h={40} />
      <Pine x={84} y={90} h={44} />
      <path d="M62 88 V82" {...line(3.4)} />
      <path d="M62 88 V82" stroke={C.white} strokeWidth={2} />
      <path d="M55 82 Q62 72 69 82 Z" fill={C.red} {...LM} />
      <circle cx={60} cy={78} r={1.2} fill={C.white} />
      <circle cx={64} cy={79} r={1} fill={C.white} />
    </g>
  ),
  fruehlig: () => <Tree season="spring" />,
  summer: () => <Tree season="summer" />,
  herbscht: () => <Tree season="autumn" />,
  winter: () => <Tree season="winter" />,
  schneema: ({ color }) => (
    <g>
      <path d="M8 86 Q50 78 92 86 L92 90 H8 Z" fill={C.white} {...LM} />
      <path d="M32 50 L16 38 M18 40 L14 34 M68 50 L84 38 M82 40 L86 34" fill="none" {...line(2.6)} />
      <circle cx={50} cy={72} r={18} fill={C.white} {...L} />
      <circle cx={50} cy={48} r={13} fill={C.white} {...L} />
      <path d="M38 40 Q50 46 62 40 L62 44 Q50 50 38 44 Z M54 44 L58 58 L64 56 L60 43 Z" fill={color ?? C.red} {...LM} />
      <circle cx={50} cy={28} r={11} fill={C.white} {...L} />
      <path d="M39 24 Q40 12 50 12 Q60 12 61 24 Z" fill={color ?? C.red} {...LM} />
      <circle cx={50} cy={10} r={3.6} fill={C.white} {...LS} />
      <rect x={38} y={21} width={24} height={4} rx={2} fill={C.white} {...LS} />
      <circle cx={46} cy={28} r={1.6} fill={C.ink} />
      <circle cx={54} cy={28} r={1.6} fill={C.ink} />
      <path d="M50 31 L60 33 L50 34 Z" fill={C.orange} {...line(1.2)} />
      <Cheeks x1={43} x2={57} y={33} r={2} />
      <circle cx={50} cy={53} r={1.6} fill={C.ink} />
      <circle cx={50} cy={59} r={1.6} fill={C.ink} />
      <circle cx={50} cy={70} r={1.8} fill={C.ink} />
      <path d="M38 64 Q44 60 48 62" fill="none" stroke={C.sky} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  ),
  glungge: ({ color }) => (
    <g>
      <ellipse cx={50} cy={78} rx={42} ry={12} fill={C.water} {...L} />
      <ellipse cx={24} cy={78} rx={8} ry={2.6} fill="none" stroke={C.white} strokeWidth={1.8} opacity={0.8} />
      <ellipse cx={80} cy={82} rx={8} ry={2.6} fill="none" stroke={C.white} strokeWidth={1.8} opacity={0.8} />
      <g fill={color ?? C.yellow} {...L}>
        <path d="M34 36 H50 V66 Q62 66 64 74 V80 H34 Z" />
        <path d="M52 32 H68 V62 Q80 62 82 70 V76 H52 Z" />
      </g>
      <rect x={32} y={32} width={20} height={7} rx={3} fill={color ?? C.yellow} {...LM} />
      <rect x={50} y={28} width={20} height={7} rx={3} fill={color ?? C.yellow} {...LM} />
      <path d="M38 42 V60 M56 38 V56" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <g fill={C.water} {...LS}>
        <path d={dropD(22, 62, 0.8)} />
        <path d={dropD(14, 70, 0.6)} />
        <path d={dropD(90, 62, 0.7)} />
        <path d={dropD(26, 18)} />
        <path d={dropD(80, 14)} />
      </g>
    </g>
  ),
  himu: () => (
    <Scene
      sky={C.sky}
      groundD={`M8 80 Q30 74 50 78 Q70 82 92 76 ${FRAME_BOTTOM}`}
      back={
        <>
          <g className="illu-bob" style={origin(32, 30)}>
            <Cloud x={32} y={32} s={1.3} />
          </g>
          <Cloud x={70} y={56} s={1.1} />
          <path d="M60 24 Q64 20 68 24 Q72 20 76 24 M74 36 Q77 33 80 36 Q83 33 86 36" fill="none" {...LM} />
          <Twinkle x={22} y={62} r={4} fill={C.white} />
        </>
      }
    />
  ),
  tag: () => (
    <Scene
      sky={C.sky}
      back={
        <>
          <Sun x={64} y={32} r={11} face />
          <Cloud x={26} y={26} s={0.8} />
        </>
      }
      front={
        <>
          <House x={30} y={72} s={1.1} />
          <Pine x={78} y={76} h={20} fill={C.green} />
        </>
      }
    />
  ),
  nacht: () => (
    <Scene
      sky={NIGHT}
      ground="#3c6b4a"
      back={
        <>
          <path d="M66 18 A14 14 0 1 0 80 38 A11 11 0 0 1 66 18 Z" fill="#f8df8a" {...LM} />
          <Star x={24} y={24} r={4.5} />
          <Star x={42} y={40} r={3} />
          <Star x={84} y={52} r={3.5} />
          <Star x={20} y={48} r={2.6} />
        </>
      }
      front={
        <>
          <House x={34} y={74} s={1.1} roof="#9b3b33" wall="#e9dcc3" lit />
          <Pine x={76} y={78} h={20} fill="#2d5a3a" />
        </>
      }
    />
  ),
  tannzapfe: ({ color }) => (
    <g>
      <Shadow y={90} rx={22} />
      <path d="M50 14 V6" {...line(3)} />
      <path d="M50 12 Q74 22 72 52 Q70 82 50 88 Q30 82 28 52 Q26 22 50 12 Z" fill={color ?? C.fur} {...L} />
      {[
        [50, 22],
        [42, 32],
        [58, 32],
        [36, 44],
        [50, 44],
        [64, 44],
        [36, 57],
        [50, 57],
        [64, 57],
        [42, 69],
        [58, 69],
        [50, 79],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 6.5} ${y} Q${x - 6} ${y + 8} ${x} ${y + 9} Q${x + 6} ${y + 8} ${x + 6.5} ${y} Q${x} ${y + 3} ${x - 6.5} ${y} Z`} fill={C.furDark} {...LS} />
      ))}
      <path d="M50 12 Q74 22 72 52 Q70 82 50 88 Q30 82 28 52 Q26 22 50 12 Z" fill="none" {...L} />
    </g>
  ),
}

/* ------------------------------------------------------------------ transport & places */

const transport: IlluMap = {
  bus: ({ color }) => (
    <g>
      <Shadow y={86} rx={42} />
      <rect x={34} y={20} width={30} height={7} rx={3} fill={C.greyLight} {...LM} />
      <path d="M8 34 Q8 26 16 26 H82 Q92 26 92 38 V74 Q92 78 88 78 H12 Q8 78 8 74 Z" fill={color ?? C.red} {...L} />
      <rect x={9.5} y={60} width={81} height={7} fill={C.white} />
      {[14, 30, 46].map((x) => (
        <rect key={x} x={x} y={33} width={13} height={17} rx={3} fill={C.sky} {...LM} />
      ))}
      <path d="M17 36 L20 33 M33 36 L36 33 M49 36 L52 33" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
      <rect x={62} y={33} width={12} height={35} rx={2} fill={C.sky} {...LM} />
      <path d="M68 33 V68" stroke={C.ink} strokeWidth={1.4} />
      <path d="M78 33 H85 Q90 33 90 40 V54 H78 Z" fill={C.sky} {...LM} />
      <circle cx={88} cy={70} r={2.6} fill={C.yellow} {...LS} />
      <Wheel x={26} y={78} r={8} />
      <Wheel x={80} y={78} r={8} />
    </g>
  ),
  tram: ({ color }) => (
    <g>
      <path d="M6 16 H94" stroke={C.grey} strokeWidth={1.4} />
      <path d="M62 32 L70 18 L78 32 M64 17 H76" fill="none" {...LM} />
      <path d="M6 84 H94" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
      <rect x={45} y={36} width={12} height={38} fill={C.grey} {...LM} />
      <path d="M48 38 V72 M51 38 V72 M54 38 V72" stroke={C.ink} strokeWidth={1} opacity={0.4} />
      <path d="M8 40 Q8 32 16 32 H48 V76 H12 Q8 76 8 72 Z" fill={color ?? C.red} {...L} />
      <path d="M54 32 H78 Q92 32 92 50 V72 Q92 76 88 76 H54 Z" fill={color ?? C.red} {...L} />
      <rect x={9.5} y={62} width={37} height={5} fill={C.white} />
      <rect x={55.5} y={62} width={35} height={5} fill={C.white} />
      <rect x={13} y={39} width={31} height={16} rx={3} fill={C.sky} {...LM} />
      <path d="M23.5 39 V55 M33.5 39 V55" stroke={C.ink} strokeWidth={1.6} />
      <rect x={58} y={39} width={18} height={16} rx={3} fill={C.sky} {...LM} />
      <path d="M80 39 H83 Q89 40 89.5 50 V55 H80 Z" fill={C.sky} {...LM} />
      <path d="M16 42 L19 39 M61 42 L64 39" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
      <circle cx={88} cy={70} r={2.2} fill={C.yellow} {...LS} />
      <Wheel x={20} y={78} r={4.5} />
      <Wheel x={36} y={78} r={4.5} />
      <Wheel x={66} y={78} r={4.5} />
      <Wheel x={82} y={78} r={4.5} />
    </g>
  ),
  zug: ({ color }) => (
    <g>
      <path d="M6 82 H94" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
      {[10, 22, 34, 46, 58, 70, 82].map((x) => (
        <rect key={x} x={x} y={84} width={8} height={4} rx={1} fill={C.brown} />
      ))}
      <path d="M52 34 L58 24 L64 34 M54 23 H62" fill="none" {...LM} />
      <rect x={38} y={46} width={8} height={20} fill={C.grey} {...LM} />
      <rect x={6} y={34} width={34} height={40} rx={4} fill={color ?? C.red} {...L} />
      <path d="M44 34 H68 Q82 34 89 52 L92 62 V74 H44 Z" fill={color ?? C.red} {...L} />
      <rect x={7.5} y={60} width={31} height={4} fill={C.white} />
      <rect x={45.5} y={60} width={45} height={4} fill={C.white} />
      <rect x={11} y={40} width={11} height={13} rx={2} fill={C.sky} {...LM} />
      <rect x={25} y={40} width={11} height={13} rx={2} fill={C.sky} {...LM} />
      <rect x={49} y={40} width={13} height={13} rx={2} fill={C.sky} {...LM} />
      <path d="M68 40 H72 Q80 40 84 53 H68 Z" fill={C.sky} {...LM} />
      <circle cx={88} cy={68} r={2.4} fill={C.yellow} {...LS} />
      <Wheel x={14} y={76} r={5} />
      <Wheel x={32} y={76} r={5} />
      <Wheel x={54} y={76} r={5} />
      <Wheel x={80} y={76} r={5} />
    </g>
  ),
  flugzueg: ({ color }) => (
    <g>
      <Cloud x={24} y={80} s={0.8} />
      <Cloud x={80} y={22} s={0.6} />
      <g className="illu-bob" style={origin(50, 50)}>
        <path d="M48 44 L58 44 L50 32 Q47 31 46 33 Z" fill={C.red} {...LM} />
        <path d="M16 44 L10 24 Q12 21 16 23 L32 44 Z" fill={C.red} {...L} />
        <path d="M12 44 Q12 40 18 40 H74 Q90 40 92 50 Q90 58 76 60 H22 Q12 58 12 50 Z" fill={color ?? C.blue} {...L} />
        <path d="M16 54 H84" stroke={C.white} strokeWidth={2.4} opacity={0.6} strokeLinecap="round" />
        {[34, 43, 52, 61].map((x) => (
          <circle key={x} cx={x} cy={47} r={2.6} fill={C.white} {...LS} />
        ))}
        <path d="M76 43 Q85 43 89 48 H76 Z" fill={C.sky} {...LS} />
        <path d="M48 55 H62 L44 78 Q38 80 38 76 Z" fill={C.red} {...L} />
      </g>
    </g>
  ),
  schiff: ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 70)}>
        <circle cx={66} cy={15} r={4} fill={C.greyLight} opacity={0.9} {...LS} />
        <circle cx={74} cy={9} r={3} fill={C.greyLight} opacity={0.9} {...LS} />
        <rect x={56} y={22} width={10} height={18} fill={C.yellow} {...L} />
        <rect x={56} y={22} width={10} height={5} fill={C.ink} />
        <rect x={34} y={36} width={36} height={11} rx={2} fill={C.white} {...L} />
        <rect x={22} y={46} width={56} height={14} rx={2} fill={C.white} {...L} />
        {[30, 40, 50, 60, 70].map((x) => (
          <circle key={x} cx={x} cy={53} r={3} fill={C.sky} {...LS} />
        ))}
        <path d="M14 58 V40" {...line(2)} />
        <g className="illu-wag" style={origin(14, 42)}>
          <path d="M14 40 H25 L22 44 L25 48 H14 Z" fill={C.red} {...LS} />
        </g>
        <path d="M8 58 H92 L82 78 H18 Z" fill={color ?? C.red} {...L} />
        <path d="M11 64 H89" stroke={C.white} strokeWidth={2.4} />
      </g>
      <path d="M6 76 Q14 72 22 76 T38 76 T54 76 T70 76 T86 76 Q90 74 94 76 V86 Q50 94 6 86 Z" fill={C.water} {...LM} />
      <path d="M20 84 H32 M60 86 H74" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
    </g>
  ),
  traktor: ({ color }) => (
    <g>
      <Shadow y={89} rx={40} />
      <g className="illu-bob" style={origin(80, 26)}>
        <circle cx={80} cy={22} r={4} fill={C.greyLight} {...LS} />
        <circle cx={86} cy={14} r={3} fill={C.greyLight} {...LS} />
      </g>
      <rect x={72} y={28} width={5} height={22} rx={1} fill={C.grey} {...LM} />
      <rect x={18} y={26} width={28} height={36} fill={color ?? C.green} {...L} />
      <rect x={23} y={31} width={18} height={18} rx={2} fill={C.sky} {...LM} />
      <path d="M26 36 L30 32" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
      <rect x={14} y={20} width={36} height={7} rx={3} fill={color ?? C.green} {...L} />
      <path d="M44 46 H82 Q88 46 88 52 V68 H44 Z" fill={color ?? C.green} {...L} />
      <path d="M82 52 V64 M85 52 V64" stroke={C.ink} strokeWidth={1.4} opacity={0.5} />
      <rect x={16} y={60} width={72} height={9} rx={2} fill="#4b4b4b" {...LM} />
      <path d="M8 68 A22 22 0 0 1 52 68" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <path d="M8 68 A22 22 0 0 1 52 68" fill="none" stroke={color ?? C.green} strokeWidth={4.6} strokeLinecap="round" />
      <Wheel x={30} y={70} r={18} />
      <Wheel x={77} y={78} r={11} />
    </g>
  ),
  fuerwehrouto: ({ color }) => (
    <g>
      <Shadow y={88} rx={42} />
      <rect x={8} y={40} width={62} height={36} rx={4} fill={color ?? C.red} {...L} />
      <path d="M68 44 H82 Q90 44 92 56 V76 H68 Z" fill={color ?? C.red} {...L} />
      <path d="M72 48 H81 Q86 48 88 58 H72 Z" fill={C.sky} {...LM} />
      <rect x={14} y={48} width={14} height={16} rx={2} fill={C.white} opacity={0.4} {...LS} />
      <rect x={31} y={48} width={14} height={16} rx={2} fill={C.white} opacity={0.4} {...LS} />
      <circle cx={57} cy={56} r={8} fill={C.yellow} {...LM} />
      <circle cx={57} cy={56} r={3.5} fill={C.white} {...LS} />
      <rect x={9.5} y={68} width={59} height={3.5} fill={C.white} />
      <rect x={10} y={30} width={58} height={8} rx={2} fill={C.greyLight} {...L} />
      <path d="M18 30 V38 M26 30 V38 M34 30 V38 M42 30 V38 M50 30 V38 M58 30 V38 M20 38 V40 M60 38 V40" stroke={C.ink} strokeWidth={1.6} />
      <g className="illu-twinkle" style={origin(79, 40)}>
        <rect x={74} y={37} width={10} height={7} rx={3} fill={C.blue} {...LS} />
        <path d="M71 34 L68 31 M79 33 V29 M87 34 L90 31" stroke={C.blue} strokeWidth={2} strokeLinecap="round" />
      </g>
      <circle cx={89} cy={68} r={2.4} fill={C.yellow} {...LS} />
      <Wheel x={24} y={78} r={9} />
      <Wheel x={76} y={78} r={9} />
    </g>
  ),
  strass: () => (
    <Scene
      sky={C.sky}
      back={
        <>
          <Cloud x={70} y={24} s={0.8} />
          <Sun x={24} y={24} r={6} />
        </>
      }
      groundD={`M8 44 H92 ${FRAME_BOTTOM}`}
      front={
        <>
          <path d="M44 44 H56 L80 90 H20 Z" fill="#8a8f98" {...LM} />
          <path d="M49.6 48 H50.4 L50.8 54 H49.2 Z M49 60 H51 L51.6 68 H48.4 Z M48.2 74 H51.8 L52.6 86 H47.4 Z" fill={C.white} />
          <House x={24} y={58} s={0.8} />
          <Pine x={80} y={62} h={18} fill={C.green} />
          <path d="M88 86 V60" {...line(2.4)} />
          <path d="M88 60 Q88 56 84 56" fill="none" {...line(2.4)} />
          <circle cx={83} cy={58} r={2.6} fill={C.yellow} {...LS} />
        </>
      }
    />
  ),
  bruegg: () => (
    <Scene
      sky={C.sky}
      back={
        <>
          <Cloud x={28} y={22} s={0.8} />
          <Cloud x={76} y={18} s={0.6} />
        </>
      }
      ground={C.water}
      groundD={`M8 68 H92 ${FRAME_BOTTOM}`}
      front={
        <>
          <path d="M14 82 H26 M58 84 H72 M40 76 H48" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <path d="M8 34 H92" stroke={C.ink} strokeWidth={2.2} />
          <path d="M14 34 V42 M24 34 V42 M34 34 V42 M44 34 V42 M54 34 V42 M64 34 V42 M74 34 V42 M84 34 V42" stroke={C.ink} strokeWidth={2} />
          <path d="M8 42 H92 V76 H84 V72 A14 14 0 0 0 56 72 V76 H44 V72 A14 14 0 0 0 16 72 V76 H8 Z" fill={C.stone} {...L} />
          <path d="M8 49 H92" stroke={C.ink} strokeWidth={1.4} opacity={0.35} />
          <path d="M20 42 V49 M36 42 V49 M52 42 V49 M68 42 V49 M84 42 V49 M28 49 V56 M72 49 V56 M50 49 V58" stroke={C.ink} strokeWidth={1.2} opacity={0.3} />
        </>
      }
    />
  ),
  lade: () => (
    <g>
      <Shadow y={90} rx={42} />
      <rect x={12} y={24} width={76} height={64} fill={C.cream} {...L} />
      <rect x={28} y={10} width={44} height={13} rx={3} fill={C.navy} {...L} />
      <circle cx={50} cy={17} r={4.2} fill={C.red} {...LS} />
      <path d="M50 13 Q53 10 55 11" fill="none" stroke={C.leaf} strokeWidth={2} strokeLinecap="round" />
      <path d="M10 26 H90 L86 40 H14 Z" fill={C.white} />
      {[0, 2, 4, 6].map((i) => (
        <path key={i} d={`M${10 + 10 * i} 26 H${20 + 10 * i} L${14 + 9 * (i + 1)} 40 H${14 + 9 * i} Z`} fill={C.red} />
      ))}
      <path d="M10 26 H90 L86 40 H14 Z" fill="none" {...L} />
      <rect x={18} y={48} width={36} height={32} rx={2} fill={C.sky} {...L} />
      <path d="M18 64 H54" {...LM} />
      <rect x={22} y={53} width={5} height={11} rx={1.5} fill={C.green} {...LS} />
      <rect x={29} y={55} width={5} height={9} rx={1.5} fill={C.orange} {...LS} />
      <rect x={38} y={56} width={11} height={8} rx={2} fill={C.yellow} {...LS} />
      <circle cx={25} cy={75} r={3.6} fill={C.red} {...LS} />
      <circle cx={32} cy={75} r={3.6} fill={C.red} {...LS} />
      <circle cx={28.5} cy={70} r={3.6} fill={C.red} {...LS} />
      <ellipse cx={45} cy={75} rx={7} ry={4.5} fill={C.furLight} {...LS} />
      <rect x={60} y={48} width={22} height={40} rx={2} fill={C.brown} {...L} />
      <rect x={64} y={52} width={14} height={16} rx={2} fill={C.sky} {...LS} />
      <circle cx={78} cy={72} r={1.8} fill={C.yellow} {...LS} />
    </g>
  ),
  maerit: () => (
    <Stand stripe={C.green}>
      <circle cx={22} cy={61} r={5} fill={C.red} {...LM} />
      <circle cx={32} cy={61} r={5} fill={C.red} {...LM} />
      <circle cx={27} cy={53} r={5} fill={C.red} {...LM} />
      <path d="M40 66 L44 48 L48 66 Z M46 66 L51 46 L56 66 Z" fill={C.orange} {...LM} />
      <path d="M42 48 L44 44 L46 48 M49 46 L51 41 L53 46" fill="none" stroke={C.greenDark} strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={70} cy={59} rx={11} ry={8} fill={C.orange} {...LM} />
      <path d="M64 53 Q62 59 64 66 M76 53 Q78 59 76 66 M70 51 V67" fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.4} />
      <path d="M70 51 L71 46" {...line(2.4)} />
      <circle cx={84} cy={60} r={6} fill={C.leaf} {...LM} />
    </Stand>
  ),
  spiuplatz: () => (
    <g>
      <ellipse cx={50} cy={86} rx={44} ry={7} fill={C.leaf} {...LM} />
      <path d="M18 86 V36 M30 86 V36" stroke={C.ink} strokeWidth={5.4} strokeLinecap="round" />
      <path d="M18 86 V36 M30 86 V36" stroke={C.blue} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M18 48 H30 M18 60 H30 M18 72 H30" stroke={C.ink} strokeWidth={2} />
      <path d="M33 36 L39 36 Q46 70 62 80 L62 87 L55 87 Q40 72 33 42 Z" fill={C.red} {...L} />
      <rect x={14} y={32} width={24} height={6} rx={2} fill={C.yellow} {...L} />
      <path d="M64 86 L71 28 M92 86 L85 28 M68 28 H88" fill="none" {...line(3.2)} />
      <g className="illu-wag" style={origin(78, 28)}>
        <path d="M73 28 V64 M83 28 V64" stroke={C.ink} strokeWidth={1.6} />
        <rect x={70} y={63} width={16} height={4} rx={2} fill={C.orange} {...LM} />
      </g>
      <circle cx={46} cy={86} r={4} fill={C.yellow} {...LS} />
    </g>
  ),
  chindsgi: () => (
    <g>
      <ellipse cx={50} cy={88} rx={44} ry={5} fill={C.leaf} {...LM} />
      <rect x={10} y={44} width={50} height={44} fill="#fde3a7" {...L} />
      <path d="M6 46 L35 18 L64 46 Z" fill={C.red} {...L} />
      <circle cx={35} cy={35} r={5.5} fill={C.yellow} {...LM} />
      <rect x={15} y={52} width={14} height={13} rx={2} fill={C.sky} {...LM} />
      <path d="M22 52 V65 M15 58.5 H29" stroke={C.ink} strokeWidth={1.2} />
      <rect x={14} y={65} width={16} height={4} rx={1.5} fill={C.brown} {...LS} />
      <circle cx={18} cy={64} r={2} fill={C.rose} />
      <circle cx={26} cy={64} r={2} fill={C.yellow} />
      <path d="M38 88 V66 A7 7 0 0 1 52 66 V88 Z" fill={C.blue} {...L} />
      <circle cx={49} cy={76} r={1.4} fill={C.yellow} />
      <circle cx={44} cy={52} r={2.4} fill={C.green} />
      <circle cx={52} cy={50} r={2.4} fill={C.purple} />
      <circle cx={56} cy={56} r={2.4} fill={C.orange} />
      <path d="M70 88 V64 M77 88 V64" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M70 72 H77 M70 80 H77" stroke={C.ink} strokeWidth={1.6} />
      <path d="M77 62 H82 Q85 78 92 83 V88 H87 Q81 80 77 66 Z" fill={C.leaf} {...LM} />
      <rect x={67} y={60} width={16} height={4} rx={1.5} fill={C.yellow} {...LM} />
      <Sun x={82} y={22} r={6} />
    </g>
  ),
  schueu: () => (
    <g>
      <Shadow y={90} rx={44} />
      <rect x={10} y={40} width={80} height={48} fill={C.cream} {...L} />
      <path d="M6 42 L18 26 H82 L94 42 Z" fill="#c0533f" {...L} />
      <rect x={42} y={14} width={16} height={14} fill={C.cream} {...L} />
      <path d="M45 28 V21 A5 5 0 0 1 55 21 V28 Z" fill="#5a4636" />
      <g className="illu-wag" style={origin(50, 18)}>
        <path d="M46 26 Q46 19 50 19 Q54 19 54 26 Z" fill={C.yellow} {...LS} />
        <circle cx={50} cy={27} r={1.3} fill={C.yellow} {...LS} />
      </g>
      <path d="M39 15 L50 6 L61 15 Z" fill="#c0533f" {...L} />
      {[16, 29, 61, 74].flatMap((x) =>
        [46, 64].map((y) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={10} height={12} rx={1.5} fill={C.sky} {...LM} />
            <path d={`M${x + 5} ${y} V${y + 12} M${x} ${y + 6} H${x + 10}`} stroke={C.ink} strokeWidth={1} />
          </g>
        )),
      )}
      <path d="M42 88 V68 A8 8 0 0 1 58 68 V88 Z" fill={C.brown} {...L} />
      <circle cx={50} cy={52} r={4} fill={C.yellow} {...LM} />
      <rect x={38} y={86} width={24} height={3.5} rx={1} fill={C.stone} {...LS} />
    </g>
  ),
  haltesteu: () => (
    <g>
      <rect x={6} y={84} width={88} height={5} rx={2} fill={C.greyLight} {...LM} />
      <rect x={46} y={32} width={40} height={36} fill={C.sky} opacity={0.55} />
      <rect x={46} y={32} width={40} height={36} fill="none" {...LM} />
      <rect x={42} y={28} width={4} height={56} fill={C.grey} {...LM} />
      <rect x={86} y={28} width={4} height={56} fill={C.grey} {...LM} />
      <path d="M38 22 H94 L92 30 H40 Z" fill={C.blue} {...L} />
      <rect x={52} y={64} width={30} height={4} rx={2} fill={C.brown} {...LM} />
      <path d="M56 68 V76 M78 68 V76" stroke={C.ink} strokeWidth={2} />
      <rect x={20} y={32} width={4} height={52} fill={C.grey} {...LM} />
      <rect x={15} y={46} width={14} height={16} rx={1.5} fill={C.white} {...LM} />
      <path d="M18 50 H26 M18 54 H26 M18 58 H23" stroke={C.ink} strokeWidth={1} opacity={0.4} />
      <circle cx={22} cy={22} r={13} fill={C.yellow} {...L} />
      <rect x={14} y={15} width={16} height={11} rx={3} fill={C.green} {...LS} />
      <rect x={16.5} y={17} width={11} height={4} rx={1} fill={C.white} />
      <circle cx={18} cy={27} r={2} fill={C.ink} />
      <circle cx={26} cy={27} r={2} fill={C.ink} />
    </g>
  ),
  zytglogge: () => (
    <g>
      <Shadow y={90} rx={32} />
      <rect x={30} y={36} width={40} height={52} fill={C.sand} {...L} />
      <rect x={61} y={37.5} width={7.8} height={49} fill={C.ink} opacity={0.07} />
      <path d="M30 70 H70 M30 44 H40 M60 44 H70" stroke={C.ink} strokeWidth={1.2} opacity={0.25} />
      <path d="M40 88 V79 A10 10 0 0 1 60 79 V88 Z" fill="#5a4636" {...L} />
      <path d="M26 38 L50 12 L74 38 Z" fill="#b4532f" {...L} />
      <path d="M38 30 L50 17 M62 30 L50 17" stroke={C.ink} strokeWidth={1.2} opacity={0.3} />
      <path d="M50 12 V8" {...line(2)} />
      <circle cx={50} cy={7} r={2.2} fill={C.yellow} {...LS} />
      <rect x={26} y={36} width={48} height={4} rx={2} fill={C.brown} {...LM} />
      <circle cx={50} cy={57} r={13} fill={C.navy} {...L} />
      <circle cx={50} cy={57} r={10.5} fill="none" stroke={C.yellow} strokeWidth={1.4} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        return <circle key={i} cx={q(50 + 8.3 * Math.cos(a))} cy={q(57 + 8.3 * Math.sin(a))} r={0.9} fill={C.yellow} />
      })}
      <path d="M50 57 V49.5 M50 57 L55.5 60" stroke={C.yellow} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={50} cy={57} r={1.6} fill={C.yellow} />
      <rect x={45} y={27} width={10} height={8} rx={4} fill={C.cream} {...LS} />
      <circle cx={34} cy={78} r={1.8} fill={C.ink} opacity={0.2} />
      <circle cx={66} cy={80} r={1.4} fill={C.ink} opacity={0.2} />
    </g>
  ),
  billett: ({ color }) => (
    <g transform="rotate(-10 50 50)">
      <path d="M16 28 H58 A6 6 0 0 0 70 28 H84 Q88 28 88 32 V68 Q88 72 84 72 H70 A6 6 0 0 0 58 72 H16 Q12 72 12 68 V32 Q12 28 16 28 Z" fill={color ?? C.yellow} {...L} />
      <path d="M64 36 V64" stroke={C.ink} strokeWidth={1.6} strokeDasharray="2 3" opacity={0.5} />
      <rect x={20} y={36} width={28} height={15} rx={4} fill={C.red} {...LS} />
      <rect x={23} y={39} width={22} height={5} rx={1} fill={C.white} />
      <circle cx={27} cy={52} r={2} fill={C.ink} />
      <circle cx={41} cy={52} r={2} fill={C.ink} />
      <rect x={20} y={58} width={34} height={3} rx={1.5} fill={C.ink} opacity={0.3} />
      <rect x={20} y={63} width={22} height={3} rx={1.5} fill={C.ink} opacity={0.3} />
      <path d={starD(76, 50, 7)} fill={C.orange} {...LS} />
    </g>
  ),
}

/* ------------------------------------------------------------------ toys */

function BikeWheel({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g className="illu-spin" style={origin(x, y)}>
      <circle cx={x} cy={y} r={r} fill={C.white} fillOpacity={0.4} stroke={C.ink} strokeWidth={5} />
      <circle cx={x} cy={y} r={r - 2.5} fill="none" stroke={C.grey} strokeWidth={1.2} />
      <path d={`M${x - r + 3} ${y} H${x + r - 3} M${x} ${y - r + 3} V${y + r - 3} M${q(x - r * 0.6)} ${q(y - r * 0.6)} L${q(x + r * 0.6)} ${q(y + r * 0.6)} M${q(x + r * 0.6)} ${q(y - r * 0.6)} L${q(x - r * 0.6)} ${q(y + r * 0.6)}`} stroke={C.grey} strokeWidth={1.2} />
      <circle cx={x} cy={y} r={2.4} fill={C.ink} />
    </g>
  )
}

/** Thick coloured bar with an ink outline (bike frames, swing frames…). */
function Bar({ d, color, w = 3.6 }: { d: string; color: string; w?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={w + 2.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

const toys: IlluMap = {
  bau: ({ color }) => (
    <g>
      <Shadow y={90} rx={28} />
      <g className="illu-bob" style={origin(50, 54)}>
        <Ball x={50} y={54} r={33} color={color ?? C.red} />
      </g>
    </g>
  ),
  teddy: ({ color }) => <Teddy fur={color ?? C.fur} />,
  titti: ({ color }) => (
    <g>
      <Shadow y={90} rx={22} />
      <circle cx={31} cy={34} r={6} fill={C.yellow} {...LM} />
      <circle cx={69} cy={34} r={6} fill={C.yellow} {...LM} />
      <path d="M26 28 L31 31 L26 35 Z M74 28 L69 31 L74 35 Z" fill={C.red} {...LS} />
      <ellipse cx={31} cy={62} rx={4} ry={10} transform="rotate(30 31 62)" fill={SKIN} {...LM} />
      <ellipse cx={69} cy={62} rx={4} ry={10} transform="rotate(-30 69 62)" fill={SKIN} {...LM} />
      <rect x={41} y={72} width={6} height={14} fill={SKIN} {...LM} />
      <rect x={53} y={72} width={6} height={14} fill={SKIN} {...LM} />
      <ellipse cx={43} cy={87} rx={5} ry={3} fill={C.red} {...LM} />
      <ellipse cx={57} cy={87} rx={5} ry={3} fill={C.red} {...LM} />
      <path d="M40 46 H60 L72 76 Q50 82 28 76 Z" fill={color ?? C.rose} {...L} />
      <path d="M42 46 Q50 54 58 46 Z" fill={C.white} {...LS} />
      <g fill={C.white} opacity={0.8}>
        <circle cx={44} cy={62} r={1.8} />
        <circle cx={56} cy={66} r={1.8} />
        <circle cx={50} cy={72} r={1.8} />
        <circle cx={38} cy={72} r={1.8} />
        <circle cx={62} cy={74} r={1.8} />
      </g>
      <circle cx={50} cy={32} r={15} fill={SKIN} {...L} />
      <path d="M35 31 Q36 16 50 16 Q64 16 65 31 Q58 22 50 26 Q42 22 35 31 Z" fill={C.yellow} {...LM} />
      <Eyes x1={44.5} x2={55.5} y={34} r={2.4} />
      <Cheeks x1={40} x2={60} y={39} r={2.2} />
      <Smile x={50} y={40} w={5} />
    </g>
  ),
  outo: ({ color }) => (
    <g>
      <Shadow y={84} rx={40} />
      <path d="M10 66 Q10 54 20 52 L32 50 L40 36 Q42 32 48 32 H64 Q70 32 74 38 L80 50 L86 52 Q92 54 92 64 V70 Q92 74 88 74 H14 Q10 74 10 70 Z" fill={color ?? C.blue} {...L} />
      <path d="M44 37 H56 V50 H37 Z" fill={C.sky} {...LM} />
      <path d="M60 37 H66 Q69 37 71 41 L75 50 H60 Z" fill={C.sky} {...LM} />
      <path d="M58 53 V70" stroke={C.ink} strokeWidth={1.4} opacity={0.5} />
      <path d="M62 56 H66" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
      <path d="M16 56 Q24 53 30 53" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} fill="none" />
      <circle cx={88} cy={59} r={2.6} fill={C.yellow} {...LS} />
      <rect x={10.5} y={57} width={3} height={5} rx={1} fill={C.red} />
      <Wheel x={30} y={74} r={9} />
      <Wheel x={72} y={74} r={9} />
    </g>
  ),
  kloetzli: () => (
    <g>
      <Shadow y={86} rx={40} />
      <Block x={16} y={58} s={26} fill={C.red}>
        <circle cx={29} cy={71} r={6} fill={C.white} {...LS} />
      </Block>
      <Block x={48} y={58} s={26} fill={C.blue}>
        <path d="M61 64 L68 77 H54 Z" fill={C.white} {...LS} />
      </Block>
      <Block x={32} y={30} s={26} fill={C.yellow}>
        <path d={starD(45, 44, 8)} fill={C.white} {...LS} />
      </Block>
    </g>
  ),
  ballon: ({ color }) => (
    <g>
      <Balloon x={50} y={32} rx={20} color={color ?? C.red} />
      <Twinkle x={80} y={20} r={5} />
      <Twinkle x={20} y={50} r={4} />
    </g>
  ),
  buech: ({ color }) => (
    <g>
      <Shadow y={88} rx={40} />
      <path d="M8 30 Q30 24 50 32 Q70 24 92 30 V82 Q70 76 50 84 Q30 76 8 82 Z" fill={color ?? C.red} {...L} />
      <path d="M12 28 Q32 20 50 28 V78 Q32 70 12 76 Z" fill={C.white} {...L} />
      <path d="M88 28 Q68 20 50 28 V78 Q68 70 88 76 Z" fill={C.white} {...L} />
      <circle cx={28} cy={40} r={6} fill={C.yellow} {...LS} />
      <path d="M16 66 Q24 52 34 60 Q40 54 46 60 V70 Q32 66 16 70 Z" fill={C.leaf} {...LS} />
      <path d="M57 38 Q70 33 82 36 M57 46 Q70 41 82 44 M57 54 Q70 49 82 52 M57 62 Q66 58 74 59" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
    </g>
  ),
  puzzle: () => (
    <g>
      <Shadow y={84} rx={40} />
      <path d={pieceD(38, 18, 28, 0, 0)} fill={C.blue} {...L} />
      <path d={pieceD(10, 46, 28, 0, 0)} fill={C.yellow} {...L} />
      <path d={pieceD(10, 18, 28, 1, 1)} fill={C.red} {...L} />
      <rect x={38} y={46} width={28} height={28} fill={C.cream} stroke={C.ink} strokeWidth={1.6} strokeDasharray="3 3" />
      <circle cx={22} cy={30} r={4} fill={C.white} opacity={0.5} />
      <g className="illu-bob" style={origin(72, 72)}>
        <g transform="translate(72 70) rotate(16)">
          <path d={pieceD(-14, -14, 28, 1, 1)} fill={C.green} {...L} />
          <circle cx={-6} cy={-6} r={3.5} fill={C.white} opacity={0.5} />
        </g>
      </g>
    </g>
  ),
  trummle: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <Drum x={50} y={46} w={30} color={color ?? C.red} />
      <g className="illu-bob" style={origin(50, 30)}>
        <Bar d="M22 12 L44 36" color={C.furLight} w={3} />
        <Bar d="M78 12 L56 36" color={C.furLight} w={3} />
        <circle cx={45} cy={37} r={4} fill={C.cream} {...LM} />
        <circle cx={55} cy={37} r={4} fill={C.cream} {...LM} />
      </g>
    </g>
  ),
  rytti: ({ color }) => (
    <g>
      <ellipse cx={50} cy={88} rx={42} ry={4} fill={C.leaf} {...LM} />
      <Bar d="M14 88 L22 12 H78 L86 88" color={C.brown} />
      <g className="illu-wag" style={origin(50, 12)}>
        <path d="M38 12 V66 M62 12 V66" stroke={C.ink} strokeWidth={1.8} />
        <rect x={32} y={64} width={36} height={7} rx={3} fill={color ?? C.red} {...L} />
      </g>
    </g>
  ),
  rutschbahn: ({ color }) => (
    <g>
      <Shadow y={89} rx={42} />
      <Bar d="M16 88 V30 M32 88 V30" color={C.blue} w={3} />
      <path d="M16 42 H32 M16 54 H32 M16 66 H32 M16 78 H32" stroke={C.ink} strokeWidth={2.2} />
      <path d="M36 28 H44 Q54 72 84 80 H90 V88 H80 Q46 80 36 36 Z" fill={color ?? C.red} {...L} />
      <path d="M42 34 Q52 70 78 80" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} />
      <rect x={12} y={24} width={34} height={7} rx={2} fill={C.yellow} {...L} />
    </g>
  ),
  sandchaschte: ({ color }) => (
    <g>
      <path d="M14 56 H86 L94 84 H6 Z" fill={C.sand} />
      <path d="M14 56 H86 L94 84 H6 Z" fill="none" stroke={C.ink} strokeWidth={7.6} strokeLinejoin="round" />
      <path d="M14 56 H86 L94 84 H6 Z" fill="none" stroke={C.fur} strokeWidth={4} strokeLinejoin="round" />
      <path d="M22 76 Q34 58 48 76 Z" fill="#e8c886" {...LM} />
      <Bar d="M28 42 L35 64" color={C.brown} w={2.4} />
      <path d="M31 62 L39 59 L42 69 Q39 74 35 71 Z" fill={C.red} {...LM} />
      <path d="M58 50 Q68 36 78 50" fill="none" {...LM} />
      <path d="M58 50 H78 L75 72 H61 Z" fill={color ?? C.blue} {...L} />
      <rect x={56} y={48} width={24} height={5} rx={2} fill={color ?? C.blue} {...LM} />
      <path d="M62 56 V68" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      <path d={starD(84, 70, 4)} fill={C.yellow} {...LS} />
    </g>
  ),
  gygampfi: ({ color }) => (
    <g>
      <Shadow y={88} rx={40} />
      <path d="M38 87 L50 60 L62 87 Z" fill={C.red} {...L} />
      <g className="illu-wag" style={origin(50, 60)}>
        <g transform="rotate(-14 50 60)">
          <Bar d="M18 56 V46 H25 M82 56 V46 H75" color={C.grey} w={2.4} />
          <rect x={8} y={56} width={84} height={7} rx={3} fill={color ?? C.yellow} {...L} />
        </g>
      </g>
      <circle cx={50} cy={64} r={2.4} fill={C.ink} />
    </g>
  ),
  velo: ({ color }) => (
    <g>
      <Shadow y={84} rx={42} />
      <BikeWheel x={24} y={66} r={16} />
      <BikeWheel x={76} y={66} r={16} />
      <Bar d="M24 66 L46 66 L40 40 Z M40 40 H68 L46 66 M68 40 L76 66" color={color ?? C.red} w={3.4} />
      <Bar d="M68 40 L65 29 H74" color={C.grey} w={2.4} />
      <Bar d="M40 40 L39 35" color={C.grey} w={2.4} />
      <path d="M30 35 Q38 30 47 34 Q40 38 30 35 Z" fill={C.ink} {...LS} />
      <circle cx={46} cy={66} r={4} fill={C.grey} {...LM} />
      <path d="M46 66 L50 73" {...line(2.4)} />
    </g>
  ),
  trottinett: ({ color }) => (
    <g>
      <Shadow y={90} rx={38} />
      <Bar d="M76 82 L70 74 L63 22" color={color ?? C.blue} w={3.6} />
      <Bar d="M54 22 H72" color={C.grey} w={3} />
      <rect x={51} y={19} width={7} height={6} rx={2.5} fill={C.ink} />
      <rect x={68} y={19} width={7} height={6} rx={2.5} fill={C.ink} />
      <path d="M14 80 Q16 72 26 72" fill="none" {...line(2.6)} />
      <rect x={20} y={72} width={52} height={7} rx={3.5} fill={color ?? C.blue} {...L} />
      <Wheel x={24} y={82} r={7} />
      <Wheel x={76} y={82} r={7} />
    </g>
  ),
  farbstift: ({ color }) => (
    <g>
      <path d="M46 84 Q54 72 62 82 T78 78 T90 70" fill="none" stroke={color ?? C.blue} strokeWidth={4.4} strokeLinecap="round" opacity={0.8} />
      <g transform="rotate(-35 50 46)">
        <path d="M74 38 L89 44 Q91 46 89 48 L74 54 Z" fill={color ?? C.blue} {...L} />
        <rect x={12} y={38} width={62} height={16} rx={3} fill={color ?? C.blue} {...L} />
        <rect x={24} y={39.2} width={40} height={13.6} fill={C.white} opacity={0.45} />
        <path d="M24 38 V54 M64 38 V54" stroke={C.ink} strokeWidth={1.4} />
        <path d="M30 43 Q36 46 42 43 T54 43 M30 49 Q36 52 42 49 T54 49" fill="none" stroke={color ?? C.blue} strokeWidth={1.6} />
      </g>
    </g>
  ),
}

/* ------------------------------------------------------------------ holidays */

function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="illu-twinkle" style={origin(x, y)}>
      <path d={`M${x} ${q(y - 12 * s)} Q${q(x + 6 * s)} ${q(y - 4 * s)} ${q(x + 3.5 * s)} ${y} Q${x} ${q(y + 2 * s)} ${q(x - 3.5 * s)} ${y} Q${q(x - 6 * s)} ${q(y - 4 * s)} ${x} ${q(y - 12 * s)} Z`} fill={C.yellow} {...LS} />
      <path d={`M${x} ${q(y - 6 * s)} Q${q(x + 2.5 * s)} ${q(y - 2 * s)} ${x} ${q(y - 0.5 * s)} Q${q(x - 2.5 * s)} ${q(y - 2 * s)} ${x} ${q(y - 6 * s)} Z`} fill={C.orange} />
    </g>
  )
}

function Candle({ x, base, h, color = C.red, lit = true }: { x: number; base: number; h: number; color?: string; lit?: boolean }) {
  return (
    <g>
      <rect x={x - 4} y={base - h} width={8} height={h} rx={1.5} fill={color} {...LM} />
      <path d={`M${x - 1.5} ${base - h + 3} V${base - 3}`} stroke={C.white} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
      <path d={`M${x} ${base - h} V${base - h - 3}`} stroke={C.ink} strokeWidth={1.4} />
      {lit && <Flame x={x} y={base - h - 3} s={0.8} />}
    </g>
  )
}

const onionD = (x: number, y: number, s = 1): string =>
  `M${x} ${q(y - 6 * s)} Q${q(x + 6 * s)} ${q(y - s)} ${q(x + 5 * s)} ${q(y + 3 * s)} Q${x} ${q(y + 8 * s)} ${q(x - 5 * s)} ${q(y + 3 * s)} Q${q(x - 6 * s)} ${q(y - s)} ${x} ${q(y - 6 * s)}Z`

function Burst({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g className="illu-twinkle" style={origin(x, y)}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        const c = Math.cos(a)
        const s = Math.sin(a)
        return (
          <g key={i}>
            <line x1={q(x + r * 0.35 * c)} y1={q(y + r * 0.35 * s)} x2={q(x + r * 0.8 * c)} y2={q(y + r * 0.8 * s)} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
            <circle cx={q(x + r * c)} cy={q(y + r * s)} r={1.6} fill={color} />
          </g>
        )
      })}
      <circle cx={x} cy={y} r={2.4} fill={C.white} />
    </g>
  )
}

const holidays: IlluMap = {
  samichlous: ({ color }) => {
    const robe = color ?? C.red
    return (
      <g>
        <Shadow y={90} rx={30} />
        <Bar d="M80 90 V26" color={C.yellow} w={3} />
        <Bar d="M80 26 Q80 12 71 13 Q63 15 66 22 Q69 26 73 22" color={C.yellow} w={3} />
        <path d="M32 44 Q50 38 68 44 L78 86 Q50 92 22 86 Z" fill={robe} {...L} />
        <path d="M47 46 H53 L55 89 H45 Z" fill={C.white} {...LS} />
        <path d="M23 82 Q50 88 77 82 L78 86 Q50 92 22 86 Z" fill={C.white} {...LS} />
        <path d="M35 46 L24 62 L32 67 L41 55 Z" fill={robe} {...L} />
        <path d="M65 46 L78 54 L74 62 L61 55 Z" fill={robe} {...L} />
        <circle cx={27} cy={66} r={5} fill={C.white} {...LM} />
        <circle cx={79} cy={57} r={5} fill={C.white} {...LM} />
        <circle cx={50} cy={32} r={11} fill={SKIN} {...L} />
        <path d="M38 32 Q36 50 44 58 Q50 64 56 58 Q64 50 62 32 Q58 41 50 41 Q42 41 38 32 Z" fill={C.white} {...L} />
        <path d="M43 38 Q47 35 50 38 Q53 35 57 38 Q53 41 50 39 Q47 41 43 38 Z" fill={C.white} {...LS} />
        <path d="M38 24 L39 14 Q44 10 50 6 Q56 10 61 14 L62 24 Z" fill={robe} {...L} />
        <path d="M50 7 V21" stroke={C.yellow} strokeWidth={3} />
        <rect x={38} y={20} width={24} height={5} rx={1.5} fill={C.yellow} {...LS} />
        <Eyes x1={45.5} x2={54.5} y={30} r={1.9} />
        <circle cx={50} cy={34.5} r={2} fill="#eeae8a" />
        <Cheeks x1={42} x2={58} y={35} r={2} />
      </g>
    )
  },
  grittibaenz: ({ color }) => {
    const dough = color ?? '#d99a52'
    const raisin = '#4a2a1a'
    return (
      <g>
        <Shadow y={91} rx={28} />
        <ellipse cx={28} cy={52} rx={7} ry={14} transform="rotate(50 28 52)" fill={dough} {...L} />
        <ellipse cx={72} cy={52} rx={7} ry={14} transform="rotate(-50 72 52)" fill={dough} {...L} />
        <ellipse cx={40} cy={80} rx={8} ry={11} transform="rotate(15 40 80)" fill={dough} {...L} />
        <ellipse cx={60} cy={80} rx={8} ry={11} transform="rotate(-15 60 80)" fill={dough} {...L} />
        <ellipse cx={50} cy={58} rx={18} ry={22} fill={dough} {...L} />
        <circle cx={50} cy={26} r={15} fill={dough} {...L} />
        <ellipse cx={43} cy={18} rx={5} ry={3} fill="#efc07f" opacity={0.8} />
        <ellipse cx={43} cy={48} rx={4} ry={7} fill="#efc07f" opacity={0.6} />
        <ellipse cx={44.5} cy={24} rx={2.2} ry={3} fill={raisin} />
        <ellipse cx={55.5} cy={24} rx={2.2} ry={3} fill={raisin} />
        <path d="M44 31 Q50 36 56 31" fill="none" stroke={raisin} strokeWidth={2} strokeLinecap="round" />
        <circle cx={50} cy={50} r={2.4} fill={raisin} />
        <circle cx={50} cy={60} r={2.4} fill={raisin} />
        <circle cx={50} cy={70} r={2.4} fill={raisin} />
        <g fill={C.white}>
          <circle cx={56} cy={16} r={1} />
          <circle cx={60} cy={22} r={1} />
          <circle cx={58} cy={44} r={1} />
          <circle cx={60} cy={54} r={1} />
          <circle cx={40} cy={64} r={1} />
        </g>
      </g>
    )
  },
  advaentschranz: ({ color }) => (
    <g>
      <Shadow y={86} rx={42} />
      <Candle x={38} base={61} h={20} color={color ?? C.red} />
      <Candle x={62} base={61} h={20} color={color ?? C.red} lit={false} />
      <ellipse cx={50} cy={70} rx={36} ry={12} fill="none" stroke={C.ink} strokeWidth={15} />
      <ellipse cx={50} cy={70} rx={36} ry={12} fill="none" stroke={C.green} strokeWidth={10.6} />
      <ellipse cx={50} cy={70} rx={36} ry={12} fill="none" stroke={C.greenDark} strokeWidth={4} strokeDasharray="3 5" opacity={0.7} />
      <g fill={C.red} {...LS}>
        <circle cx={16} cy={66} r={2.4} />
        <circle cx={84} cy={74} r={2.4} />
        <circle cx={40} cy={82} r={2.4} />
        <circle cx={66} cy={81} r={2.4} />
      </g>
      <Candle x={28} base={80} h={20} color={color ?? C.red} />
      <Candle x={72} base={80} h={20} color={color ?? C.red} lit={false} />
    </g>
  ),
  wiehnachtsboum: () => (
    <g>
      <Shadow y={90} rx={36} />
      <Pine x={46} y={90} h={76} fill={C.green} />
      <path d="M36 44 Q46 48 56 42 M30 62 Q46 68 62 60 M24 78 Q46 84 68 76" fill="none" stroke={C.yellow} strokeWidth={2} strokeDasharray="1 3.4" strokeLinecap="round" />
      {(
        [
          [40, 54, C.red],
          [54, 52, C.blue],
          [46, 36, C.yellow],
          [32, 72, C.purple],
          [52, 72, C.red],
          [62, 70, C.yellow],
        ] as const
      ).map(([x, y, col], i) => (
        <circle key={i} cx={x} cy={y} r={3.6} fill={col} {...LS} />
      ))}
      <Star x={46} y={15} r={8} />
      <rect x={70} y={74} width={18} height={14} rx={2} fill={C.red} {...LM} />
      <path d="M79 74 V88 M70 80 H88" stroke={C.yellow} strokeWidth={2.4} />
      <path d="M79 74 Q73 67 72 72 Q74 75 79 74 Q85 67 86 72 Q84 75 79 74 Z" fill={C.yellow} {...LS} />
    </g>
  ),
  gschaenk: ({ color }) => (
    <g>
      <Shadow y={88} rx={36} />
      <rect x={20} y={46} width={60} height={40} rx={3} fill={color ?? C.red} {...L} />
      <rect x={45} y={47} width={10} height={38} fill={C.yellow} {...LS} />
      <rect x={16} y={36} width={68} height={12} rx={3} fill={color ?? C.red} {...L} />
      <rect x={45} y={37} width={10} height={10} fill={C.yellow} {...LS} />
      <path d="M50 36 Q34 18 28 28 Q28 38 50 36 Z" fill={C.yellow} {...L} />
      <path d="M50 36 Q66 18 72 28 Q72 38 50 36 Z" fill={C.yellow} {...L} />
      <circle cx={50} cy={35} r={4.5} fill={C.yellow} {...L} />
      <g fill={C.white} opacity={0.5}>
        <circle cx={30} cy={58} r={2.4} />
        <circle cx={70} cy={66} r={2.4} />
        <circle cx={32} cy={76} r={2.4} />
        <circle cx={66} cy={54} r={2.4} />
      </g>
      <Twinkle x={14} y={22} r={5} />
      <Twinkle x={86} y={18} r={4} />
    </g>
  ),
  cherze: ({ color }) => (
    <g>
      <circle cx={50} cy={28} r={18} fill={C.yellow} opacity={0.25} />
      <ellipse cx={50} cy={86} rx={24} ry={6} fill="#e3b448" {...L} />
      <rect x={38} y={40} width={24} height={46} rx={3} fill={color ?? C.red} {...L} />
      <path d="M38.5 41 H61.5 V47 Q59 52 57 47 V45 Q54 54 50 46 Q47 51 44 47 Q42 52 38.5 48 Z" fill={C.white} opacity={0.45} />
      <path d="M44 52 V80" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <path d="M50 40 V35" stroke={C.ink} strokeWidth={1.8} />
      <Flame x={50} y={35} s={1.6} />
    </g>
  ),
  oschterhaas: ({ color }) => {
    const fur = color ?? '#e9d6bd'
    return (
      <g>
        <Shadow y={91} rx={28} />
        <ellipse cx={40} cy={24} rx={7} ry={16} transform="rotate(-10 40 24)" fill={fur} {...L} />
        <ellipse cx={60} cy={24} rx={7} ry={16} transform="rotate(10 60 24)" fill={fur} {...L} />
        <ellipse cx={40} cy={26} rx={3.2} ry={11} transform="rotate(-10 40 26)" fill={C.pink} />
        <ellipse cx={60} cy={26} rx={3.2} ry={11} transform="rotate(10 60 26)" fill={C.pink} />
        <ellipse cx={36} cy={86} rx={9} ry={5} fill={fur} {...L} />
        <ellipse cx={64} cy={86} rx={9} ry={5} fill={fur} {...L} />
        <ellipse cx={50} cy={68} rx={22} ry={20} fill={fur} {...L} />
        <ellipse cx={50} cy={72} rx={13} ry={13} fill={C.white} opacity={0.8} />
        <ellipse cx={50} cy={72} rx={9} ry={11} fill={C.blue} {...LM} />
        <path d="M41.5 70 L45 66 L48.5 70 L52 66 L55.5 70 L58.5 66.5" fill="none" stroke={C.yellow} strokeWidth={2} strokeLinejoin="round" />
        <circle cx={50} cy={77} r={1.6} fill={C.white} />
        <circle cx={41} cy={72} r={4.5} fill={fur} {...LM} />
        <circle cx={59} cy={72} r={4.5} fill={fur} {...LM} />
        <circle cx={50} cy={44} r={16} fill={fur} {...L} />
        <Eyes x1={44} x2={56} y={42} r={2.6} />
        <ellipse cx={50} cy={48} rx={2.4} ry={1.8} fill={C.pink} {...line(1)} />
        <path d="M47 51 Q50 54 50 50 Q50 54 53 51" fill="none" {...line(1.4)} />
        <Cheeks x1={41} x2={59} y={49} r={2.6} />
        <path d="M36 47 H28 M36 50 L29 52 M64 47 H72 M64 50 L71 52" stroke={C.ink} strokeWidth={1} opacity={0.5} />
      </g>
    )
  },
  oschterei: ({ color }) => {
    const zz = Array.from({ length: 9 }, (_, i) => `${22 + i * 7} ${i % 2 ? 44 : 50}`)
    const zz2 = Array.from({ length: 9 }, (_, i) => `${78 - i * 7} ${(8 - i) % 2 ? 54 : 60}`)
    return (
      <g>
        <Shadow y={91} rx={24} />
        <path d="M50 10 C72 10 82 46 80 62 C78 82 64 90 50 90 C36 90 22 82 20 62 C18 46 28 10 50 10 Z" fill={color ?? C.yellow} />
        <path d={`M${zz.join(' L')} L${zz2.join(' L')} Z`} fill={C.red} />
        <path d="M22 68 Q36 62 50 68 T78 68" fill="none" stroke={C.green} strokeWidth={3.4} />
        <g fill={C.blue}>
          <circle cx={40} cy={32} r={3} />
          <circle cx={50} cy={26} r={3} />
          <circle cx={60} cy={32} r={3} />
          <circle cx={36} cy={80} r={2.4} />
          <circle cx={50} cy={82} r={2.4} />
          <circle cx={64} cy={80} r={2.4} />
        </g>
        <ellipse cx={36} cy={28} rx={3} ry={6} transform="rotate(20 36 28)" fill={C.white} opacity={0.6} />
        <path d="M50 10 C72 10 82 46 80 62 C78 82 64 90 50 90 C36 90 22 82 20 62 C18 46 28 10 50 10 Z" fill="none" {...L} />
      </g>
    )
  },
  fasnacht: () => (
    <g>
      {(
        [
          [16, 40, C.red, 0],
          [30, 26, C.yellow, 1],
          [44, 14, C.blue, 0],
          [58, 30, C.green, 1],
          [72, 40, C.rose, 0],
          [86, 30, C.orange, 1],
          [16, 64, C.purple, 1],
          [86, 58, C.yellow, 0],
          [10, 82, C.green, 0],
          [90, 80, C.red, 1],
          [38, 40, C.orange, 0],
          [66, 14, C.purple, 0],
        ] as const
      ).map(([x, y, col, sq], i) =>
        sq ? (
          <rect key={i} x={x - 3} y={y - 2} width={6} height={4} rx={1} fill={col} transform={`rotate(${i * 37} ${x} ${y})`} {...line(1)} />
        ) : (
          <circle key={i} cx={x} cy={y} r={2.8} fill={col} {...line(1)} />
        ),
      )}
      <g className="illu-wag" style={origin(50, 24)}>
        <path d="M10 22 Q18 12 24 22 T36 22" fill="none" stroke={C.purple} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M62 22 Q70 30 76 20 T90 18" fill="none" stroke={C.green} strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <Shadow y={90} rx={28} />
      <Drum x={50} y={54} w={24} color={C.blue} />
      <Bar d="M60 40 L82 52" color={C.furLight} w={2.6} />
      <circle cx={59} cy={40} r={3.4} fill={C.cream} {...LM} />
    </g>
  ),
  maske: ({ color }) => (
    <g>
      <Bar d="M76 62 L88 90" color={C.brown} w={3} />
      <ellipse cx={36} cy={30} rx={5} ry={14} transform="rotate(-25 36 30)" fill={C.green} {...LM} />
      <ellipse cx={47} cy={24} rx={5} ry={15} transform="rotate(-5 47 24)" fill={C.yellow} {...LM} />
      <ellipse cx={58} cy={26} rx={5} ry={14} transform="rotate(18 58 26)" fill={C.rose} {...LM} />
      <path d="M10 48 Q12 34 30 34 Q44 34 50 42 Q56 34 70 34 Q88 34 90 48 Q90 64 72 66 Q58 66 50 56 Q42 66 28 66 Q10 64 10 48 Z" fill={color ?? C.purple} {...L} />
      <ellipse cx={30} cy={50} rx={9} ry={6} fill={C.white} {...L} />
      <ellipse cx={70} cy={50} rx={9} ry={6} fill={C.white} {...L} />
      <g fill={C.yellow} {...line(1)}>
        <circle cx={16} cy={46} r={2} />
        <circle cx={84} cy={46} r={2} />
        <circle cx={50} cy={48} r={2.4} />
        <circle cx={22} cy={60} r={1.6} />
        <circle cx={78} cy={60} r={1.6} />
      </g>
      <Twinkle x={84} y={22} r={5} />
    </g>
  ),
  lampion: ({ color }) => (
    <g>
      <Bar d="M10 14 L70 22" color={C.brown} w={2.4} />
      <g className="illu-wag" style={origin(50, 20)}>
        <circle cx={50} cy={58} r={34} fill={C.yellow} opacity={0.2} />
        <path d="M50 20 V32" stroke={C.ink} strokeWidth={1.6} />
        <ellipse cx={50} cy={58} rx={28} ry={24} fill={color ?? C.orange} {...L} />
        <path d="M50 34 V82 M38 35 Q28 58 38 81 M62 35 Q72 58 62 81 M30 39 Q16 58 30 77 M70 39 Q84 58 70 77" fill="none" stroke={C.ink} strokeWidth={1.3} opacity={0.3} />
        <ellipse cx={50} cy={60} rx={10} ry={13} fill={C.yellow} opacity={0.75} />
        <rect x={40} y={30} width={20} height={6} rx={2} fill="#5a4636" {...LM} />
        <rect x={42} y={80} width={16} height={5} rx={2} fill="#5a4636" {...LM} />
      </g>
    </g>
  ),
  fahne: () => (
    <g>
      <Shadow y={90} rx={16} x={22} />
      <Bar d="M22 90 V12" color={C.grey} w={3} />
      <circle cx={22} cy={10} r={3.5} fill={C.yellow} {...LM} />
      <g className="illu-wag" style={origin(24, 16)}>
        <path d="M24 16 Q38 10 52 16 T80 16 V70 Q66 64 52 70 T24 70 Z" fill={C.red} {...L} />
        <path d="M46.5 26 H57.5 V37.5 H69 V48.5 H57.5 V60 H46.5 V48.5 H35 V37.5 H46.5 Z" fill={C.white} />
      </g>
    </g>
  ),
  fuerwaerch: () => (
    <Scene
      sky={NIGHT}
      back={
        <>
          <Burst x={34} y={32} r={16} color={C.rose} />
          <Burst x={68} y={26} r={13} color={C.yellow} />
          <Burst x={64} y={54} r={10} color={C.leaf} />
          <Twinkle x={20} y={56} r={3} fill={C.sky} />
          <Twinkle x={84} y={44} r={3} fill={C.sky} />
        </>
      }
      ground="#25304f"
      groundD={`M8 74 H14 V66 L20 60 L26 66 V74 H34 V62 H44 V74 H52 V68 L58 62 L64 68 V74 H72 V64 H80 V74 H92 ${FRAME_BOTTOM}`}
      front={
        <g fill={C.yellow}>
          <rect x={18} y={68} width={3} height={3} />
          <rect x={37} y={66} width={3} height={3} />
          <rect x={56} y={70} width={3} height={3} />
          <rect x={74} y={68} width={3} height={3} />
        </g>
      }
    />
  ),
  geburtstag: ({ color }) => (
    <g>
      <ellipse cx={50} cy={84} rx={40} ry={6} fill={C.white} {...L} />
      <rect x={20} y={52} width={60} height={32} rx={4} fill={color ?? C.rose} {...L} />
      <rect x={21.2} y={72} width={57.6} height={3} fill={C.cream} />
      <path d="M20 58 Q20 52 26 52 H74 Q80 52 80 58 V62 Q76 68 72 62 Q68 70 63 62 Q58 68 54 62 Q50 70 45 62 Q40 68 36 62 Q32 70 27 62 Q23 66 20 62 Z" fill={C.white} {...LM} />
      {(
        [
          [28, 56, C.blue],
          [40, 57, C.yellow],
          [58, 55, C.green],
          [70, 57, C.red],
        ] as const
      ).map(([x, y, col], i) => (
        <rect key={i} x={x} y={y} width={4} height={1.8} rx={0.9} fill={col} transform={`rotate(${i * 50 - 40} ${x + 2} ${y + 1})`} />
      ))}
      <Candle x={36} base={53} h={16} color={C.blue} />
      <Candle x={50} base={53} h={18} color={C.yellow} />
      <Candle x={64} base={53} h={16} color={C.green} />
    </g>
  ),
  zibelemaerit: () => (
    <Stand stripe={C.red}>
      {[30, 50, 70].map((x) => (
        <g key={x} className="illu-wag" style={origin(x, 34)}>
          <path d={`M${x} 34 V62`} stroke={C.ink} strokeWidth={4.6} strokeLinecap="round" />
          <path d={`M${x} 34 V62`} stroke={C.sand} strokeWidth={2.4} strokeLinecap="round" />
          {[40, 47, 54, 61].map((y, i) => (
            <path key={y} d={onionD(x + (i % 2 ? 4 : -4), y, 0.9)} fill={i % 2 ? '#d99a3e' : '#c97a3a'} {...LS} />
          ))}
          <path d={`M${x - 3} 64 L${x} 60 L${x + 3} 64 Z`} fill={C.red} {...line(1)} />
        </g>
      ))}
    </Stand>
  ),
  oblate: () => (
    <g>
      <Shadow y={90} rx={34} />
      <rect x={30} y={22} width={52} height={66} rx={3} transform="rotate(8 56 54)" fill="#f3ecdc" {...L} />
      <g transform="rotate(-6 46 50)">
        <rect x={18} y={14} width={56} height={72} rx={3} fill={C.white} {...L} />
        <rect x={24} y={20} width={44} height={60} rx={2} fill="none" stroke="#d8ccb2" strokeWidth={1.6} />
        <rect x={27} y={23} width={38} height={54} rx={2} fill="none" stroke="#d8ccb2" strokeWidth={1.2} strokeDasharray="1.5 2.5" />
        <path d={starD(46, 36, 8)} fill="none" stroke="#cdbd98" strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M32 72 V60 L46 50 L60 60 V72" fill="none" stroke="#cdbd98" strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M41 72 V64 Q46 59 51 64 V72" fill="none" stroke="#cdbd98" strokeWidth={1.6} />
        <path d="M33 73 V61 L47 51 L61 61 V73" fill="none" stroke={C.white} strokeWidth={1} opacity={0.9} />
      </g>
    </g>
  ),
}

/* ------------------------------------------------------------------ time */

const time: IlluMap = {
  morge: () => (
    <Scene
      sky="#fde2c4"
      back={
        <>
          <Sun x={28} y={60} r={12} />
          <Cloud x={70} y={30} s={0.8} fill="#fff1f1" />
          <path d="M56 46 Q59 43 62 46 Q65 43 68 46" fill="none" {...LM} />
        </>
      }
      front={
        <>
          <House x={70} y={72} s={1.1} />
          <circle cx={30} cy={80} r={2.4} fill={C.white} {...LS} />
          <circle cx={30} cy={80} r={1} fill={C.yellow} />
        </>
      }
    />
  ),
  mittag: () => (
    <Scene
      sky={C.sky}
      back={<Sun x={50} y={30} r={11} face />}
      front={
        <>
          <House x={28} y={72} s={1.1} />
          <Pine x={76} y={76} h={20} fill={C.green} />
        </>
      }
    />
  ),
  abe: () => (
    <Scene
      sky="#f29a7e"
      ground="#5f9e58"
      back={
        <>
          <rect x={9} y={11} width={82} height={16} rx={10} fill="#b77fb0" opacity={0.6} />
          <Sun x={72} y={62} r={12} fill={C.orange} />
          <Star x={24} y={24} r={4} />
          <Star x={42} y={18} r={2.6} />
        </>
      }
      front={<House x={32} y={74} s={1.1} lit />}
    />
  ),
  huet: () => <Calendar dir={0} />,
  morn: () => <Calendar dir={1} />,
  geschter: () => <Calendar dir={-1} />,
}

/* ------------------------------------------------------------------ opposites */

const faded = 0.32

const opposites: IlluMap = {
  gross: ({ color }) => (
    <g>
      <Shadow x={44} y={89} rx={28} />
      <Ball x={44} y={54} r={32} color={color ?? C.red} />
      <g opacity={faded}>
        <Ball x={84} y={80} r={8} color={color ?? C.red} />
      </g>
    </g>
  ),
  chly: ({ color }) => (
    <g>
      <g opacity={faded}>
        <Ball x={36} y={54} r={28} color={color ?? C.red} />
      </g>
      <Shadow x={72} y={89} rx={12} ry={2.5} />
      <Ball x={72} y={76} r={11} color={color ?? C.red} />
    </g>
  ),
  heiss: ({ color }) => (
    <g>
      <Sun x={80} y={20} r={8} />
      <g className="illu-bob" style={origin(46, 30)}>
        <path d="M34 44 Q28 36 34 28 T34 14 M46 44 Q40 36 46 28 T46 12 M58 44 Q52 36 58 28 T58 14" fill="none" stroke={C.grey} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      </g>
      <ellipse cx={46} cy={84} rx={32} ry={6} fill={C.white} {...L} />
      <Bar d="M66 56 Q80 54 78 66 Q76 74 64 72" color={color ?? C.red} w={3.4} />
      <path d="M24 50 H68 L64 76 Q62 84 54 84 H38 Q30 84 28 76 Z" fill={color ?? C.red} {...L} />
      <ellipse cx={46} cy={50} rx={22} ry={4} fill={C.brown} {...LM} />
      <path d="M32 58 L34 74" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  chaut: ({ color }) => (
    <g>
      <Shadow y={88} rx={32} />
      <Block x={22} y={40} s={44} fill={color ?? '#bfe7f7'}>
        <path d="M28 48 L34 44" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        <Eyes x1={37} x2={51} y={58} r={2.8} />
        <path d="M36 70 Q39 67 42 70 T48 70 T54 70" fill="none" {...LM} />
      </Block>
      <Flake x={82} y={20} r={9} />
      <Flake x={14} y={28} r={6} />
      <path d="M8 56 L14 58 M8 66 L14 66 M80 60 L86 58 M80 70 L86 70" stroke={C.blue} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  ),
  schnaeu: ({ color }) => {
    const fur = color ?? '#d9b38c'
    return (
      <g>
        <path d="M6 44 H24 M10 56 H28 M6 68 H22" stroke={C.blue} strokeWidth={3} strokeLinecap="round" />
        <circle cx={26} cy={82} r={5} fill={C.greyLight} {...LS} />
        <circle cx={15} cy={78} r={3.5} fill={C.greyLight} {...LS} />
        <ellipse cx={66} cy={32} rx={4.5} ry={14} transform="rotate(-55 66 32)" fill={fur} {...LM} />
        <ellipse cx={36} cy={74} rx={13} ry={5} transform="rotate(20 36 74)" fill={fur} {...LM} />
        <ellipse cx={76} cy={74} rx={10} ry={4} transform="rotate(-25 76 74)" fill={fur} {...LM} />
        <ellipse cx={54} cy={62} rx={21} ry={13} transform="rotate(-10 54 62)" fill={fur} {...L} />
        <circle cx={34} cy={58} r={5} fill={C.white} {...LM} />
        <ellipse cx={70} cy={30} rx={4.5} ry={14} transform="rotate(-40 70 30)" fill={fur} {...LM} />
        <ellipse cx={70} cy={31} rx={2} ry={9} transform="rotate(-40 70 31)" fill={C.pink} />
        <circle cx={77} cy={48} r={12} fill={fur} {...L} />
        <circle cx={81} cy={45} r={2.2} fill={C.ink} />
        <ellipse cx={88} cy={50} rx={2} ry={1.6} fill={C.pink} {...line(1)} />
        <circle cx={79} cy={53} r={2.4} fill={C.cheek} opacity={0.55} />
      </g>
    )
  },
  langsam: ({ color }) => (
    <g>
      <Shadow y={87} rx={40} />
      <path d="M6 86 H14" stroke={C.ink} strokeWidth={2} strokeDasharray="2 3" opacity={0.3} />
      <path d="M84 52 L80 36 M89 52 L91 36" {...line(2)} />
      <circle cx={80} cy={35} r={2.6} fill={C.ink} />
      <circle cx={91} cy={35} r={2.6} fill={C.ink} />
      <path d="M14 82 Q14 74 24 74 H70 Q80 74 81 62 Q82 50 87 50 Q93 51 92 62 Q90 80 74 84 H18 Q14 84 14 82 Z" fill="#d6e6a0" {...L} />
      <path d="M84 63 Q87 66 90 63" fill="none" {...LS} />
      <circle cx={48} cy={54} r={23} fill={color ?? C.orange} {...L} />
      <path d="M50 55 A3 3 0 1 0 47 58 A7 7 0 1 0 55 50 A12 12 0 1 0 36 64 A17 17 0 0 0 56 70" fill="none" {...LM} />
      <circle cx={40} cy={42} r={3.4} fill={C.white} opacity={0.5} />
    </g>
  ),
  obe: ({ color }) => (
    <g>
      <path d="M10 88 H70" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" opacity={0.3} />
      <Balloon x={42} y={24} rx={14} color={color ?? C.red} />
      <Bar d="M83 84 V30" color={C.green} w={4} />
      <path d="M73 34 L83 18 L93 34 Z" fill={C.green} {...L} />
    </g>
  ),
  unde: ({ color }) => (
    <g>
      <path d="M10 14 H70" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" opacity={0.3} />
      <path d="M42 20 V58" stroke={C.ink} strokeWidth={2} strokeDasharray="2 4" opacity={0.3} />
      <Shadow x={42} y={89} rx={16} />
      <Ball x={42} y={74} r={14} color={color ?? C.blue} />
      <Bar d="M83 16 V70" color={C.orange} w={4} />
      <path d="M73 68 L83 84 L93 68 Z" fill={C.orange} {...L} />
    </g>
  ),
  offe: ({ color }) => <Door open color={color ?? C.red} />,
  zue: ({ color }) => <Door open={false} color={color ?? C.red} />,
  lut: ({ color }) => (
    <g>
      <Shadow y={90} rx={26} />
      <Drum x={50} y={54} w={22} color={color ?? C.red} />
      <g className="illu-twinkle" style={origin(50, 62)}>
        <path d="M22 48 Q14 62 22 76 M12 40 Q0 62 12 84 M78 48 Q86 62 78 76 M88 40 Q100 62 88 84" fill="none" stroke={C.orange} strokeWidth={3.4} strokeLinecap="round" />
      </g>
      <g fill={C.ink}>
        <ellipse cx={26} cy={26} rx={4.5} ry={3.4} transform="rotate(-20 26 26)" />
        <path d="M30 25 V10 Q36 12 38 18" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
        <ellipse cx={66} cy={22} rx={4.5} ry={3.4} transform="rotate(-20 66 22)" />
        <ellipse cx={80} cy={18} rx={4.5} ry={3.4} transform="rotate(-20 80 18)" />
        <path d="M70 21 V8 L84 5 V17" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
      </g>
      <Bar d="M38 30 L48 44 M62 30 L52 44" color={C.furLight} w={2.6} />
    </g>
  ),
  liisli: ({ color }) => {
    const fur = color ?? C.stone
    return (
      <g>
        <Shadow y={90} rx={26} />
        <path d="M84 18 A8 8 0 1 0 90 30 A6 6 0 0 1 84 18 Z" fill="#f8df8a" {...LM} />
        <path d="M68 82 Q90 82 86 64" fill="none" {...line(2.2)} />
        <ellipse cx={50} cy={72} rx={20} ry={17} fill={fur} {...L} />
        <circle cx={33} cy={28} r={11} fill={fur} {...L} />
        <circle cx={67} cy={28} r={11} fill={fur} {...L} />
        <circle cx={33} cy={28} r={6} fill={C.pink} />
        <circle cx={67} cy={28} r={6} fill={C.pink} />
        <circle cx={50} cy={46} r={18} fill={fur} {...L} />
        <path d="M39 44 Q42 47 45 44 M55 44 Q58 47 61 44" fill="none" {...LM} />
        <Cheeks x1={39} x2={61} y={51} r={2.6} />
        <circle cx={50} cy={51} r={2.4} fill={C.pink} {...line(1)} />
        <path d="M36 52 L26 50 M36 55 L27 57 M64 52 L74 50 M64 55 L73 57" stroke={C.ink} strokeWidth={1} opacity={0.5} />
        <ellipse cx={36} cy={74} rx={5} ry={8} transform="rotate(20 36 74)" fill={fur} {...LM} />
        <path d="M58 82 Q60 66 52 58" fill="none" stroke={C.ink} strokeWidth={8.4} strokeLinecap="round" />
        <path d="M58 82 Q60 66 52 58" fill="none" stroke={fur} strokeWidth={5.6} strokeLinecap="round" />
        <path d="M52 58 L50 52" stroke={C.ink} strokeWidth={5.4} strokeLinecap="round" />
        <path d="M52 58 L50 52" stroke={fur} strokeWidth={2.8} strokeLinecap="round" />
      </g>
    )
  },
  vou: ({ color }) => (
    <g>
      <Glass level={0.92} color={color ?? C.orange} />
      <g fill={C.white} opacity={0.6}>
        <circle cx={56} cy={50} r={1.8} />
        <circle cx={46} cy={64} r={1.4} />
        <circle cx={58} cy={72} r={1.6} />
      </g>
    </g>
  ),
  laeaer: () => <Glass level={0} />,
  nass: ({ color }) => (
    <g>
      <Shirt color={color ?? C.blue} />
      <g fill={C.water} {...LS}>
        <path d={dropD(36, 88, 0.7)} />
        <path d={dropD(50, 91, 0.8)} />
        <path d={dropD(64, 87, 0.7)} />
        <path d={dropD(20, 58, 0.6)} />
        <path d={dropD(80, 58, 0.6)} />
      </g>
      <path d="M38 44 Q40 50 38 56 M60 60 Q62 66 60 70" stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
    </g>
  ),
  troche: ({ color }) => (
    <g>
      <Shirt color={color ?? C.blue} />
      <Sun x={82} y={78} r={7} />
      <Twinkle x={18} y={66} r={5} />
      <Twinkle x={62} y={40} r={4} fill={C.white} />
    </g>
  ),
  lang: ({ color }) => (
    <g>
      <Shadow y={66} rx={42} ry={3} />
      <Worm d="M14 54 Q24 40 34 54 T54 54 T74 54" hx={82} hy={50} color={color ?? C.leaf} />
      <g opacity={faded}>
        <Worm d="M36 84 Q40 78 44 84" hx={52} hy={81} color={color ?? C.leaf} />
      </g>
    </g>
  ),
  churz: ({ color }) => (
    <g>
      <g opacity={faded}>
        <Worm d="M12 30 Q20 18 28 30 T44 30 T60 30" hx={68} hy={27} color={color ?? C.leaf} />
      </g>
      <Shadow y={78} rx={20} ry={3} />
      <Worm d="M38 68 Q44 60 50 68" hx={58} hy={65} color={color ?? C.leaf} />
    </g>
  ),
  hell: () => (
    <g>
      <rect x={8} y={8} width={84} height={84} rx={16} fill={PALE} />
      <Bulb on />
    </g>
  ),
  dunku: () => (
    <g>
      <rect x={8} y={8} width={84} height={84} rx={16} fill={NIGHT} {...L} />
      <path d="M76 16 A8 8 0 1 0 84 28 A6 6 0 0 1 76 16 Z" fill="#f8df8a" {...LM} />
      <Star x={20} y={22} r={3} />
      <Star x={22} y={70} r={2.4} />
      <Bulb on={false} />
    </g>
  ),
  suber: ({ color }) => <Boot color={color ?? C.yellow} />,
  draeckig: ({ color }) => <Boot color={color ?? C.yellow} dirty />,
  schwaer: ({ color }) => (
    <g>
      <path d="M30 10 V22 M50 6 V20 M70 10 V22" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M26 20 L30 25 L34 20 M46 18 L50 23 L54 18 M66 20 L70 25 L74 20" fill="none" {...LM} />
      <path d="M10 80 Q6 72 18 73 H82 Q94 72 90 80 Q94 89 82 88 H18 Q6 89 10 80 Z" fill={C.rose} {...L} />
      <path d="M16 74 Q10 50 30 38 Q50 26 70 36 Q90 48 84 74 Z" fill={color ?? '#8f8a83'} {...L} />
      <path d="M28 42 Q38 34 50 34" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      <g fill={C.ink} opacity={0.25}>
        <circle cx={60} cy={50} r={2.4} />
        <circle cx={40} cy={60} r={2} />
        <circle cx={70} cy={64} r={1.6} />
      </g>
      <path d="M5 70 L9 74 M5 90 L9 86 M95 70 L91 74 M95 90 L91 86" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  liecht: ({ color }) => (
    <g>
      <path d="M12 76 Q24 64 34 76 T58 74" fill="none" stroke={C.grey} strokeWidth={2} strokeDasharray="2 4" strokeLinecap="round" />
      <g className="illu-bob" style={origin(50, 50)}>
        <g transform="rotate(-30 50 50)">
          <path d="M50 12 Q68 30 62 58 Q58 76 50 84 Q42 76 38 58 Q32 30 50 12 Z" fill={color ?? C.rose} {...L} />
          <path d="M44 34 L48 38 M57 40 L52 44 M42 52 L48 56 M58 58 L52 62" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" />
          <path d="M50 16 V92" {...LM} />
          <path d="M44 28 Q42 40 44 50" stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
        </g>
      </g>
    </g>
  ),
  aut: () => <Teddy fur="#a68b70" light="#cdb79c" old />,
  noei: ({ color }) => (
    <g>
      <Teddy fur={color ?? C.fur} />
      <path d="M50 57 L40 51 V63 Z M50 57 L60 51 V63 Z" fill={C.red} {...LM} />
      <circle cx={50} cy={57} r={3} fill={C.red} {...LM} />
      <Twinkle x={14} y={18} r={6} />
      <Twinkle x={86} y={14} r={5} />
      <Twinkle x={88} y={54} r={4} />
    </g>
  ),
}

/* ------------------------------------------------------------------ school */

/** Three wooden toy blocks carrying a short label each (letters / digits). */
function LabelBlocks({ labels, colors }: { labels: [string, string, string]; colors: [string, string, string] }) {
  const spots: [number, number][] = [
    [12, 56],
    [46, 56],
    [29, 26],
  ]
  return (
    <g>
      <Shadow y={88} rx={40} />
      {spots.map(([x, y], i) => (
        <Block key={i} x={x} y={y} s={28} fill={colors[i]}>
          <text x={x + 14} y={y + 22} textAnchor="middle" fontSize={21} fontWeight={800} fontFamily="'Arial Rounded MT Bold', Nunito, system-ui, sans-serif" fill={C.white} stroke={C.ink} strokeWidth={1.4} paintOrder="stroke">
            {labels[i]}
          </text>
        </Block>
      ))}
    </g>
  )
}

const school: IlluMap = {
  znueni: ({ color }) => (
    <g>
      <Shadow y={89} rx={40} />
      <path d="M18 52 L24 24 H76 L82 52 Z" fill={color ?? C.green} {...L} />
      <path d="M24 48 L28 28 H72 L76 48 Z" fill={C.white} opacity={0.35} />
      <path d="M30 37 Q31 31 36 32" fill="none" stroke={C.greenDark} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={30} cy={46} r={9} fill={C.red} {...L} />
      <ellipse cx={34} cy={34} rx={4} ry={2} transform="rotate(-30 34 34)" fill={C.leaf} {...LS} />
      <path d="M44 56 L52 36 L64 56 Z" fill={C.sand} {...L} />
      <path d="M47 50 Q53 47 59 50" fill="none" stroke={C.leaf} strokeWidth={2.4} strokeLinecap="round" />
      <rect x={68} y={34} width={5} height={22} rx={2} transform="rotate(10 70 45)" fill={C.orange} {...LS} />
      <rect x={75} y={36} width={5} height={20} rx={2} transform="rotate(-6 77 46)" fill={C.orange} {...LS} />
      <path d="M12 52 H88 V80 Q88 86 82 86 H18 Q12 86 12 80 Z" fill={color ?? C.green} {...L} />
      <path d="M18 60 H40" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <rect x={44} y={50} width={12} height={6} rx={2} fill={C.yellow} {...LS} />
    </g>
  ),
  pouse: ({ color }) => (
    <g>
      <g className="illu-wag" style={origin(32, 14)}>
        <rect x={29} y={10} width={6} height={18} rx={2} fill={C.brown} {...LM} />
        <circle cx={32} cy={59} r={3.4} fill={C.ink} />
        <path d="M18 52 Q18 30 32 28 Q46 30 46 52 Z" fill={C.yellow} {...L} />
        <rect x={14} y={50} width={36} height={6} rx={3} fill={C.yellow} {...L} />
        <path d="M24 46 Q24 36 30 33" fill="none" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      </g>
      <g className="illu-twinkle" style={origin(52, 34)}>
        <path d="M54 28 Q60 34 54 40 M60 22 Q70 34 60 46" fill="none" stroke={C.orange} strokeWidth={3} strokeLinecap="round" />
      </g>
      <path d="M50 84 Q56 52 70 56" fill="none" stroke={C.ink} strokeWidth={1.8} strokeDasharray="2 4" opacity={0.4} />
      <Shadow x={72} y={89} rx={14} />
      <Ball x={72} y={74} r={14} color={color ?? C.blue} />
    </g>
  ),
  buechstabe: () => <LabelBlocks labels={['A', 'B', 'C']} colors={[C.red, C.blue, C.yellow]} />,
  zahl: () => <LabelBlocks labels={['1', '2', '3']} colors={[C.green, C.orange, C.purple]} />,
  schaeri: ({ color }) => (
    <g transform="rotate(-25 50 50)">
      <path d="M47 50 L36 8 Q38 5 41 8 L54 46 Z" fill="#cfd5db" {...L} />
      <path d="M53 50 L64 8 Q62 5 59 8 L46 46 Z" fill="#e6eaed" {...L} />
      <Bar d="M48 50 L38 64 M52 50 L62 64" color={color ?? C.red} w={5} />
      <circle cx={35} cy={74} r={11} fill="none" stroke={C.ink} strokeWidth={9} />
      <circle cx={35} cy={74} r={11} fill="none" stroke={color ?? C.red} strokeWidth={5.4} />
      <circle cx={65} cy={74} r={11} fill="none" stroke={C.ink} strokeWidth={9} />
      <circle cx={65} cy={74} r={11} fill="none" stroke={color ?? C.red} strokeWidth={5.4} />
      <circle cx={50} cy={48} r={2.8} fill={C.grey} {...LS} />
    </g>
  ),
  lym: ({ color }) => (
    <g>
      <Shadow y={89} rx={36} />
      <rect x={64} y={62} width={22} height={24} rx={4} transform="rotate(-70 75 74)" fill={color ?? C.purple} {...L} />
      <path d="M36 34 V22 Q36 15 46 15 Q56 15 56 22 V34 Z" fill={C.white} {...L} />
      <rect x={32} y={32} width={28} height={7} rx={2} fill={color ?? C.purple} {...L} />
      <rect x={34} y={38} width={24} height={48} rx={4} fill={color ?? C.purple} {...L} />
      <rect x={34} y={52} width={24} height={20} fill={C.white} {...LM} />
      <path d={dropD(46, 63, 1.1)} fill={C.sky} {...LS} />
      <path d="M38 42 V48 M38 76 V82" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  papier: () => (
    <g>
      <Shadow y={88} rx={36} />
      <rect x={22} y={18} width={52} height={66} rx={2} transform="rotate(-8 48 51)" fill="#e9eef5" {...L} />
      <rect x={26} y={16} width={52} height={66} rx={2} transform="rotate(5 52 49)" fill={C.cream} {...L} />
      <path d="M24 14 H66 L78 26 V84 H24 Z" fill={C.white} {...L} />
      <path d="M66 14 V26 H78 Z" fill={C.greyLight} {...LM} />
      <path d="M32 36 H70 M32 46 H70 M32 56 H70 M32 66 H70 M32 76 H58" stroke={C.blue} strokeWidth={1.4} opacity={0.35} />
    </g>
  ),
  bleistift: ({ color }) => (
    <g transform="rotate(-35 50 50)">
      <path d="M74 43 L90 50 L74 57 Z" fill="#f1d9a6" {...L} />
      <path d="M85.5 48 L90 50 L85.5 52 Z" fill={C.ink} {...LS} />
      <rect x={18} y={43} width={56} height={14} fill={color ?? C.yellow} {...L} />
      <path d="M18 50 H74" stroke={C.ink} strokeWidth={1.2} opacity={0.3} />
      <rect x={6} y={43} width={10} height={14} rx={3} fill={C.pink} {...L} />
      <rect x={13} y={42.5} width={7} height={15} fill={C.greyLight} {...LM} />
      <path d="M15.5 43 V57 M17.5 43 V57" stroke={C.ink} strokeWidth={0.8} opacity={0.5} />
    </g>
  ),
  garderobe: ({ color }) => (
    <g>
      <Shadow y={90} rx={42} />
      <rect x={10} y={16} width={80} height={10} rx={3} fill={C.fur} {...L} />
      <path d="M26 26 V34 Q26 38 30 36 M50 26 V34 Q50 38 54 36 M74 26 V34 Q74 38 78 36" fill="none" {...LM} />
      <circle cx={18} cy={21} r={2.6} fill={C.yellow} />
      <circle cx={42} cy={21} r={2.6} fill={C.green} />
      <circle cx={66} cy={21} r={2.6} fill={C.blue} />
      <path d="M26 33 L16 39 L12 64 H20 L21 52 V70 H31 V52 L32 64 H40 L36 39 Z" fill={color ?? C.red} {...L} />
      <path d="M26 38 V70" stroke={C.ink} strokeWidth={1.2} opacity={0.4} />
      <rect x={40} y={35} width={20} height={28} rx={6} fill={C.blue} {...L} />
      <rect x={43} y={48} width={14} height={11} rx={3} fill={C.sky} {...LM} />
      <path d="M64 48 Q64 34 74 34 Q84 34 84 48 Z" fill={C.yellow} {...L} />
      <rect x={63} y={45} width={22} height={5} rx={2} fill={C.orange} {...LM} />
      <circle cx={74} cy={32} r={3.6} fill={C.orange} {...LM} />
      <path d="M16 88 V78 M84 88 V78" {...line(3)} />
      <rect x={10} y={73} width={80} height={6} rx={2} fill={C.brown} {...L} />
      <ellipse cx={32} cy={87} rx={6} ry={3} fill={C.red} {...LM} />
      <ellipse cx={44} cy={87} rx={6} ry={3} fill={C.red} {...LM} />
    </g>
  ),
  wandtafele: () => (
    <g>
      <rect x={8} y={14} width={84} height={62} rx={4} fill={C.fur} {...L} />
      <rect x={13} y={19} width={74} height={52} rx={2} fill="#3d6b4f" {...LM} />
      <g fill="none" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
        <circle cx={28} cy={34} r={6} />
        <path d="M28 24 V22 M38 34 H40 M35 27 L36.5 25.5 M21 27 L19.5 25.5 M16 34 H18" />
        <path d="M52 62 V48 L62 40 L72 48 V62 Z M59 62 V54 H65 V62" />
        <path d="M18 64 Q30 60 44 64 Q60 66 82 63" />
      </g>
      <rect x={10} y={76} width={80} height={5} rx={2} fill={C.furDark} {...L} />
      <rect x={28} y={72} width={9} height={4} rx={1.5} fill={C.white} {...LS} />
      <rect x={40} y={72} width={7} height={4} rx={1.5} fill={C.yellow} {...LS} />
      <rect x={64} y={70} width={14} height={6} rx={2} fill={C.blue} {...LS} />
    </g>
  ),
}

/* ------------------------------------------------------------------ props for games & stories */

function Crate({ color, mark }: { color: string; mark: 'circle' | 'triangle' }) {
  return (
    <g>
      <Shadow y={89} rx={38} />
      <path d="M12 34 H88 L82 86 H18 Z" fill={color} {...L} />
      <path d="M13.5 52 H86.5 M15.5 70 H84.5" stroke={C.ink} strokeWidth={1.6} opacity={0.35} />
      <rect x={10} y={30} width={80} height={8} rx={3} fill={color} {...L} />
      <rect x={40} y={42} width={20} height={6} rx={3} fill={C.ink} opacity={0.5} />
      <path d="M16 38 L20 82" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.45} />
      {mark === 'circle' ? (
        <circle cx={50} cy={66} r={8} fill={C.white} {...LM} />
      ) : (
        <path d="M50 57 L59 74 H41 Z" fill={C.white} {...LM} />
      )}
    </g>
  )
}

function merlons(x: number, y: number, w: number, n: number): string {
  const step = w / (2 * n - 1)
  return Array.from({ length: n }, (_, i) => `M${q(x + i * 2 * step)} ${y} v-5 h${q(step)} v5 Z`).join(' ')
}

const props: IlluMap = {
  basket: ({ color }) => (
    <g>
      <Shadow y={90} rx={38} />
      <Bar d="M18 46 Q50 0 82 46" color={C.fur} w={5} />
      <path d="M10 46 H90 L80 84 Q78 88 74 88 H26 Q22 88 20 84 Z" fill={color ?? '#d9a35b'} {...L} />
      <path d="M13 60 H87 M16 73 H84" stroke={C.ink} strokeWidth={1.4} opacity={0.35} />
      {[20, 32, 44, 56, 68, 80].map((x, i) => (
        <path key={x} d={`M${x + (i % 2) * 3} ${51} V${58} M${x + 6 - (i % 2) * 3} ${63} V${71} M${x + (i % 2) * 3} ${76} V${84}`} stroke={C.ink} strokeWidth={1.4} opacity={0.3} />
      ))}
      <rect x={8} y={42} width={84} height={9} rx={4.5} fill="#c48a45" {...L} />
    </g>
  ),
  box: ({ color }) => (
    <g>
      <Shadow y={89} rx={40} />
      <path d="M22 34 L27 8 H73 L78 34 Z" fill={color ?? C.blue} {...L} />
      <path d="M22 34 L27 8 H73 L78 34 Z" fill={C.ink} opacity={0.18} />
      <path d="M14 46 L22 34 H78 L86 46 Z" fill="#5a4636" {...L} />
      <path d="M22 34 L26 42 H74 L78 34" fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.4} />
      <rect x={14} y={46} width={72} height={40} rx={3} fill={color ?? C.blue} {...L} />
      <path d="M20 52 H80" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <path d={starD(50, 68, 10)} fill={C.yellow} {...LM} />
      <circle cx={26} cy={74} r={3} fill={C.white} opacity={0.6} />
      <circle cx={74} cy={62} r={3} fill={C.white} opacity={0.6} />
    </g>
  ),
  'bin-a': ({ color }) => <Crate color={color ?? C.blue} mark="circle" />,
  'bin-b': ({ color }) => <Crate color={color ?? C.orange} mark="triangle" />,
  'sticker-star': ({ color }) => (
    <g>
      <g className="illu-bob" style={origin(50, 52)}>
        <path d={starD(50, 54, 36, 17)} fill={C.white} stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
        <path d={starD(50, 54, 36, 17)} fill={C.white} stroke={C.white} strokeWidth={9} strokeLinejoin="round" />
        <path d={starD(50, 54, 36, 17)} fill={color ?? C.yellow} />
        <circle cx={40} cy={42} r={3.4} fill={C.white} opacity={0.7} />
      </g>
      <Twinkle x={86} y={18} r={5} />
    </g>
  ),
  sparkle: ({ color }) => (
    <g>
      <Twinkle x={48} y={52} r={30} fill={color ?? C.yellow} />
      <Twinkle x={80} y={20} r={9} fill={color ?? C.yellow} />
      <Twinkle x={20} y={80} r={7} fill={color ?? C.yellow} />
    </g>
  ),
  'heart-small': ({ color }) => (
    <g className="illu-bob" style={origin(50, 50)}>
      <path d={HEART_D} fill={color ?? C.red} {...line(2.6)} />
      <ellipse cx={32} cy={36} rx={5} ry={7} transform="rotate(-30 32 36)" fill={C.white} opacity={0.55} />
    </g>
  ),
  bench: ({ color }) => (
    <g>
      <Shadow y={89} rx={42} />
      <Bar d="M22 88 V24 M78 88 V24" color="#4b4b4b" w={3.4} />
      <rect x={10} y={24} width={80} height={8} rx={3} fill={color ?? C.fur} {...L} />
      <rect x={10} y={36} width={80} height={8} rx={3} fill={color ?? C.fur} {...L} />
      <rect x={6} y={54} width={88} height={9} rx={3} fill={color ?? C.fur} {...L} />
      <path d="M14 27 H40 M14 39 H30 M10 57 H44" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" opacity={0.4} />
    </g>
  ),
  fountain: ({ color }) => (
    <g>
      <Shadow y={90} rx={42} />
      <rect x={44} y={20} width={12} height={40} fill={color ?? C.red} {...L} />
      <rect x={45} y={30} width={10} height={3} fill={C.yellow} />
      <rect x={45} y={46} width={10} height={3} fill={C.yellow} />
      <rect x={40} y={15} width={20} height={6} rx={2} fill={C.yellow} {...L} />
      <circle cx={50} cy={10} r={5} fill={C.green} {...L} />
      <Bar d="M44 40 H34 M56 40 H66" color={C.grey} w={2.4} />
      <path d="M32 41 Q24 44 22 62 M68 41 Q76 44 78 62" fill="none" stroke={C.water} strokeWidth={3.2} strokeLinecap="round" />
      <rect x={6} y={58} width={88} height={7} rx={3} fill="#cfc9bf" {...L} />
      <rect x={10} y={59} width={80} height={3} rx={1.5} fill={C.water} />
      <path d="M9 65 H91 V82 Q91 88 85 88 H15 Q9 88 9 82 Z" fill={C.stone} {...L} />
      <path d="M30 65 V88 M50 65 V88 M70 65 V88" stroke={C.ink} strokeWidth={1.4} opacity={0.3} />
      <g fill={C.water} {...line(1)}>
        <circle cx={18} cy={54} r={1.8} />
        <circle cx={82} cy={54} r={1.8} />
      </g>
    </g>
  ),
  'flower-box': ({ color }) => (
    <g>
      <path d="M24 60 V44 M42 60 V36 M60 60 V42 M78 60 V38" stroke={C.greenDark} strokeWidth={2.4} />
      <g fill={C.leaf} {...LM}>
        <ellipse cx={16} cy={56} rx={8} ry={5} />
        <ellipse cx={34} cy={54} rx={8} ry={5} />
        <ellipse cx={52} cy={55} rx={8} ry={5} />
        <ellipse cx={70} cy={54} rx={8} ry={5} />
        <ellipse cx={86} cy={56} rx={7} ry={5} />
      </g>
      {(
        [
          [24, 40],
          [42, 32],
          [60, 38],
          [78, 34],
        ] as const
      ).map(([x, y]) => (
        <g key={x} className="illu-bob" style={origin(x, y)}>
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i * 2 * Math.PI) / 5 - Math.PI / 2
            return <circle key={i} cx={q(x + 6 * Math.cos(a))} cy={q(y + 6 * Math.sin(a))} r={4.6} fill={color ?? C.red} {...LS} />
          })}
          <circle cx={x} cy={y} r={2.6} fill={C.yellow} {...line(1)} />
        </g>
      ))}
      <rect x={8} y={58} width={84} height={22} rx={3} fill={C.brown} {...L} />
      <path d="M8 69 H92" stroke={C.ink} strokeWidth={1.4} opacity={0.35} />
      <path d="M20 80 L24 88 L28 80 M72 80 L76 88 L80 80" fill={C.furDark} {...LM} />
    </g>
  ),
  'picnic-blanket': ({ color }) => {
    const cols = 6
    const rows = 4
    const pt = (u: number, v: number): string => {
      const xl = 18 + (6 - 18) * v
      const xr = 82 + (94 - 82) * v
      return `${q(xl + (xr - xl) * u)} ${q(46 + 40 * v)}`
    }
    const cells: string[] = []
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        if ((i + j) % 2 === 0) {
          const u0 = i / cols
          const u1 = (i + 1) / cols
          const v0 = j / rows
          const v1 = (j + 1) / rows
          cells.push(`M${pt(u0, v0)} L${pt(u1, v0)} L${pt(u1, v1)} L${pt(u0, v1)} Z`)
        }
    return (
      <g>
        <Shadow y={88} rx={46} ry={4} />
        <path d="M18 46 H82 L94 86 H6 Z" fill={C.white} />
        <path d={cells.join(' ')} fill={color ?? C.red} opacity={0.85} />
        <path d="M18 46 H82 L94 86 H6 Z" fill="none" {...L} />
      </g>
    )
  },
  sandcastle: ({ color }) => {
    const sand = color ?? '#ecc77e'
    return (
      <g>
        <path d="M6 88 Q10 76 24 76 H76 Q90 76 94 88 Z" fill={C.sand} {...L} />
        <path d="M50 26 V10" {...line(2)} />
        <g className="illu-wag" style={origin(50, 12)}>
          <path d="M50 10 L62 14 L50 18 Z" fill={C.red} {...LS} />
        </g>
        <rect x={22} y={52} width={56} height={28} fill={sand} {...L} />
        <path d={merlons(22, 52, 56, 6)} fill={sand} {...LM} />
        <rect x={40} y={32} width={20} height={22} fill={sand} {...L} />
        <path d={merlons(40, 32, 20, 3)} fill={sand} {...LM} />
        <rect x={14} y={42} width={16} height={38} fill={sand} {...L} />
        <path d={merlons(14, 42, 16, 3)} fill={sand} {...LM} />
        <rect x={70} y={42} width={16} height={38} fill={sand} {...L} />
        <path d={merlons(70, 42, 16, 3)} fill={sand} {...LM} />
        <path d="M44 80 V70 A6 6 0 0 1 56 70 V80 Z" fill="#b98a4a" {...LM} />
        <circle cx={22} cy={54} r={2.4} fill="#b98a4a" />
        <circle cx={78} cy={54} r={2.4} fill="#b98a4a" />
        <circle cx={50} cy={42} r={2.4} fill="#b98a4a" />
        <path d="M24 70 Q28 66 32 70 M68 66 Q72 62 76 66" fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.3} />
        <path d={starD(86, 84, 4.5)} fill={C.orange} {...LS} />
        <path d="M12 86 L16 80 L20 86 Z" fill={C.rose} {...LS} />
      </g>
    )
  },
}

export const worldIllus: IlluMap = {
  ...nature,
  ...transport,
  ...toys,
  ...holidays,
  ...time,
  ...opposites,
  ...school,
  ...props,
}
