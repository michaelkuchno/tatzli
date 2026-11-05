import { memo, type CSSProperties } from 'react'
import type { Pose } from '@content/types'
import type { IlluMap } from './types'
import { animalIllus } from './animals'
import { objectIllus } from './objects'
import { worldIllus } from './world'
import { characterIllus } from './characters'
import { C, line } from './kit'

export const ILLUS: IlluMap = { ...animalIllus, ...objectIllus, ...worldIllus, ...characterIllus }

export function hasIllu(key: string) {
  return key in ILLUS
}

function Fallback() {
  return (
    <g>
      <circle cx="50" cy="50" r="34" fill={C.yellow} {...line()} />
      <circle cx="40" cy="45" r="4" fill={C.ink} />
      <circle cx="60" cy="45" r="4" fill={C.ink} />
      <path d="M38 60 Q50 70 62 60" fill="none" {...line()} />
    </g>
  )
}

export interface IllustrationProps {
  name: string
  color?: string
  pose?: Pose
  className?: string
  style?: CSSProperties
  live?: boolean
  title?: string
  flip?: boolean
}

/** Renders a registry illustration in its own 100×100 SVG. `live` enables part animations. */
export const Illustration = memo(function Illustration({ name, color, pose, className, style, live, title, flip }: IllustrationProps) {
  const R = ILLUS[name]
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className ?? ''} ${live ? 'illu-live' : ''}`}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <g transform={flip ? 'translate(100 0) scale(-1 1)' : undefined}>{R ? <R color={color} pose={pose} /> : <Fallback />}</g>
    </svg>
  )
})
