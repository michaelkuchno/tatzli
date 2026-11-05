import type { ReactNode } from 'react'
import type { IlluMap } from './types'
import { C, line, origin, Shadow, Eyes, Cheeks, Smile } from './kit'

/* ------------------------------------------------------------------ helpers */

function rgb(hex: string): number[] | null {
  let h = hex.trim().replace('#', '')
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((ch) => ch + ch).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, to: string, t: number): string {
  const a = rgb(hex)
  const b = rgb(to)
  if (!a || !b) return hex
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
const lighten = (c: string, t = 0.5) => mix(c, '#ffffff', t)
const darken = (c: string, t = 0.25) => mix(c, '#000000', t)
/** [main, light] – natural colours unless recoloured. */
const pal = (color: string | undefined, base: string, lt: string): [string, string] =>
  color ? [color, lighten(color, 0.55)] : [base, lt]

const f2 = (n: number) => Math.round(n * 10) / 10

/** Thick outlined stroke (tails, necks, trunks, legs). */
function Tube({ d, c, w = 6 }: { d: string; c: string; w?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={w + 4.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

/** Single side-view eye (blinks). */
function Eye({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return (
    <g className="illu-blink" style={origin(x, y)}>
      <circle cx={x} cy={y} r={r} fill={C.ink} />
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={C.white} />
    </g>
  )
}

/** Big googly eyes on white (for dark faces / owls / frogs). */
function BigEyes({ x1, x2, y, r = 5 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x1} cy={y} r={r} fill={C.white} {...line(1.6)} />
      <circle cx={x2} cy={y} r={r} fill={C.white} {...line(1.6)} />
      <Eyes x1={x1} x2={x2} y={y} r={r * 0.58} />
    </>
  )
}

/** Sitting front-facing body with belly, arms and feet. */
function Sit({ c, belly, y = 70, rx = 20, ry = 17, feet }: { c: string; belly: string; y?: number; rx?: number; ry?: number; feet?: string }) {
  return (
    <>
      <ellipse cx={50} cy={y} rx={rx} ry={ry} fill={c} {...line()} />
      <ellipse cx={50} cy={y + 4} rx={rx * 0.6} ry={ry * 0.62} fill={belly} />
      <ellipse cx={32} cy={y - 1} rx={5} ry={8} transform={`rotate(25 32 ${y - 1})`} fill={c} {...line()} />
      <ellipse cx={68} cy={y - 1} rx={5} ry={8} transform={`rotate(-25 68 ${y - 1})`} fill={c} {...line()} />
      <ellipse cx={40} cy={88} rx={7.5} ry={4.5} fill={feet ?? c} {...line()} />
      <ellipse cx={60} cy={88} rx={7.5} ry={4.5} fill={feet ?? c} {...line()} />
    </>
  )
}

function Head({ c, y = 40, r = 21 }: { c: string; y?: number; r?: number }) {
  return <circle cx={50} cy={y} r={r} fill={c} {...line()} />
}

/** Eyes + cheeks for front faces. */
function Face({ y = 40, dx = 8, r = 3.2 }: { y?: number; dx?: number; r?: number }) {
  return (
    <>
      <Eyes x1={50 - dx} x2={50 + dx} y={y} r={r} />
      <Cheeks x1={50 - dx - 7} x2={50 + dx + 7} y={y + 8} />
    </>
  )
}

/** Muzzle with nose and "w" mouth. */
function Snout({ y = 40, m, nose = C.ink, w = 9 }: { y?: number; m: string; nose?: string; w?: number }) {
  return (
    <>
      <ellipse cx={50} cy={y + 9} rx={w} ry={6.5} fill={m} />
      <ellipse cx={50} cy={y + 6} rx={3.2} ry={2.3} fill={nose} />
      <path d={`M45.5 ${y + 10} Q48 ${y + 13.5} 50 ${y + 10} Q52 ${y + 13.5} 54.5 ${y + 10}`} fill="none" {...line(1.8)} />
    </>
  )
}

function Whiskers({ y, x1 = 38, x2 = 62 }: { y: number; x1?: number; x2?: number }) {
  return (
    <path
      d={`M${x1} ${y} L${x1 - 10} ${y - 2} M${x1} ${y + 3} L${x1 - 10} ${y + 4} M${x2} ${y} L${x2 + 10} ${y - 2} M${x2} ${y + 3} L${x2 + 10} ${y + 4}`}
      {...line(1.3)}
      fill="none"
    />
  )
}

/** Big bushy tail (fox, wolf) with a light tip. */
function BushyTail({ c, tip }: { c: string; tip: string }) {
  return (
    <g className="illu-wag" style={origin(66, 82)}>
      <g transform="rotate(38 76 66)">
        <ellipse cx={76} cy={66} rx={9.5} ry={21} fill={c} {...line()} />
        <path d="M68.6 53 Q76 40 83.4 53 Q76 57 68.6 53Z" fill={tip} />
      </g>
    </g>
  )
}

/* ------------------------------------------------- side-view four-legger */

interface QuadP {
  c: string
  hoof: string
  hx: number
  hy: number
  /** head scale – heads are drawn big so toddlers see the face. */
  hs?: number
  bodyY?: number
  neckW?: number
  legW?: number
  tail?: ReactNode
  overlay?: ReactNode
  /** unscaled, drawn on the neck behind the head (manes, horns, antlers, ears). */
  neck?: ReactNode
  head: ReactNode
}
function Quad({ c, hoof, hx, hy, hs = 1.3, bodyY = 56, neckW = 13, legW = 7.5, tail, overlay, neck, head }: QuadP) {
  const far = darken(c, 0.12)
  const leg = (x: number, fill: string) => (
    <g key={x}>
      <rect x={x - legW / 2} y={bodyY + 2} width={legW} height={89 - bodyY - 2} rx={legW / 2} fill={fill} {...line()} />
      <rect x={x - legW / 2} y={84} width={legW} height={5} rx={1.5} fill={hoof} {...line(1.8)} />
    </g>
  )
  const nb1 = [54, bodyY - 10]
  const nb2 = [67, bodyY + 4]
  const nt1 = [hx - neckW / 2, hy + 6]
  const nt2 = [hx + neckW / 2, hy + 6]
  return (
    <>
      <Shadow y={90} rx={34} />
      {tail}
      {leg(33, far)}
      {leg(60, far)}
      <ellipse cx={42} cy={bodyY} rx={25} ry={14} fill={c} {...line()} />
      {overlay}
      {leg(25, c)}
      {leg(52, c)}
      <path d={`M${nb1} L${nt1} L${nt2} L${nb2} Z`} fill={c} />
      <path d={`M${nb1} L${nt1} M${nt2} L${nb2}`} fill="none" {...line()} />
      {neck}
      <g transform={`translate(${f2(hx * (1 - hs))} ${f2(hy * (1 - hs))}) scale(${hs})`}>{head}</g>
    </>
  )
}

/** Stripes hanging from the top edge of an ellipse (zebra, bee). */
function stripes(cx: number, cy: number, rx: number, ry: number, xs: number[], len = 0.75): string {
  return xs
    .map((x) => {
      const dy = ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2))
      const top = cy - dy + 1
      return `M${f2(x - 1.5)} ${f2(top)} Q${f2(x + 3)} ${f2(top + dy * len)} ${f2(x)} ${f2(top + dy * len * 1.6)}`
    })
    .join(' ')
}

/** Horse-like long front-facing head (horse, zebra, donkey). */
function LongHead({ x, y, c, muzzle, mane, ears = true }: { x: number; y: number; c: string; muzzle: string; mane?: string; ears?: boolean }) {
  return (
    <>
      {ears && (
        <>
          <path d={`M${x - 7} ${y - 8} L${x - 8} ${y - 18} L${x - 1} ${y - 12}Z`} fill={c} {...line(1.8)} />
          <path d={`M${x + 7} ${y - 8} L${x + 8} ${y - 18} L${x + 1} ${y - 12}Z`} fill={c} {...line(1.8)} />
        </>
      )}
      <ellipse cx={x} cy={y} rx={9.5} ry={12.5} fill={c} {...line()} />
      {mane && <path d={`M${x - 4} ${y - 11} Q${x} ${y - 15} ${x + 4} ${y - 11} Q${x + 1.5} ${y - 7} ${x} ${y - 9} Q${x - 1.5} ${y - 7} ${x - 4} ${y - 11}Z`} fill={mane} {...line(1.4)} />}
      <ellipse cx={x} cy={y + 8} rx={8} ry={6} fill={muzzle} {...line(1.8)} />
      <circle cx={x - 2.8} cy={y + 7.5} r={1.2} fill={C.ink} />
      <circle cx={x + 2.8} cy={y + 7.5} r={1.2} fill={C.ink} />
      <path d={`M${x - 2.5} ${y + 10.5} Q${x} ${y + 12.5} ${x + 2.5} ${y + 10.5}`} fill="none" {...line(1.4)} />
      <Eyes x1={x - 4.2} x2={x + 4.2} y={y - 2} r={2.4} />
      <Cheeks x1={x - 7.5} x2={x + 7.5} y={y + 3} r={2} />
    </>
  )
}

/** Wide front-facing head (cow, calf, goat, deer). `earUp` = upright deer ears. */
function WideHead({ x, y, c, muzzle, earIn = C.pink, earLen = 6.5, earUp, nose }: { x: number; y: number; c: string; muzzle: string; earIn?: string; earLen?: number; earUp?: boolean; nose?: boolean }) {
  const ex = earUp ? 9 : 12
  const ey = earUp ? y - 9 : y - 4
  const rot = earUp ? 50 : -20
  const ear = (s: 1 | -1) => (
    <>
      <ellipse cx={x + s * ex} cy={ey} rx={earLen} ry={earUp ? 4.2 : 3.6} transform={`rotate(${s * -rot} ${x + s * ex} ${ey})`} fill={c} {...line(1.8)} />
      <ellipse cx={x + s * (ex + 0.5)} cy={ey} rx={earLen * 0.55} ry={earUp ? 2.2 : 1.6} transform={`rotate(${s * -rot} ${x + s * ex} ${ey})`} fill={earIn} />
    </>
  )
  return (
    <>
      <g className="illu-flap" style={origin(x - 7, y - 4)}>
        {ear(-1)}
      </g>
      {ear(1)}
      <ellipse cx={x} cy={y} rx={10.5} ry={11} fill={c} {...line()} />
      <ellipse cx={x} cy={y + 8} rx={9} ry={5.8} fill={muzzle} {...line(1.8)} />
      {nose ? (
        <ellipse cx={x} cy={y + 6.2} rx={2.8} ry={1.9} fill={C.ink} />
      ) : (
        <>
          <circle cx={x - 3} cy={y + 7.5} r={1.2} fill={C.ink} />
          <circle cx={x + 3} cy={y + 7.5} r={1.2} fill={C.ink} />
        </>
      )}
      <path d={`M${x - 2.5} ${y + 10.5} Q${x} ${y + 12.5} ${x + 2.5} ${y + 10.5}`} fill="none" {...line(1.4)} />
      <Eyes x1={x - 4.5} x2={x + 4.5} y={y - 2} r={2.5} />
      <Cheeks x1={x - 8} x2={x + 8} y={y + 3} r={2} />
    </>
  )
}

/* ------------------------------------------------------------- side birds */

const HEN = 'M24 58 Q24 42 42 43 Q52 43 54 36 Q54 25 65 25 Q76 26 76 37 Q76 47 70 52 Q72 78 47 78 Q24 78 24 58Z'
function Fowl({ c, wing, comb, combBig, tail }: { c: string; wing: string; comb: string; combBig?: boolean; tail: ReactNode }) {
  const cr = combBig ? 5 : 3.6
  return (
    <>
      <Shadow y={90} rx={24} />
      <path d="M42 76 L42 88 M37 89 L42 87 L47 89 M54 76 L54 88 M49 89 L54 87 L59 89" fill="none" stroke={C.orange} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      {tail}
      <circle cx={60} cy={combBig ? 23 : 25} r={cr} fill={comb} {...line(1.8)} />
      <circle cx={66} cy={combBig ? 20 : 23} r={cr} fill={comb} {...line(1.8)} />
      <circle cx={72} cy={combBig ? 23 : 25} r={cr} fill={comb} {...line(1.8)} />
      <path d={HEN} fill={c} {...line()} />
      <path d="M75.5 34 L84 38 L75.5 42Z" fill={C.yellow} {...line(1.8)} />
      <ellipse cx={74} cy={combBig ? 47 : 46} rx={combBig ? 3.2 : 2.4} ry={combBig ? 5 : 3.6} fill={comb} {...line(1.6)} />
      <Eye x={67} y={34} r={3} />
      <circle cx={68} cy={41} r={2.4} fill={C.cheek} opacity={0.55} />
      <g className="illu-flap" style={origin(52, 56)}>
        <ellipse cx={43} cy={60} rx={12} ry={8} transform="rotate(-12 43 60)" fill={wing} {...line()} />
      </g>
    </>
  )
}

function Water({ y = 80 }: { y?: number }) {
  return (
    <path
      d={`M7 ${y} Q14 ${y - 5} 21 ${y} T35 ${y} T49 ${y} T63 ${y} T77 ${y} T93 ${y} L93 ${y + 11} Q50 ${y + 15} 7 ${y + 11}Z`}
      fill={C.water}
      {...line(2)}
    />
  )
}

/* ---------------------------------------------------- colours / numbers / shapes */

function blobPath(cx: number, cy: number, r: number, amp: number, k: number, ph: number, n = 72): string {
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = r + amp * Math.sin(k * a + ph) + amp * 0.4 * Math.sin((k + 3) * a)
    pts.push(`${f2(cx + rr * Math.cos(a))} ${f2(cy + rr * Math.sin(a))}`)
  }
  return 'M' + pts.join(' L') + 'Z'
}
const SPLASH = blobPath(50, 52, 29, 3.6, 7, 0.6)

function Splash({ fill, dark }: { fill: string; dark?: boolean }) {
  const mouth = dark ? C.white : C.ink
  return (
    <g>
      <Shadow y={91} rx={28} />
      <path d={SPLASH} fill={fill} {...line()} />
      <circle cx={15} cy={30} r={4.5} fill={fill} {...line(1.8)} />
      <circle cx={86} cy={70} r={5} fill={fill} {...line(1.8)} />
      <circle cx={84} cy={24} r={3} fill={fill} {...line(1.8)} />
      <circle cx={17} cy={78} r={3.2} fill={fill} {...line(1.8)} />
      {!dark && <ellipse cx={36} cy={36} rx={7} ry={4} transform="rotate(-30 36 36)" fill={C.white} opacity={0.45} />}
      <BigEyes x1={41} x2={59} y={47} r={5.5} />
      <path d="M43 58 Q50 65 57 58" fill="none" {...line(2.2)} stroke={mouth} />
      <Cheeks x1={33} x2={67} y={57} r={3.4} />
    </g>
  )
}

const NUM_FONT = "'Baloo 2', Nunito, 'Arial Rounded MT Bold', 'Segoe UI', Arial, sans-serif"
function NumberPic({ n }: { n: number }) {
  const big = n > 10
  const frames = big ? 2 : 1
  const s = big ? 11 : 15
  const r = big ? 4.3 : 5.8
  const x0 = 50 - (s * 5) / 2
  const tops = big ? [45, 70] : [55]
  const cells: ReactNode[] = []
  for (let f = 0; f < frames; f++) {
    for (let i = 0; i < 10; i++) {
      const k = f * 10 + i
      const cx = x0 + s / 2 + (i % 5) * s
      const cy = tops[f] + s / 2 + Math.floor(i / 5) * s
      cells.push(
        k < n ? (
          <g key={k}>
            <circle cx={cx} cy={cy} r={r} fill={f === 0 ? C.red : C.blue} {...line(1.4)} />
            <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.3} fill={C.white} opacity={0.7} />
          </g>
        ) : (
          <circle key={k} cx={cx} cy={cy} r={r * 0.75} fill="#efe4d0" />
        ),
      )
    }
  }
  return (
    <g>
      <text
        x={50}
        y={big ? 39 : 44}
        textAnchor="middle"
        fontFamily={NUM_FONT}
        fontWeight={900}
        fontSize={big ? 38 : 44}
        fill={C.orange}
        stroke={C.ink}
        strokeWidth={2.6}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {n}
      </text>
      {tops.map((t) => (
        <rect key={t} x={x0 - 2} y={t - 1} width={s * 5 + 4} height={s * 2 + 2} rx={5} fill={C.white} {...line(1.8)} />
      ))}
      {cells}
    </g>
  )
}

