import type { ReactElement } from 'react'
import type { Pose } from '@content/types'

/**
 * Every illustration draws into a 100×100 viewBox (origin top-left) unless it is a place
 * background (160×90). Renderers return SVG children (no <svg> root).
 *
 * - `color` replaces the main colour of the object (right-click recolour). Undefined = default.
 * - Parts that should move carry CSS classes from illustrations.css:
 *     illu-blink (eyes), illu-wag (tails, swinging), illu-flap (wings, ears),
 *     illu-bob (small up/down), illu-spin (wheels, propellers), illu-twinkle (stars, sparkles)
 *   Use `style={{ transformOrigin: 'x y', transformBox: 'view-box' }}` (via the `origin()` helper)
 *   so rotations pivot correctly. Animations only run when an ancestor has `.illu-live`.
 */
export interface IlluProps {
  color?: string
  pose?: Pose
}
export type Illu = (p: IlluProps) => ReactElement
export type IlluMap = Record<string, Illu>
