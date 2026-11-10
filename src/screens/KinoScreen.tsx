import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AlignedSource, Lang, Story, Song } from '@content/types'
import { useApp } from '@/state/AppContext'
import { WORDS, WORD_BY_ID, PHRASES, STORIES, SONGS, TOPIC_BY_ID, PHRASE_BY_ID, STORY_BY_ID, SONG_BY_ID } from '@/lib/content'
import { topicsFor } from '@/lib/topics'
import { loadManifest, hasRecording, stopAll } from '@/lib/audio'
import { speak, speakChain, soundLangs, speechRate } from '@/lib/speak'
import { playMelody, sfx, setMusic } from '@/lib/sound'
import { recordExposure } from '@/lib/progress'
import { plainAll } from '@/lib/align'
import { Illustration } from '@/illustrations/registry'
import { SceneView } from '@/components/SceneView'
import { AlignedSentence } from '@/components/AlignedSentence'
import { WordLabel } from '@/components/WordLabel'
import { ChildBar, KidButton } from '@/components/ui'
import { showColor, isColorWord } from '@/components/ColorBurst'
import { shuffle, wait } from '@/activities/common'
import { keepScreenOn, allowScreenOff } from '@/lib/wakeLock'
import { PlaybackBar, type Chapter } from '@/components/PlaybackBar'
import { CHANNELS, CHANNEL_BY_ID, startKinoSession, kinoSessionSeconds, type Channel, type ChannelId } from '@/lib/kinoChannels'
import type { UiLang } from '@/lib/i18n'

/** Estimated duration of a segment in seconds (for the timeline / seeking). */
/** estimated seconds of a segment; spoken parts get longer when the speech is slower (melody keeps its tempo) */
function segDuration(seg: Segment, rate = 1): number {
  if (seg.kind === 'word') return 12 / rate
  if (seg.kind === 'phrase') return 14 / rate
  if (seg.kind === 'story') return (3 + seg.story.pages.length * 7) / rate
  const beats = seg.song.melody.reduce((a, n) => a + n.d, 0)
  return (seg.song.lines.length * 3.5) / rate + (beats * 60) / seg.song.bpm + 1
}
function segIllu(seg: Segment): string {
  if (seg.kind === 'word') return WORD_BY_ID[seg.id].illu
  if (seg.kind === 'phrase') return seg.illu
  if (seg.kind === 'story') return seg.story.pages[0].scene.items[0]?.key ?? 'buech'
  return seg.song.illu === 'tatzli' ? 'pose-sing' : seg.song.illu
}

type Segment =
  | { kind: 'word'; id: string }
  | { kind: 'phrase'; id: string; src: AlignedSource; illu: string }
  | { kind: 'story'; story: Story }
  | { kind: 'song'; song: Song }

/**
 * A lesson (topic) as a self-running presentation, in teaching order: every word → the phrases → the story → the song.
 * Played once; only verified recordings (strict mode).
 */
async function buildLesson(topicId: string, langs: Lang[], strict: boolean): Promise<{ list: Segment[]; available: number; total: number }> {
  await loadManifest()
  const ok = (id: string) => !strict || hasRecording(id, langs)
  const topic = TOPIC_BY_ID[topicId]
  const list: Segment[] = []
  let total = 0
  for (const id of topic.words) {
    if (!WORD_BY_ID[id]) continue
    total++
    if (ok(`w.${id}`)) list.push({ kind: 'word', id })
  }
  for (const id of topic.phrases) {
    const p = PHRASE_BY_ID[id]
    if (!p) continue
    total++
    if (ok(`p.${p.id}`)) list.push({ kind: 'phrase', id: p.id, src: p.src, illu: p.illu ?? topic.icon })
  }
  const story = topic.story ? STORY_BY_ID[topic.story] : undefined
  if (story) {
    total++
    if (story.pages.every((_, i) => ok(`s.${story.id}.${i}`))) list.push({ kind: 'story', story })
  }
  const song = topic.song ? SONG_BY_ID[topic.song] : undefined
  if (song) {
    total++
    if (song.lines.every((_, i) => ok(`song.${song.id}.${i}`))) list.push({ kind: 'song', song })
  }
  return { list, available: list.length, total }
}

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