function ShapeFace({ y = 50 }: { y?: number }) {
  return (
    <>
      <Eyes x1={41} x2={59} y={y} r={3.6} />
      <Cheeks x1={34} x2={66} y={y + 8} r={3.6} />
      <Smile x={50} y={y + 8} w={10} />
    </>
  )
}

const numbers: IlluMap = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => [`n${i + 1}`, () => <NumberPic n={i + 1} />]),
)

/* ======================================================================== */

export const animalIllus: IlluMap = {
  /* ---------------------------------------------------------- front sitters */
  baer: ({ color }) => {
    const [c, l] = pal(color, C.fur, C.furLight)
    return (
      <g>
        <Shadow />
        <Sit c={c} belly={l} />
        <circle cx={32} cy={23} r={8} fill={c} {...line()} />
        <circle cx={68} cy={23} r={8} fill={c} {...line()} />
        <circle cx={32} cy={23} r={4.3} fill={l} />
        <circle cx={68} cy={23} r={4.3} fill={l} />
        <Head c={c} />
        <Face />
        <Snout m={l} />
      </g>
    )
  },

  chatz: ({ color }) => {
    const [c, l] = pal(color, '#f2a453', '#fde8cc')
    const st = darken(c, 0.2)
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(66, 82)}>
          <Tube d="M66 82 C86 82 90 62 80 52" c={c} w={6} />
        </g>
        <Sit c={c} belly={l} />
        <path d="M31 33 L29 11 L46 22Z" fill={c} {...line()} />
        <path d="M69 33 L71 11 L54 22Z" fill={c} {...line()} />
        <path d="M33 28 L32 17 L41 23Z" fill={C.pink} />
        <path d="M67 28 L68 17 L59 23Z" fill={C.pink} />
        <Head c={c} />
        <path d="M44 21 L45 27 M50 20 L50 27 M56 21 L55 27" stroke={st} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Face />
        <circle cx={46.5} cy={49} r={4.5} fill={l} />
        <circle cx={53.5} cy={49} r={4.5} fill={l} />
        <path d="M47.5 45.5 L52.5 45.5 L50 48.5Z" fill={C.pink} {...line(1.4)} />
        <path d="M46 51 Q48 53.5 50 51 Q52 53.5 54 51" fill="none" {...line(1.6)} />
        <Whiskers y={48} x1={40} x2={60} />
      </g>
    )
  },

  hund: ({ color }) => {
    const [c, l] = pal(color, '#dba56c', '#fbead2')
    const ear = darken(c, 0.35)
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(68, 80)}>
          <Tube d="M68 80 Q84 76 84 60" c={c} w={6} />
        </g>
        <Sit c={c} belly={l} />
        <path d="M35 58 Q50 65 65 58" fill="none" stroke={C.red} strokeWidth={4} strokeLinecap="round" />
        <circle cx={50} cy={64} r={3} fill={C.yellow} {...line(1.4)} />
        <Head c={c} />
        <ellipse cx={58} cy={25} rx={6} ry={4} fill={ear} />
        <g className="illu-flap" style={origin(32, 26)}>
          <ellipse cx={29} cy={38} rx={7} ry={14} transform="rotate(18 29 38)" fill={ear} {...line()} />
        </g>
        <ellipse cx={71} cy={38} rx={7} ry={14} transform="rotate(-18 71 38)" fill={ear} {...line()} />
        <Face y={38} />
        <ellipse cx={50} cy={50} rx={11} ry={8} fill={l} />
        <ellipse cx={50} cy={46} rx={4.2} ry={3} fill={C.ink} />
        <ellipse cx={51.5} cy={55.5} rx={2.6} ry={3.2} fill="#f26b7a" {...line(1.3)} />
        <path d="M45 51 Q47.5 54.5 50 51 Q52.5 54.5 55 51" fill="none" {...line(1.8)} />
      </g>
    )
  },

  soeili: ({ color }) => {
    const [c, l] = pal(color, '#f6a7b8', '#fcd5de')
    const sn = darken(c, 0.1)
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(68, 78)}>
          <path d="M68 78 C76 78 80 72 76 69 C72 66 69 72 74 74 C78 76 82 72 83 69" fill="none" {...line(2.4)} />
        </g>
        <Sit c={c} belly={l} feet={sn} />
        <path d="M32 31 L27 13 L45 21Z" fill={c} {...line()} />
        <path d="M68 31 L73 13 L55 21Z" fill={c} {...line()} />
        <Head c={c} r={22} />
        <Eyes x1={42} x2={58} y={35} r={3.2} />
        <Cheeks x1={33} x2={67} y={45} />
        <ellipse cx={50} cy={47} rx={10} ry={7.5} fill={sn} {...line()} />
        <ellipse cx={46.5} cy={47} rx={1.7} ry={2.6} fill={C.ink} />
        <ellipse cx={53.5} cy={47} rx={1.7} ry={2.6} fill={C.ink} />
        <Smile x={50} y={57} w={8} />
      </g>
    )
  },

  schaf: ({ color }) => {
    const wool = color ?? '#fbf7ef'
    const face = '#d9b48a'
    const bumps = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return [f2(50 + 19 * Math.cos(a)), f2(64 + 14 * Math.sin(a))]
    })
    return (
      <g>
        <Shadow />
        <rect x={36} y={76} width={7} height={13} rx={3} fill="#5c4a43" {...line()} />
        <rect x={57} y={76} width={7} height={13} rx={3} fill="#5c4a43" {...line()} />
        {bumps.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={9.5} fill={wool} {...line()} />
        ))}
        <ellipse cx={50} cy={64} rx={23} ry={17} fill={wool} />
        <ellipse cx={30} cy={36} rx={8} ry={4} transform="rotate(-20 30 36)" fill={face} {...line()} />
        <ellipse cx={70} cy={36} rx={8} ry={4} transform="rotate(20 70 36)" fill={face} {...line()} />
        <ellipse cx={50} cy={40} rx={13} ry={15} fill={face} {...line()} />
        <circle cx={43} cy={27} r={6} fill={wool} {...line()} />
        <circle cx={57} cy={27} r={6} fill={wool} {...line()} />
        <circle cx={50} cy={24} r={6.5} fill={wool} {...line()} />
        <Eyes x1={45} x2={55} y={39} r={2.8} />
        <Cheeks x1={41} x2={59} y={46} r={2.4} />
        <path d="M47 48.5 Q50 51.5 53 48.5" fill="none" {...line(1.8)} />
      </g>
    )
  },

  muus: ({ color }) => {
    const [c, l] = pal(color, '#aeb0bd', '#e4e5ec')
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(66, 82)}>
          <Tube d="M66 82 C84 88 92 72 84 64" c={C.pink} w={2} />
        </g>
        <Sit c={c} belly={l} feet={C.pink} rx={18} ry={16} y={72} />
        <circle cx={29} cy={25} r={12} fill={c} {...line()} />
        <circle cx={71} cy={25} r={12} fill={c} {...line()} />
        <circle cx={29} cy={25} r={7.5} fill={C.pink} />
        <circle cx={71} cy={25} r={7.5} fill={C.pink} />
        <Head c={c} y={43} r={19} />
        <Face y={41} dx={7} />
        <ellipse cx={50} cy={50} rx={7} ry={5} fill={l} />
        <circle cx={50} cy={48} r={3} fill={C.pink} {...line(1.4)} />
        <path d="M47 53 Q50 55.5 53 53" fill="none" {...line(1.6)} />
        <Whiskers y={49} x1={42} x2={58} />
      </g>
    )
  },

  haas: ({ color }) => {
    const [c, l] = pal(color, '#c49a6c', '#f2e1c8')
    const ear = (x: number, rot: number) => (
      <g transform={`rotate(${rot} ${x} 34)`}>
        <ellipse cx={x} cy={20} rx={6} ry={16} fill={c} {...line()} />
        <ellipse cx={x} cy={22} rx={3} ry={11} fill={C.pink} />
        <path d={`M${x - 4.6} 10 Q${x} 0 ${x + 4.6} 10 Q${x} 8 ${x - 4.6} 10Z`} fill={C.ink} />
      </g>
    )
    return (
      <g>
        <Shadow />
        <Sit c={c} belly={l} y={73} rx={18} feet={l} />
        <g className="illu-flap" style={origin(42, 34)}>
          {ear(42, -10)}
        </g>
        {ear(58, 10)}
        <Head c={c} y={46} r={18} />
        <Face y={44} dx={7} />
        <ellipse cx={50} cy={53} rx={7} ry={5} fill={l} />
        <path d="M47.5 49.5 L52.5 49.5 L50 52Z" fill={C.pink} {...line(1.4)} />
        <rect x={48} y={54} width={4} height={4} rx={1} fill={C.white} {...line(1.3)} />
        <Whiskers y={52} x1={42} x2={58} />
      </g>
    )
  },

  chuengu: ({ color }) => {
    const [c, l] = pal(color, '#f5f1ea', '#ffffff')
    return (
      <g>
        <Shadow />
        <circle cx={73} cy={82} r={6.5} fill={C.white} {...line()} />
        <Sit c={c} belly={l} y={71} rx={23} ry={17} />
        <ellipse cx={40} cy={22} rx={7.5} ry={12} transform="rotate(-10 40 22)" fill={c} {...line()} />
        <ellipse cx={40} cy={23} rx={4} ry={8} transform="rotate(-10 40 22)" fill={C.pink} />
        <g className="illu-flap" style={origin(60, 28)}>
          <ellipse cx={68} cy={28} rx={12} ry={7} transform="rotate(25 68 28)" fill={c} {...line()} />
          <ellipse cx={68} cy={28} rx={8} ry={3.8} transform="rotate(25 68 28)" fill={C.pink} />
        </g>
        <Head c={c} y={44} r={21} />
        <Face y={42} />
        <path d="M47.5 48.5 L52.5 48.5 L50 51Z" fill={C.pink} {...line(1.4)} />
        <path d="M46 53 Q48 55.5 50 53 Q52 55.5 54 53" fill="none" {...line(1.6)} />
        <rect x={48} y={54.5} width={4} height={4} rx={1} fill={C.white} {...line(1.2)} />
      </g>
    )
  },

  fuchs: ({ color }) => {
    const [c] = pal(color, '#ee7f2d', '#fff')
    return (
      <g>
        <Shadow />
        <BushyTail c={c} tip={C.white} />
        <Sit c={c} belly={C.white} feet={C.ink} />
        <path d="M30 34 L28 9 L47 22Z" fill={c} {...line()} />
        <path d="M70 34 L72 9 L53 22Z" fill={c} {...line()} />
        <path d="M30.5 18 L28.5 10 L36 15Z" fill={C.ink} />
        <path d="M69.5 18 L71.5 10 L64 15Z" fill={C.ink} />
        <Head c={c} />
        <path d="M29.5 42 Q33 59 50 61 Q67 59 70.5 42 Q62 50 50 48 Q38 50 29.5 42Z" fill={C.white} />
        <Face y={38} />
        <ellipse cx={50} cy={49} rx={3.4} ry={2.6} fill={C.ink} />
        <path d="M46 53 Q48 55.5 50 53 Q52 55.5 54 53" fill="none" {...line(1.6)} />
      </g>
    )
  },

  eichhoernli: ({ color }) => {
    const [c, l] = pal(color, '#c8642e', '#f6dcb8')
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(64, 82)}>
          <Tube d="M64 82 C90 80 92 48 80 34 C72 25 62 32 69 40" c={c} w={15} />
        </g>
        <Sit c={c} belly={l} y={71} rx={18} />
        <path d="M33 31 L31 11 L45 21Z" fill={c} {...line()} />
        <path d="M67 31 L69 11 L55 21Z" fill={c} {...line()} />
        <Head c={c} y={40} r={19} />
        <Face y={39} dx={7} />
        <ellipse cx={50} cy={48} rx={7.5} ry={5.5} fill={l} />
        <ellipse cx={50} cy={46} rx={2.6} ry={2} fill={C.ink} />
        <path d="M47 50 Q50 52.5 53 50" fill="none" {...line(1.6)} />
        <ellipse cx={50} cy={72} rx={5} ry={5.5} fill="#b5793f" {...line(1.8)} />
        <path d="M44 68 Q50 62 56 68Z" fill="#7a4f28" {...line(1.8)} />
        <ellipse cx={44} cy={70} rx={4} ry={3.5} fill={c} {...line(1.8)} />
        <ellipse cx={56} cy={70} rx={4} ry={3.5} fill={c} {...line(1.8)} />
      </g>
    )
  },

  uele: ({ color }) => {
    const [c, l] = pal(color, '#9c6b43', '#ecd3aa')
    const face = lighten(l, 0.4)
    return (
      <g>
        <Tube d="M12 86 L88 86" c="#8a5428" w={5} />
        <ellipse cx={20} cy={81} rx={6} ry={3} transform="rotate(-25 20 81)" fill={C.leaf} {...line(1.6)} />
        <path d="M27 28 L24 9 L40 20Z" fill={c} {...line()} />
        <path d="M73 28 L76 9 L60 20Z" fill={c} {...line()} />
        <g className="illu-flap" style={origin(28, 46)}>
          <ellipse cx={25} cy={60} rx={7} ry={17} transform="rotate(15 25 60)" fill={darken(c, 0.15)} {...line()} />
        </g>
        <ellipse cx={75} cy={60} rx={7} ry={17} transform="rotate(-15 75 60)" fill={darken(c, 0.15)} {...line()} />
        <ellipse cx={50} cy={54} rx={26} ry={31} fill={c} {...line()} />
        <ellipse cx={50} cy={67} rx={16} ry={16} fill={l} />
        <path d="M43 62 l3 3 l3 -3 M51 62 l3 3 l3 -3 M47 70 l3 3 l3 -3" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={39} cy={42} r={12} fill={face} {...line(1.6)} />
        <circle cx={61} cy={42} r={12} fill={face} {...line(1.6)} />
        <BigEyes x1={39} x2={61} y={42} r={8.5} />
        <path d="M46 50 L54 50 L50 57Z" fill={C.orange} {...line(1.8)} />
        <path d="M39 84 l2 4 M43 84 l0 4 M57 84 l0 4 M61 84 l-2 4" fill="none" stroke={C.orange} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    )
  },

  aff: ({ color }) => {
    const [c] = pal(color, '#8a5a3b', '#fff')
    const face = '#f1d2a8'
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(34, 82)}>
          <Tube d="M34 82 C14 86 10 68 18 60 C23 55 29 60 24 64" c={c} w={4.5} />
        </g>
        <Sit c={c} belly={face} />
        <circle cx={27} cy={41} r={8.5} fill={c} {...line()} />
        <circle cx={73} cy={41} r={8.5} fill={c} {...line()} />
        <circle cx={27} cy={41} r={4.8} fill={face} />
        <circle cx={73} cy={41} r={4.8} fill={face} />
        <Head c={c} />
        <circle cx={43} cy={38} r={8.5} fill={face} />
        <circle cx={57} cy={38} r={8.5} fill={face} />
        <ellipse cx={50} cy={49} rx={13} ry={9.5} fill={face} />
        <Face y={38} dx={7} />
        <circle cx={48} cy={46} r={1.2} fill={C.ink} />
        <circle cx={52} cy={46} r={1.2} fill={C.ink} />
        <Smile x={50} y={50} w={12} />
        <path d="M60 66 Q75 78 88 58 Q86 56 84 58 Q74 70 62 61Z" fill={C.yellow} {...line(1.8)} />
        <ellipse cx={62} cy={64} rx={4.5} ry={4} fill={c} {...line(1.8)} />
      </g>
    )
  },

  loei: ({ color }) => {
    const [c, l] = pal(color, '#f3b74d', '#fde6bb')
    const mane = darken(c, 0.3)
    const tufts = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2
      return [f2(50 + 22 * Math.cos(a)), f2(41 + 22 * Math.sin(a))]
    })
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(68, 82)}>
          <Tube d="M68 82 Q86 84 84 68" c={c} w={3.5} />
          <circle cx={84} cy={66} r={4.5} fill={mane} {...line(1.8)} />
        </g>
        <Sit c={c} belly={l} y={72} />
        {tufts.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={9} fill={mane} {...line()} />
        ))}
        <circle cx={50} cy={41} r={23} fill={mane} />
        <circle cx={36} cy={27} r={5} fill={c} {...line()} />
        <circle cx={64} cy={27} r={5} fill={c} {...line()} />
        <Head c={c} y={42} r={17} />
        <Eyes x1={44} x2={56} y={39} r={2.8} />
        <Cheeks x1={38} x2={62} y={47} r={2.6} />
        <ellipse cx={50} cy={49} rx={7.5} ry={5.5} fill={l} />
        <path d="M47.5 45.5 L52.5 45.5 L50 48.5Z" fill="#7a4a2a" {...line(1.4)} />
        <path d="M46.5 50 Q48.3 52.5 50 50 Q51.7 52.5 53.5 50" fill="none" {...line(1.6)} />
      </g>
    )
  },

  pinguin: ({ color }) => {
    const c = color ?? '#33415a'
    return (
      <g>
        <Shadow />
        <g className="illu-flap" style={origin(30, 48)}>
          <ellipse cx={26} cy={60} rx={6} ry={15} transform="rotate(22 26 60)" fill={c} {...line()} />
        </g>
        <ellipse cx={74} cy={60} rx={6} ry={15} transform="rotate(-22 74 60)" fill={c} {...line()} />
        <ellipse cx={50} cy={56} rx={24} ry={32} fill={c} {...line()} />
        <ellipse cx={50} cy={66} rx={16} ry={20} fill={C.white} />
        <circle cx={43} cy={39} r={8.5} fill={C.white} />
        <circle cx={57} cy={39} r={8.5} fill={C.white} />
        <ellipse cx={50} cy={46} rx={12} ry={8} fill={C.white} />
        <Eyes x1={44} x2={56} y={39} r={2.9} />
        <Cheeks x1={38} x2={62} y={46} r={2.6} />
        <path d="M45 45 L55 45 L50 51Z" fill={C.orange} {...line(1.8)} />
        <ellipse cx={41} cy={88.5} rx={7} ry={3.5} fill={C.orange} {...line()} />
        <ellipse cx={59} cy={88.5} rx={7} ry={3.5} fill={C.orange} {...line()} />
      </g>
    )
  },

  igu: ({ color }) => {
    const c = color ?? '#7a5638'
    const face = '#f0d3a8'
    const n = 22
    const pts: string[] = []
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI
      const k = i % 2 === 0 ? 1 : 1.2
      pts.push(`${f2(50 + 36 * k * Math.cos(a))} ${f2(64 + 32 * k * Math.sin(a))}`)
    }
    const spikes = `M${pts.join(' L')} Q86 84 70 86 L30 86 Q14 84 14 64Z`
    return (
      <g>
        <Shadow />
        <path d={spikes} fill={c} {...line()} />
        <circle cx={66} cy={31} r={6} fill={C.red} {...line(1.8)} />
        <path d="M66 25 L67 21" {...line(1.8)} />
        <ellipse cx={69.5} cy={22.5} rx={3} ry={1.6} transform="rotate(-20 69.5 22.5)" fill={C.leaf} {...line(1.2)} />
        <ellipse cx={50} cy={74} rx={21} ry={14} fill={face} {...line()} />
        <ellipse cx={50} cy={58} rx={16} ry={14} fill={face} {...line()} />
        <ellipse cx={50} cy={70} rx={14} ry={8} fill={face} />
        <Eyes x1={44} x2={56} y={55} r={2.9} />
        <Cheeks x1={38} x2={62} y={62} r={2.6} />
        <ellipse cx={50} cy={63} rx={3.6} ry={2.8} fill={C.ink} />
        <path d="M47 67 Q50 69.5 53 67" fill="none" {...line(1.6)} />
        <ellipse cx={40} cy={88} rx={6} ry={3.5} fill={face} {...line()} />
        <ellipse cx={60} cy={88} rx={6} ry={3.5} fill={face} {...line()} />
      </g>
    )
  },

  wouf: ({ color }) => {
    const [c, l] = pal(color, '#8f98a6', '#eef0f3')
    return (
      <g>
        <Shadow />
        <BushyTail c={c} tip={l} />
        <Sit c={c} belly={l} />
        <path d="M31 34 L30 8 L47 22Z" fill={c} {...line()} />
        <path d="M69 34 L70 8 L53 22Z" fill={c} {...line()} />
        <path d="M33 28 L32 14 L42 22Z" fill={l} />
        <path d="M67 28 L68 14 L58 22Z" fill={l} />
        <Head c={c} />
        <path d="M32 39 Q41 32 50 38 Q59 32 68 39 Q67 58 50 61 Q33 58 32 39Z" fill={l} />
        <Face y={38} />
        <ellipse cx={50} cy={47} rx={4} ry={3} fill={C.ink} />
        <path d="M44 51 Q50 56 56 51" fill="none" {...line(1.8)} />
        <ellipse cx={50} cy={55} rx={2.4} ry={2.8} fill="#f26b7a" {...line(1.2)} />
      </g>
    )
  },

  luchs: ({ color }) => {
    const [c, l] = pal(color, '#d8b07a', '#f8ead0')
    const spot = darken(c, 0.35)
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(68, 82)}>
          <Tube d="M68 82 Q80 82 82 72" c={c} w={6} />
          <circle cx={82.3} cy={70} r={3.6} fill={C.ink} />
        </g>
        <Sit c={c} belly={l} />
        <circle cx={38} cy={66} r={1.6} fill={spot} />
        <circle cx={62} cy={74} r={1.6} fill={spot} />
        <circle cx={64} cy={64} r={1.4} fill={spot} />
        <path d="M32 33 L31 13 L45 22Z" fill={c} {...line()} />
        <path d="M68 33 L69 13 L55 22Z" fill={c} {...line()} />
        <path d="M29.5 14 L31 6 L33 14Z M70.5 14 L69 6 L67 14Z" fill={C.ink} {...line(1.6)} />
        <path d="M30 40 L23 50 L31 50 L27 58 L37 56 L41 63 L50 59 L59 63 L63 56 L73 58 L69 50 L77 50 L70 40Z" fill={l} {...line()} />
        <Head c={c} y={39} r={20} />
        <circle cx={44} cy={25} r={1.5} fill={spot} />
        <circle cx={50} cy={23} r={1.5} fill={spot} />
        <circle cx={56} cy={25} r={1.5} fill={spot} />
        <Face y={37} dx={7.5} />
        <circle cx={46.5} cy={48} r={4.5} fill={l} />
        <circle cx={53.5} cy={48} r={4.5} fill={l} />
        <path d="M47.5 44.5 L52.5 44.5 L50 47.5Z" fill={C.pink} {...line(1.4)} />
        <Whiskers y={47} x1={41} x2={59} />
      </g>
    )
  },

  frosch: ({ color }) => {
    const [c, l] = pal(color, C.green, '#c7e8a8')
    return (
      <g>
        <Shadow y={91} rx={34} />
        <ellipse cx={24} cy={78} rx={11} ry={7.5} fill={c} {...line()} />
        <ellipse cx={76} cy={78} rx={11} ry={7.5} fill={c} {...line()} />
        <ellipse cx={20} cy={87} rx={9} ry={3.5} fill={c} {...line()} />
        <ellipse cx={80} cy={87} rx={9} ry={3.5} fill={c} {...line()} />
        <circle cx={35} cy={40} r={11} fill={c} {...line()} />
        <circle cx={65} cy={40} r={11} fill={c} {...line()} />
        <ellipse cx={50} cy={64} rx={30} ry={22} fill={c} {...line()} />
        <ellipse cx={50} cy={72} rx={18} ry={11} fill={l} />
        <circle cx={35} cy={40} r={8} fill={c} />
        <circle cx={65} cy={40} r={8} fill={c} />
        <BigEyes x1={35} x2={65} y={40} r={7} />
        <circle cx={47} cy={53} r={1.2} fill={C.ink} />
        <circle cx={53} cy={53} r={1.2} fill={C.ink} />
        <path d="M33 58 Q50 72 67 58" fill="none" {...line(2.4)} />
        <Cheeks x1={28} x2={72} y={58} r={4} />
        <ellipse cx={38} cy={86} rx={6} ry={3.2} fill={c} {...line()} />
        <ellipse cx={62} cy={86} rx={6} ry={3.2} fill={c} {...line()} />
      </g>
    )
  },

  murmeli: ({ color }) => {
    const [c, l] = pal(color, '#a8835a', '#ecd8b8')
    return (
      <g>
        <Shadow y={92} rx={36} />
        <path d="M12 92 Q13 78 28 76 L72 76 Q87 78 88 92Z" fill={C.stone} {...line()} />
        <path d="M24 84 Q30 82 34 84 M64 86 Q70 83 76 86" fill="none" {...line(1.4)} />
        <ellipse cx={50} cy={58} rx={17} ry={21} fill={c} {...line()} />
        <ellipse cx={50} cy={63} rx={10} ry={13} fill={l} />
        <ellipse cx={42} cy={78} rx={6} ry={3.5} fill={c} {...line()} />
        <ellipse cx={58} cy={78} rx={6} ry={3.5} fill={c} {...line()} />
        <circle cx={37} cy={20} r={4.5} fill={c} {...line()} />
        <circle cx={63} cy={20} r={4.5} fill={c} {...line()} />
        <Head c={c} y={31} r={16} />
        <Eyes x1={44} x2={56} y={28} r={2.7} />
        <Cheeks x1={38} x2={62} y={35} r={2.4} />
        <ellipse cx={50} cy={37} rx={7.5} ry={5.5} fill={l} />
        <ellipse cx={50} cy={34.5} rx={2.8} ry={2} fill={C.ink} />
        <rect x={48.2} y={39.5} width={3.6} height={4} rx={1} fill={C.white} {...line(1.2)} />
        <ellipse cx={45} cy={50} rx={3.5} ry={4.5} fill={c} {...line(1.8)} />
        <ellipse cx={55} cy={50} rx={3.5} ry={4.5} fill={c} {...line(1.8)} />
      </g>
    )
  },

  otter: ({ color }) => {
    const [c, l] = pal(color, '#7b5236', '#ecd3b2')
    return (
      <g>
        <ellipse cx={50} cy={66} rx={18} ry={20} fill={c} {...line()} />
        <ellipse cx={50} cy={68} rx={11} ry={14} fill={l} />
        <circle cx={35} cy={26} r={4.5} fill={c} {...line()} />
        <circle cx={65} cy={26} r={4.5} fill={c} {...line()} />
        <Head c={c} y={39} r={18} />
        <ellipse cx={50} cy={47} rx={12.5} ry={8.5} fill={l} />
        <Eyes x1={43} x2={57} y={36} r={2.9} />
        <Cheeks x1={37} x2={63} y={45} r={2.4} />
        <ellipse cx={50} cy={44} rx={3.6} ry={2.6} fill={C.ink} />
        <path d="M46 48.5 Q48 51 50 48.5 Q52 51 54 48.5" fill="none" {...line(1.6)} />
        <Whiskers y={46} x1={41} x2={59} />
        <g className="illu-wag" style={origin(50, 64)}>
          <ellipse cx={48} cy={64} rx={8} ry={4.2} fill={C.blue} {...line(1.8)} />
          <path d="M56 64 L62 60 L62 68Z" fill={C.blue} {...line(1.8)} />
          <circle cx={44} cy={63} r={1} fill={C.ink} />
        </g>
        <ellipse cx={41} cy={66} rx={4} ry={3.5} fill={c} {...line(1.8)} />
        <ellipse cx={58} cy={66} rx={4} ry={3.5} fill={c} {...line(1.8)} />
        <Water y={79} />
        <circle cx={22} cy={70} r={2} fill="none" {...line(1.4)} />
        <circle cx={80} cy={66} r={2.6} fill="none" {...line(1.4)} />
      </g>
    )
  },

  biber: ({ color }) => {
    const [c, l] = pal(color, '#8a5a35', '#dcb88e')
    const tail = '#5a4030'
    return (
      <g>
        <Shadow />
        <g className="illu-wag" style={origin(62, 84)}>
          <g transform="rotate(-20 75 80)">
            <ellipse cx={75} cy={80} rx={16} ry={7} fill={tail} {...line()} />
            <path d="M66 77 L84 77 M64 80.5 L86 80.5 M66 84 L84 84 M70 74 L70 86 M75 73 L75 87 M80 74 L80 86" stroke={lighten(tail, 0.3)} strokeWidth={1.3} />
          </g>
        </g>
        <Sit c={c} belly={l} />
        <circle cx={33} cy={24} r={5} fill={c} {...line()} />
        <circle cx={67} cy={24} r={5} fill={c} {...line()} />
        <Head c={c} />
        <Face y={37} />
        <ellipse cx={50} cy={47} rx={10} ry={7} fill={l} />
        <ellipse cx={50} cy={43.5} rx={4} ry={2.8} fill={C.ink} />
        <rect x={45.5} y={49} width={9} height={9} rx={2} fill="#f2a43a" {...line(1.6)} />
        <path d="M50 49.5 L50 57.5" {...line(1.4)} />
        <Tube d="M28 76 L72 64" c="#b07a45" w={4} />
        <ellipse cx={74} cy={60} rx={5} ry={2.6} transform="rotate(-40 74 60)" fill={C.leaf} {...line(1.4)} />
        <ellipse cx={40} cy={72} rx={4.2} ry={3.8} fill={c} {...line(1.8)} />
        <ellipse cx={60} cy={67} rx={4.2} ry={3.8} fill={c} {...line(1.8)} />
      </g>
    )
  },

  elefant: ({ color }) => {
    const [c, l] = pal(color, '#a3adb8', '#d6dce2')
    const inner = '#f2c2c6'
    return (
      <g>
        <Shadow />
        <Sit c={c} belly={l} />
        <path d="M37 90 l0 -2.5 M40 90.5 l0 -2.5 M43 90 l0 -2.5 M57 90 l0 -2.5 M60 90.5 l0 -2.5 M63 90 l0 -2.5" stroke={C.white} strokeWidth={2} strokeLinecap="round" />
        <g className="illu-flap" style={origin(38, 36)}>
          <ellipse cx={24} cy={40} rx={16} ry={20} fill={c} {...line()} />
          <ellipse cx={25} cy={41} rx={10} ry={13} fill={inner} />
        </g>
        <ellipse cx={76} cy={40} rx={16} ry={20} fill={c} {...line()} />
        <ellipse cx={75} cy={41} rx={10} ry={13} fill={inner} />
        <Head c={c} y={38} r={18} />
        <path d="M42 50 Q40 55 37 55 M58 50 Q60 55 63 55" fill="none" stroke={C.white} strokeWidth={3.4} strokeLinecap="round" />
        <Tube d="M50 46 C50 60 47 70 56 72 C62 73 65 66 60 63" c={c} w={9} />
        <path d="M46 56 L54 56 M46 61 L54 61 M47 66 L54 66" stroke={darken(c, 0.15)} strokeWidth={1.4} strokeLinecap="round" />
        <Eyes x1={43} x2={57} y={35} r={2.9} />
        <Cheeks x1={37} x2={63} y={43} r={2.8} />
      </g>
    )
  },

  /* ----------------------------------------------------------- side quads */
  ross: ({ color }) => {
    const [c, l] = pal(color, '#a8682f', '#e7c39a')
    const mane = darken(c, 0.4)
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={67}
          hy={31}
          tail={
            <g className="illu-wag" style={origin(18, 50)}>
              <Tube d="M18 50 Q6 58 11 74" c={mane} w={6} />
            </g>
          }
          neck={<path d="M52 50 Q47 44 53 42 Q50 37 56 36 Q54 31 60 30 L64 34 L57 48Z" fill={mane} {...line(1.8)} />}
          head={<LongHead x={67} y={31} c={c} muzzle={l} mane={mane} />}
        />
      </g>
    )
  },

  zebra: ({ color }) => {
    const c = color ?? C.white
    const k = C.black
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={67}
          hy={31}
          tail={
            <g className="illu-wag" style={origin(18, 50)}>
              <Tube d="M18 50 Q10 58 12 70" c={c} w={2.5} />
              <ellipse cx={12} cy={72} rx={3} ry={4.5} fill={k} />
            </g>
          }
          overlay={<path d={stripes(42, 56, 25, 14, [24, 31, 38, 45, 52, 59])} fill="none" stroke={k} strokeWidth={3.4} strokeLinecap="round" />}
          neck={
            <>
              <path d="M57 50 L69 53 M56.5 44.5 L71 47 M59.5 39.5 L72.5 41.5" stroke={k} strokeWidth={3} strokeLinecap="round" />
              <path d="M52 48 L50 44 L54 43 L53 39 L57 39 L57 35 L61 35 L61 31 L64 34 L57 48Z" fill={k} {...line(1.6)} />
            </>
          }
          head={
            <>
              <LongHead x={67} y={31} c={c} muzzle="#7d7d7d"/>
              <path d="M63.5 21 Q67 22.5 70.5 21 M62 24.5 Q67 26.5 72 24.5" stroke={k} strokeWidth={2} strokeLinecap="round" fill="none" />
            </>
          }
        />
      </g>
    )
  },

  esu: ({ color }) => {
    const [c, l] = pal(color, '#a4a09a', '#ece8e1')
    const dk = darken(c, 0.4)
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={67}
          hy={37}
          tail={
            <g className="illu-wag" style={origin(18, 50)}>
              <Tube d="M18 50 Q10 58 12 70" c={c} w={2.5} />
              <ellipse cx={12} cy={72} rx={3} ry={4.5} fill={dk} />
            </g>
          }
          overlay={<ellipse cx={42} cy={64} rx={16} ry={5} fill={l} />}
          neck={
            <>
              <path d="M52 48 L50 44 L54 43 L53 39 L57 39 L58 36 L62 37 L64 40 L57 48Z" fill={dk} {...line(1.6)} />
              <g className="illu-flap" style={origin(61, 28)}>
                <ellipse cx={60} cy={19} rx={4.8} ry={12} transform="rotate(-15 60 19)" fill={c} {...line(1.8)} />
                <ellipse cx={60} cy={20} rx={2.2} ry={8} transform="rotate(-15 60 19)" fill={dk} />
              </g>
              <ellipse cx={74} cy={19} rx={4.8} ry={12} transform="rotate(15 74 19)" fill={c} {...line(1.8)} />
              <ellipse cx={74} cy={20} rx={2.2} ry={8} transform="rotate(15 74 19)" fill={dk} />
            </>
          }
          head={<LongHead x={67} y={37} c={c} muzzle={l} ears={false} />}
        />
      </g>
    )
  },

  chue: ({ color }) => {
    const c = color ?? '#fbf8f2'
    const patch = '#3a3330'
    const x = 67
    const y = 32
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={x}
          hy={y}
          neckW={15}
          tail={
            <g className="illu-wag" style={origin(18, 50)}>
              <Tube d="M18 50 Q11 60 13 70" c={c} w={2.5} />
              <ellipse cx={13} cy={72} rx={3} ry={4.5} fill={patch} />
            </g>
          }
          overlay={
            <>
              <path d="M24 50 Q28 44 36 46 Q40 52 34 56 Q26 58 24 50Z" fill={patch} />
              <path d="M44 60 Q48 54 54 57 Q56 63 50 65 Q44 65 44 60Z" fill={patch} />
              <ellipse cx={48} cy={70} rx={6} ry={3.2} fill={C.pink} {...line(1.6)} />
            </>
          }
          neck={
            <>
              <path d="M58 50 Q67 55 76 49" fill="none" stroke={C.red} strokeWidth={2.6} strokeLinecap="round" />
              <path d="M64 53 L70 53 L72 60 L62 60Z" fill={C.yellow} {...line(1.6)} />
            </>
          }
          head={
            <>
              <path d={`M${x - 7} ${y - 8} Q${x - 14} ${y - 14} ${x - 10} ${y - 19} Q${x - 8} ${y - 13} ${x - 3} ${y - 10}Z`} fill="#f4e6c4" {...line(1.4)} />
              <path d={`M${x + 7} ${y - 8} Q${x + 14} ${y - 14} ${x + 10} ${y - 19} Q${x + 8} ${y - 13} ${x + 3} ${y - 10}Z`} fill="#f4e6c4" {...line(1.4)} />
              <WideHead x={x} y={y} c={c} muzzle={C.pink} />
              <ellipse cx={x + 5} cy={y - 7.5} rx={3.5} ry={2.6} fill={patch} />
            </>
          }
        />
      </g>
    )
  },

  chaub: ({ color }) => {
    const c = color ?? '#c98a4b'
    const s = 0.84
    const x = 67
    const y = 33
    return (
      <g>
        <g transform={`translate(${f2(50 * (1 - s))} ${f2(90 * (1 - s))}) scale(${s})`}>
          <Quad
            c={c}
            hoof={C.ink}
            hx={x}
            hy={y}
            hs={1.4}
            neckW={15}
            tail={
              <g className="illu-wag" style={origin(18, 50)}>
                <Tube d="M18 50 Q11 60 13 70" c={c} w={2.5} />
                <ellipse cx={13} cy={72} rx={3} ry={4.5} fill={C.white} {...line(1.4)} />
              </g>
            }
            overlay={
              <>
                <path d="M26 52 Q30 45 38 47 Q41 54 35 57 Q28 59 26 52Z" fill={C.white} />
                <path d="M46 61 Q50 56 56 58 Q57 64 51 66 Q46 66 46 61Z" fill={C.white} />
              </>
            }
            head={
              <>
                <WideHead x={x} y={y} c={c} muzzle={C.pink} earLen={8} />
                <path d={`M${x - 3} ${y - 9} Q${x} ${y - 12} ${x + 3} ${y - 9} Q${x + 1.5} ${y - 4} ${x} ${y - 6} Q${x - 1.5} ${y - 4} ${x - 3} ${y - 9}Z`} fill={C.white} />
              </>
            }
          />
        </g>
      </g>
    )
  },

  geiss: ({ color }) => {
    const [c, l] = pal(color, '#f1ebe0', '#fffaf2')
    const horn = '#a59c90'
    const x = 67
    const y = 35
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={x}
          hy={y}
          tail={<path d="M19 48 L12 40 L22 44Z" fill={c} {...line(1.8)} />}
          overlay={<ellipse cx={42} cy={62} rx={16} ry={5} fill={l} />}
          neck={
            <>
              <Tube d="M62 26 Q58 14 50 14" c={horn} w={3.6} />
              <Tube d="M70 25 Q69 13 61 10" c={horn} w={3.6} />
            </>
          }
          head={
            <>
              <WideHead x={x} y={y} c={c} muzzle="#f6d6d6" earLen={8} />
              <path d={`M${x - 3} ${y + 13} L${x} ${y + 21} L${x + 3} ${y + 13}Z`} fill={l} {...line(1.4)} />
            </>
          }
        />
      </g>
    )
  },

  steibock: ({ color }) => {
    const [c, l] = pal(color, '#9b7b5b', '#dcc7a8')
    const horn = '#d6bf96'
    const hornEl = (d: string) => (
      <>
        <path d={d} fill="none" stroke={C.ink} strokeWidth={10.5} strokeLinecap="round" />
        <path d={d} fill="none" stroke={horn} strokeWidth={6.2} strokeLinecap="round" />
        <path d={d} fill="none" stroke={darken(horn, 0.25)} strokeWidth={6.2} strokeDasharray="1.4 3.2" />
      </>
    )
    const x = 67
    const y = 37
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={x}
          hy={y}
          tail={<path d="M19 48 L13 42 L22 45Z" fill={c} {...line(1.8)} />}
          overlay={<ellipse cx={42} cy={63} rx={16} ry={5} fill={l} />}
          neck={
            <>
              {hornEl('M61 29 C56 13 40 9 29 21')}
              {hornEl('M70 28 C68 11 52 6 40 15')}
            </>
          }
          head={
            <>
              <WideHead x={x} y={y} c={c} muzzle={l} earLen={6} />
              <path d={`M${x - 2.5} ${y + 13} L${x} ${y + 19} L${x + 2.5} ${y + 13}Z`} fill={darken(c, 0.35)} {...line(1.4)} />
            </>
          }
        />
      </g>
    )
  },

  reh: ({ color }) => {
    const [c, l] = pal(color, '#b9733e', '#f4e2c8')
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={67}
          hy={33}
          legW={6}
          tail={<circle cx={18} cy={52} r={6} fill={C.white} {...line(1.8)} />}
          overlay={<ellipse cx={42} cy={63} rx={16} ry={5} fill={l} />}
          neck={<path d="M60 49 Q66 53 72 47 L70 44 L62 44Z" fill={C.white} />}
          head={<WideHead x={67} y={33} c={c} muzzle={l} earLen={9} earUp earIn={l} nose />}
        />
      </g>
    )
  },

  hirsch: ({ color }) => {
    const [c, l] = pal(color, '#9a5b2e', '#ead2ae')
    const ant = '#ead2a8'
    const antlers = 'M62 28 L56 15 L49 11 M56 15 L55 6 M59 21 L50 19 M72 28 L78 15 L85 11 M78 15 L79 6 M75 21 L84 19'
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={67}
          hy={36}
          tail={<path d="M19 48 L13 44 L21 51Z" fill={c} {...line(1.8)} />}
          overlay={<ellipse cx={42} cy={63} rx={16} ry={5} fill={l} />}
          neck={
            <>
              <path d="M54.5 46 L61.5 43 L73 43 L66.5 59Z" fill={darken(c, 0.2)} />
              <Tube d={antlers} c={ant} w={3.4} />
            </>
          }
          head={<WideHead x={67} y={36} c={c} muzzle={l} earLen={7} earIn={l} nose />}
        />
      </g>
    )
  },

  giraffe: ({ color }) => {
    const [c, l] = pal(color, '#f4c45a', '#fbe7b5')
    const sp = '#b8742f'
    const x = 70
    const y = 17
    return (
      <g>
        <Quad
          c={c}
          hoof={C.ink}
          hx={x}
          hy={y}
          hs={1.05}
          bodyY={50}
          neckW={11}
          legW={6.5}
          tail={
            <g className="illu-wag" style={origin(18, 50)}>
              <Tube d="M18 50 Q12 58 14 66" c={c} w={2} />
              <ellipse cx={14} cy={68} rx={2.6} ry={4} fill={sp} />
            </g>
          }
          overlay={
            <path transform="translate(0 -4)" d="M28 48 l6 -2 l3 5 l-5 4 l-5 -2Z M42 46 l7 0 l2 6 l-6 3 l-4 -4Z M33 58 l7 -1 l2 5 l-7 2Z M48 58 l6 -2 l3 5 l-6 3Z" fill={sp} />
          }
          neck={
            <>
              <path d="M54 44 L52 41 L56 39 L56 34 L60 33 L60 28 L64 27 L64 24 L67 26 L58 44Z" fill={sp} {...line(1.4)} />
              <path d="M62 41 l4 -1 l1 4 l-4 1Z M66 32 l3 0 l0 4 l-3 0Z M64 49 l4 -1 l1 4 l-4 1Z" fill={sp} />
            </>
          }
          head={
            <>
              <path d={`M${x - 3} ${y - 8} L${x - 4} ${y - 10} M${x + 3} ${y - 8} L${x + 4} ${y - 10}`} {...line(2.4)} />
              <circle cx={x - 4} cy={y - 10.5} r={2} fill={sp} {...line(1.4)} />
              <circle cx={x + 4} cy={y - 10.5} r={2} fill={sp} {...line(1.4)} />
              <WideHead x={x} y={y} c={c} muzzle={l} earLen={6} />
              <path d={`M${x + 4} ${y - 9} l2.5 0 l0 2.5 l-2.5 0Z`} fill={sp} />
            </>
          }
        />
      </g>
    )
  },

  krokodil: ({ color }) => {
    const [c, l] = pal(color, '#5fae4f', '#d8eaa2')
    const dk = darken(c, 0.2)
    return (
      <g>
        <Shadow y={88} rx={40} />
        {[28, 38, 52, 62].map((x) => (
          <ellipse key={x} cx={x} cy={81} rx={5} ry={6} fill={x === 38 || x === 62 ? dk : c} {...line()} />
        ))}
        {[22, 30, 38, 46, 54].map((x) => (
          <circle key={x} cx={x} cy={58 - (x === 22 ? 0 : 1)} r={3.2} fill={dk} {...line(1.6)} />
        ))}
        <g className="illu-wag" style={origin(26, 66)}>
          <path d="M26 60 Q12 62 8 50 Q12 70 28 76Z" fill={c} {...line()} />
        </g>
        <ellipse cx={42} cy={69} rx={23} ry={12} fill={c} {...line()} />
        <ellipse cx={42} cy={75} rx={16} ry={4} fill={l} />
        <circle cx={62} cy={47} r={6.5} fill={c} {...line()} />
        <circle cx={73} cy={46} r={6.5} fill={c} {...line()} />
        <path d="M55 58 Q56 49 68 51 L90 56 Q96 58 95 63 Q94 68 88 69 L64 73 Q56 73 55 68Z" fill={c} {...line()} />
        <path d="M59 63 Q76 68 93 61" fill="none" {...line(2)} />
        <path d="M67 65.2 l1.6 3 l1.6 -3 M74 65.6 l1.6 3 l1.6 -3 M81 65 l1.6 3 l1.6 -3" fill={C.white} stroke={C.ink} strokeWidth={1} strokeLinejoin="round" />
        <circle cx={91} cy={57} r={1.2} fill={C.ink} />
        <circle cx={62} cy={47} r={4.6} fill={C.white} />
        <circle cx={73} cy={46} r={4.6} fill={C.white} />
        <Eyes x1={62.5} x2={73.5} y={46.5} r={2.6} />
        <circle cx={66} cy={60} r={2.6} fill={C.cheek} opacity={0.55} />
      </g>
    )
  },

  schiudchrot: ({ color }) => {
    const shell = color ?? '#a2753f'
    const plate = lighten(shell, 0.3)
    const skin = '#a8c46e'
    return (
      <g>
        <Shadow y={90} rx={38} />
        <path d="M16 76 L8 80 L16 81Z" fill={skin} {...line(1.8)} />
        {[22, 34, 58, 70].map((x) => (
          <rect key={x} x={x} y={72} width={9} height={16} rx={4} fill={skin} {...line()} />
        ))}
        <path d="M74 66 Q80 62 80 56 L88 60 Q84 70 76 74Z" fill={skin} {...line()} />
        <path d="M14 76 Q14 36 49 36 Q84 36 84 76Z" fill={shell} {...line()} />
        <path d="M41 48 L57 48 L62 59 L57 70 L41 70 L36 59Z" fill={plate} {...line(1.6)} />
        <path d="M36 59 L19 60 M41 48 L35 39.5 M57 48 L63 39.5 M62 59 L79 60 M41 70 L39 76 M57 70 L59 76" fill="none" {...line(1.6)} />
        <path d="M24 46 Q20 54 21 60 M74 46 Q78 54 77 60" fill="none" stroke={plate} strokeWidth={2} strokeLinecap="round" />
        <rect x={10} y={73} width={78} height={7} rx={3.5} fill={plate} {...line()} />
        <circle cx={84} cy={55} r={10} fill={skin} {...line()} />
        <Eyes x1={80.5} x2={88} y={53} r={2.4} />
        <path d="M81 59 Q84.3 62 87.5 59" fill="none" {...line(1.6)} />
        <circle cx={78} cy={58} r={2} fill={C.cheek} opacity={0.55} />
      </g>
    )
  },

  /* --------------------------------------------------------------- birds */
  huen: ({ color }) => {
    const [c, l] = pal(color, '#e2a05e', '#f5d3a8')
    return (
      <g>
        <Fowl
          c={c}
          wing={l}
          comb={C.red}
          tail={<path d="M30 52 Q18 44 20 30 Q26 38 30 34 Q30 42 36 44Z" fill={c} {...line()} />}
        />
      </g>
    )
  },

  gueggu: ({ color }) => {
    const [c, l] = pal(color, '#c8552b', '#f2b552')
    return (
      <g>
        <Fowl
          c={c}
          wing={l}
          comb={C.red}
          combBig
          tail={
            <g className="illu-wag" style={origin(30, 58)}>
              <Tube d="M30 58 Q10 54 10 34" c={C.orange} w={5} />
              <Tube d="M30 56 Q14 40 22 18" c="#2c6e9c" w={6} />
              <Tube d="M32 54 Q24 34 36 20" c="#3e9f6b" w={6} />
            </g>
          }
        />
      </g>
    )
  },

  aente: ({ color }) => {
    const [c, l] = pal(color, '#f6d040', '#fbe9a0')
    return (
      <g>
        <path d="M16 54 Q12 64 22 72 Q34 82 58 78 Q76 74 74 60 Q72 54 68 52 Q78 46 78 36 Q76 24 64 24 Q52 25 52 37 Q52 46 58 51 Q46 56 30 56 Q22 56 16 54Z" fill={c} {...line()} />
        <path d="M76 36 Q86 34 91 38 Q91 43 85 44 Q80 44 76 41Z" fill={C.orange} {...line(1.8)} />
        <path d="M77 40 L88 40" {...line(1.4)} />
        <Eye x={68} y={34} r={3} />
        <circle cx={67} cy={42} r={2.4} fill={C.cheek} opacity={0.55} />
        <g className="illu-flap" style={origin(52, 60)}>
          <path d="M30 60 Q42 52 58 60 Q50 70 34 68Z" fill={l} {...line()} />
        </g>
        <Water y={74} />
      </g>
    )
  },

  vogu: ({ color }) => {
    const [c, l] = pal(color, C.blue, '#cfe6f8')
    return (
      <g>
        <path d="M44 72 L48 84 L50 72Z" fill={darken(c, 0.2)} {...line(1.6)} />
        <Tube d="M8 84 Q50 78 92 82" c="#8a5428" w={4.5} />
        <ellipse cx={80} cy={76} rx={6} ry={3} transform="rotate(-30 80 76)" fill={C.leaf} {...line(1.4)} />
        <ellipse cx={16} cy={78} rx={6} ry={3} transform="rotate(30 16 78)" fill={C.leaf} {...line(1.4)} />
        <path d="M45 82 l-2 4 M49 82 l0 4 M53 82 l0 4 M57 82 l2 4" stroke={C.orange} strokeWidth={2.4} strokeLinecap="round" />
        <path d="M48 28 Q46 18 52 16 Q50 22 54 26Z" fill={c} {...line(1.8)} />
        <g className="illu-flap" style={origin(30, 46)}>
          <ellipse cx={27} cy={56} rx={7} ry={13} transform="rotate(30 27 56)" fill={darken(c, 0.12)} {...line()} />
        </g>
        <g className="illu-flap" style={origin(70, 46)}>
          <ellipse cx={73} cy={56} rx={7} ry={13} transform="rotate(-30 73 56)" fill={darken(c, 0.12)} {...line()} />
        </g>
        <circle cx={50} cy={53} r={25} fill={c} {...line()} />
        <ellipse cx={50} cy={63} rx={15} ry={13} fill={l} />
        <Eyes x1={42} x2={58} y={45} r={3.2} />
        <Cheeks x1={35} x2={65} y={53} r={3} />
        <path d="M46 50 L54 50 L50 56Z" fill={C.orange} {...line(1.8)} />
      </g>
    )
  },

  schwan: ({ color }) => {
    const c = color ?? C.white
    return (
      <g>
        <path d="M14 58 Q14 48 26 54 Q42 62 60 58 Q72 55 74 66 Q74 80 46 80 Q18 80 14 58Z" fill={c} {...line()} />
        <Tube d="M64 62 C72 48 56 38 60 26 C62 18 70 16 74 22" c={c} w={7} />
        <circle cx={71} cy={21} r={7} fill={c} {...line()} />
        <path d="M77 18 L90 24 L77 26Z" fill={C.orange} {...line(1.8)} />
        <ellipse cx={77} cy={22} rx={2} ry={3.6} fill={C.ink} />
        <Eye x={71} y={19} r={2.6} />
        <circle cx={69} cy={25} r={2} fill={C.cheek} opacity={0.55} />
        <g className="illu-flap" style={origin(58, 60)}>
          <path d="M26 58 Q36 38 60 54 Q48 64 26 58Z" fill={mix(c, '#c9d6e6', 0.25)} {...line()} />
        </g>
        <Water y={74} />
      </g>
    )
  },

  storch: ({ color }) => {
    const c = color ?? C.white
    const red = C.red
    return (
      <g>
        <Shadow y={90} rx={20} />
        <path d="M46 60 L46 89 M41 90 L46 88 L51 90" fill="none" stroke={red} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 60 L60 72 L50 75" fill="none" stroke={red} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={42} cy={52} rx={24} ry={12} transform="rotate(-12 42 52)" fill={c} {...line()} />
        <g className="illu-flap" style={origin(56, 48)}>
          <path d="M30 50 L10 49 L17 53 L9 56 L17 58 L12 62 L32 58Z" fill={C.black} {...line(1.6)} />
          <path d="M26 52 Q40 41 58 46 Q52 58 34 59 Q27 58 26 52Z" fill={c} {...line()} />
        </g>
        <Tube d="M60 46 Q68 36 64 26 Q62 20 66 16" c={c} w={6} />
        <circle cx={66} cy={18} r={8} fill={c} {...line()} />
        <path d="M72 15 L93 26 L71 21Z" fill={red} {...line(1.8)} />
        <Eye x={67} y={16} r={2.6} />
        <circle cx={64.5} cy={22} r={2} fill={C.cheek} opacity={0.55} />
      </g>
    )
  },

  /* ------------------------------------------------------- little critters */
  fisch: ({ color }) => {
    const [c, l] = pal(color, C.orange, '#fcd2a2')
    return (
      <g>
        <g className="illu-bob">
          <g className="illu-wag" style={origin(24, 50)}>
            <path d="M26 50 L8 34 Q12 50 8 66Z" fill={darken(c, 0.1)} {...line()} />
          </g>
          <path d="M40 34 Q50 18 62 32Z" fill={darken(c, 0.1)} {...line()} />
          <ellipse cx={50} cy={50} rx={28} ry={19} fill={c} {...line()} />
          <ellipse cx={52} cy={57} rx={18} ry={8} fill={l} />
          <path d="M30 44 Q34 48 30 52 M37 40 Q41 46 37 52 M33 53 Q37 57 33 61" fill="none" stroke={darken(c, 0.15)} strokeWidth={1.8} strokeLinecap="round" />
          <circle cx={66} cy={45} r={6} fill={C.white} {...line(1.6)} />
          <Eye x={67} y={45} r={3.4} />
          <path d="M70 55 Q74 58 77 54" fill="none" {...line(2)} />
          <circle cx={64} cy={54} r={2.6} fill={C.cheek} opacity={0.6} />
        </g>
        <circle cx={84} cy={34} r={3} fill="none" stroke={C.water} strokeWidth={2} />
        <circle cx={88} cy={24} r={2} fill="none" stroke={C.water} strokeWidth={2} />
        <circle cx={82} cy={15} r={3.6} fill="none" stroke={C.water} strokeWidth={2} />
        <path d="M14 84 Q22 80 30 84 T46 84 M54 88 Q62 84 70 88 T86 88" fill="none" stroke={C.water} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    )
  },

  schnaegg: ({ color }) => {
    const shell = color ?? '#e39b4b'
    const body = '#ead39c'
    return (
      <g>
        <Shadow y={88} rx={38} />
        <path d="M70 42 L66 26 M78 42 L82 26" fill="none" {...line(2.4)} />
        <circle cx={66} cy={24} r={4.5} fill={body} {...line(1.8)} />
        <circle cx={82} cy={24} r={4.5} fill={body} {...line(1.8)} />
        <Eyes x1={66} x2={82} y={24} r={2.4} />
        <path d="M10 86 Q12 78 30 78 L62 78 Q66 64 66 52 Q66 38 76 38 Q88 38 88 54 Q88 86 60 86Z" fill={body} {...line()} />
        <Cheeks x1={70} x2={84} y={56} r={2.4} />
        <path d="M72 60 Q77 64 82 60" fill="none" {...line(1.8)} />
        <circle cx={42} cy={56} r={24} fill={shell} {...line()} />
        <path d="M42 56 m0 0 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0 a15 15 0 0 1 30 0" fill="none" {...line(2.2)} />
        <ellipse cx={32} cy={42} rx={5} ry={3} transform="rotate(-35 32 42)" fill={C.white} opacity={0.4} />
      </g>
    )
  },

  summervogu: ({ color }) => {
    const w1 = color ?? C.orange
    const w2 = C.purple
    return (
      <g>
        <Shadow y={92} rx={20} />
        <g className="illu-bob">
          <g className="illu-flap" style={origin(50, 52)}>
            <path d="M48 48 Q30 16 14 28 Q6 44 26 54 Q38 56 48 52Z" fill={w1} {...line()} />
            <path d="M48 56 Q26 56 22 72 Q26 86 40 78 Q48 70 48 60Z" fill={w2} {...line()} />
            <circle cx={26} cy={38} r={5} fill={C.yellow} {...line(1.4)} />
            <circle cx={34} cy={70} r={3.5} fill={C.rose} {...line(1.4)} />
          </g>
          <path d="M52 48 Q70 16 86 28 Q94 44 74 54 Q62 56 52 52Z" fill={w1} {...line()} />
          <path d="M52 56 Q74 56 78 72 Q74 86 60 78 Q52 70 52 60Z" fill={w2} {...line()} />
          <circle cx={74} cy={38} r={5} fill={C.yellow} {...line(1.4)} />
          <circle cx={66} cy={70} r={3.5} fill={C.rose} {...line(1.4)} />
          <ellipse cx={50} cy={60} rx={4.5} ry={18} fill="#5a4a6a" {...line()} />
          <path d="M47 32 Q44 20 38 18 M53 32 Q56 20 62 18" fill="none" {...line(1.8)} />
          <circle cx={38} cy={18} r={2.4} fill={C.ink} />
          <circle cx={62} cy={18} r={2.4} fill={C.ink} />
          <circle cx={50} cy={38} r={9} fill="#5a4a6a" {...line()} />
          <BigEyes x1={46} x2={54} y={37} r={3.4} />
          <path d="M47 42 Q50 44.5 53 42" fill="none" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      </g>
    )
  },

  biene: ({ color }) => {
    const c = color ?? C.yellow
    const k = C.black
    return (
      <g>
        <Shadow y={90} rx={22} />
        <g className="illu-bob">
          <g className="illu-flap" style={origin(46, 44)}>
            <ellipse cx={38} cy={30} rx={10} ry={15} transform="rotate(-25 38 30)" fill="#e6f4fc" {...line()} />
          </g>
          <ellipse cx={54} cy={28} rx={9} ry={14} transform="rotate(20 54 28)" fill="#e6f4fc" {...line()} />
          <path d="M18 60 L10 62 L18 65Z" fill={C.ink} />
          <ellipse cx={42} cy={60} rx={25} ry={18} fill={c} {...line()} />
          <path d={stripes(42, 60, 25, 18, [33, 45], 1)} stroke={k} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M70 40 Q70 30 64 26 M78 40 Q80 30 86 27" fill="none" {...line(1.8)} />
          <circle cx={64} cy={26} r={2.4} fill={C.ink} />
          <circle cx={86} cy={27} r={2.4} fill={C.ink} />
          <circle cx={73} cy={52} r={14} fill={c} {...line()} />
          <Eyes x1={68} x2={78} y={50} r={2.8} />
          <Cheeks x1={65} x2={81} y={56} r={2.4} />
          <path d="M70 57 Q73 60 76 57" fill="none" {...line(1.8)} />
        </g>
      </g>
    )
  },

  himugueegeli: ({ color }) => {
    const c = color ?? C.red
    const k = C.black
    return (
      <g>
        <Shadow y={90} rx={28} />
        <path d="M24 50 L14 44 M22 62 L11 64 M26 74 L16 82 M76 50 L86 44 M78 62 L89 64 M74 74 L84 82" fill="none" {...line(2.6)} />
        <path d="M44 22 Q40 12 34 10 M56 22 Q60 12 66 10" fill="none" {...line(2)} />
        <circle cx={34} cy={10} r={2.4} fill={C.ink} />
        <circle cx={66} cy={10} r={2.4} fill={C.ink} />
        <circle cx={50} cy={60} r={28} fill={c} {...line()} />
        <path d="M50 34 L50 88" {...line(2)} />
        {[
          [38, 50, 5.5],
          [62, 50, 5.5],
          [34, 68, 5],
          [66, 68, 5],
          [43, 80, 3.8],
          [57, 80, 3.8],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={k} />
        ))}
        <ellipse cx={38} cy={44} rx={5} ry={2.5} transform="rotate(-30 38 44)" fill={C.white} opacity={0.4} />
        <path d="M32 36 Q50 14 68 36 Q50 42 32 36Z" fill={k} {...line()} />
        <BigEyes x1={44} x2={56} y={30} r={4} />
        <path d="M47 35.5 Q50 37.5 53 35.5" fill="none" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    )
  },

  spinne: ({ color }) => {
    const [c, l] = pal(color, '#6a5a8c', '#a99bc8')
    const legs = 'M34 56 Q20 44 12 52 M33 62 Q18 58 10 66 M34 68 Q20 70 14 82 M38 73 Q28 80 26 90 M66 56 Q80 44 88 52 M67 62 Q82 58 90 66 M66 68 Q80 70 86 82 M62 73 Q72 80 74 90'
    return (
      <g>
        <Shadow y={92} rx={26} />
        <path d="M50 6 L50 40" stroke={C.inkSoft} strokeWidth={1.4} />
        <Tube d={legs} c={c} w={3.4} />
        <circle cx={50} cy={62} r={20} fill={c} {...line()} />
        <ellipse cx={50} cy={70} rx={11} ry={8} fill={l} />
        <BigEyes x1={43} x2={57} y={56} r={6} />
        <Cheeks x1={36} x2={64} y={65} r={3} />
        <path d="M45 67 Q50 72 55 67" fill="none" {...line(2)} />
      </g>
    )
  },

  wurm: ({ color }) => {
    const c = color ?? '#f39aa8'
    const d = 'M14 80 Q24 60 36 76 Q48 92 58 72 Q64 60 70 54'
    return (
      <g>
        <Shadow y={88} rx={32} />
        <path d="M8 88 Q10 80 14 86 M88 88 Q86 78 82 86 M84 88 Q86 82 88 84" fill="none" stroke={C.greenDark} strokeWidth={2.2} strokeLinecap="round" />
        <Tube d={d} c={c} w={12} />
        <path d="M20 70 L26 74 M38 78 L32 82 M50 82 L56 78" stroke={darken(c, 0.15)} strokeWidth={1.6} strokeLinecap="round" />
        <circle cx={72} cy={46} r={14} fill={c} {...line()} />
        <Eyes x1={67} x2={77} y={44} r={2.8} />
        <Cheeks x1={64} x2={80} y={50} r={2.4} />
        <path d="M68 51 Q72 55 76 51" fill="none" {...line(1.8)} />
      </g>
    )
  },

  /* -------------------------------------------------------------- colours */
  rot: () => <Splash fill={C.red} />,
  blau: () => <Splash fill={C.blue} />,
  gaeub: () => <Splash fill={C.yellow} />,
  grueen: () => <Splash fill={C.green} />,
  orangsch: () => <Splash fill={C.orange} />,
  violett: () => <Splash fill={C.purple} />,
  rosa: () => <Splash fill={C.rose} />,
  bruun: () => <Splash fill={C.brown} />,
  schwarz: () => <Splash fill={C.black} dark />,
  wyss: () => <Splash fill={C.white} />,
  grau: () => <Splash fill={C.grey} />,

  /* -------------------------------------------------------------- numbers */
  ...numbers,

  /* --------------------------------------------------------------- shapes */
  kreis: ({ color }) => (
    <g>
      <Shadow y={92} rx={28} />
      <circle cx={50} cy={50} r={34} fill={color ?? C.blue} {...line(2.6)} />
      <ellipse cx={34} cy={32} rx={7} ry={4} transform="rotate(-35 34 32)" fill={C.white} opacity={0.45} />
      <ShapeFace />
    </g>
  ),
  dreieck: ({ color }) => {
    const d = 'M50 14 L86 80 L14 80Z'
    return (
      <g>
        <Shadow y={92} rx={34} />
        <path d={d} fill="none" stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
        <path d={d} fill={color ?? C.yellow} stroke={color ?? C.yellow} strokeWidth={9.4} strokeLinejoin="round" />
        <ShapeFace y={56} />
      </g>
    )
  },
  quadrat: ({ color }) => (
    <g>
      <Shadow y={92} rx={34} />
      <rect x={16} y={16} width={68} height={68} rx={8} fill={color ?? C.green} {...line(2.6)} />
      <ellipse cx={28} cy={28} rx={6} ry={3.5} transform="rotate(-35 28 28)" fill={C.white} opacity={0.45} />
      <ShapeFace />
    </g>
  ),
  haerz: ({ color }) => (
    <g>
      <Shadow y={92} rx={26} />
      <path d="M50 86 C20 66 8 48 16 32 C24 17 43 18 50 32 C57 18 76 17 84 32 C92 48 80 66 50 86Z" fill={color ?? C.red} {...line(2.6)} />
      <ellipse cx={28} cy={32} rx={5} ry={3} transform="rotate(-40 28 32)" fill={C.white} opacity={0.45} />
      <ShapeFace y={46} />
    </g>
  ),
}
