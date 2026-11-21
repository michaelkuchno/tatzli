import { C, Cheeks, Eyes, Shadow, line, origin } from './kit'

/**
 * The teacher (d Lehrerin / pani nauczycielka) of both schools – the Swiss and the Polish one.
 * A friendly young woman at the blackboard with a pointer; `talking` opens and closes her mouth
 * (driven by the sound that is playing, see components/Teacher.tsx), `board` draws the blackboard.
 * Drawn into the 100×100 viewBox like every illustration, in the app's ink-outline style.
 */
const L = line()
const LM = line(1.8)
const LS = line(1.4)
const SKIN = '#f8d3b0'
const HAIR = '#7a4526'
const HAIR_LIGHT = '#9b5c35'
const CARDIGAN = '#3fa58f'
const SKIRT = '#2c4a7a'

export function TeacherFigure({ talking = false, board = true }: { talking?: boolean; board?: boolean }) {
  return (
    <g data-teacher="1">
      {board && (
        <g>
          {/* the blackboard with chalk: a letter, a sum and a star */}
          <rect x={5} y={10} width={42} height={30} rx={2.5} fill="#2f6b4a" {...L} />
          <rect x={7.5} y={12.5} width={37} height={25} rx={1.5} fill="none" stroke="#a8d5b8" strokeWidth={0.8} opacity={0.6} />
          <path d="M11 30 L15 18 L19 30 M12.5 26 H17.5" fill="none" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 24 h5 M25.5 21.5 v5 M31 24 h4 M31 26 h4" stroke={C.yellow} strokeWidth={1.6} strokeLinecap="round" />
          <path d="M39.5 17 l1.2 2.6 2.8 .3 -2.1 1.9 .6 2.8 -2.5 -1.4 -2.5 1.4 .6 -2.8 -2.1 -1.9 2.8 -.3 Z" fill={C.rose} />
          <path d="M10 34 h14" stroke={C.white} strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
          <rect x={14} y={40} width={22} height={2.6} rx={1.3} fill={C.brown} {...LS} />
          <rect x={17} y={38.6} width={5} height={1.6} rx={0.8} fill={C.white} />
        </g>
      )}
      <Shadow x={64} y={92} rx={18} />
      <g className="illu-bob" style={origin(64, 90)}>
        {/* long hair behind */}
        <path d="M48 36 Q47 20 62 18 Q78 18 77 36 Q79 52 74 60 L52 60 Q46 50 48 36 Z" fill={HAIR} {...L} />
        {/* legs and shoes */}
        <path d="M58.5 80 V88 M68.5 80 V88" stroke={SKIN} strokeWidth={4} strokeLinecap="round" />
        <path d="M58.5 80 V88 M68.5 80 V88" fill="none" stroke={C.ink} strokeWidth={0.9} opacity={0.35} />
        <ellipse cx={57.5} cy={89} rx={4} ry={2.2} fill={C.red} {...LS} />
        <ellipse cx={69.5} cy={89} rx={4} ry={2.2} fill={C.red} {...LS} />
        {/* skirt */}
        <path d="M53 68 L75 68 L79 82 Q64 85.5 49 82 Z" fill={SKIRT} {...L} />
        {/* blouse and cardigan */}
        <path d="M51 51 Q64 46 77 51 L77.5 70 Q64 72.5 50.5 70 Z" fill={CARDIGAN} {...L} />
        <path d="M60 50 L64 58 L68 50 Z" fill={C.white} {...LS} />
        <path d="M64 58 V70" stroke={C.ink} strokeWidth={1.2} opacity={0.5} />
        <circle cx={62} cy={62} r={0.9} fill={C.white} />
        <circle cx={62} cy={66} r={0.9} fill={C.white} />
        {/* a book in the right arm */}
        <g transform="rotate(8 78 64)">
          <rect x={73.5} y={57} width={10} height={13} rx={1.2} fill={C.yellow} {...LM} />
          <path d="M76 61 h5 M76 64 h4" stroke={C.ink} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
        </g>
        <path d="M77 53 Q83 58 80 66" fill="none" stroke={CARDIGAN} strokeWidth={5.5} strokeLinecap="round" />
        <path d="M77 53 Q83 58 80 66" fill="none" stroke={C.ink} strokeWidth={0.9} opacity={0.4} strokeLinecap="round" />
        <circle cx={79.8} cy={66.5} r={2.6} fill={SKIN} {...LS} />
        {/* left arm with the pointer to the board */}
        <g className="teacher-point" style={origin(52, 53)}>
          <path d="M52 53 Q45 52 41.5 47.5" fill="none" stroke={CARDIGAN} strokeWidth={5.5} strokeLinecap="round" />
          <path d="M52 53 Q45 52 41.5 47.5" fill="none" stroke={C.ink} strokeWidth={0.9} opacity={0.4} strokeLinecap="round" />
          <path d="M41 47 L26 29" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
          <path d="M41 47 L26 29" stroke="#c98d55" strokeWidth={1.6} strokeLinecap="round" />
          <circle cx={25.6} cy={28.5} r={1.5} fill={C.red} {...line(0.9)} />
          <circle cx={41} cy={47} r={2.6} fill={SKIN} {...LS} />
        </g>
        {/* neck and head */}
        <rect x={61} y={44} width={6} height={6} rx={2} fill={SKIN} />
        <ellipse cx={64} cy={34} rx={12} ry={12.5} fill={SKIN} {...L} />
        {/* fringe and a flower clip */}
        <path d="M52 33 Q52 21 64 21 Q76 21 76 33 Q71 26 64 27 Q58 26 55.5 31 Q54 30 52 33 Z" fill={HAIR} {...LM} />
        <path d="M60 23.5 Q64 22.5 68 23.5" fill="none" stroke={HAIR_LIGHT} strokeWidth={1.2} strokeLinecap="round" />
        <g transform="translate(73 25)">
          <circle r={2.6} fill={C.rose} {...line(1)} />
          <circle r={1} fill={C.yellow} />
        </g>
        {/* face: eyes with lashes, cheeks, mouth */}
        <Eyes x1={59.5} x2={68.5} y={35} r={2.3} />
        <path d="M56.6 32.6 l-1.4 -1.2 M71.4 32.6 l1.4 -1.2" stroke={C.ink} strokeWidth={1.1} strokeLinecap="round" />
        <path d="M57 30.4 Q59.5 29 62 30.4 M66 30.4 Q68.5 29 71 30.4" fill="none" stroke={HAIR} strokeWidth={1.1} strokeLinecap="round" />
        <Cheeks x1={56.5} x2={71.5} y={39.5} r={2.4} />
        {talking ? (
          <g className="teacher-mouth" style={origin(64, 41.5)}>
            <ellipse cx={64} cy={41.6} rx={2.6} ry={2.1} fill="#a5333a" {...line(1.2)} />
            <ellipse cx={64} cy={42.6} rx={1.4} ry={0.8} fill={C.pink} />
          </g>
        ) : (
          <path d="M60.6 40.6 Q64 43.6 67.4 40.6" fill="none" stroke="#a5333a" strokeWidth={1.6} strokeLinecap="round" />
        )}
        <circle cx={52.3} cy={37.5} r={1} fill={C.yellow} {...line(0.6)} />
        <circle cx={75.7} cy={37.5} r={1} fill={C.yellow} {...line(0.6)} />
      </g>
    </g>
  )
}