/** One film of a kind (songs, stories, a word field, sentences, a mix): short and finite, different every time. */
async function buildChannel(ch: Channel, level: 1 | 2 | 3, langs: Lang[], strict: boolean, mix: { songs: boolean; stories: boolean; words: boolean; colors: boolean }): Promise<{ list: Segment[]; available: number; total: number }> {
  if (ch.kind === 'mix') {
    const p = await buildProgramme(level, langs, strict, mix)
    return { ...p, list: p.list.slice(0, ch.size) }
  }
  await loadManifest()
  const ok = (id: string) => !strict || hasRecording(id, langs)
  const max = Math.max(2, level)
  let all: Segment[] = []
  let total = 0
  if (ch.kind === 'songs')
    for (const s of SONGS.filter((x) => x.level <= max)) {
      total++
      if (s.lines.every((_, i) => ok(`song.${s.id}.${i}`))) all.push({ kind: 'song', song: s })
    }
  else if (ch.kind === 'stories')
    for (const s of STORIES.filter((x) => x.level <= max)) {
      total++
      if (s.pages.every((_, i) => ok(`s.${s.id}.${i}`))) all.push({ kind: 'story', story: s })
    }
  else if (ch.kind === 'phrases')
    for (const p of PHRASES.filter((x) => x.level <= max && x.illu && !x.tags?.includes('tpr'))) {
      total++
      if (ok(`p.${p.id}`)) all.push({ kind: 'phrase', id: p.id, src: p.src, illu: p.illu! })
    }
  else
    for (const w of WORDS.filter((x) => x.level <= max && ch.cats?.includes(x.cat))) {
      total++
      if (ok(`w.${w.id}`)) all.push({ kind: 'word', id: w.id })
    }
  all = shuffle(all)
  return { list: all.slice(0, ch.size), available: all.length, total }
}

/** the film after this one: the next lesson, or the next kind of film */
function nextFilm(topicId: string | undefined, channel: ChannelId | undefined, level: 1 | 2 | 3): { topicId?: string; channel?: ChannelId; icon: string; color: string; title: string } {
  if (topicId) {
    const lessons = topicsFor(level)
    const n = lessons[(lessons.findIndex((x) => x.id === topicId) + 1) % lessons.length]
    return { topicId: n.id, icon: n.icon, color: '#ffe58a', title: n.title.de }
  }
  const i = CHANNELS.findIndex((c) => c.id === channel)
  const n = CHANNELS[(i + 1) % CHANNELS.length]
  return { channel: n.id, icon: n.icon, color: n.color, title: n.title.de }
}

