import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { SONG_BY_ID, TOPIC_BY_ID } from '@/lib/content'
import { parseAligned } from '@/lib/align'
import { useApp } from '@/state/AppContext'
import { AlignedSentence } from '@/components/AlignedSentence'
import { KidButton } from '@/components/ui'
import { Illustration } from '@/illustrations/registry'
import { playMelody } from '@/lib/sound'
import { speak } from '@/lib/speak'
import { stopAll } from '@/lib/audio'
import type { ActivityProps } from './common'

/**
 * Original song / rhyme. "Los" = each line is spoken (pronunciation in the sound language) with the
 * text highlighted; "Sing" = the original melody plays (Web Audio) while words light up in rhythm.
 */
export function SongPlayer({ topicId, onComplete, songId }: ActivityProps & { songId?: string }) {
  const { profile } = useApp()
  const song = SONG_BY_ID[songId ?? TOPIC_BY_ID[topicId]?.song ?? '']
  const lang = profile?.langs[0] ?? 'be'
  const [line, setLine] = useState(-1)
  const [word, setWord] = useState<number | null>(null)
  const [mode, setMode] = useState<'idle' | 'speak' | 'sing'>('idle')
  const stopRef = useRef<() => void>(() => {})
  const plays = useRef(0)

  // map note index → (line, segment index in first display language)
  const timeline = useMemo(() => {
    if (!song) return []
    const out: { line: number; seg: number }[] = []
    let beat = 0
    const bounds: number[] = []
    for (const l of song.lines) {
      bounds.push(beat)
      beat += l.beats
    }
    let acc = 0
    for (const n of song.melody) {
      let li = bounds.findIndex((b, k) => acc >= b && acc < (bounds[k + 1] ?? Infinity))
      if (li < 0) li = song.lines.length - 1
      const segs = parseAligned(song.lines[li].src[lang])
      const alignedIdx = segs.map((s, k) => (s.groups.length ? k : -1)).filter((k) => k >= 0)
      const pos = (acc - bounds[li]) / song.lines[li].beats
      out.push({ line: li, seg: alignedIdx[Math.min(alignedIdx.length - 1, Math.floor(pos * alignedIdx.length))] ?? 0 })
      acc += n.d
    }
    return out
  }, [song, lang])

  useEffect(() => () => {
    stopRef.current()
    stopAll()
  }, [])

  if (!song) return null

  const finish = () => {
    setMode('idle')
    setLine(-1)
    setWord(null)
    plays.current++
    if (plays.current === 1) onComplete()
  }

  const speakAll = async () => {
    stopRef.current()
    setMode('speak')
    let cancelled = false
    stopRef.current = () => {
      cancelled = true
      stopAll()
    }
    for (let i = 0; i < song.lines.length; i++) {
      if (cancelled) return
      setLine(i)
      await speak(profile, `song.${song.id}.${i}`)
    }
    if (!cancelled) finish()
  }

  const sing = () => {
    stopRef.current()
    stopAll()
    setMode('sing')
    const m = playMelody(song.melody, song.bpm, (i) => {
      const t = timeline[i]
      if (t) {
        setLine(t.line)
        setWord(t.seg)
      }
    })
    const id = window.setTimeout(finish, m.seconds * 1000 + 400)
    stopRef.current = () => {
      m.stop()
      clearTimeout(id)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5" data-testid="song" data-mode={mode}>
      <motion.div className="h-[30vh] w-[30vh]" animate={mode !== 'idle' ? { rotate: [-4, 4, -4], y: [0, -8, 0] } : {}} transition={{ repeat: Infinity, duration: 60 / song.bpm * 2 }}>
        <Illustration name={song.illu === 'tatzli' ? 'pose-sing' : song.illu} className="h-full w-full" live={mode !== 'idle'} />
      </motion.div>
      <div className="flex gap-4">
        <KidButton illu="ohr" label="Los" testId="song-speak" color="#e0f5f1" onClick={() => void speakAll()} />
        <KidButton illu="pose-sing" label="Sing" testId="song-sing" color="#fff3c4" onClick={sing} />
      </div>
      <div className="flex w-full max-w-5xl flex-col gap-3">
        {song.lines.map((l, i) => (
          <div key={i} className={`rounded-3xl p-3 transition-all ${line === i ? 'scale-[1.02] bg-white shadow-lg' : 'bg-white/50'}`} data-testid={`song-line-${i}`} data-active={line === i}>
            {(profile?.level ?? 2) > 1 || line === i ? (
              <AlignedSentence src={l.src} audioId={`song.${song.id}.${i}`} size="md" activeWord={line === i && word !== null ? { lang, index: word } : null} />
            ) : (
              <div className="h-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
