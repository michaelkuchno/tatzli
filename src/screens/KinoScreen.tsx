import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AlignedSource, Lang, Story, Song } from '@content/types'
import { useApp } from '@/state/AppContext'
import { WORDS, WORD_BY_ID, PHRASES, STORIES, SONGS } from '@/lib/content'
import { topicsFor } from '@/lib/topics'
import { loadManifest, hasRecording, stopAll } from '@/lib/audio'
import { speak, speakChain, soundLangs } from '@/lib/speak'
import { playMelody, sfx, setMusic } from '@/lib/sound'
import { recordExposure } from '@/lib/progress'
import { plainAll } from '@/lib/align'
import { Illustration } from '@/illustrations/registry'
import { SceneView } from '@/components/SceneView'
import { AlignedSentence } from '@/components/AlignedSentence'
import { WordLabel } from '@/components/WordLabel'
import { ChildBar } from '@/components/ui'
import { showColor, isColorWord } from '@/components/ColorBurst'
import { shuffle, wait } from '@/activities/common'

type Segment =
  | { kind: 'word'; id: string }
  | { kind: 'phrase'; id: string; src: AlignedSource; illu: string }
  | { kind: 'story'; story: Story }
  | { kind: 'song'; song: Song }

/** Build a varied programme from the child's level; only items with verified recordings (strict mode). */
async function buildProgramme(level: 1 | 2 | 3, langs: Lang[], strict: boolean, mix: { songs: boolean; stories: boolean; words: boolean; colors: boolean }): Promise<{ list: Segment[]; available: number; total: number }> {
  await loadManifest()
  const ok = (id: string) => !strict || hasRecording(id, langs)
  const topicWords = new Set(topicsFor(level).flatMap((t) => t.words))
  const levelWords = WORDS.filter((w) => w.level <= level && (topicWords.has(w.id) || w.level === 1) && w.cat !== 'verbs')
  let total = 0
  const words: Segment[] = []
  for (const w of levelWords) {
    if (!mix.colors && w.cat === 'colors') continue
    if (!mix.words && w.cat !== 'colors') continue
    total++
    if (ok(`w.${w.id}`)) words.push({ kind: 'word', id: w.id })
  }
  const phrases: Segment[] = []
  if (mix.words)
    for (const p of PHRASES.filter((x) => x.level <= level && x.illu && !x.tags?.includes('tpr'))) {
      total++
      if (ok(`p.${p.id}`)) phrases.push({ kind: 'phrase', id: p.id, src: p.src, illu: p.illu! })
    }
  const stories: Segment[] = []
  if (mix.stories)
    for (const s of STORIES.filter((x) => x.level <= Math.max(2, level))) {
      total++
      const ids = s.pages.map((_, i) => `s.${s.id}.${i}`)
      if (ids.every(ok)) stories.push({ kind: 'story', story: s })
    }
  const songs: Segment[] = []
  if (mix.songs)
    for (const s of SONGS.filter((x) => x.level <= Math.max(2, level))) {
      total++
      if (s.lines.every((_, i) => ok(`song.${s.id}.${i}`))) songs.push({ kind: 'song', song: s })
    }
  // weave: 3 words → phrase → song/story …
  const W = shuffle(words)
  const P = shuffle(phrases)
  const big = shuffle([...songs, ...stories])
  const list: Segment[] = []
  let guard = 0
  while ((W.length || P.length || big.length) && guard++ < 400) {
    for (let i = 0; i < 3 && W.length; i++) list.push(W.shift()!)
    if (P.length) list.push(P.shift()!)
    if (big.length) list.push(big.shift()!)
  }
  return { list, available: words.length + phrases.length + stories.length + songs.length, total }
}

/**
 * Tatzli-Kino: a calm, self-running programme for mealtimes (configurable 5–30 min by a grown-up).
 * Big pictures, words appear in the chosen languages, Tatzli invites the child to repeat
 * ("Jetz du!" – configurable), songs and stories in between. Ends with a gentle goodbye.
 */
