import type { IlluMap } from './types'
import { C, line, origin, Shadow, Eyes, Cheeks, Smile } from './kit'

/* Food, home and clothes illustrations. 100×100 viewBox, fragments only. */

const L = line()
const T = line(1.6)
const HI = '#ffffff'

/* ---------- small shared helpers ---------- */

/** Cute face used consistently on fruit & veg (and the friendly mushroom). */
function Face({ x, y, s: k = 1 }: { x: number; y: number; s?: number }) {
  const s = k * 1.2
  return (
    <>
      <Cheeks x1={x - 10 * s} x2={x + 10 * s} y={y + 5 * s} r={2.6 * s} />
      <Eyes x1={x - 5.5 * s} x2={x + 5.5 * s} y={y} r={2.6 * s} />
      <Smile x={x} y={y + 4.5 * s} w={6.5 * s} />
    </>
  )
}

function Hi({ x, y, rx, ry, a = 0 }: { x: number; y: number; rx: number; ry: number; a?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${a} ${x} ${y})`} fill={HI} opacity={0.45} />
}

function Leaf({ x, y, a = 0, s = 1, fill = C.green }: { x: number; y: number; a?: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d="M0 0 Q7 -10 18 -6 Q10 4 0 0 Z" fill={fill} {...line(2.2 / s)} />
      <path d="M2 -1 Q9 -4 15 -5" fill="none" {...line(1.2 / s)} opacity={0.5} />
    </g>
  )
}

function Steam({ x, y, n = 3, gap = 9 }: { x: number; y: number; n?: number; gap?: number }) {
  const xs = Array.from({ length: n }, (_, i) => x + (i - (n - 1) / 2) * gap)
  return (
    <g className="illu-bob" style={origin(x, y)} opacity={0.6}>
      {xs.map((sx, i) => (
        <path key={i} d={`M${sx} ${y} q-4 -5 0 -10 q4 -5 0 -10`} fill="none" stroke={C.inkSoft} strokeWidth={2.4} strokeLinecap="round" />
      ))}
    </g>
  )
}

function Sun({ x, y, r }: { x: number; y: number; r: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
  return (
    <g>
      <g className="illu-spin" style={origin(x, y)}>
        {rays.map((a, i) => (
          <line
            key={i}
            x1={x + Math.cos(a) * (r + 3)}
            y1={y + Math.sin(a) * (r + 3)}
            x2={x + Math.cos(a) * (r + 8)}
            y2={y + Math.sin(a) * (r + 8)}
            stroke={C.orange}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={x} cy={y} r={r} fill={C.yellow} {...L} />
      <Hi x={x - r * 0.35} y={y - r * 0.35} rx={r * 0.25} ry={r * 0.18} a={-30} />
    </g>
  )
}

function Star({ x, y, r, fill = C.yellow }: { x: number; y: number; r: number; fill?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} {...line(1.6)} />
}

/** Round clock face; hour hand points at `hour`, minute hand at 12 (optionally spinning). */
function ClockFace({ x, y, r, hour, spin = false, fill = C.cream }: { x: number; y: number; r: number; hour: number; spin?: boolean; fill?: string }) {
  const ha = (hour * 30 * Math.PI) / 180
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} {...L} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180
        return <circle key={i} cx={x + Math.sin(a) * r * 0.78} cy={y - Math.cos(a) * r * 0.78} r={i % 3 === 0 ? 1.6 : 0.9} fill={C.ink} />
      })}
      <line x1={x} y1={y} x2={x + Math.sin(ha) * r * 0.45} y2={y - Math.cos(ha) * r * 0.45} {...line(3)} />
      <g className={spin ? 'illu-spin' : undefined} style={origin(x, y)}>
        <line x1={x} y1={y} x2={x} y2={y - r * 0.68} {...line(2.2)} />
      </g>
      <circle cx={x} cy={y} r={2} fill={C.red} />
    </g>
  )
}

/** Elbow-macaroni piece: outlined thick curved tube. */
function Elbow({ x, y, a = 0, s = 1 }: { x: number; y: number; a?: number; s?: number }) {
  const d = 'M-6 -4 Q-6 6 6 6'
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={9.5} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#f6cf5a" strokeWidth={6} strokeLinecap="round" />
      <circle cx={6.5} cy={6} r={1.6} fill="#d79a2c" />
    </g>
  )
}

/** Crescent-shaped croissant centred at x/y (art spans ±40 × ±16 at s=1). */
function Croissant({ x, y, s, fill }: { x: number; y: number; s: number; fill?: string }) {
  const w = 2.2 / Math.max(s, 0.5)
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -50)`}>
      <path d="M10 66 C12 46 30 34 50 34 C70 34 88 46 90 66 C86 70 80 70 76 66 C68 58 60 56 50 56 C40 56 32 58 24 66 C20 70 14 70 10 66 Z" fill={fill ?? '#e3a04a'} {...line(w)} />
      <path d="M26 46 Q34 54 30 63 M40 37 Q46 46 42 57 M60 37 Q54 46 58 57 M74 46 Q66 54 70 63" fill="none" {...line(w * 0.75)} />
      <path d="M44 40 Q50 38 56 40" fill="none" stroke={HI} strokeWidth={3 / Math.max(s, 0.5)} strokeLinecap="round" opacity={0.5} />
    </g>
  )
}

function Table() {
  return (
    <g>
      <rect x={6} y={80} width={88} height={8} rx={3} fill="#c98a4b" {...L} />
      <path d="M10 84 L90 84" stroke="#a96d36" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  )
}

/** Generic shirt silhouette (short or long sleeves). */
function shirtPath(long: boolean): string {
  return long
    ? 'M32 16 L42 13 Q50 22 58 13 L68 16 L84 26 Q90 52 92 78 L80 80 L74 42 L72 88 L28 88 L26 42 L20 80 L8 78 Q10 52 16 26 Z'
    : 'M30 18 L42 14 Q50 23 58 14 L70 18 L90 34 L80 47 L72 41 L72 86 L28 86 L28 41 L20 47 L10 34 Z'
}

/* ---------- the map ---------- */

