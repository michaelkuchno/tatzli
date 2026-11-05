import { useEffect, useMemo, useState } from 'react'
import { TOPIC_BY_ID, PHRASES, PHRASE_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { AlignedSentence } from '@/components/AlignedSentence'
import { GrownupButton } from '@/components/ui'
import { recordExposure } from '@/lib/progress'
import { speak, speakChain } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { shuffle, useDifficulty, type ActivityProps } from './common'

/** TPR "Mach mit!": Tatzli performs the movement, the child imitates, a grown-up taps "done". */
export function Tpr({ topicId, onComplete }: ActivityProps) {
  const { profile, t } = useApp()
  const level = profile?.level ?? 2
  const topic = TOPIC_BY_ID[topicId]
  const diff = useDifficulty(profile?.id, level)
  const commands = useMemo(() => {
    const own = topic.phrases.map((id) => PHRASE_BY_ID[id]).filter((p) => p?.tags?.includes('tpr'))
    const pool = PHRASES.filter((p) => p.tags?.includes('tpr') && p.level <= level && !own.includes(p))
    return [...own, ...shuffle(pool)].slice(0, Math.max(3, Math.min(6, diff.rounds)))
  }, [topic, level, diff.rounds])
  const [i, setI] = useState(0)
  const cmd = commands[i]

  useEffect(() => {
    if (!cmd) return
    void speakChain(profile, ['ui.do-it', `p.${cmd.id}`])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmd?.id])

  if (!cmd) return null
  return (
    <div className="flex flex-col items-center gap-6" data-testid="tpr" data-command={cmd.id}>
      <button type="button" className="h-[46vh] w-[46vh] max-w-[80vw] rounded-full bg-white/70 shadow-xl" aria-label="Tatzli" onClick={() => void speak(profile, `p.${cmd.id}`)} data-testid="tpr-tatzli">
        <Illustration name="tatzli" pose={cmd.pose ?? 'dance'} className="h-full w-full" live />
      </button>
      {level > 1 && (
        <div className="rounded-3xl bg-white/85 p-4 shadow">
          <AlignedSentence src={cmd.src} audioId={`p.${cmd.id}`} size="xl" />
        </div>
      )}
      <GrownupButton
        testId="tpr-done"
        onClick={() => {
          sfx.success()
          if (profile?.id) void recordExposure(profile.id, cmd.id, 'phrase', 'recognised')
          void speak(profile, 'ui.super')
          if (i + 1 >= commands.length) onComplete()
          else setI(i + 1)
        }}
      >
        ✓ {t('done')}
      </GrownupButton>
    </div>
  )
}
