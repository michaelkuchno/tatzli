import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { db } from '@/lib/db'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { ParentHoldButton } from '@/components/ParentGate'
import { enterFullscreen } from '@/lib/hooks'
import { unlockAudio, sfx } from '@/lib/sound'
import { speak } from '@/lib/speak'

export function ProfilesScreen() {
  const { setProfileId, go, t } = useApp()
  const profiles = useLiveQuery(() => db.profiles.toArray(), [])
  return (
    <div className="safe-x flex min-h-full flex-col items-center justify-center gap-8 py-8">
      <div className="absolute right-4 top-4 tv:right-16 tv:top-10">
        <ParentHoldButton onPass={() => go({ name: 'parent', tab: 'profiles' })} />
      </div>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-56 w-56 tv:h-96 tv:w-96">
        <Illustration name="tatzli" pose="wave" className="h-full w-full" live title="Tatzli" />
      </motion.div>
      <h1 className="text-5xl font-black tracking-tight text-amber-800 tv:text-8xl">Tatzli</h1>
      {profiles && profiles.length === 0 && (
        <p className="max-w-md text-center text-lg text-stone-600" data-testid="no-profiles">
          {t('noProfiles')}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-6">
        {profiles?.map((p) => (
          <button
            key={p.id}
            type="button"
            data-nav
            data-testid={`profile-${p.nickname}`}
            className="flex flex-col items-center gap-2 rounded-[2.5rem] bg-white p-4 shadow-xl transition-transform hover:scale-105 active:scale-95 focus-visible:ring-8 focus-visible:ring-amber-300 outline-none"
            onClick={() => {
              unlockAudio()
              sfx.success()
              setProfileId(p.id!)
              void enterFullscreen()
              void speak(p, 'ui.hello')
              go({ name: 'map' })
            }}
          >
            <div className="h-36 w-36 tv:h-56 tv:w-56">
              <Illustration name={p.avatar} className="h-full w-full" live />
            </div>
            <span className="text-2xl font-extrabold text-stone-700 tv:text-4xl">{p.nickname}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