export const objectIllus: IlluMap = {
  /* ===== FOOD: fruit & veg (with faces) ===== */
  oepfu: ({ color }) => (
    <g>
      <Shadow rx={26} />
      <path d="M50 34 C40 24 16 26 16 54 C16 78 34 92 50 86 C66 92 84 78 84 54 C84 26 60 24 50 34 Z" fill={color ?? C.red} {...L} />
      <Hi x={29} y={48} rx={4.5} ry={9} a={20} />
      <path d="M50 34 Q49 24 54 14" fill="none" {...line(4)} />
      <Leaf x={54} y={22} a={-20} />
      <Face x={50} y={60} />
    </g>
  ),
  bire: ({ color }) => (
    <g>
      <Shadow rx={24} />
      <path d="M50 22 C41 22 39 32 39 40 C39 50 22 56 22 72 C22 86 36 91 50 91 C64 91 78 86 78 72 C78 56 61 50 61 40 C61 32 59 22 50 22 Z" fill={color ?? '#bcd35b'} {...L} />
      <Hi x={33} y={66} rx={4} ry={8} a={15} />
      <path d="M50 23 Q50 15 46 9" fill="none" {...line(3.5)} />
      <Leaf x={49} y={15} a={-30} s={0.9} />
      <Face x={50} y={68} />
    </g>
  ),
  banane: ({ color }) => (
    <g>
      <Shadow y={90} rx={32} />
      <path d="M22 28 C14 58 34 86 66 84 C76 83 84 78 89 70 L85 65 C76 71 64 72 54 68 C38 60 31 46 31 28 Z" fill={color ?? C.yellow} {...L} />
      <path d="M26 40 C26 62 42 78 64 79" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <path d="M22 28 L23 19 L30 19 L31 28 Z" fill={C.brown} {...L} />
      <circle cx={88} cy={68} r={2.6} fill={C.ink} />
      <Face x={44} y={67} s={0.8} />
    </g>
  ),
  aerdbeeri: ({ color }) => (
    <g>
      <Shadow rx={24} />
      <path d="M50 89 C30 82 17 64 19 46 C21 33 34 29 50 33 C66 29 79 33 81 46 C83 64 70 82 50 89 Z" fill={color ?? C.red} {...L} />
      {[
        [33, 44], [67, 44], [26, 58], [74, 58], [34, 72], [66, 72], [50, 80], [42, 82], [58, 82],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.4} ry={2.2} fill={C.yellow} />
      ))}
      <path d="M29 36 L38 26 L43 33 L50 20 L57 33 L62 26 L71 36 Q50 44 29 36 Z" fill={C.green} {...L} />
      <path d="M50 22 L51 13" {...line(3)} />
      <Face x={50} y={56} />
    </g>
  ),
  chriesi: ({ color }) => (
    <g>
      <Shadow rx={34} />
      <path d="M33 54 Q38 32 56 16" fill="none" {...line(3)} stroke={C.greenDark} />
      <path d="M67 56 Q63 36 56 16" fill="none" {...line(3)} stroke={C.greenDark} />
      <Leaf x={56} y={17} a={-15} s={1.1} />
      <circle cx={33} cy={70} r={17} fill={color ?? '#c8243a'} {...L} />
      <circle cx={67} cy={72} r={17} fill={color ?? '#c8243a'} {...L} />
      <Hi x={25} y={63} rx={3} ry={5} a={30} />
      <Hi x={59} y={65} rx={3} ry={5} a={30} />
      <Face x={33} y={71} s={0.7} />
      <Face x={67} y={73} s={0.7} />
    </g>
  ),
  trube: ({ color }) => {
    const rows: [number, number[]][] = [
      [34, [29, 43, 57, 71]],
      [47, [36, 50, 64]],
      [60, [43, 57]],
      [73, [50]],
    ]
    return (
      <g>
        <Shadow y={90} rx={22} />
        <path d="M50 28 Q50 18 54 10" fill="none" {...line(3.5)} />
        <Leaf x={52} y={20} a={-25} s={1.1} />
        {rows.map(([y, xs]) =>
          xs.map((x) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={8.5} fill={color ?? C.purple} {...L} />
              <circle cx={x - 3} cy={y - 3} r={1.8} fill={HI} opacity={0.5} />
            </g>
          )),
        )}
        <Face x={50} y={46} s={0.75} />
      </g>
    )
  },
  orange: ({ color }) => (
    <g>
      <Shadow rx={28} />
      <circle cx={50} cy={58} r={31} fill={color ?? C.orange} {...L} />
      {[
        [30, 46], [70, 46], [26, 64], [74, 64], [38, 78], [62, 78], [50, 84], [40, 38], [60, 38],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1} fill={C.ink} opacity={0.25} />
      ))}
      <Hi x={34} y={44} rx={4} ry={7} a={35} />
      <path d="M50 28 L50 22" {...line(3.5)} />
      <Leaf x={51} y={24} a={-15} />
      <Face x={50} y={60} />
    </g>
  ),
  zitrone: ({ color }) => (
    <g>
      <Shadow rx={32} />
      <path d="M12 58 Q14 51 21 49 C30 30 70 30 79 49 Q86 51 88 58 Q86 65 79 67 C70 86 30 86 21 67 Q14 65 12 58 Z" fill={color ?? C.yellow} {...L} />
      <Hi x={34} y={46} rx={7} ry={3.5} a={-15} />
      <Leaf x={52} y={36} a={-30} />
      <Face x={50} y={58} />
    </g>
  ),
  zwaetschge: ({ color }) => (
    <g>
      <Shadow rx={24} />
      <ellipse cx={50} cy={60} rx={25} ry={29} fill={color ?? '#5d4b9e'} {...L} />
      <path d="M50 32 Q42 58 50 88" fill="none" {...line(1.6)} opacity={0.5} />
      <Hi x={36} y={50} rx={3.5} ry={9} a={12} />
      <path d="M50 32 Q51 24 56 18" fill="none" {...line(3.5)} />
      <Leaf x={54} y={22} a={-10} />
      <Face x={53} y={60} s={0.9} />
    </g>
  ),
  aprikose: ({ color }) => (
    <g>
      <Shadow rx={27} />
      <path d="M50 34 C30 26 18 42 20 60 C22 80 36 88 50 88 C64 88 78 80 80 60 C82 42 70 26 50 34 Z" fill={color ?? '#f6a646'} {...L} />
      <ellipse cx={66} cy={56} rx={10} ry={13} fill={C.red} opacity={0.22} />
      <path d="M50 34 Q44 60 50 88" fill="none" {...line(1.6)} opacity={0.45} />
      <Hi x={32} y={48} rx={3.5} ry={7} a={25} />
      <path d="M50 34 Q50 27 53 22" fill="none" {...line(3.5)} />
      <Leaf x={52} y={26} a={-25} />
      <Face x={52} y={62} />
    </g>
  ),
  rueebli: ({ color }) => (
    <g>
      <Shadow y={92} rx={12} />
      <path d="M50 26 Q44 12 36 8 M50 26 Q50 12 52 6 M50 26 Q58 14 66 10" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M50 26 Q44 12 36 8 M50 26 Q50 12 52 6 M50 26 Q58 14 66 10" fill="none" stroke={C.green} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M30 32 Q50 20 70 32 Q64 62 52 90 Q50 93 48 90 Q36 62 30 32 Z" fill={color ?? C.orange} {...L} />
      <path d="M36 58 L42 58 M58 66 L63 66 M44 76 L49 76" {...line(1.6)} />
      <Hi x={37} y={40} rx={2.5} ry={6} a={-15} />
      <Face x={50} y={42} s={0.85} />
    </g>
  ),
  haerdoepfu: ({ color }) => (
    <g>
      <Shadow rx={32} />
      <path d="M18 58 C14 42 28 32 46 36 C60 30 84 34 84 54 C86 74 70 84 50 82 C30 84 20 74 18 58 Z" fill={color ?? '#d6a35c'} {...L} />
      {[
        [28, 50], [72, 46], [76, 66], [32, 72], [62, 76],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={2} ry={1.4} fill={C.brown} opacity={0.6} />
      ))}
      <Hi x={34} y={44} rx={6} ry={3} a={-15} />
      <Face x={52} y={58} />
    </g>
  ),
  tomate: ({ color }) => (
    <g>
      <Shadow rx={30} />
      <path d="M50 34 C70 30 84 42 84 60 C84 78 68 88 50 88 C32 88 16 78 16 60 C16 42 30 30 50 34 Z" fill={color ?? C.red} {...L} />
      <Hi x={30} y={48} rx={4} ry={8} a={30} />
      <path d="M50 38 L40 30 L46 34 L38 38 L48 39 L44 46 L52 40 L58 46 L56 39 L66 38 L56 34 L62 30 Z" fill={C.green} {...L} />
      <path d="M51 34 L52 24" {...line(3.5)} />
      <Face x={50} y={62} />
    </g>
  ),
  gurke: ({ color }) => (
    <g>
      <Shadow y={90} rx={34} />
      <g transform="rotate(-25 50 56)">
        <rect x={10} y={42} width={80} height={28} rx={14} fill={color ?? C.green} {...L} />
        <path d="M18 50 Q50 46 82 50" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
        {[22, 34, 66, 78, 28, 72].map((x, i) => (
          <circle key={i} cx={x} cy={i < 4 ? 60 : 51} r={1.3} fill={C.greenDark} />
        ))}
        <path d="M90 56 L95 56" {...line(3)} />
      </g>
      <Face x={50} y={57} s={0.85} />
    </g>
  ),
  zibele: ({ color }) => (
    <g>
      <Shadow rx={26} />
      <path d="M50 22 Q54 32 66 40 C84 52 82 84 50 85 C18 84 16 52 34 40 Q46 32 50 22 Z" fill={color ?? '#e2a95e'} {...L} />
      <path d="M50 24 Q32 50 42 84 M50 24 Q68 50 58 84" fill="none" {...line(1.4)} opacity={0.45} />
      <path d="M44 85 L42 90 M50 85 L50 91 M56 85 L58 90" {...line(1.6)} />
      <path d="M50 24 Q46 14 40 8 M50 24 Q54 14 60 10" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M50 24 Q46 14 40 8 M50 24 Q54 14 60 10" fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" />
      <Hi x={30} y={58} rx={3} ry={8} a={10} />
      <Face x={50} y={62} />
    </g>
  ),
  salat: ({ color }) => {
    const c = color ?? C.leaf
    return (
      <g>
        <Shadow rx={36} />
        <path d="M14 66 C8 50 18 36 30 40 C32 26 46 22 52 30 C60 20 76 26 74 40 C88 38 94 54 86 66 Z" fill={C.green} {...L} />
        <path d="M16 70 C12 58 22 50 30 54 C32 44 42 42 48 48 C54 40 66 42 68 52 C78 48 88 58 82 72 C70 90 30 90 16 70 Z" fill={c} {...L} />
        <path d="M50 86 L50 56 M50 74 L36 62 M50 74 L64 62" fill="none" {...line(1.6)} opacity={0.5} />
        <Face x={50} y={66} />
      </g>
    )
  },
  aerbsli: ({ color }) => (
    <g>
      <Shadow y={84} rx={36} />
      <path d="M10 54 Q50 30 90 44 Q86 72 50 74 Q18 76 10 54 Z" fill={color ?? C.green} {...L} />
      <path d="M16 56 Q50 40 84 48 Q80 64 50 66 Q22 68 16 56 Z" fill="#cfeaa0" {...line(1.6)} />
      {[30, 50, 70].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={56 - i * 1.2} r={9} fill="#8fcf55" {...L} />
          <Eyes x1={x - 3.2} x2={x + 3.2} y={55 - i * 1.2} r={1.6} />
          <Smile x={x} y={58.5 - i * 1.2} w={3.6} />
        </g>
      ))}
      <path d="M10 54 Q6 50 8 44" fill="none" {...line(3)} />
    </g>
  ),
  chuerbis: ({ color }) => {
    const c = color ?? C.orange
    return (
      <g>
        <Shadow rx={36} />
        <path d="M47 38 L48 24 Q50 20 55 22 L54 38 Z" fill="#7d8a3a" {...L} />
        <path d="M55 26 Q66 18 70 26" fill="none" {...line(2)} stroke={C.greenDark} />
        <ellipse cx={30} cy={64} rx={18} ry={24} fill={c} {...L} />
        <ellipse cx={70} cy={64} rx={18} ry={24} fill={c} {...L} />
        <ellipse cx={50} cy={63} rx={20} ry={26} fill={c} {...L} />
        <path d="M18 54 Q16 64 20 74" fill="none" stroke={HI} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        <Face x={50} y={64} />
      </g>
    )
  },

  /* ===== FOOD: bakery, dairy & dishes ===== */
  brot: ({ color }) => (
    <g>
      <Shadow y={84} rx={38} />
      <path d="M12 70 C10 44 30 32 50 32 C70 32 90 44 88 70 Q88 82 76 82 L24 82 Q12 82 12 70 Z" fill={color ?? '#d58f45'} {...L} />
      <path d="M22 52 C26 42 38 37 50 37" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      <path d="M30 60 L40 44 M46 62 L56 44 M62 62 L72 46" fill="none" stroke="#f3cf91" strokeWidth={4} strokeLinecap="round" />
      <path d="M30 60 L40 44 M46 62 L56 44 M62 62 L72 46" fill="none" {...line(1.2)} opacity={0.5} />
    </g>
  ),
  zopf: ({ color }) => {
    const c = color ?? '#d8873a'
    return (
      <g>
        <Shadow y={80} rx={42} />
        <ellipse cx={50} cy={62} rx={40} ry={16} fill="#b8692a" {...L} />
        {[16, 30, 44, 58, 72, 86].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={58} rx={i === 0 || i === 5 ? 7 : 10} ry={13} transform={`rotate(${i % 2 ? -35 : 35} ${x} 58)`} fill={c} {...L} />
            <ellipse cx={x - 2} cy={53} rx={2} ry={4} transform={`rotate(${i % 2 ? -35 : 35} ${x - 2} 53)`} fill={HI} opacity={0.45} />
          </g>
        ))}
      </g>
    )
  },
  gipfeli: ({ color }) => (
    <g>
      <Shadow y={84} rx={40} />
      <Croissant x={50} y={56} s={1.1} fill={color} />
    </g>
  ),
  chaes: ({ color }) => {
    const c = color ?? C.yellow
    return (
      <g>
        <Shadow y={86} rx={40} />
        <path d="M12 56 L76 30 L88 52 Z" fill="#fde48a" {...L} />
        <path d="M12 56 L88 52 L88 84 L12 84 Z" fill={c} {...L} />
        {[
          [26, 66, 5], [48, 74, 6.5], [72, 64, 4.5], [36, 79, 3], [80, 77, 3],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#e0a52a" {...T} />
        ))}
        <ellipse cx={56} cy={46} rx={5} ry={2.5} fill="#e0a52a" {...T} />
        <ellipse cx={74} cy={40} rx={3} ry={1.6} fill="#e0a52a" {...T} />
        <path d="M88 56 Q86 66 88 72" fill="none" stroke="#e0a52a" strokeWidth={3} opacity={0.6} />
      </g>
    )
  },
  miuch: ({ color }) => {
    const c = color ?? C.blue
    return (
      <g>
        <Shadow x={52} y={89} rx={28} />
        <path d="M60 40 L76 32 L76 82 L60 88 Z" fill={C.greyLight} {...L} />
        <path d="M60 64 L76 59 L76 82 L60 88 Z" fill={c} {...L} />
        <path d="M44 22 L60 14 L76 32 L60 40 Z" fill={C.greyLight} {...L} />
        <path d="M44 22 L44 16 L60 9 L60 14 Z" fill={C.white} {...L} />
        <path d="M28 40 L44 22 L60 40 Z" fill={C.white} {...L} />
        <rect x={28} y={40} width={32} height={48} fill={C.white} {...L} />
        <path d="M28 64 L60 64 L60 88 L28 88 Z" fill={c} {...L} />
        <path d="M44 66 Q51 75 51 79 A7 7 0 0 1 37 79 Q37 75 44 66 Z" fill={C.white} {...T} />
        <circle cx={40} cy={50} r={3} fill={C.ink} opacity={0.8} />
        <circle cx={50} cy={53} r={2} fill={C.ink} opacity={0.8} />
      </g>
    )
  },
  anke: ({ color }) => (
    <g>
      <Shadow y={84} rx={42} />
      <path d="M8 70 L28 52 L92 52 L76 80 Z" fill={C.greyLight} {...L} />
      <path d="M24 66 L24 52 L36 42 L80 42 L80 56 L68 66 Z" fill={color ?? '#fbe28a'} {...L} />
      <path d="M24 52 L36 42 L80 42 L68 52 Z" fill="#fff0b8" {...L} />
      <path d="M68 52 L68 66 M68 52 L80 42" fill="none" {...L} />
      <path d="M40 46 Q48 40 56 46 Q50 50 44 48" fill="#fff6d2" {...T} />
    </g>
  ),
  ei: ({ color }) => (
    <g>
      <Shadow y={90} rx={22} />
      <path d="M50 12 C66 12 74 36 74 52 C74 64 64 70 50 70 C36 70 26 64 26 52 C26 36 34 12 50 12 Z" fill={C.cream} {...L} />
      <Hi x={40} y={32} rx={3.5} ry={7} a={20} />
      <path d="M24 56 L76 56 Q76 74 60 78 L64 86 Q50 90 36 86 L40 78 Q24 74 24 56 Z" fill={color ?? C.red} {...L} />
      <path d="M32 62 Q50 66 68 62" fill="none" stroke={HI} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  wasser: ({ color }) => (
    <g>
      <ellipse cx={50} cy={86} rx={34} ry={6} fill={color ?? C.water} opacity={0.45} {...T} />
      <path d="M50 10 C60 30 76 46 76 62 A26 26 0 0 1 24 62 C24 46 40 30 50 10 Z" fill={color ?? C.water} {...L} />
      <path d="M36 58 Q36 70 46 76" fill="none" stroke={HI} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      <path d="M16 70 Q12 76 16 79 Q20 76 16 70 Z" fill={color ?? C.water} {...T} />
      <path d="M84 66 Q80 72 84 75 Q88 72 84 66 Z" fill={color ?? C.water} {...T} />
    </g>
  ),
  suppe: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <Steam x={46} y={38} />
      <path d="M74 54 L88 22" {...line(7)} />
      <path d="M74 54 L88 22" stroke={C.greyLight} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M12 54 L88 54 Q86 84 50 86 Q14 84 12 54 Z" fill={color ?? C.blue} {...L} />
      <ellipse cx={50} cy={54} rx={38} ry={8} fill="#f2a03d" {...L} />
      <circle cx={36} cy={53} r={2.5} fill={C.green} />
      <circle cx={48} cy={56} r={2.2} fill={C.orange} stroke={C.ink} strokeWidth={0.8} />
      <circle cx={60} cy={52} r={2.4} fill={C.green} />
      <rect x={42} y={50} width={4} height={3} fill={C.cream} />
      <path d="M22 66 Q30 78 46 80" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
    </g>
  ),
  rys: ({ color }) => (
    <g>
      <Shadow y={88} rx={32} />
      <path d="M22 56 C22 34 78 34 78 56 Z" fill={C.white} {...L} />
      {[
        [34, 48, -30], [44, 42, 10], [56, 44, -20], [66, 50, 30], [40, 52, 60], [52, 51, 0], [60, 40, 40], [48, 36, -50], [30, 54, 20], [70, 54, -10],
      ].map(([x, y, a], i) => (
        <ellipse key={i} cx={x} cy={y} rx={2.6} ry={1.3} transform={`rotate(${a} ${x} ${y})`} fill={C.cream} {...line(0.9)} />
      ))}
      <path d="M14 56 L86 56 Q84 84 50 86 Q16 84 14 56 Z" fill={color ?? C.red} {...L} />
      <path d="M20 66 L80 66" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
      <path d="M30 74 L70 74" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  hoernli: ({ color }) => (
    <g>
      <Shadow y={84} rx={42} />
      <ellipse cx={50} cy={70} rx={42} ry={13} fill={color ?? C.white} {...L} />
      <ellipse cx={50} cy={69} rx={30} ry={8} fill="none" {...line(1.4)} opacity={0.4} />
      <Elbow x={32} y={62} a={-20} />
      <Elbow x={66} y={62} a={60} />
      <Elbow x={48} y={64} a={150} />
      <Elbow x={40} y={50} a={90} />
      <Elbow x={58} y={48} a={-60} />
      <Elbow x={50} y={38} a={200} />
      <Elbow x={26} y={70} a={120} s={0.9} />
      <Elbow x={74} y={72} a={-150} s={0.9} />
    </g>
  ),
  schoggi: ({ color }) => (
    <g>
      <Shadow y={90} rx={28} />
      <g transform="rotate(-12 50 50)">
        <rect x={28} y={8} width={44} height={80} rx={4} fill="#7a4524" {...L} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={32 + c * 19} y={12 + r * 15} width={17} height={13} rx={2} fill="#8f5530" {...T} />
          )),
        )}
        <path d="M34 15 L46 15" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        <path d="M26 58 L32 54 L38 58 L44 54 L50 58 L56 54 L62 58 L68 54 L74 58 L74 90 L26 90 Z" fill="#cfd5db" {...L} />
        <rect x={26} y={64} width={48} height={26} fill={color ?? C.purple} {...L} />
        <circle cx={50} cy={77} r={6} fill={C.white} {...T} />
        <path d="M47 77 L50 74 L53 77 L50 80 Z" fill={color ?? C.purple} />
      </g>
    </g>
  ),
  glace: ({ color }) => (
    <g>
      <path d="M32 52 L68 52 L50 94 Z" fill="#e2a85a" {...L} />
      <path d="M38 58 L58 80 M48 56 L64 66 M36 62 L46 80 M62 58 L44 82" fill="none" {...line(1.4)} opacity={0.55} />
      <circle cx={50} cy={46} r={18} fill={C.cream} {...L} />
      <path d="M32 50 Q36 58 40 52 Q44 60 48 52 Q52 60 58 52 Q62 58 68 50" fill="none" {...line(1.6)} />
      <path d="M33 30 C33 16 67 16 67 30 C70 34 66 40 60 38 Q56 44 50 38 Q44 44 40 38 C34 40 30 34 33 30 Z" fill={color ?? C.pink} {...L} />
      <Hi x={42} y={24} rx={4} ry={2.5} a={-20} />
      <circle cx={52} cy={12} r={5} fill={C.red} {...L} />
      <path d="M52 7 Q54 2 58 2" fill="none" {...line(1.8)} />
    </g>
  ),
  chueche: ({ color }) => (
    <g>
      <Shadow y={88} rx={38} />
      <path d="M16 52 L16 80 Q50 90 84 80 L84 52 Z" fill="#e6b06c" {...L} />
      <path d="M16 66 Q50 74 84 66" fill="none" stroke={C.cream} strokeWidth={4} />
      <path d="M16 66 Q50 74 84 66" fill="none" {...line(1.4)} opacity={0.5} />
      <path d="M16 52 Q16 44 50 44 Q84 44 84 52 L84 58 Q80 62 77 58 Q74 64 70 58 Q60 64 54 59 Q48 64 42 59 Q34 64 28 58 Q24 62 20 58 Q16 60 16 56 Z" fill={color ?? C.rose} {...L} />
      {[30, 50, 70].map((x) => (
        <g key={x}>
          <path d={`M${x} 52 C${x - 6} 46 ${x - 5} 40 ${x} 41 C${x + 5} 40 ${x + 6} 46 ${x} 52 Z`} fill={C.red} {...T} />
          <path d={`M${x - 3} 41 L${x} 38 L${x + 3} 41`} fill={C.green} {...line(1.2)} />
        </g>
      ))}
      <rect x={47} y={22} width={6} height={16} rx={2} fill={C.blue} {...T} />
      <g className="illu-wag" style={origin(50, 22)}>
        <path d="M50 10 Q56 17 50 21 Q44 17 50 10 Z" fill={C.yellow} {...T} />
      </g>
    </g>
  ),
  guetzli: ({ color }) => (
    <g>
      <Shadow y={86} rx={36} />
      <g transform="rotate(-10 68 44)">
        <path d="M68 22 L74 36 L89 37 L77 47 L81 62 L68 54 L55 62 L59 47 L47 37 L62 36 Z" fill="#e7b46a" {...L} />
        <circle cx={68} cy={44} r={4} fill={C.red} {...T} />
      </g>
      <circle cx={40} cy={62} r={26} fill={color ?? '#d9a05b'} {...L} />
      {[
        [30, 52], [46, 50], [52, 64], [34, 70], [42, 78], [26, 64], [56, 74],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={3} ry={2.4} fill="#5b3420" />
      ))}
      <Hi x={30} y={46} rx={5} ry={2.5} a={-30} />
    </g>
  ),
  konfi: ({ color }) => (
    <g>
      <Shadow y={90} rx={28} />
      <path d="M26 34 L74 34 L76 80 Q76 88 68 88 L32 88 Q24 88 24 80 Z" fill={color ?? '#c62a3d'} {...L} />
      <path d="M30 40 L30 78" stroke={HI} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
      <rect x={34} y={52} width={32} height={22} rx={4} fill={C.cream} {...L} />
      <path d="M50 70 C42 64 42 56 47 57 L50 59 L53 57 C58 56 58 64 50 70 Z" fill={C.red} {...T} />
      <path d="M48 57 L50 54 L52 57" fill={C.green} {...line(1)} />
      <path d="M18 30 Q22 16 50 16 Q78 16 82 30 L74 36 L26 36 Z" fill={C.white} {...L} />
      {[30, 42, 54, 66].map((x) => (
        <rect key={x} x={x} y={20} width={6} height={6} fill={C.red} />
      ))}
      {[24, 36, 48, 60, 72].map((x) => (
        <rect key={x} x={x} y={27} width={6} height={6} fill={C.red} />
      ))}
      <path d="M18 30 Q22 16 50 16 Q78 16 82 30 L74 36 L26 36 Z" fill="none" {...L} />
      <path d="M26 36 L74 36" {...line(4)} stroke={C.red} />
    </g>
  ),
  hung: ({ color }) => (
    <g>
      <Shadow y={90} rx={30} />
      <path d="M30 34 C14 40 14 84 32 88 L68 88 C86 84 86 40 70 34 Z" fill={color ?? '#f2a52b'} {...L} />
      <rect x={28} y={26} width={44} height={10} rx={4} fill={C.brown} {...L} />
      <path d="M32 36 Q34 46 38 42 Q40 50 44 40 L56 38 Q60 48 62 40 Q66 44 68 36 Z" fill="#f7c95a" {...T} />
      <ellipse cx={50} cy={64} rx={14} ry={11} fill={C.cream} {...L} />
      <ellipse cx={47} cy={59} rx={3} ry={4.5} transform="rotate(-25 47 59)" fill="#eaf6fc" {...line(1)} />
      <ellipse cx={53} cy={59} rx={3} ry={4.5} transform="rotate(25 53 59)" fill="#eaf6fc" {...line(1)} />
      <ellipse cx={50} cy={66} rx={8} ry={5} fill={C.yellow} {...line(1.4)} />
      <path d="M48 61.5 L48 70.5 M53 61.8 L53 70.2" stroke={C.ink} strokeWidth={2.2} />
      <circle cx={44} cy={65} r={1} fill={C.ink} />
      <path d="M24 50 Q22 66 28 78" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <path d="M72 34 L86 12" {...line(4)} />
      <path d="M68 20 C66 14 74 8 80 12 C86 16 84 26 76 26 C70 26 70 24 68 20 Z" fill="#c98a4b" {...L} />
      <path d="M70 17 L82 22 M71 21 L80 25" {...line(1.2)} />
    </g>
  ),
  tee: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <Steam x={22} y={40} n={2} gap={7} />
      <path d="M26 66 Q18 60 14 46 Q12 42 16 42 Q22 50 30 54" fill={color ?? C.green} {...L} />
      <path d="M70 48 Q90 48 86 64 Q84 72 72 74" fill="none" {...line(6.5)} />
      <path d="M70 48 Q90 48 86 64 Q84 72 72 74" fill="none" stroke={color ?? C.green} strokeWidth={3} strokeLinecap="round" />
      <path d="M50 34 C20 34 20 86 34 86 L66 86 C80 86 80 34 50 34 Z" fill={color ?? C.green} {...L} />
      <path d="M36 32 Q50 24 64 32 Z" fill={color ?? C.green} {...L} />
      <circle cx={50} cy={24} r={4} fill={C.yellow} {...L} />
      <path d="M30 60 Q50 66 70 60" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
      <circle cx={40} cy={70} r={2} fill={C.white} />
      <circle cx={50} cy={72} r={2} fill={C.white} />
      <circle cx={60} cy={70} r={2} fill={C.white} />
      <path d="M34 44 Q30 52 32 58" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  saft: ({ color }) => (
    <g>
      <Shadow y={90} rx={22} />
      <path d="M58 30 L70 6" {...line(6.5)} />
      <path d="M58 30 L70 6" stroke={C.red} strokeWidth={3} strokeLinecap="round" />
      <path d="M30 26 L70 26 L66 86 Q66 89 62 89 L38 89 Q34 89 34 86 Z" fill="#eaf6fc" {...L} />
      <path d="M31.5 40 L68.5 40 L66 86 Q66 89 62 89 L38 89 Q34 89 34 86 Z" fill={color ?? C.orange} {...L} />
      <path d="M38 46 L40 82" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <path d="M58 30 L56 44" {...line(6.5)} />
      <path d="M58 30 L56 44" stroke={C.red} strokeWidth={3} strokeLinecap="round" />
      <path d="M22 28 A12 12 0 0 1 46 28 Z" fill={C.orange} {...L} transform="rotate(-20 34 28)" />
      <path d="M26 26 A8 8 0 0 1 42 26 Z" fill="#ffd07a" transform="rotate(-20 34 28)" />
      <path d="M34 26 L34 19 M34 26 L29 21 M34 26 L39 21" {...line(1)} transform="rotate(-20 34 28)" />
    </g>
  ),
  mueesli: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <path d="M68 50 L86 24" {...line(7)} />
      <path d="M68 50 L86 24" stroke={C.greyLight} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M14 54 L86 54 Q84 84 50 86 Q16 84 14 54 Z" fill={color ?? C.yellow} {...L} />
      <ellipse cx={50} cy={54} rx={36} ry={9} fill={C.white} {...L} />
      {[
        [30, 53, '#d9a05b'], [40, 56, '#c98a4b'], [52, 51, '#d9a05b'], [62, 56, '#c98a4b'], [70, 52, '#d9a05b'], [46, 58, '#5b3420'], [58, 50, '#5b3420'],
      ].map(([x, y, f], i) => (
        <ellipse key={i} cx={x as number} cy={y as number} rx={3.4} ry={2} fill={f as string} {...line(0.8)} />
      ))}
      <circle cx={36} cy={50} r={3.2} fill={C.red} {...line(1)} />
      <circle cx={64} cy={58} r={3} fill={C.purple} {...line(1)} />
      <circle cx={50} cy={55} r={2.6} fill={C.blue} {...line(1)} />
      <path d="M22 66 Q30 78 46 80" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
    </g>
  ),
  wurscht: ({ color }) => (
    <g>
      <Shadow y={84} rx={38} />
      <path d="M14 66 Q50 26 86 66" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M14 66 Q50 26 86 66" fill="none" stroke={color ?? '#c9553c'} strokeWidth={17.6} strokeLinecap="round" />
      <path d="M22 58 Q50 30 78 58" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      <path d="M36 52 L42 44 M48 48 L52 40 M58 49 L62 42 M66 54 L70 46" {...line(1.6)} opacity={0.7} />
      <path d="M9 74 L6 79 M14 76 L13 81" {...line(2)} />
      <path d="M91 74 L94 79 M86 76 L87 81" {...line(2)} />
    </g>
  ),
  nuss: ({ color }) => (
    <g>
      <Shadow y={88} rx={38} />
      <path d="M34 34 C14 34 10 58 16 72 C22 86 46 88 54 74 C62 58 54 34 34 34 Z" fill={color ?? '#c9995e'} {...L} />
      <path d="M34 36 Q30 60 36 84" fill="none" {...line(1.8)} />
      <path d="M22 48 Q28 50 26 58 Q22 64 26 72 M44 46 Q40 54 46 60 Q50 66 44 74" fill="none" {...line(1.4)} opacity={0.6} />
      <circle cx={72} cy={70} r={14} fill="#a5622d" {...L} />
      <path d="M58 66 Q60 54 72 54 Q84 54 86 66 Q72 62 58 66 Z" fill="#e3c08a" {...L} />
      <path d="M72 54 L73 50" {...line(2.5)} />
      <Hi x={66} y={74} rx={2} ry={4} a={20} />
    </g>
  ),
  pilz: ({ color }) => (
    <g>
      <Shadow rx={26} />
      <path d="M38 52 Q34 74 36 86 Q50 92 64 86 Q66 74 62 52 Z" fill={C.cream} {...L} />
      <path d="M12 54 C12 26 34 14 50 14 C66 14 88 26 88 54 Q50 62 12 54 Z" fill={color ?? '#9a5a2c'} {...L} />
      <path d="M24 32 Q30 24 38 22" fill="none" stroke={HI} strokeWidth={3.5} strokeLinecap="round" opacity={0.45} />
      <Face x={50} y={70} s={0.8} />
    </g>
  ),

  /* ===== FOOD: meal scenes ===== */
  zmorge: () => (
    <g>
      <rect x={6} y={8} width={88} height={60} rx={10} fill="#fdeccf" />
      <Sun x={78} y={24} r={9} />
      <Table />
      <path d="M10 62 L42 62 Q41 79 26 80 Q11 79 10 62 Z" fill={C.blue} {...L} />
      <ellipse cx={26} cy={62} rx={16} ry={4} fill={C.white} {...L} />
      <circle cx={21} cy={61} r={1.8} fill={C.red} />
      <circle cx={28} cy={62} r={1.6} fill="#c98a4b" />
      <circle cx={33} cy={61} r={1.6} fill={C.purple} />
      <path d="M48 44 L62 44 L60 80 L50 80 Z" fill={C.white} {...L} />
      <path d="M48.6 50 L61.4 50" {...line(1.4)} />
      <Croissant x={79} y={72} s={0.38} />
    </g>
  ),
  zmittag: () => (
    <g>
      <rect x={6} y={8} width={88} height={60} rx={10} fill={C.sky} />
      <Sun x={50} y={24} r={10} />
      <Table />
      <ellipse cx={46} cy={74} rx={34} ry={8} fill={C.white} {...L} />
      <path d="M24 72 C24 58 68 58 68 72 Z" fill="#f6cf5a" {...L} />
      <Elbow x={34} y={66} a={-20} s={0.7} />
      <Elbow x={46} y={64} a={60} s={0.7} />
      <Elbow x={58} y={67} a={150} s={0.7} />
      <circle cx={45} cy={70} r={3} fill={C.red} {...line(1)} />
      <path d="M86 54 L86 80" {...line(5)} />
      <path d="M86 54 L86 80" stroke={C.greyLight} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M81 42 L81 52 Q86 58 91 52 L91 42 M86 42 L86 54" fill="none" {...line(2)} />
    </g>
  ),
  znacht: () => (
    <g>
      <rect x={6} y={8} width={88} height={60} rx={10} fill={C.navy} />
      <path d="M30 14 A12 12 0 1 0 42 32 A9 9 0 1 1 30 14 Z" fill={C.yellow} {...L} />
      <g className="illu-twinkle" style={origin(66, 22)}>
        <Star x={60} y={18} r={4} />
        <Star x={76} y={28} r={3} />
      </g>
      <Table />
      <Steam x={36} y={56} n={2} gap={8} />
      <path d="M12 62 L60 62 Q58 80 36 80 Q14 80 12 62 Z" fill={C.red} {...L} />
      <ellipse cx={36} cy={62} rx={24} ry={5} fill="#f2a03d" {...L} />
      <rect x={74} y={52} width={10} height={28} rx={2} fill={C.cream} {...L} />
      <path d="M79 52 L79 48" {...line(1.6)} />
      <g className="illu-wag" style={origin(79, 48)}>
        <path d="M79 34 Q86 43 79 48 Q72 43 79 34 Z" fill={C.yellow} {...L} />
        <path d="M79 40 Q82 44 79 46 Q76 44 79 40 Z" fill={C.orange} />
      </g>
      <rect x={70} y={78} width={18} height={4} rx={2} fill={C.greyLight} {...T} />
    </g>
  ),
  zvieri: () => (
    <g>
      <ClockFace x={50} y={30} r={20} hour={4} />
      <Table />
      <path d="M28 54 C24 50 12 52 12 66 C12 76 20 82 28 80 C36 82 44 76 44 66 C44 52 32 50 28 54 Z" fill={C.red} {...L} />
      <path d="M28 54 Q28 48 31 45" fill="none" {...line(2.5)} />
      <Leaf x={30} y={48} a={-20} s={0.6} />
      <Hi x={19} y={62} rx={2} ry={4} a={20} />
      <path d="M56 80 L56 62 Q50 61 50 54 Q50 46 60 46 L78 46 Q88 46 88 54 Q88 61 82 62 L82 80 Z" fill="#c98a4b" {...L} />
      <path d="M60 78 L60 60 Q55 59 55 54 Q55 50 62 50 L76 50 Q83 50 83 54 Q83 59 78 60 L78 78 Z" fill="#f5d9a4" />
    </g>
  ),

  /* ===== HOME ===== */
  huus: ({ color }) => (
    <g>
      <Shadow y={90} rx={42} />
      <rect x={64} y={18} width={9} height={18} fill={C.stone} {...L} />
      <rect x={22} y={46} width={56} height={44} fill={color ?? C.cream} {...L} />
      <path d="M8 52 L50 14 L92 52 L84 54 L50 24 L16 54 Z" fill={C.red} {...L} />
      <path d="M24 46 L50 24 L76 46" fill="none" stroke={C.brown} strokeWidth={1.2} opacity={0.5} />
      <circle cx={50} cy={38} r={5} fill={C.sky} {...T} />
      <path d="M45 66 Q45 60 51 60 Q57 60 57 66 L57 90 L45 90 Z" fill={C.brown} {...L} />
      <circle cx={54} cy={76} r={1.4} fill={C.yellow} />
      {[27, 63].map((x) => (
        <g key={x}>
          <rect x={x} y={54} width={11} height={11} fill={C.sky} {...T} />
          <path d={`M${x + 5.5} 54 L${x + 5.5} 65 M${x} 59.5 L${x + 11} 59.5`} {...line(1.2)} />
          <circle cx={x + 2} cy={66} r={2.4} fill={C.red} {...line(0.8)} />
          <circle cx={x + 5.5} cy={65} r={2.4} fill={C.rose} {...line(0.8)} />
          <circle cx={x + 9} cy={66} r={2.4} fill={C.red} {...line(0.8)} />
          <rect x={x - 1.5} y={67} width={14} height={4.5} rx={1} fill={C.brown} {...T} />
        </g>
      ))}
    </g>
  ),
  chuchi: ({ color }) => (
    <g>
      <rect x={6} y={8} width={88} height={82} rx={8} fill="#eef6f3" />
      <path d="M6 30 L94 30" stroke="#d5e7e1" strokeWidth={1} />
      <rect x={60} y={24} width={30} height={3.5} rx={1} fill={C.brown} {...T} />
      <rect x={63} y={13} width={8} height={11} rx={2} fill={C.red} {...T} />
      <rect x={75} y={15} width={8} height={9} rx={2} fill={C.yellow} {...T} />
      <Steam x={33} y={30} n={2} gap={8} />
      <rect x={12} y={50} width={46} height={40} rx={3} fill={C.white} {...L} />
      <rect x={18} y={60} width={34} height={22} rx={3} fill={C.navy} {...L} />
      <path d="M22 64 L30 64" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      <circle cx={20} cy={55} r={2} fill={C.ink} />
      <circle cx={28} cy={55} r={2} fill={C.ink} />
      <circle cx={44} cy={55} r={2} fill={C.ink} />
      <path d="M22 36 L44 36 L44 48 Q44 51 41 51 L25 51 Q22 51 22 48 Z" fill={color ?? C.red} {...L} />
      <path d="M20 36 L46 36" {...line(3)} />
      <path d="M14 40 L22 40 M44 40 L52 40" {...line(3)} />
      <rect x={30} y={31} width={6} height={4} rx={1.5} fill={C.ink} />
      <rect x={60} y={58} width={30} height={32} rx={2} fill="#d9a05b" {...L} />
      <rect x={58} y={52} width={34} height={6} rx={1.5} fill={C.stone} {...L} />
      <path d="M75 62 L75 88" {...line(1.6)} />
      <path d="M70 70 L70 76 M80 70 L80 76" {...line(2.4)} />
    </g>
  ),
  zimmer: ({ color }) => (
    <g>
      <rect x={6} y={8} width={88} height={64} rx={6} fill={color ?? '#fbe7c6'} {...L} />
      <path d="M6 72 L94 72 L94 86 Q94 90 90 90 L10 90 Q6 90 6 86 Z" fill="#c98a4b" {...L} />
      <path d="M20 80 L34 80 M50 84 L66 84 M76 78 L88 78" stroke="#a96d36" strokeWidth={1.4} strokeLinecap="round" />
      <rect x={14} y={18} width={26} height={24} rx={2} fill={C.sky} {...L} />
      <path d="M27 18 L27 42 M14 30 L40 30" {...line(1.6)} />
      <path d="M12 16 Q16 30 12 46 L18 46 Q20 30 18 16 Z" fill={C.red} {...T} />
      <path d="M42 16 Q38 30 42 46 L36 46 Q34 30 36 16 Z" fill={C.red} {...T} />
      <path d="M10 16 L44 16" {...line(2.4)} />
      <rect x={58} y={18} width={20} height={15} fill={C.white} {...L} />
      <path d="M60 31 L66 24 L70 28 L73 25 L76 31 Z" fill={C.green} {...line(1)} />
      <circle cx={72} cy={22} r={2} fill={C.yellow} />
      <path d="M50 64 L50 50 M44 50 L56 50 L60 40 L40 40 Z" fill={C.yellow} {...L} />
      <rect x={44} y={64} width={12} height={4} rx={1} fill={C.brown} {...T} />
      <ellipse cx={50} cy={82} rx={28} ry={5} fill={C.blue} {...L} />
      <rect x={70} y={56} width={14} height={14} rx={2} fill={C.green} {...L} />
      <rect x={73} y={44} width={12} height={12} rx={2} fill={C.orange} {...L} />
      <circle cx={22} cy={64} r={6} fill={C.red} {...L} />
      <path d="M16 64 L28 64" stroke={C.white} strokeWidth={2} />
    </g>
  ),
  garte: ({ color }) => (
    <g>
      <rect x={6} y={8} width={88} height={78} rx={8} fill={C.sky} />
      <Sun x={82} y={20} r={6} />
      <path d="M6 64 L94 64 L94 82 Q94 90 86 90 L14 90 Q6 90 6 82 Z" fill={C.leaf} {...L} />
      {[12, 24, 36, 48, 60, 72, 84].map((x) => (
        <path key={x} d={`M${x - 4} 66 L${x - 4} 42 L${x} 37 L${x + 4} 42 L${x + 4} 66 Z`} fill={C.white} {...line(1.8)} />
      ))}
      <rect x={6} y={46} width={88} height={4} fill={C.white} {...line(1.6)} />
      <rect x={6} y={58} width={88} height={4} fill={C.white} {...line(1.6)} />
      <circle cx={74} cy={50} r={14} fill={C.green} {...L} />
      <circle cx={64} cy={58} r={10} fill={C.green} {...L} />
      <circle cx={70} cy={46} r={1.8} fill={C.red} />
      <circle cx={78} cy={54} r={1.8} fill={C.red} />
      {[
        [18, C.red], [32, C.yellow], [46, color ?? C.purple],
      ].map(([x, f]) => (
        <g key={x as number}>
          <path d={`M${x} 82 L${x} 64`} {...line(2.4)} stroke={C.greenDark} />
          <Leaf x={x as number} y={76} a={-30} s={0.5} />
          <g className="illu-wag" style={origin(x as number, 64)}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={(x as number) + Math.cos((a * Math.PI) / 180) * 5} cy={62 + Math.sin((a * Math.PI) / 180) * 5} r={3.6} fill={f as string} {...line(1.2)} />
            ))}
            <circle cx={x as number} cy={62} r={2.6} fill={C.orange} {...line(1.2)} />
          </g>
        </g>
      ))}
    </g>
  ),
  bett: ({ color }) => (
    <g>
      <Shadow y={90} rx={42} />
      <rect x={8} y={30} width={10} height={60} rx={3} fill="#b9773d" {...L} />
      <rect x={82} y={50} width={10} height={40} rx={3} fill="#b9773d" {...L} />
      <circle cx={13} cy={26} r={5} fill="#b9773d" {...L} />
      <circle cx={87} cy={46} r={5} fill="#b9773d" {...L} />
      <rect x={16} y={62} width={68} height={12} rx={2} fill={C.white} {...L} />
      <path d="M18 54 Q18 44 30 45 Q42 44 42 54 Q42 62 30 62 Q18 63 18 54 Z" fill={C.white} {...L} />
      <path d="M24 50 Q28 48 32 48" stroke={C.sky} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M40 58 Q40 52 46 52 L84 52 L84 80 Q84 82 82 82 L42 82 Q40 82 40 80 Z" fill={color ?? C.blue} {...L} />
      <path d="M40 58 Q40 52 46 52 L54 52 L54 82 L42 82 Q40 82 40 80 Z" fill={C.white} opacity={0.35} />
      <path d="M54 52 L54 82" {...line(1.6)} />
      {[[62, 60], [74, 60], [68, 70], [62, 78], [76, 76]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.4} fill={C.white} opacity={0.85} />
      ))}
    </g>
  ),
  tisch: ({ color }) => {
    const c = color ?? '#c98a4b'
    return (
      <g>
        <Shadow y={90} rx={40} />
        <rect x={18} y={48} width={7} height={42} rx={2} fill={c} {...L} />
        <rect x={75} y={48} width={7} height={42} rx={2} fill={c} {...L} />
        <rect x={28} y={48} width={6} height={32} rx={2} fill="#a96d36" {...L} />
        <rect x={66} y={48} width={6} height={32} rx={2} fill="#a96d36" {...L} />
        <path d="M22 34 L78 34 L92 46 L8 46 Z" fill="#e2b07a" {...L} />
        <rect x={8} y={46} width={84} height={8} rx={2} fill={c} {...L} />
        <path d="M30 38 L50 38" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </g>
    )
  },
  stueu: ({ color }) => {
    const c = color ?? '#c98a4b'
    return (
      <g>
        <Shadow y={90} rx={28} />
        <rect x={26} y={10} width={8} height={80} rx={3} fill={c} {...L} />
        <rect x={66} y={10} width={8} height={80} rx={3} fill={c} {...L} />
        <rect x={24} y={14} width={52} height={10} rx={4} fill={c} {...L} />
        <rect x={38} y={24} width={5} height={30} fill={c} {...T} />
        <rect x={57} y={24} width={5} height={30} fill={c} {...T} />
        <rect x={20} y={54} width={60} height={9} rx={3} fill="#e2b07a" {...L} />
        <path d="M34 74 L66 74" {...line(4)} />
        <path d="M34 74 L66 74" stroke={c} strokeWidth={1.8} />
      </g>
    )
  },
  tuer: ({ color }) => (
    <g>
      <rect x={22} y={8} width={56} height={84} rx={3} fill={C.stone} {...L} />
      <rect x={28} y={14} width={44} height={78} rx={2} fill={color ?? C.green} {...L} />
      <rect x={34} y={22} width={32} height={26} rx={2} fill="none" {...line(1.8)} />
      <rect x={34} y={56} width={32} height={28} rx={2} fill="none" {...line(1.8)} />
      <circle cx={50} cy={35} r={7} fill={C.sky} {...T} />
      <circle cx={64} cy={52} r={3.2} fill={C.yellow} {...T} />
      <rect x={20} y={88} width={60} height={5} rx={2} fill={C.brown} {...T} />
    </g>
  ),
  faenschter: ({ color }) => (
    <g>
      <rect x={20} y={12} width={60} height={66} rx={3} fill={color ?? C.white} {...L} />
      <rect x={26} y={18} width={48} height={54} fill={C.sky} {...T} />
      <path d="M36 34 Q36 28 42 28 Q44 22 50 24 Q56 22 58 28 Q63 28 62 34 Z" fill={C.white} {...line(1.2)} />
      <path d="M50 18 L50 72 M26 45 L74 45" {...line(3)} />
      <path d="M30 22 L38 22" stroke={HI} strokeWidth={2} strokeLinecap="round" />
      <path d="M12 8 L88 8" {...line(3)} />
      <path d="M14 8 Q24 30 16 60 L10 60 Q12 30 8 8 Z" fill={C.red} {...T} />
      <path d="M86 8 Q76 30 84 60 L90 60 Q88 30 92 8 Z" fill={C.red} {...T} />
      <rect x={14} y={78} width={72} height={6} rx={2} fill={C.brown} {...L} />
      <path d="M44 78 L46 70 L54 70 L56 78 Z" fill={C.orange} {...T} />
      <circle cx={50} cy={64} r={4} fill={C.rose} {...line(1.2)} />
      <circle cx={50} cy={64} r={1.6} fill={C.yellow} />
    </g>
  ),
  lampe: ({ color }) => (
    <g>
      <Shadow y={90} rx={22} />
      <g className="illu-twinkle" style={origin(50, 48)}>
        <path d="M24 56 L16 66 M76 56 L84 66 M50 60 L50 64" {...line(2)} stroke={C.yellow} />
      </g>
      <rect x={47} y={46} width={6} height={38} fill={C.inkSoft} {...T} />
      <ellipse cx={50} cy={86} rx={18} ry={5} fill={C.inkSoft} {...L} />
      <path d="M34 14 L66 14 L80 50 L20 50 Z" fill={color ?? C.yellow} {...L} />
      <path d="M38 20 L30 44" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <g className="illu-wag" style={origin(64, 50)}>
        <path d="M64 50 L64 60" {...line(1.4)} />
        <circle cx={64} cy={62} r={2.2} fill={C.yellow} {...line(1.2)} />
      </g>
    </g>
  ),
  tasse: ({ color }) => (
    <g>
      <Shadow y={88} rx={36} />
      <Steam x={44} y={36} />
      <ellipse cx={46} cy={82} rx={36} ry={7} fill={C.white} {...L} />
      <path d="M70 50 Q88 50 86 64 Q84 74 68 74" fill="none" {...line(8)} />
      <path d="M70 50 Q88 50 86 64 Q84 74 68 74" fill="none" stroke={color ?? C.red} strokeWidth={4} strokeLinecap="round" />
      <path d="M20 42 L72 42 L68 74 Q66 84 56 84 L36 84 Q26 84 24 74 Z" fill={color ?? C.red} {...L} />
      <ellipse cx={46} cy={42} rx={26} ry={5} fill="#8a5428" {...L} />
      <path d="M28 52 L31 72" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <circle cx={48} cy={62} r={5} fill={C.white} opacity={0.85} />
    </g>
  ),
  taeller: ({ color }) => (
    <g>
      <Shadow y={80} rx={42} />
      <ellipse cx={50} cy={62} rx={42} ry={18} fill={C.white} {...L} />
      <ellipse cx={50} cy={62} rx={28} ry={11} fill={C.cream} {...line(1.6)} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * 36 * Math.PI) / 180
        return <circle key={i} cx={50 + Math.cos(a) * 35} cy={62 + Math.sin(a) * 14.5} r={2} fill={color ?? C.blue} />
      })}
      <path d="M32 56 Q40 53 50 53" fill="none" stroke={HI} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ),
  loeffu: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <g transform="rotate(40 50 50)">
        <rect x={46} y={42} width={8} height={52} rx={4} fill={color ?? C.greyLight} {...L} />
        <ellipse cx={50} cy={26} rx={14} ry={19} fill={color ?? C.greyLight} {...L} />
        <ellipse cx={50} cy={27} rx={9} ry={13} fill="#c4cacf" />
        <ellipse cx={46} cy={22} rx={2.5} ry={6} fill={HI} opacity={0.8} />
      </g>
    </g>
  ),
  gable: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <g transform="rotate(40 50 50)">
        <rect x={46} y={44} width={8} height={50} rx={4} fill={color ?? C.greyLight} {...L} />
        <path d="M36 8 L36 30 Q36 46 50 46 Q64 46 64 30 L64 8 L60 8 L60 28 L56 28 L56 8 L52 8 L52 28 L48 28 L48 8 L44 8 L44 28 L40 28 L40 8 Z" fill={color ?? C.greyLight} {...L} />
        <path d="M40 34 Q42 42 50 42" fill="none" stroke={HI} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </g>
  ),
  glas: ({ color }) => (
    <g>
      <Shadow y={90} rx={24} />
      <path d="M28 14 L72 14 L66 86 Q66 89 62 89 L38 89 Q34 89 34 86 Z" fill="#eef8fd" {...L} />
      <path d="M30.5 42 L69.5 42 L66 86 Q66 89 62 89 L38 89 Q34 89 34 86 Z" fill={color ?? C.water} {...L} />
      <ellipse cx={50} cy={42} rx={19.5} ry={3} fill={color ?? C.water} {...line(1.6)} />
      <path d="M36 22 L40 80" stroke={HI} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <circle cx={56} cy={66} r={2.4} fill={HI} opacity={0.7} />
      <circle cx={60} cy={56} r={1.6} fill={HI} opacity={0.7} />
    </g>
  ),
  badwanne: ({ color }) => (
    <g>
      <Shadow y={90} rx={40} />
      <path d="M84 30 L84 18 Q84 12 78 12 L70 12" fill="none" {...line(5)} />
      <path d="M84 30 L84 18 Q84 12 78 12 L70 12" fill="none" stroke={C.greyLight} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M70 8 L70 16" {...line(4)} />
      {[[24, 44, 8], [36, 40, 9], [50, 42, 8], [62, 40, 8], [74, 44, 7]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={C.white} {...line(1.6)} />
      ))}
      <g className="illu-bob" style={origin(60, 38)}>
        <ellipse cx={60} cy={40} rx={9} ry={5} fill={C.yellow} {...line(1.6)} />
        <circle cx={55} cy={33} r={5} fill={C.yellow} {...line(1.6)} />
        <path d="M50 33 L46 34 L50 35.5 Z" fill={C.orange} {...line(1)} />
        <circle cx={54} cy={31.5} r={1} fill={C.ink} />
      </g>
      <path d="M10 46 L90 46 L86 70 Q82 80 68 80 L32 80 Q18 80 14 70 Z" fill={color ?? C.white} {...L} />
      <rect x={8} y={44} width={84} height={6} rx={3} fill={color ?? C.white} {...L} />
      <path d="M22 58 Q26 70 36 72" fill="none" stroke={C.sky} strokeWidth={3} strokeLinecap="round" />
      <path d="M24 80 L20 88 M76 80 L80 88" {...line(4)} />
      <circle cx={20} cy={88} r={2.6} fill={C.ink} />
      <circle cx={80} cy={88} r={2.6} fill={C.ink} />
    </g>
  ),
  zahbuerschte: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <g transform="rotate(-30 50 50)">
        <rect x={6} y={50} width={60} height={9} rx={4.5} fill={color ?? C.blue} {...L} />
        <rect x={64} y={52} width={30} height={6} rx={3} fill={color ?? C.blue} {...L} />
        <rect x={68} y={40} width={24} height={12} rx={2} fill={C.white} {...L} />
        <path d="M72 41 L72 51 M76 41 L76 51 M80 41 L80 51 M84 41 L84 51 M88 41 L88 51" {...line(1)} />
        <path d="M68 40 Q66 30 76 32 Q78 24 86 28 Q94 28 92 40 Z" fill={C.white} {...L} />
        <path d="M72 36 Q80 30 88 36" fill="none" stroke={C.sky} strokeWidth={3} strokeLinecap="round" />
        <path d="M12 53 L50 53" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </g>
    </g>
  ),
  seife: ({ color }) => (
    <g>
      <Shadow y={88} rx={38} />
      <path d="M12 74 L88 74 Q86 86 74 86 L26 86 Q14 86 12 74 Z" fill={C.sky} {...L} />
      <rect x={22} y={54} width={56} height={24} rx={11} fill={color ?? C.rose} {...L} />
      <path d="M30 60 Q40 57 54 58" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <g className="illu-bob" style={origin(50, 30)}>
        {[[34, 40, 8], [56, 30, 11], [74, 44, 6], [44, 20, 5], [70, 16, 4]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#eaf6fc" {...line(1.6)} />
            <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill={HI} />
          </g>
        ))}
      </g>
    </g>
  ),
  handtuech: ({ color }) => {
    const c = color ?? C.orange
    return (
      <g>
        <rect x={10} y={14} width={80} height={6} rx={3} fill={C.greyLight} {...L} />
        <circle cx={12} cy={17} r={4} fill={C.stone} {...L} />
        <circle cx={88} cy={17} r={4} fill={C.stone} {...L} />
        <path d="M28 18 L72 18 L72 82 L28 82 Z" fill={c} {...L} />
        <path d="M28 18 Q24 22 28 30 L28 18" fill={c} {...L} />
        <path d="M30 66 L70 66 M30 72 L70 72" stroke={C.white} strokeWidth={3} />
        <path d="M30 26 L30 60" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        {[32, 38, 44, 50, 56, 62, 68].map((x) => (
          <path key={x} d={`M${x} 82 L${x} 88`} {...line(1.6)} />
        ))}
      </g>
    )
  },
  chuessi: ({ color }) => (
    <g>
      <Shadow y={86} rx={38} />
      <path d="M12 26 Q30 32 50 28 Q70 32 88 26 Q82 50 88 78 Q70 72 50 76 Q30 72 12 78 Q18 50 12 26 Z" fill={color ?? C.rose} {...L} />
      <path d="M22 34 Q50 40 78 34 Q74 52 78 70 Q50 64 22 70 Q26 52 22 34 Z" fill="none" stroke={C.ink} strokeWidth={1.4} strokeDasharray="3 3" opacity={0.5} />
      <path d="M50 62 C38 54 38 44 45 45 L50 49 L55 45 C62 44 62 54 50 62 Z" fill={C.red} {...T} />
      <path d="M26 38 Q24 48 26 56" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  decki: ({ color }) => {
    const c = color ?? C.blue
    return (
      <g>
        <Shadow y={86} rx={42} />
        <path d="M14 30 L84 30 L84 78 L14 78 Q6 78 6 70 L6 38 Q6 30 14 30 Z" fill={c} {...L} />
        {[0, 1, 2, 3].map((col) =>
          [0, 1, 2].map((row) =>
            (col + row) % 2 === 0 ? <rect key={`${col}${row}`} x={18 + col * 16.5} y={30 + row * 16} width={16.5} height={16} fill={C.yellow} opacity={0.8} /> : null,
          ),
        )}
        <path d="M14 30 L84 30 L84 78 L14 78" fill="none" {...L} />
        <path d="M14 30 Q6 30 6 38 L6 70 Q6 78 14 78 Q22 78 22 70 L22 38 Q22 30 14 30 Z" fill={c} {...L} />
        <path d="M14 34 Q10 34 10 40 L10 60" fill="none" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
        {[32, 38, 44, 50, 56, 62, 68, 74].map((y) => (
          <path key={y} d={`M84 ${y} L90 ${y}`} {...line(1.6)} />
        ))}
      </g>
    )
  },
  uhr: ({ color }) => (
    <g>
      <Shadow y={90} rx={26} />
      <path d="M30 82 L24 90 M70 82 L76 90" {...line(4)} />
      <path d="M18 26 A12 12 0 0 1 36 14 Z" fill={C.yellow} {...L} />
      <path d="M82 26 A12 12 0 0 0 64 14 Z" fill={C.yellow} {...L} />
      <path d="M50 22 L50 16" {...line(3)} />
      <circle cx={50} cy={56} r={32} fill={color ?? C.red} {...L} />
      <ClockFace x={50} y={56} r={25} hour={10} spin fill={C.white} />
    </g>
  ),
  schluessu: ({ color }) => (
    <g>
      <Shadow y={88} rx={34} />
      <g transform="rotate(-35 50 50)">
        <path d="M44 46 L94 46 L94 54 L88 54 L88 62 L82 62 L82 54 L76 54 L76 60 L70 60 L70 54 L44 54 Z" fill={color ?? C.yellow} {...L} />
        <circle cx={28} cy={50} r={18} fill={color ?? C.yellow} {...L} />
        <circle cx={28} cy={50} r={7} fill={C.white} {...L} />
        <path d="M18 40 Q22 36 28 36" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
        <path d="M50 49 L86 49" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </g>
    </g>
  ),
  sofa: ({ color }) => {
    const c = color ?? C.green
    return (
      <g>
        <Shadow y={90} rx={42} />
        <path d="M18 70 L16 86 M82 70 L84 86" {...line(4)} />
        <rect x={16} y={28} width={68} height={34} rx={8} fill={c} {...L} />
        <rect x={20} y={54} width={30} height={16} rx={5} fill={c} {...L} />
        <rect x={50} y={54} width={30} height={16} rx={5} fill={c} {...L} />
        <rect x={6} y={44} width={16} height={34} rx={7} fill={c} {...L} />
        <rect x={78} y={44} width={16} height={34} rx={7} fill={c} {...L} />
        <rect x={20} y={70} width={60} height={8} rx={2} fill={c} {...L} />
        <g transform="rotate(-12 33 46)">
          <rect x={25} y={38} width={16} height={16} rx={4} fill={C.yellow} {...L} />
          <circle cx={33} cy={46} r={1.6} fill={C.ink} />
        </g>
        <path d="M22 34 L40 34" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
      </g>
    )
  },
  chaschte: ({ color }) => {
    const c = color ?? '#c98a4b'
    return (
      <g>
        <Shadow y={92} rx={34} />
        <path d="M24 88 L24 92 M76 88 L76 92" {...line(4)} />
        <rect x={20} y={14} width={60} height={76} rx={3} fill={c} {...L} />
        <rect x={16} y={8} width={68} height={8} rx={2} fill={c} {...L} />
        <rect x={25} y={20} width={24} height={50} rx={2} fill="none" {...line(1.8)} />
        <rect x={51} y={20} width={24} height={50} rx={2} fill="none" {...line(1.8)} />
        <rect x={25} y={74} width={50} height={12} rx={2} fill="none" {...line(1.8)} />
        <circle cx={45} cy={46} r={2.4} fill={C.yellow} {...T} />
        <circle cx={55} cy={46} r={2.4} fill={C.yellow} {...T} />
        <rect x={44} y={78} width={12} height={4} rx={2} fill={C.yellow} {...T} />
        <path d="M29 26 L29 62" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.4} />
      </g>
    )
  },
  chueeuschrank: ({ color }) => (
    <g>
      <Shadow y={92} rx={28} />
      <rect x={24} y={6} width={52} height={86} rx={8} fill={color ?? C.white} {...L} />
      <path d="M24 34 L76 34" {...L} />
      <rect x={30} y={16} width={4} height={12} rx={2} fill={C.greyLight} {...T} />
      <rect x={30} y={42} width={4} height={24} rx={2} fill={C.greyLight} {...T} />
      <path d="M68 12 L68 28" stroke={C.sky} strokeWidth={3} strokeLinecap="round" />
      <path d="M68 40 L68 84" stroke={C.sky} strokeWidth={3} strokeLinecap="round" />
      <circle cx={52} cy={50} r={4} fill={C.red} {...T} />
      <Star x={58} y={68} r={5} fill={C.yellow} />
      <rect x={44} y={20} width={10} height={7} rx={1} fill={C.green} {...line(1.2)} />
    </g>
  ),
  telefon: ({ color }) => {
    const c = color ?? C.red
    return (
      <g>
        <Shadow y={88} rx={36} />
        <path d="M70 70 Q90 72 86 84 Q82 92 92 92" fill="none" {...line(1.8)} />
        <path d="M18 84 L26 50 L74 50 L82 84 Z" fill={c} {...L} />
        <rect x={34} y={58} width={32} height={22} rx={3} fill={C.cream} {...L} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((k) => <circle key={`${r}${k}`} cx={42 + k * 8} cy={63 + r * 6} r={2} fill={C.ink} />),
        )}
        <g className="illu-wag" style={origin(50, 34)}>
          <path d="M14 42 Q12 28 24 28 L76 28 Q88 28 86 42 L74 44 Q72 38 66 38 L34 38 Q28 38 26 44 Z" fill={c} {...L} />
          <path d="M28 32 L48 32" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
        </g>
        <path d="M8 22 Q4 30 8 38 M92 22 Q96 30 92 38" fill="none" {...line(2)} opacity={0.6} />
      </g>
    )
  },
  staege: ({ color }) => {
    const c = color ?? '#c98a4b'
    return (
      <g>
        <Shadow y={90} rx={42} />
        <path d="M10 90 L10 76 L26 76 L26 62 L42 62 L42 48 L58 48 L58 34 L74 34 L74 20 L90 20 L90 90 Z" fill={c} {...L} />
        {[[10, 76], [26, 62], [42, 48], [58, 34], [74, 20]].map(([x, y]) => (
          <path key={x} d={`M${x} ${y} L${x + 16} ${y}`} stroke="#e2b07a" strokeWidth={3} strokeLinecap="round" />
        ))}
        <path d="M14 56 L80 2" fill="none" {...line(5)} />
        <path d="M14 56 L80 2" fill="none" stroke={C.red} strokeWidth={2.4} strokeLinecap="round" />
        {[[18, 76, 52.7], [34, 62, 39.6], [50, 48, 26.5], [66, 34, 13.4]].map(([x, y, t]) => (
          <path key={x} d={`M${x} ${y} L${x} ${t}`} {...line(2.4)} />
        ))}
      </g>
    )
  },

  /* ===== CLOTHES ===== */
  tshirt: ({ color }) => (
    <g>
      <path d={shirtPath(false)} fill={color ?? C.blue} {...L} />
      <path d="M42 14 Q50 23 58 14" fill="none" {...line(3.5)} />
      <path d="M20 47 L10 34 M80 47 L90 34" fill="none" {...L} />
      <path d="M33 30 L33 50" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
      <Star x={50} y={50} r={11} />
    </g>
  ),
  hose: ({ color }) => (
    <g>
      <path d="M28 12 L72 12 L82 88 L58 88 L50 40 L42 88 L18 88 Z" fill={color ?? '#4f7cc4'} {...L} />
      <rect x={28} y={12} width={44} height={9} fill={color ?? '#4f7cc4'} {...L} />
      <path d="M50 21 L50 40" {...line(1.6)} />
      <path d="M32 21 Q36 30 30 34 M68 21 Q64 30 70 34" fill="none" {...line(1.6)} />
      <path d="M20 80 L42 80 M58 80 L80 80" {...line(1.6)} />
      <rect x={35} y={10} width={3} height={12} rx={1} fill={C.white} opacity={0.7} />
      <rect x={62} y={10} width={3} height={12} rx={1} fill={C.white} opacity={0.7} />
      <circle cx={50} cy={16.5} r={2} fill={C.yellow} {...line(1)} />
    </g>
  ),
  schue: ({ color }) => {
    const c = color ?? C.red
    const shoe = (dx: number, dy: number, shade: boolean) => (
      <g transform={`translate(${dx} ${dy})`}>
        <path d="M14 66 L14 46 Q14 40 22 40 L32 40 Q36 50 46 52 L66 56 Q80 58 82 68 L82 70 L14 70 Z" fill={c} {...L} />
        {shade && <path d="M14 66 L14 46 Q14 40 22 40 L32 40 Q36 50 46 52 L66 56 Q80 58 82 68 L82 70 L14 70 Z" fill={C.ink} opacity={0.18} />}
        <rect x={12} y={68} width={72} height={8} rx={4} fill={C.white} {...L} />
        <path d="M38 48 L44 44 M44 51 L50 46 M50 53 L56 48" {...line(2)} stroke={C.white} />
        <path d="M60 60 Q72 60 78 66" fill="none" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.4} />
      </g>
    )
    return (
      <g>
        <Shadow y={88} rx={44} />
        {shoe(8, -14, true)}
        {shoe(-4, 8, false)}
      </g>
    )
  },
  socke: ({ color }) => {
    const c = color ?? C.green
    const sock = (dx: number, dy: number, shade: boolean) => (
      <g transform={`translate(${dx} ${dy})`}>
        <path d="M24 8 L48 8 L48 50 L66 60 Q76 66 70 76 Q64 84 54 78 L28 64 Q22 60 24 52 Z" fill={c} {...L} />
        <rect x={24} y={8} width={24} height={10} fill={C.white} {...L} />
        <path d="M24 13 L48 13" {...line(1.2)} />
        <path d="M24 28 L48 28 M24 36 L48 36" stroke={C.yellow} strokeWidth={4} />
        <path d="M56 68 Q66 64 70 76 Q64 84 54 78 Z" fill={C.yellow} {...line(1.6)} />
        <path d="M24 52 Q22 60 28 64 L34 67 Q36 58 30 52 Z" fill={C.yellow} {...line(1.6)} />
        {shade && <path d="M24 8 L48 8 L48 50 L66 60 Q76 66 70 76 Q64 84 54 78 L28 64 Q22 60 24 52 Z" fill={C.ink} opacity={0.15} />}
      </g>
    )
    return (
      <g>
        <Shadow y={90} rx={36} />
        {sock(18, -2, true)}
        {sock(-6, 8, false)}
      </g>
    )
  },
  chappe: ({ color }) => {
    const c = color ?? C.red
    return (
      <g>
        <Shadow y={88} rx={36} />
        <path d="M18 70 C16 36 32 22 50 22 C68 22 84 36 82 70 Z" fill={c} {...L} />
        <path d="M34 30 Q28 40 28 56" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        <path d="M24 50 L76 50" stroke={C.white} strokeWidth={4} strokeLinecap="round" />
        <rect x={14} y={64} width={72} height={18} rx={6} fill={c} {...L} />
        {[22, 30, 38, 46, 54, 62, 70, 78].map((x) => (
          <path key={x} d={`M${x} 67 L${x} 79`} {...line(1.4)} opacity={0.5} />
        ))}
        <g className="illu-bob" style={origin(50, 20)}>
          {[0, 45, 90, 135].map((a) => (
            <ellipse key={a} cx={50} cy={16} rx={10} ry={3.5} transform={`rotate(${a} 50 16)`} fill={C.white} {...line(1.4)} />
          ))}
          <circle cx={50} cy={16} r={6} fill={C.white} />
        </g>
      </g>
    )
  },
  jagge: ({ color }) => {
    const c = color ?? C.orange
    return (
      <g>
        <path d={shirtPath(true)} fill={c} {...L} />
        <path d="M42 13 L50 28 L58 13" fill={C.ink} opacity={0.2} />
        <path d="M36 14 L50 32 L64 14 L58 12 L50 22 L42 12 Z" fill={c} {...L} />
        <path d="M50 30 L50 88" {...line(2.6)} />
        <path d="M48 36 L52 36 M48 44 L52 44 M48 52 L52 52 M48 60 L52 60 M48 68 L52 68 M48 76 L52 76" {...line(1.2)} />
        <rect x={47} y={30} width={6} height={8} rx={2} fill={C.greyLight} {...T} />
        <path d="M32 64 L44 64 L44 74 L32 74 Z M56 64 L68 64 L68 74 L56 74 Z" fill={c} {...line(1.8)} />
        <path d="M8 78 L20 80" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M92 78 L80 80" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M74 42 L80 80 M26 42 L20 80" fill="none" {...line(1.6)} />
      </g>
    )
  },
  schau: ({ color }) => {
    const c = color ?? C.red
    return (
      <g>
        <path d="M54 44 L66 86 L54 89 L44 48 Z" fill={c} {...L} />
        <path d="M49 60 L59 57 M53 74 L63 71" stroke={C.white} strokeWidth={4} />
        <path d="M54 89 L52 94 M58 88 L57 94 M62 87 L62 93 M66 86 L67 92" {...line(1.6)} />
        <path d="M20 30 Q50 46 80 30 Q84 40 78 46 Q50 60 22 46 Q16 40 20 30 Z" fill={c} {...L} />
        <path d="M22 18 Q50 32 78 18 Q84 26 80 32 Q50 46 20 32 Q16 26 22 18 Z" fill={c} {...L} />
        <path d="M36 26 L36 40 M64 26 L64 40" stroke={C.white} strokeWidth={4} />
        <path d="M44 50 L34 82 L46 85 L54 52 Z" fill={c} {...L} />
        <path d="M40 62 L50 65 M36 74 L46 77" stroke={C.white} strokeWidth={4} />
        <path d="M34 82 L32 88 M38 83 L37 89 M42 84 L42 90 M46 85 L47 91" {...line(1.6)} />
      </g>
    )
  },
  haendsche: ({ color }) => {
    const c = color ?? C.purple
    const mitt = (dx: number, flip: boolean) => (
      <g transform={`translate(${dx} 0) ${flip ? 'translate(100 0) scale(-1 1)' : ''}`}>
        <path d="M20 66 L18 40 Q16 18 30 16 Q44 14 44 36 L44 46 Q50 38 54 44 Q56 50 46 60 L44 66 Z" fill={c} {...L} />
        <rect x={16} y={64} width={32} height={16} rx={4} fill={C.white} {...L} />
        <path d="M22 66 L22 78 M28 66 L28 78 M34 66 L34 78 M40 66 L40 78" {...line(1.2)} opacity={0.5} />
        <path d="M24 26 Q22 34 24 44" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        <Star x={30} y={46} r={5} fill={C.white} />
      </g>
    )
    return (
      <g>
        <Shadow y={88} rx={40} />
        <path d="M32 80 Q50 96 68 80" fill="none" {...line(1.6)} />
        {mitt(-6, false)}
        {mitt(6, true)}
      </g>
    )
  },
  gummistifu: ({ color }) => {
    const c = color ?? C.yellow
    const boot = (dx: number, dy: number, shade: boolean) => (
      <g transform={`translate(${dx} ${dy})`}>
        <path d="M22 10 L46 10 L46 56 L66 60 Q76 62 76 72 L76 76 L20 76 Q18 50 22 10 Z" fill={c} {...L} />
        {shade && <path d="M22 10 L46 10 L46 56 L66 60 Q76 62 76 72 L76 76 L20 76 Q18 50 22 10 Z" fill={C.ink} opacity={0.15} />}
        <rect x={20} y={8} width={28} height={7} rx={2} fill={c} {...L} />
        <rect x={18} y={74} width={60} height={7} rx={3} fill={C.ink} />
        <path d="M27 20 L27 60" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      </g>
    )
    return (
      <g>
        <ellipse cx={50} cy={88} rx={44} ry={6} fill={C.water} opacity={0.6} {...T} />
        {boot(18, 0, true)}
        {boot(-4, 6, false)}
        <path d="M8 80 Q6 74 10 72 M92 80 Q96 76 92 72" fill="none" stroke={C.water} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    )
  },
  pyjama: ({ color }) => {
    const c = color ?? C.sky
    return (
      <g>
        <path d="M34 50 L66 50 L72 92 L54 92 L50 66 L46 92 L28 92 Z" fill={c} {...L} />
        <path d="M30 86 L46 86 M54 86 L70 86" {...line(1.4)} />
        <path d="M34 10 L42 8 Q50 14 58 8 L66 10 L84 22 L76 34 L68 28 L68 56 L32 56 L32 28 L24 34 L16 22 Z" fill={c} {...L} />
        <path d="M42 8 L50 18 L58 8" fill="none" {...line(2)} />
        <path d="M50 18 L50 56" {...line(1.6)} />
        {[26, 36, 46].map((y) => (
          <circle key={y} cx={53} cy={y} r={1.6} fill={C.white} {...line(1)} />
        ))}
        <path d="M40 34 A4 4 0 1 0 44 40 A3 3 0 1 1 40 34 Z" fill={C.yellow} {...line(1)} />
        <Star x={60} y={42} r={3.6} />
        <Star x={40} y={72} r={3.6} />
        <path d="M58 70 A4 4 0 1 0 62 76 A3 3 0 1 1 58 70 Z" fill={C.yellow} {...line(1)} />
      </g>
    )
  },
  jupe: ({ color }) => {
    const c = color ?? C.rose
    return (
      <g>
        <Shadow y={88} rx={36} />
        <path d="M32 26 L68 26 L88 82 Q50 90 12 82 Z" fill={c} {...L} />
        <path d="M42 30 L34 84 M50 30 L50 86 M58 30 L66 84" fill="none" {...line(1.6)} opacity={0.6} />
        <rect x={30} y={18} width={40} height={10} rx={3} fill={c} {...L} />
        <circle cx={50} cy={23} r={2} fill={C.white} {...line(1)} />
        <path d="M14 78 Q50 86 86 78" fill="none" stroke={C.white} strokeWidth={3} />
      </g>
    )
  },
  chleid: ({ color }) => {
    const c = color ?? C.purple
    return (
      <g>
        <path d="M38 8 L38 16 M62 8 L62 16" {...line(4)} />
        <path d="M34 14 Q42 22 50 22 Q58 22 66 14 L70 46 L90 88 Q50 96 10 88 L30 46 Z" fill={c} {...L} />
        <path d="M30 44 L70 44 L70 50 L30 50 Z" fill={C.white} {...line(1.8)} />
        <path d="M50 47 L40 41 L40 53 Z M50 47 L60 41 L60 53 Z" fill={C.white} {...line(1.6)} />
        <circle cx={50} cy={47} r={2.6} fill={C.yellow} {...line(1.2)} />
        {[[30, 70], [50, 76], [70, 70], [40, 60], [60, 60], [24, 84], [76, 84]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.4} fill={C.white} opacity={0.85} />
        ))}
        <path d="M14 86 Q50 94 86 86" fill="none" stroke={C.white} strokeWidth={2.4} />
      </g>
    )
  },
  pulli: ({ color }) => {
    const c = color ?? C.green
    return (
      <g>
        <path d={shirtPath(true)} fill={c} {...L} />
        <path d="M42 13 Q50 22 58 13" fill="none" {...line(4)} />
        <path d="M26 46 L34 40 L42 46 L50 40 L58 46 L66 40 L74 46" fill="none" stroke={C.white} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 54 L74 54" stroke={C.yellow} strokeWidth={3.5} />
        <rect x={27} y={80} width={46} height={8} rx={2} fill={c} {...L} />
        <path d="M8 78 L20 80" stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        <path d="M92 78 L80 80" stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        <path d="M74 42 L80 80 M26 42 L20 80" fill="none" {...line(1.6)} />
        {[32, 40, 48, 56, 64].map((x) => (
          <path key={x} d={`M${x + 1} 81 L${x + 1} 87`} {...line(1)} opacity={0.5} />
        ))}
      </g>
    )
  },
  sunnebrueue: ({ color }) => {
    const c = color ?? C.red
    return (
      <g>
        <Shadow y={78} rx={40} />
        <path d="M12 40 L4 34 M88 40 L96 34" {...line(4)} />
        <path d="M12 38 L88 38" {...line(5)} />
        <path d="M12 38 L88 38" stroke={c} strokeWidth={2.4} />
        <path d="M8 36 Q8 30 16 30 L42 30 Q46 30 46 36 Q46 64 28 64 Q10 64 8 36 Z" fill={c} {...L} />
        <path d="M54 36 Q54 30 58 30 L84 30 Q92 30 92 36 Q90 64 72 64 Q54 64 54 36 Z" fill={c} {...L} />
        <path d="M13 37 Q13 35 17 35 L39 35 Q41 35 41 38 Q41 59 28 59 Q15 59 13 37 Z" fill={C.navy} />
        <path d="M59 38 Q59 35 61 35 L83 35 Q87 35 87 37 Q85 59 72 59 Q59 59 59 38 Z" fill={C.navy} />
        <path d="M18 40 L26 40 M64 40 L72 40" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        <path d="M22 50 L30 44 M68 50 L76 44" stroke={HI} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </g>
    )
  },
  raegemantu: ({ color }) => {
    const c = color ?? C.yellow
    return (
      <g>
        <path d="M30 18 L18 30 Q12 56 12 80 L24 82 L28 44 L26 92 L74 92 L72 44 L76 82 L88 80 Q88 56 82 30 L70 18 Z" fill={c} {...L} />
        <path d="M32 26 Q30 6 50 6 Q70 6 68 26 Q60 32 50 32 Q40 32 32 26 Z" fill={c} {...L} />
        <path d="M37 24 Q38 12 50 12 Q62 12 63 24 Q56 27 50 27 Q44 27 37 24 Z" fill={C.ink} opacity={0.25} />
        <path d="M50 32 L50 92" {...line(1.8)} />
        {[44, 58, 72].map((y) => (
          <circle key={y} cx={56} cy={y} r={2.4} fill={C.navy} {...line(1)} />
        ))}
        <path d="M32 66 L44 66 M60 66 L72 66" {...line(1.8)} />
        <path d="M34 40 Q32 60 34 80" fill="none" stroke={HI} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        {[[8, 20], [92, 14], [90, 46], [6, 52]].map(([x, y]) => (
          <path key={x * y} d={`M${x} ${y - 5} Q${x + 3} ${y} ${x} ${y + 2} Q${x - 3} ${y} ${x} ${y - 5} Z`} fill={C.water} {...line(1.2)} />
        ))}
      </g>
    )
  },
  thek: ({ color }) => {
    const c = color ?? C.blue
    return (
      <g>
        <Shadow y={91} rx={34} />
        <path d="M26 30 L18 30 Q14 30 14 36 L14 74" fill="none" {...line(5)} />
        <path d="M74 30 L82 30 Q86 30 86 36 L86 74" fill="none" {...line(5)} />
        <path d="M42 20 Q42 12 50 12 Q58 12 58 20" fill="none" {...line(4)} />
        <rect x={22} y={20} width={56} height={70} rx={10} fill={c} {...L} />
        <path d="M22 30 Q22 20 32 20 L68 20 Q78 20 78 30 L78 58 Q78 64 72 64 L28 64 Q22 64 22 58 Z" fill={c} {...L} />
        <path d="M22 30 Q22 20 32 20 L68 20 Q78 20 78 30 L78 58 Q78 64 72 64 L28 64 Q22 64 22 58 Z" fill={C.ink} opacity={0.1} />
        <rect x={44} y={58} width={12} height={10} rx={2} fill={C.yellow} {...L} />
        <rect x={30} y={30} width={40} height={8} rx={2} fill={C.yellow} {...T} />
        <circle cx={34} cy={78} r={5} fill={C.red} {...T} />
        <circle cx={66} cy={78} r={5} fill={C.red} {...T} />
        <path d="M28 70 L28 84" stroke={HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.4} />
        <Star x={50} y={48} r={7} fill={C.white} />
      </g>
    )
  },
}
