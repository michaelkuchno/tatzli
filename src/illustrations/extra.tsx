import type { ReactNode } from 'react'
import type { IlluMap, IlluProps } from './types'
import { ILLUS } from './registry'
import { C, line } from './kit'

/**
 * Pictures that show exactly what a sentence says (found by the picture ↔ text audit): several things at once,
 * a thing in a certain state or position, a scene. Most are built from the existing drawings, so the style stays the same.
 * ILLUS is read at render time (never while the modules load), so the import cycle with the registry is harmless.
 */
const L = line()
const LM = line(1.8)
const LS = line(1.4)
const pic = (name: string, p: IlluProps = {}) => {
  const R = ILLUS[name]
  return R ? <R {...p} /> : null
}
/** a drawing placed at x/y (centre) with a scale */
const at = (x: number, y: number, s: number, node: ReactNode, rot = 0) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-50 -50)`}>{node}</g>
)

/** an open hand with five fingers */
const OPEN_HAND = (
  <g>
    <path d="M14 86 Q10 66 16 58 L14 36 Q14 31 18.5 31 Q23 31 23 36 L24 52 L24 24 Q24 19 28.5 19 Q33 19 33 24 L33.5 50 L35 22 Q35 17 39.5 17.5 Q44 18 43.5 23 L42 52 L46 30 Q47 26 51 27 Q55 28 54 33 L49 62 Q56 56 62 60 Q65 63 62 67 L50 80 Q44 88 34 88 Z" fill="#f8d3b0" {...L} />
    <path d="M24 70 Q32 74 40 70" fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.35} strokeLinecap="round" />
  </g>
)

export const extraIllus: IlluMap = {
  // speaking: Tatzli tells something (a speech bubble)
  rede: (p) => (
    <g>
      {at(42, 56, 0.86, pic('tatzli', p))}
      <path d="M62 10 H90 Q94 10 94 14 V30 Q94 34 90 34 H74 L66 41 L68 34 H62 Q58 34 58 30 V14 Q58 10 62 10 Z" fill={C.white} {...L} />
      <circle cx={68} cy={22} r={2.4} fill={C.ink} />
      <circle cx={76} cy={22} r={2.4} fill={C.ink} />
      <circle cx={84} cy={22} r={2.4} fill={C.ink} />
    </g>
  ),
  // again: the repeat sign
  nomau: () => (
    <g>
      <path d="M50 18 A32 32 0 1 1 20 58" fill="none" stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
      <path d="M50 18 A32 32 0 1 1 20 58" fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
      <path d="M38 6 L56 18 L38 30 Z" fill={C.orange} {...L} />
      <circle cx={50} cy={50} r={9} fill={C.yellow} {...LM} />
    </g>
  ),
  // healthy food to eat a lot of: apple, carrot, bread
  'viu-gsund': () => (
    <g>
      {at(26, 56, 0.5, pic('oepfu'))}
      {at(52, 46, 0.5, pic('rueebli'))}
      {at(76, 58, 0.5, pic('brot'))}
    </g>
  ),
  // three apples
  'oepfu-3': () => (
    <g>
      {at(28, 58, 0.5, pic('oepfu'))}
      {at(50, 42, 0.5, pic('oepfu'))}
      {at(72, 58, 0.5, pic('oepfu'))}
    </g>
  ),
  // two cars (2 × 4 wheels)
  'outo-2': () => (
    <g>
      {at(50, 34, 0.56, pic('outo'))}
      {at(50, 70, 0.56, pic('outo', { color: C.red }))}
    </g>
  ),
  // the four seasons of a year
  jahreszyte: () => (
    <g>
      {at(28, 28, 0.44, pic('fruehlig'))}
      {at(72, 28, 0.44, pic('summer'))}
      {at(28, 72, 0.44, pic('herbscht'))}
      {at(72, 72, 0.44, pic('winter'))}
    </g>
  ),
  // scissors carried with the point down
  'schaeri-unde': () => <g transform="rotate(180 50 50)">{pic('schaeri')}</g>,
  // two hands = ten fingers
  // one hand with five fingers
  'hand-5': () => (
    <g>
      <ellipse cx={50} cy={92} rx={22} ry={3.5} fill={C.shadow} />
      <g transform="translate(16 2) scale(1.05)">{OPEN_HAND}</g>
    </g>
  ),
  // two hands = ten fingers
  'haend-2': () => (
    <g>
      <ellipse cx={50} cy={92} rx={40} ry={3.5} fill={C.shadow} />
      <g transform="translate(2 2) scale(0.78)">{OPEN_HAND}</g>
      <g transform="translate(98 2) scale(-0.78 0.78)">{OPEN_HAND}</g>
      <text x={50} y={14} textAnchor="middle" fontSize={12} fontWeight={900} fill={C.ink}>
        5 + 5 = 10
      </text>
    </g>
  ),
  // a pattern: pear, strawberry, pear, strawberry, … what comes next?
  muster: () => (
    <g>
      <rect x={4} y={30} width={92} height={40} rx={10} fill={C.white} {...LM} />
      {at(15, 50, 0.24, pic('bire'))}
      {at(33, 50, 0.24, pic('aerdbeeri'))}
      {at(51, 50, 0.24, pic('bire'))}
      {at(69, 50, 0.24, pic('aerdbeeri'))}
      <rect x={79} y={39} width={14} height={22} rx={4} fill="none" stroke={C.orange} strokeWidth={2} strokeDasharray="3 2.5" />
      <text x={86} y={56} textAnchor="middle" fontSize={15} fontWeight={900} fill={C.orange}>
        ?
      </text>
    </g>
  ),
  // the dog runs fast
  'hund-renne': () => (
    <g>
      {at(56, 52, 0.86, pic('hund'))}
      <path d="M8 40 H26 M4 52 H22 M10 64 H28" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
      <circle cx={24} cy={84} r={4} fill={C.greyLight} />
      <circle cx={16} cy={80} r={3} fill={C.greyLight} />
    </g>
  ),
  // the Easter basket (święconka): a basket with eggs
  chorbli: () => (
    <g>
      {pic('basket')}
      {at(38, 46, 0.26, pic('oschterei'))}
      {at(52, 42, 0.26, pic('oschterei', { color: C.leaf }))}
      {at(65, 47, 0.26, pic('oschterei', { color: C.rose }))}
    </g>
  ),
  // nuts shared equally on three plates
  teile: () => (
    <g>
      {[22, 50, 78].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={62} rx={13} ry={6} fill={C.white} {...LM} />
          <ellipse cx={x} cy={61} rx={8} ry={3.2} fill="none" stroke={C.greyLight} strokeWidth={1.2} />
          {at(x - 5, 54, 0.2, pic('nuss'))}
          {at(x + 5, 54, 0.2, pic('nuss'))}
        </g>
      ))}
      <text x={50} y={32} textAnchor="middle" fontSize={16} fontWeight={900} fill={C.ink}>
        6 : 3 = 2
      </text>
    </g>
  ),
  // showering before swimming
  dusche: (p) => (
    <g>
      {at(48, 58, 0.78, pic('pose-wash', p))}
      <path d="M64 8 Q78 8 78 18" fill="none" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
      <path d="M70 18 H86 L82 24 H74 Z" fill={C.greyLight} {...LS} />
      {[[72, 30], [78, 34], [84, 30], [75, 40], [81, 44], [70, 46]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q-2 4 0 5.5 q2 -1.5 0 -5.5 Z`} fill={C.water} {...line(0.9)} />
      ))}
    </g>
  ),
  // a big tower of ten blocks
  turm: () => (
    <g>
      <ellipse cx={50} cy={93} rx={20} ry={3.5} fill={C.shadow} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={40 + (i % 2 ? 1.5 : -1.5)} y={84 - i * 8} width={20} height={8} rx={1.5} fill={[C.red, C.yellow, C.blue, C.green, C.orange][i % 5]} {...LS} />
      ))}
      <text x={72} y={20} fontSize={11} fontWeight={900} fill={C.ink}>
        10
      </text>
    </g>
  ),
  // balls to count
  chugele: () => (
    <g>
      {[
        [28, 40, C.red],
        [50, 34, C.blue],
        [72, 40, C.yellow],
        [38, 64, C.green],
        [62, 64, C.orange],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r={10} fill={c as string} {...L} />
          <path d={`M${(x as number) - 6} ${(y as number) - 3} q6 -6 12 0`} fill="none" stroke={C.white} strokeWidth={2} opacity={0.6} />
        </g>
      ))}
    </g>
  ),
}

