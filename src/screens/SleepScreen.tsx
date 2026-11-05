import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { ParentHoldButton } from '@/components/ParentGate'
import { speak } from '@/lib/speak'
import { sfx, setMusic } from '@/lib/sound'
import { today } from '@/lib/db'

/** Gentle end of session: "Tatzli geit go schlafe" with a lullaby. Only a grown-up can extend. */
export function SleepScreen() {
  const { profile, settings, update, back, t } = useApp()
  useEffect(() => {
    setMusic(false)
    sfx.lullaby()
    const id = window.setTimeout(() => void speak(profile, 'ui.bye'), 1200)
    return () => clearTimeout(id)
  }, [profile])
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-indigo-900 to-indigo-700 text-white" data-testid="sleep">
      <div className="absolute right-4 top-4 tv:right-16 tv:top-10">
        <ParentHoldButton
          onPass={() => {
            const key = `${profile?.id}:${today()}`
            update({ extendToday: { ...settings.extendToday, [key]: (settings.extendToday[key] ?? 0) + 5 } })
            back()
          }}
          label={t('extend')}
        />
      </div>
      <motion.div className="h-[55vh] w-[55vh] max-w-[90vw]" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
        <Illustration name="sleeping-tatzli" className="h-full w-full" live />
      </motion.div>
      <p className="text-3xl font-bold opacity-90 tv:text-6xl">Gueti Nacht, Tatzli!</p>
    </div>
  )
}