export function KinoScreen() {
  const { profile, settings, t } = useApp()
  const level = profile?.level ?? 1
  const langs = soundLangs(profile)
  const showText = profile?.langs ?? ['be']
  const [prog, setProg] = useState<{ list: Segment[]; available: number; total: number } | null>(null)
  const [idx, setIdx] = useState(0)
  const [sub, setSub] = useState(0) // page/line inside a story or song
  const [phase, setPhase] = useState<'show' | 'repeat' | 'text'>('show')
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)
  const startedAt = useRef(Date.now())
  const pausedRef = useRef(false)
  const run = useRef(0)
  pausedRef.current = paused

  useEffect(() => {
    setMusic(false)
    void buildProgramme(level, langs, settings.strictAudio, settings.kinoMix).then(setProg)
    const id = window.setTimeout(() => void speak(profile, 'ui.kino-hello'), 300)
    return () => {
      clearTimeout(id)
      stopAll()
      setMusic(settings.music)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timeUp = () => Date.now() - startedAt.current > settings.kinoMinutes * 60000
  const waitWhilePaused = async (token: number) => {
    while (pausedRef.current && token === run.current) await wait(300)
  }

  const playSegment = useCallback(
    async (seg: Segment, token: number) => {
      const alive = () => token === run.current
      if (seg.kind === 'word') {
        setPhase('show')
        await wait(900)
        setPhase('text')
        if (isColorWord(seg.id)) showColor(seg.id)
        if (!alive()) return
        await speak(profile, `w.${seg.id}`)
        await waitWhilePaused(token)
        if (!alive()) return
        setPhase('repeat')
        await speak(profile, `ui.${settings.kinoPrompt}`)
        await wait(3200) // time for the child to say it
        if (!alive()) return
        setPhase('text')
        if (isColorWord(seg.id)) showColor(seg.id)
        await speakChain(profile, [`w.${seg.id}`])
        sfx.sparkle()
        if (profile?.id) void recordExposure(profile.id, seg.id, 'word', 'exposed')
        await wait(1200)
      } else if (seg.kind === 'phrase') {
        setPhase('show')
        await wait(700)
        setPhase('text')
        await speak(profile, `p.${seg.id}`, undefined)
        await waitWhilePaused(token)
        if (!alive()) return
        setPhase('repeat')
        await speak(profile, `ui.${settings.kinoPrompt}`)
        await wait(4000)
        if (!alive()) return
        setPhase('text')
        await speak(profile, `p.${seg.id}`)
        if (profile?.id) void recordExposure(profile.id, seg.id, 'phrase', 'exposed')
        await wait(1200)
      } else if (seg.kind === 'story') {
        let i = 0
        await speak(profile, `st.${seg.story.id}`)
        while (i < seg.story.pages.length && alive()) {
          setSub(i)
          const pg = seg.story.pages[i]
          await wait(500)
          await speak(profile, `s.${seg.story.id}.${i}`, plainAll(pg.text))
          await wait(1500)
          await waitWhilePaused(token)
          if (pg.end) break
          i = pg.choice ? pg.choice.options[0].next : i + 1
        }
      } else {
        const song = seg.song
        for (let i = 0; i < song.lines.length && alive(); i++) {
          setSub(i)
          await speak(profile, `song.${song.id}.${i}`)
          await waitWhilePaused(token)
        }
        if (!alive()) return
        // sing the whole melody once with the lines lighting up
        let beat = 0
        const bounds = song.lines.map((l) => {
          const b = beat
          beat += l.beats
          return b
        })
        let acc = 0
        const starts = song.melody.map((n) => {
          const s = acc
          acc += n.d
          return s
        })
        const m = playMelody(song.melody, song.bpm, (ni) => {
          const li = bounds.findIndex((b, k) => starts[ni] >= b && starts[ni] < (bounds[k + 1] ?? Infinity))
          if (li >= 0) setSub(li)
        })
        await wait(m.seconds * 1000 + 600)
      }
    },
    [profile, settings.kinoPrompt],
  )

  useEffect(() => {
    if (!prog || ended || !prog.list.length) return
    const token = ++run.current
    void (async () => {
      await wait(600)
      await waitWhilePaused(token)
      if (token !== run.current) return
      await playSegment(prog.list[idx % prog.list.length], token)
      if (token !== run.current) return
      if (timeUp()) {
        setEnded(true)
        await speak(profile, 'ui.kino-bye')
        return
      }
      setSub(0)
      setIdx((i) => i + 1)
    })()
    return () => {
      run.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog, idx, ended])

  const seg = prog?.list.length ? prog.list[idx % prog.list.length] : null
  const elapsed = Math.min(1, (Date.now() - startedAt.current) / (settings.kinoMinutes * 60000))

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sky-100 to-amber-50" data-testid="kino" data-segment={seg?.kind ?? ''}>
      <ChildBar
        title={
          <div className="mx-auto h-3 w-40 overflow-hidden rounded-full bg-white/70" aria-hidden>
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${elapsed * 100}%` }} />
          </div>
        }
      />
      <div className="safe-x flex min-h-0 flex-1 flex-col items-center justify-center gap-4 pb-4">
        {!prog && <div className="h-40 w-40 animate-bounce"><Illustration name="tatzli" className="h-full w-full" /></div>}
        {prog && !prog.list.length && (
          <div className="flex flex-col items-center gap-4 text-center" data-testid="kino-empty">
            <div className="h-56 w-56">
              <Illustration name="pose-listen" className="h-full w-full" live />
            </div>
            <p className="max-w-md rounded-2xl bg-white/80 p-4 text-lg text-stone-700">
              🔈 {t('kinoWaiting', { done: prog.available, total: prog.total })}
            </p>
          </div>
        )}
        {ended && (
          <motion.div className="h-[55vh] w-[55vh] max-w-[90vw]" initial={{ scale: 0.8 }} animate={{ scale: 1 }} data-testid="kino-end">
            <Illustration name="pose-eat" className="h-full w-full" live />
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {!ended && seg && (seg.kind === 'word' || seg.kind === 'phrase') && (
            <motion.div key={idx} className="flex w-full flex-col items-center gap-4" initial={{ opacity: 0, scale: 0.6, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -30 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
              <div className="relative flex items-center justify-center gap-6">
                <motion.button
                  type="button"
                  aria-label="nochmal"
                  className="rounded-[3rem] bg-white p-4 shadow-2xl"
                  style={{ width: 'min(58vw, 46vh)', height: 'min(58vw, 46vh)' }}
                  animate={{ rotate: [0, -3, 3, 0], y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  onClick={() => void speak(profile, seg.kind === 'word' ? `w.${seg.id}` : `p.${seg.id}`)}
                  data-testid="kino-picture"
                >
                  <Illustration name={seg.kind === 'word' ? WORD_BY_ID[seg.id].illu : seg.illu} className="h-full w-full" live />
                </motion.button>
                {phase === 'repeat' && (
                  <motion.div className="absolute -right-4 -top-6 h-36 w-36 md:-right-40 md:top-auto md:h-56 md:w-56" initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} data-testid="kino-repeat">
                    <Illustration name="tatzli" pose="listen" className="h-full w-full" live />
                    <motion.div className="absolute -left-2 top-2 h-12 w-12 rounded-full bg-rose-400 shadow-lg" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-full w-full p-2" fill="white">
                        <rect x="9" y="3" width="6" height="11" rx="3" />
                        <path d="M6 11a6 6 0 0 0 12 0" fill="none" stroke="white" strokeWidth="2" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {phase !== 'show' &&
                  (seg.kind === 'word' ? (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} data-testid="kino-text">
                      <WordLabel wordId={seg.id} langs={showText} />
                    </motion.div>
                  ) : (
                    <motion.div className="max-w-4xl rounded-3xl bg-white/90 p-4 shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="kino-text">
                      <AlignedSentence src={seg.src} audioId={`p.${seg.id}`} langs={showText} size="lg" />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          )}
          {!ended && seg?.kind === 'story' && (
            <motion.div key={`${idx}-${sub}`} className="flex w-full max-w-5xl flex-col gap-3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <SceneView scene={seg.story.pages[sub].scene} interactive={false} />
              <div className="rounded-3xl bg-white/90 p-3 shadow">
                <AlignedSentence src={seg.story.pages[sub].text} audioId={`s.${seg.story.id}.${sub}`} langs={showText} size="md" />
              </div>
            </motion.div>
          )}
          {!ended && seg?.kind === 'song' && (
            <motion.div key={`${idx}-song`} className="flex w-full max-w-4xl flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="h-[30vh] w-[30vh]" animate={{ rotate: [-5, 5, -5], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: (60 / seg.song.bpm) * 2 }}>
                <Illustration name={seg.song.illu === 'tatzli' ? 'pose-sing' : seg.song.illu} className="h-full w-full" live />
              </motion.div>
              <div className="w-full rounded-3xl bg-white/90 p-4 shadow">
                <AlignedSentence src={seg.song.lines[sub].src} audioId={`song.${seg.song.id}.${sub}`} langs={showText} size="lg" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!ended && prog && prog.list.length > 0 && (
        <div className="flex justify-center pb-5">
          <button
            type="button"
            data-nav
            data-testid="kino-pause"
            aria-label={paused ? 'play' : 'pause'}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl active:scale-95"
            onClick={() => {
              setPaused((p) => !p)
              if (!paused) stopAll()
            }}
          >
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="#4a3326" aria-hidden>
              {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