/** a page of my own drawings that need no other picture */
export const drawnIllus: IlluMap = {
  // Saint Nicholas' big jute sack
  sack: () => (
    <g>
      <ellipse cx={50} cy={90} rx={28} ry={4} fill={C.shadow} />
      <path d="M36 26 Q30 22 34 16 Q42 20 50 18 Q58 20 66 16 Q70 22 64 26 Q86 44 80 76 Q76 90 50 90 Q24 90 20 76 Q14 44 36 26 Z" fill="#b98a4e" {...L} />
      <path d="M36 27 Q50 31 64 27" fill="none" stroke={C.red} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M30 50 q4 2 8 0 M58 62 q4 2 8 0 M42 74 q4 2 8 0" stroke="#8b5a2b" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </g>
  ),
  // swimming armbands
  flugeli: () => (
    <g>
      {[32, 68].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={52} rx={15} ry={20} fill={C.orange} {...L} />
          <ellipse cx={x} cy={52} rx={6} ry={10} fill={C.white} {...LM} />
          <path d={`M${x - 10} 40 q4 -4 8 -2`} stroke={C.white} strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
  // the cat sleeps: curled up, eyes closed, z z z
  'chatz-schlaf': () => (
    <g>
      <ellipse cx={50} cy={86} rx={32} ry={4} fill={C.shadow} />
      <path d="M22 76 Q20 56 44 54 Q72 52 78 70 Q80 84 56 85 L30 85 Q22 84 22 76 Z" fill={C.orange} {...L} />
      <path d="M76 76 Q92 80 86 66 Q84 60 78 62" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M76 76 Q92 80 86 66 Q84 60 78 62" fill="none" stroke={C.orange} strokeWidth={4.4} strokeLinecap="round" />
      <path d="M44 62 q4 -3 8 0 M56 66 q4 -3 8 0" stroke="#c96f1c" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx={30} cy={70} r={15} fill={C.orange} {...L} />
      <path d="M18 62 L20 48 L28 57 Z M34 56 L42 49 L42 62 Z" fill={C.orange} {...LM} />
      <path d="M21 70 q3 3 6 0 M33 70 q3 3 6 0" fill="none" {...LM} />
      <ellipse cx={30} cy={75} rx={2} ry={1.4} fill={C.pink} />
      <text x={52} y={36} fontSize={12} fontWeight={900} fill={C.navy}>z</text>
      <text x={62} y={26} fontSize={15} fontWeight={900} fill={C.navy}>z</text>
      <text x={74} y={14} fontSize={18} fontWeight={900} fill={C.navy}>z</text>
    </g>
  ),
  // a paper shopping bag
  saeckli: () => (
    <g>
      <ellipse cx={50} cy={90} rx={24} ry={3.5} fill={C.shadow} />
      <path d="M28 34 H72 L76 88 H24 Z" fill="#d9a35f" {...L} />
      <path d="M40 34 Q40 18 50 18 Q60 18 60 34" fill="none" stroke={C.ink} strokeWidth={3} />
      <path d="M28 34 L32 42 H68 L72 34" fill="none" stroke={C.ink} strokeWidth={1.2} opacity={0.4} />
      {at(50, 26, 0.26, pic('oepfu'))}
    </g>
  ),
  // the stop button in the bus
  chnopf: () => (
    <g>
      <rect x={30} y={8} width={40} height={84} rx={8} fill={C.yellow} {...L} />
      <circle cx={50} cy={46} r={14} fill={C.red} {...L} />
      <circle cx={50} cy={46} r={8} fill="#f06b5c" />
      <text x={50} y={76} textAnchor="middle" fontSize={11} fontWeight={900} fill={C.ink}>STOP</text>
      <path d="M70 60 Q62 58 60 52 Q58 46 63 46 L67 50 V34 Q67 30 71 30 Q75 30 75 34 V48 Q84 48 86 54 Q88 64 80 72 L70 72 Z" fill="#f8d3b0" {...LM} />
    </g>
  ),
  // it is three o'clock
  'uhr-3': () => (
    <g>
      <ellipse cx={50} cy={92} rx={26} ry={3.5} fill={C.shadow} />
      <circle cx={50} cy={50} r={38} fill={C.white} stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => {
        const t = ((i + 1) / 12) * 2 * Math.PI
        return (
          <text key={i} x={50 + 29 * Math.sin(t)} y={50 - 29 * Math.cos(t) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill={C.ink}>
            {i + 1}
          </text>
        )
      })}
      <line x1={50} y1={50} x2={50} y2={20} stroke={C.green} strokeWidth={3} strokeLinecap="round" />
      <line x1={50} y1={50} x2={70} y2={50} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
      <circle cx={50} cy={50} r={3.5} fill={C.ink} />
    </g>
  ),
  // from a seed grows a plant: seed, roots drinking water in the soil, two leaves
  some: () => (
    <g>
      <rect x={8} y={50} width={84} height={42} rx={6} fill="#8b5a2b" {...L} />
      <path d="M8 50 H92" stroke="#5f3b1b" strokeWidth={2} />
      <ellipse cx={50} cy={64} rx={7} ry={4.5} fill="#d9a35f" {...LS} />
      <path d="M50 66 Q46 74 40 80 M50 66 Q52 76 50 86 M50 66 Q56 72 62 78" fill="none" stroke={C.cream} strokeWidth={2} strokeLinecap="round" />
      {[[34, 84], [66, 82], [46, 90]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 5} q-2.5 4 0 5.5 q2.5 -1.5 0 -5.5 Z`} fill={C.water} {...line(0.8)} />
      ))}
      <path d="M50 60 V28" stroke={C.green} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M50 38 Q36 30 30 38 Q40 46 50 40 Z" fill={C.leaf} {...LM} />
      <path d="M50 32 Q62 20 72 28 Q62 38 50 34 Z" fill={C.leaf} {...LM} />
      <circle cx={80} cy={16} r={8} fill={C.yellow} {...LS} />
    </g>
  ),
  // what is left of the snowman: a puddle with his carrot, coals and scarf in the sun
  gschmouze: () => (
    <g>
      <circle cx={78} cy={20} r={11} fill={C.yellow} {...L} />
      <path d="M78 4 V0 M92 20 H96 M88 9 l3 -3 M88 31 l3 3" stroke={C.orange} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M12 74 Q14 62 36 64 Q52 58 70 64 Q90 64 88 76 Q86 88 56 88 Q20 90 12 74 Z" fill={C.water} {...L} />
      <path d="M30 74 Q46 70 62 75" fill="none" stroke={C.white} strokeWidth={2} opacity={0.7} strokeLinecap="round" />
      <path d="M44 70 L62 66 L46 76 Z" fill={C.orange} {...LS} />
      <circle cx={32} cy={78} r={2.6} fill={C.ink} />
      <circle cx={72} cy={80} r={2.6} fill={C.ink} />
      <path d="M20 66 Q30 58 42 62 L40 68 Q30 66 22 72 Z" fill={C.red} {...LS} />
      <path d="M50 44 Q44 52 50 56 Q56 52 50 44 Z" fill={C.water} {...line(1)} opacity={0.9} />
    </g>
  ),
  // the festive Christmas Eve table: many dishes and one free place with an empty plate
  festtisch: () => (
    <g>
      <path d="M50 8 l1.6 3.6 3.9 .4 -2.9 2.6 .8 3.8 -3.4 -2 -3.4 2 .8 -3.8 -2.9 -2.6 3.9 -.4 Z" fill={C.yellow} {...line(0.8)} />
      <path d="M4 52 H74 L71 60 H7 Z" fill={C.white} {...L} />
      <path d="M10 60 V88 M68 60 V88" stroke={C.brown} strokeWidth={4} strokeLinecap="round" />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={10 + (i % 6) * 9.6 + (i >= 6 ? 4.5 : 0)} cy={i >= 6 ? 50 : 44} rx={4} ry={2.2} fill={[C.orange, C.yellow, C.leaf, C.rose, C.water, C.sand][i % 6]} {...line(1)} />
      ))}
      {/* the free place: an empty chair and an empty plate for an unexpected guest */}
      <ellipse cx={86} cy={50} rx={6} ry={2.4} fill={C.white} {...line(1.2)} />
      <path d="M92 34 V78 M80 64 H92 M81 64 V86 M92 78 V86 M92 36 H88" stroke={C.brown} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </g>
  ),
  // a simple map of Poland: the Baltic in the north, the Tatras in the south, the Vistula in between, Warsaw and Kraków
  polechaarte: () => (
    <g>
      <rect x={4} y={4} width={92} height={18} rx={4} fill={C.water} {...LM} />
      <path d="M14 22 L40 20 L62 18 L84 24 L88 44 L84 62 L74 80 L52 86 L30 82 L16 66 L12 44 Z" fill="#dff0c8" {...L} />
      <path d="M54 82 Q52 70 58 60 Q66 50 58 40 Q50 30 46 22" fill="none" stroke={C.blue} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M42 86 L48 76 L54 86 Z M50 86 L56 74 L62 86 Z" fill={C.grey} {...LS} />
      <path d="M46 79 L48 76 L50 79 M54 77 L56 74 L58 77" stroke={C.white} strokeWidth={1.4} fill="none" />
      <circle cx={62} cy={50} r={3.4} fill={C.red} {...LS} />
      <text x={58} y={46} textAnchor="end" fontSize={7} fontWeight={800} fill={C.ink}>Warszawa</text>
      <circle cx={52} cy={74} r={2.6} fill={C.red} {...LS} />
      <text x={22} y={73} fontSize={7} fontWeight={800} fill={C.ink}>Kraków</text>
      <path d="M20 12 q4 -3 8 0 q4 3 8 0 M60 12 q4 -3 8 0 q4 3 8 0" fill="none" stroke={C.white} strokeWidth={1.4} />
    </g>
  ),
}