/** The cinema menu: different kinds of films and every lesson; a tap starts one (and the films then follow one another). */
function KinoMenu() {
  const { profile, settings, go, t } = useApp()
  const level = profile?.level ?? 1
  const langs = soundLangs(profile)
  const ui = settings.uiLang as UiLang
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    setMusic(false)
    const id = window.setTimeout(() => void speak(profile, 'ui.kino-hello'), 300)
    void (async () => {
      const out: Record<string, number> = {}
      for (const ch of CHANNELS) out[ch.id] = (await buildChannel(ch, level, langs, settings.strictAudio, settings.kinoMix)).available
      setCounts(out)
    })()
    return () => {
      clearTimeout(id)
      stopAll()
      setMusic(settings.music)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const start = (s: { channel?: ChannelId; topicId?: string }) => {
    stopAll()
    startKinoSession()
    go({ name: 'kino', ...s, n: Date.now() })
  }
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sky-100 to-amber-50" data-testid="kino-menu">
      <ChildBar title={<span className="text-2xl font-black text-amber-900 tv:text-4xl">🎬 Tatzli-Kino</span>} />
      <div className="safe-x flex-1 overflow-auto pb-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5 py-2 tv:gap-10" data-testid="kino-channels">
          {CHANNELS.map((ch) => {
            const empty = counts !== null && !counts[ch.id]
            return (
              <div key={ch.id} className={`flex w-32 flex-col items-center gap-1 tv:w-48 ${empty ? 'opacity-40' : ''}`}>
                <KidButton illu={ch.icon} label={ch.title[ui] ?? ch.title.de} size={112} color={ch.color} testId={`kino-ch-${ch.id}`} onClick={() => !empty && start({ channel: ch.id })} />
                <span className="text-center text-sm font-bold text-stone-700 tv:text-xl">{ch.title[ui] ?? ch.title.de}</span>
              </div>
            )
          })}
        </div>
        <h3 className="mx-auto mt-6 max-w-6xl px-2 text-lg font-black text-amber-900 tv:text-3xl">{t('kinoLessons')}</h3>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 py-2" data-testid="kino-lessons">
          {topicsFor(level).map((tp) => (
            <div key={tp.id} className="flex w-28 flex-col items-center gap-1 tv:w-40">
              <KidButton illu={tp.icon} label={tp.title.de} size={92} testId={`kino-lesson-${tp.id}`} onClick={() => start({ topicId: tp.id })} />
              <span className="text-center text-xs font-bold text-stone-600 tv:text-lg">{tp.title.be}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function KinoScreen({ topicId, channel }: { topicId?: string; channel?: string } = {}) {
  if (!topicId && !channel) return <KinoMenu />
  return <KinoFilm topicId={topicId} channel={channel as ChannelId | undefined} />
}

/**
 * Tatzli-Kino: a calm, self-running programme for mealtimes (configurable 5–30 min by a grown-up).
 * Big pictures, words appear in the chosen languages, Tatzli invites the child to repeat
 * ("Jetz du!" – configurable), songs and stories in between. Ends with a gentle goodbye.
 */
function KinoFilm({ topicId, channel }: { topicId?: string; channel?: ChannelId }) {
  const { profile, settings, t, go, swap, screen } = useApp()
  const level = profile?.level ?? 1
  const langs = soundLangs(profile)
  const showText = profile?.langs ?? ['be']
  const [prog, setProg] = useState<{ list: Segment[]; available: number; total: number } | null>(null)
  const [idx, setIdx] = useState(0)
  const [sub, setSub] = useState(0) // page/line inside a story or song
  const [phase, setPhase] = useState<'show' | 'repeat' | 'text'>('show')
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)
  /** after a film: 'next' = the next film starts by itself after a short countdown; 'bye' = the cinema time is used up */
  const [finale, setFinale] = useState<'next' | 'bye'>('next')
  const [countdown, setCountdown] = useState(0)
  const following = nextFilm(topicId, channel, level)
  const goNext = () => {
    stopAll()
    swap(screen, { name: 'kino', topicId: following.topicId, channel: following.channel, n: Date.now() })
  }
  const again = () => {
    stopAll()
    swap(screen, { name: 'kino', topicId, channel, n: Date.now() })
  }
  const finish = async () => {
    const over = kinoSessionSeconds() >= settings.kinoMinutes * 60
    setFinale(over ? 'bye' : 'next')
    setEnded(true)
    if (over) await speak(profile, 'ui.kino-bye')
  }
  const [restart, setRestart] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const segStart = useRef(Date.now())
  const pausedAt = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const run = useRef(0)
  pausedRef.current = paused

  // the screen must stay on for the whole show
  useEffect(() => {
    if (!ended) void keepScreenOn()
    else void allowScreenOff()
    return () => {
      void allowScreenOff()
    }
  }, [ended])

  useEffect(() => {
    setMusic(false)
    const ch = channel ? CHANNEL_BY_ID[channel] : undefined
    void (topicId ? buildLesson(topicId, langs, settings.strictAudio) : buildChannel(ch ?? CHANNEL_BY_ID.mix, level, langs, settings.strictAudio, settings.kinoMix)).then(setProg)
    // a lesson starts with its title
    const id = window.setTimeout(() => topicId && void speak(profile, `t.${topicId}`), 300)
    return () => {
      clearTimeout(id)
      stopAll()
      setMusic(settings.music)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // timeline: the looped programme cut to the chosen length
  const plan = useMemo(() => {
    const out: { at: number; dur: number; i: number }[] = []
    if (!prog?.list.length) return out
    // every film plays its list once; afterwards the next film follows (until the cinema time is used up)
    let at = 0
    for (let i = 0; i < prog.list.length; i++) {
      const dur = segDuration(prog.list[i % prog.list.length], speechRate(profile))
      out.push({ at, dur, i })
      at += dur
    }
    return out
  }, [prog, profile])
  const totalSec = plan.length ? plan[plan.length - 1].at + plan[plan.length - 1].dur : 0
  const chapters: Chapter[] = useMemo(
    () => (prog?.list.length ? plan.map((p) => { const s = prog.list[p.i % prog.list.length]; return { at: p.at, illu: segIllu(s), kind: s.kind } }) : []),
    [plan, prog],
  )
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])
  const position = plan[idx] ? plan[idx].at + Math.min(plan[idx].dur, ((pausedAt.current ?? now) - segStart.current) / 1000) : totalSec
  const goTo = (j: number) => {
    stopAll()
    const k2 = Math.max(0, Math.min(plan.length - 1, j))
    setSub(0)
    setIdx(k2)
    setRestart((r) => r + 1)
  }
  const seek = (t: number) => {
    const j = plan.findIndex((p) => t >= p.at && t < p.at + p.dur)
    goTo(j < 0 ? plan.length - 1 : j)
  }
  const togglePause = () => {
    setPaused((p) => {
      if (!p) {
        stopAll()
        pausedAt.current = Date.now()
      } else if (pausedAt.current) {
        segStart.current += Date.now() - pausedAt.current
        pausedAt.current = null
      }
      return !p
    })
  }
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
    if (prog && !prog.list.length && !ended) void finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog])

  // countdown to the next film (buttons stay usable all the time)
  useEffect(() => {
    if (!ended || finale !== 'next') return
    let alive = true
    void (async () => {
      for (let c = 8; c > 0 && alive; c--) {
        setCountdown(c)
        await new Promise((r) => setTimeout(r, 1000))
      }
      if (alive) goNext()
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended, finale])

  useEffect(() => {
    if (!prog || ended || !prog.list.length) return
    const token = ++run.current
    segStart.current = Date.now()
    pausedAt.current = paused ? Date.now() : null
    void (async () => {
      await wait(600)
      await waitWhilePaused(token)
      if (token !== run.current) return
      await playSegment(prog.list[idx % prog.list.length], token)
      if (token !== run.current) return
      if (idx + 1 >= plan.length) {
        await finish()
        return
      }
      setSub(0)
      setIdx((i) => i + 1)
    })()
    return () => {
      run.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog, idx, ended, restart])

  const seg = prog?.list.length ? prog.list[idx % prog.list.length] : null
  const elapsed = totalSec ? Math.min(1, position / totalSec) : 0

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-sky-100 to-amber-50" data-testid="kino" data-segment={seg?.kind ?? ''} data-film={topicId ?? channel} data-items={prog?.list.length ?? -1}>
      <ChildBar
        title={
          <div className="mx-auto h-3 w-40 overflow-hidden rounded-full bg-white/70" aria-hidden>
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${elapsed * 100}%` }} />
          </div>
        }
      />
      <PlaybackBar
        position={position}
        total={totalSec}
        chapters={chapters}
        playing={!paused && !ended}
        disabled={ended}
        onSeek={seek}
        onToggle={togglePause}
        onPrev={() => goTo(position - (plan[idx]?.at ?? 0) > 3 ? idx : idx - 1)}
        onNext={() => goTo(idx + 1)}
        testId="kino-bar"
      >
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
        {ended && finale === 'bye' && (
          <motion.div className="h-[45vh] w-[45vh] max-w-[90vw]" initial={{ scale: 0.8 }} animate={{ scale: 1 }} data-testid="kino-end">
            <Illustration name="pose-eat" className="h-full w-full" live />
          </motion.div>
        )}
        {ended && finale === 'next' && (
          <motion.div className="flex flex-col items-center gap-3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} data-testid="kino-upnext" data-next={following.topicId ?? following.channel}>
            <button type="button" className="relative rounded-[3rem] p-5 shadow-2xl" style={{ background: following.color, width: 'min(50vw, 36vh)', height: 'min(50vw, 36vh)' }} onClick={goNext} aria-label={following.title} data-testid="kino-next-tile">
              <Illustration name={following.icon} className="h-full w-full" live />
              <span className="absolute -right-3 -top-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-black text-amber-600 shadow-lg tv:h-24 tv:w-24 tv:text-5xl" data-testid="kino-countdown">
                {countdown}
              </span>
            </button>
            <span className="text-xl font-black text-stone-700 tv:text-3xl">▶ {following.title}</span>
          </motion.div>
        )}
        {ended && (
          <div className="flex flex-wrap justify-center gap-6" data-testid="kino-end-actions">
            {finale === 'next' && <KidButton illu={following.icon} label={following.title} size={110} color={following.color} testId={topicId ? 'lesson-end-next' : 'kino-next-now'} onClick={goNext} />}
            <KidButton label="nomau" size={110} testId="kino-again" onClick={again}>
              <span className="text-5xl" aria-hidden>
                ↻
              </span>
            </KidButton>
            {topicId && <KidButton illu={TOPIC_BY_ID[topicId].icon} label={TOPIC_BY_ID[topicId].title.de} size={110} testId="lesson-end-play" onClick={() => go({ name: 'topic', topicId })} />}
            <KidButton label="Kino" size={110} color="#ffe58a" testId="kino-to-menu" onClick={() => { stopAll(); go({ name: 'kino' }) }}>
              <span className="text-5xl" aria-hidden>
                🎬
              </span>
            </KidButton>
            <KidButton illu="huus" label="Karte" size={110} testId="kino-end-home" onClick={() => go({ name: 'map' })} />
          </div>
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
      </PlaybackBar>
      {paused && !ended && (
        <button type="button" className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/20" aria-label="play" data-testid="kino-paused" onClick={togglePause}>
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-white/95 shadow-2xl">
            <svg viewBox="0 0 24 24" className="h-14 w-14" fill="#4a3326" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
