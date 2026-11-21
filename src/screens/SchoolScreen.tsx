import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Curriculum, Stage, Subject } from '@content/types'
import { CURRICULA, STAGES, schoolLessons } from '@content/school'
import { useApp } from '@/state/AppContext'
import { db } from '@/lib/db'
import { curriculumOf, SCHOOL_NAME, stageName, stageOf } from '@/lib/school'
import { ChildBar, KidButton } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { speak } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { stopAll } from '@/lib/audio'
import { startKinoSession } from '@/lib/kinoChannels'
import type { UiKey } from '@/lib/i18n'

export const SUBJECT_COLOR: Record<Subject, string> = {
  deutsch: '#ffe0e6',
  mathe: '#d9f0ff',
  nmg: '#e6f7df',
  gestalten: '#fff3c4',
  musik: '#f2e6ff',
  sport: '#ffe9d1',
  // the Polish school uses the same colour for the same kind of subject
  polski: '#ffe0e6',
  matematyka: '#d9f0ff',
  przyroda: '#e6f7df',
  spoleczna: '#e3f0ff',
  plastyka: '#fff3c4',
  technika: '#fdebd3',
  muzyka: '#f2e6ff',
  wf: '#ffe9d1',
}
/** the flag of each school on its switch */
const SCHOOL_FLAG: Record<Curriculum, string> = { ch: 'fahne', pl: 'polefahne' }

/**
 * Tatzli's school: the teacher (d Lehrerin / pani nauczycielka) and the lessons of one stage of one school –
 * the Swiss school (Lehrplan 21, Kanton Bern: Chindsgi 1, Chindsgi 2, 1st–3rd class) or the Polish school
 * (podstawa programowa: przedszkole, zerówka, klasa 1–3). School and stage are set by a grown-up in the profile
 * and can be switched here; both schools look and work the same.
 */
export function SchoolScreen() {
  const { profile, go, t, settings } = useApp()
  const stage = stageOf(profile)
  const cur = curriculumOf(profile)
  const lessons = schoolLessons(stage, cur)
  const visited = useLiveQuery(async () => (profile?.id ? (await db.topics.where('profileId').equals(profile.id).toArray()).map((x) => x.topicId) : []), [profile?.id]) ?? []
  const lang = profile?.langs[0] ?? 'be'

  useEffect(() => () => stopAll(), [])

  const setStage = async (s: Stage) => {
    if (!profile?.id || s === stage) return
    sfx.pop()
    await db.profiles.update(profile.id, { stage: s })
  }
  const setSchool = async (c: Curriculum) => {
    if (!profile?.id || c === cur) return
    sfx.pop()
    await db.profiles.update(profile.id, { school: c })
  }
  const open = (id: string) => {
    // the hover preview of the title stops at once; the teacher then says the title in full (never two voices, never a restart mid-word)
    stopAll()
    sfx.success()
    // the lesson screen lets the teacher say the title and the opening sentence
    go({ name: 'topic', topicId: id })
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-emerald-50 to-amber-50" data-testid="school" data-stage={stage} data-school={cur}>
      <ChildBar
        title={
          <span className="inline-flex items-center gap-3">
            <motion.span className="inline-block h-14 w-14 tv:h-24 tv:w-24" initial={{ rotate: -8 }} animate={{ rotate: [-8, 6, -8] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Illustration name="lehrerin" className="h-full w-full" live />
            </motion.span>
            <span className="hidden text-2xl font-black text-emerald-900 sm:inline tv:text-4xl" data-testid="school-name">{SCHOOL_NAME[cur]}</span>
          </span>
        }
        right={
          <KidButton
            label={t('kinoSchool')}
            testId="school-kino"
            size={72}
            color="#ffe58a"
            onClick={() => {
              stopAll()
              startKinoSession()
              go({ name: 'kino', topicId: lessons[0].id, n: Date.now() })
            }}
          >
            <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" aria-hidden>
              <rect x="5" y="9" width="38" height="26" rx="5" fill="#fff" stroke="#4a3326" strokeWidth="3.5" />
              <path d="M20 15 L31 22 L20 29 Z" fill="#e2493b" />
            </svg>
          </KidButton>
        }
      />
      <div className="safe-x flex flex-wrap justify-center gap-2 pb-2 tv:gap-4" role="tablist" data-testid="school-tabs">
        {CURRICULA.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            data-nav
            aria-selected={c === cur}
            aria-label={t(`cur_${c}` as UiKey)}
            title={t(`cur_${c}` as UiKey)}
            data-testid={`school-cur-${c}`}
            className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-lg font-extrabold shadow transition active:scale-95 tv:text-3xl ${c === cur ? 'bg-sky-700 text-white' : 'bg-white text-sky-900'}`}
            onClick={() => void setSchool(c)}
          >
            <span className="inline-block h-10 w-10 rounded-full bg-white tv:h-16 tv:w-16">
              <Illustration name={SCHOOL_FLAG[c]} className="h-full w-full" />
            </span>
            {SCHOOL_NAME[c]}
          </button>
        ))}
      </div>
      <div className="safe-x flex flex-wrap justify-center gap-2 pb-3 tv:gap-4" role="tablist" data-testid="stage-tabs">
        {STAGES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            data-nav
            aria-selected={s === stage}
            title={t(`${cur === 'pl' ? 'plstage' : 'stage'}_${s}` as UiKey)}
            data-testid={`school-stage-${s}`}
            className={`rounded-full px-4 py-2 text-lg font-extrabold shadow transition active:scale-95 tv:px-8 tv:py-4 tv:text-3xl ${s === stage ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900'}`}
            onClick={() => void setStage(s)}
          >
            {stageName(cur, s)}
          </button>
        ))}
      </div>
      <div className="safe-x grid flex-1 auto-rows-min grid-cols-2 content-start gap-4 overflow-auto pb-8 sm:grid-cols-3 lg:grid-cols-5 tv:gap-8" data-testid="school-lessons">
        {lessons.map((l, i) => (
          <motion.button
            key={l.id}
            type="button"
            data-nav
            data-testid={`lesson-${l.id}`}
            aria-label={l.title.de}
            className="relative flex flex-col items-center gap-2 rounded-[2rem] p-3 shadow-lg outline-none focus-visible:ring-8 focus-visible:ring-amber-300"
            style={{ background: SUBJECT_COLOR[l.school.subject] }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') void speak(profile, `t.${l.id}`)
            }}
            onClick={() => open(l.id)}
          >
            <span className="aspect-square w-3/4">
              <Illustration name={l.icon} className="h-full w-full" live />
            </span>
            <span className="text-center text-lg font-extrabold leading-tight text-stone-800 tv:text-3xl">{l.title[lang]}</span>
            <span className="rounded-full bg-white/70 px-2 text-xs font-bold text-stone-600 tv:text-lg" data-testid={`subject-${l.id}`}>
              {t(`subj_${l.school.subject}` as UiKey)}
            </span>
            {visited.includes(l.id) && (
              <span className="absolute -right-1 -top-1 h-9 w-9">
                <Illustration name="sticker-star" className="h-full w-full" />
              </span>
            )}
          </motion.button>
        ))}
      </div>
      <p className="safe-x pb-3 text-center text-sm text-stone-500 tv:text-xl" data-testid="school-stage-name">
        {cur === 'pl' ? <>{t(`plstage_${stage}` as UiKey)} · {t('plCurriculum')}</> : <>{t(`stage_${stage}` as UiKey)} · Lehrplan 21 · {settings.uiLang === 'pl' ? 'Berno' : 'Bern'}</>}
      </p>
    </div>
  )
}
