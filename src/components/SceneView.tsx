import type { ReactNode } from 'react'
import type { SceneSpec } from '@content/types'
import { PlaceBackground } from '@/illustrations/places'
import { seasonOf, timeOfDay } from '@/lib/calendar'
import { WORD_BY_ID } from '@/lib/content'
import { Thing } from './Thing'
import { Illustration } from '@/illustrations/registry'

/**
 * A 16:9 scene: SVG place background + interactive objects anchored at bottom-centre (x,y in %).
 * Items are ~22 % of the scene height at scale 1.
 */
export function SceneView({ scene, children, interactive = true, testId }: { scene: SceneSpec; children?: ReactNode; interactive?: boolean; testId?: string }) {
  const now = new Date()
  const season = scene.season ?? seasonOf(now)
  const time = scene.time ?? (timeOfDay(now) === 'night' ? 'evening' : 'day')
  return (
    <div className="scene relative w-full overflow-hidden rounded-[2rem] shadow-xl" style={{ aspectRatio: '16 / 9', maxWidth: 'min(100%, calc((100dvh - 150px) * 16 / 9))', marginInline: 'auto' }} data-testid={testId}>
      <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <PlaceBackground place={scene.place} season={season} time={time} />
      </svg>
      {scene.items.map((it, i) => {
        const h = 22 * (it.scale ?? 1)
        const wordId = WORD_BY_ID[it.key] ? it.key : undefined
        return (
          <div
            key={`${it.key}-${i}`}
            className="absolute"
            style={{ left: `${it.x}%`, top: `${it.y}%`, height: `${h}%`, aspectRatio: '1', transform: 'translate(-50%, -100%)' }}
          >
            {interactive ? (
              <Thing illu={WORD_BY_ID[it.key]?.illu ?? it.key} wordId={wordId} pose={it.pose} flip={it.flip} size="100%" className="h-full w-full" testId={`scene-item-${it.key}`} />
            ) : null}
            {!interactive && <ThingStatic name={WORD_BY_ID[it.key]?.illu ?? it.key} pose={it.pose} flip={it.flip} />}
          </div>
        )
      })}
      {children}
    </div>
  )
}

function ThingStatic({ name, pose, flip }: { name: string; pose?: SceneSpec['items'][number]['pose']; flip?: boolean }) {
  return <Illustration name={name} pose={pose} flip={flip} className="h-full w-full" live />
}
