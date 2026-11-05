import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { TOPIC_BY_ID, PHRASE_BY_ID, WORD_BY_ID } from '@/lib/content'
import { useApp } from '@/state/AppContext'
import { Illustration } from '@/illustrations/registry'
import { KidButton } from '@/components/ui'
import { WordLabel } from '@/components/WordLabel'
import { AlignedSentence } from '@/components/AlignedSentence'
import { speak } from '@/lib/speak'
import { sfx } from '@/lib/sound'
import { stopAll } from '@/lib/audio'
import type { ActivityProps } from './common'

/**
 * "Red wie Tatzli": model voice → child records → plays model again and then the child's voice.
 * No pronunciation scoring. Recordings live only in memory and are discarded right after playback.
 * The microphone is requested only here (and in the parent's recording studio).
 */
export function SpeakLike({ topicId, onComplete }: ActivityProps) {
  const { profile } = useApp()
  const topic = TOPIC_BY_ID[topicId]
  const level = profile?.level ?? 2
  const items = useMemo(() => {
    const ws = topic.words.slice(0, 6).map((w) => ({ id: `w.${w}`, word: w as string | undefined, phrase: undefined as string | undefined, illu: WORD_BY_ID[w].illu }))
    const ps =
      level > 1
        ? topic.phrases
            .map((p) => PHRASE_BY_ID[p])
            .filter((p) => p && p.level <= level)
            .slice(0, 3)
            .map((p) => ({ id: `p.${p.id}`, word: undefined, phrase: p.id as string | undefined, illu: p.illu ?? topic.icon }))
        : []
    return [...ws, ...ps]
  }, [topic, level])
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<'idle' | 'model' | 'rec' | 'play' | 'nomic'>('idle')
  const [count, setCount] = useState(0)
  const rec = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const item = items[idx]

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop())
      stopAll()
    },
    [],
  )

  const go = async () => {
    if (!item) return
    setState('model')
    await speak(profile, item.id)
    let s = stream.current
    try {
      if (!s) {
        s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        stream.current = s
      }
    } catch {
      setState('nomic')
      return
    }
    setState('rec')
    sfx.pop()
    const chunks: Blob[] = []
    const mr = new MediaRecorder(s)
    rec.current = mr
    mr.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data)
    }
    const stopped = new Promise<void>((r) => (mr.onstop = () => r()))
    mr.start()
    await new Promise((r) => setTimeout(r, level === 3 ? 3500 : 2600))
    if (mr.state !== 'inactive') mr.stop()
    await stopped
    setState('play')
    sfx.soft()
    // model first, then the child's own voice
    await speak(profile, item.id)
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
    const url = URL.createObjectURL(blob)
    await new Promise<void>((resolve) => {
      const a = new Audio(url)
      a.onended = () => resolve()
      a.onerror = () => resolve()
      a.play().catch(() => resolve())
      setTimeout(resolve, 6000)
    })
    URL.revokeObjectURL(url)
    // the blob goes out of scope here – never stored
    chunks.length = 0
    sfx.success()
    setState('idle')
    const c = count + 1
    setCount(c)
    if (c === Math.min(3, items.length)) onComplete()
  }

  if (!item) return null
  return (
    <div className="flex flex-col items-center gap-5" data-testid="speak" data-state={state}>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((it, k) => (
          <KidButton key={it.id} illu={it.illu} label={it.id} size={72} color={k === idx ? '#ffe58a' : '#fff'} testId={`speak-item-${k}`} onClick={() => setIdx(k)} />
        ))}
      </div>
      <div className="flex items-center gap-8">
        <div className="h-[28vh] w-[28vh]">
          <Illustration name="tatzli" pose={state === 'rec' ? 'listen' : state === 'model' ? 'sing' : 'idle'} className="h-full w-full" live={state !== 'idle'} />
        </div>
        <div className="h-[22vh] w-[22vh] rounded-[2.5rem] bg-white p-3 shadow-lg">
          <Illustration name={item.illu} className="h-full w-full" live />
        </div>
      </div>
      {level > 1 && (item.word ? <WordLabel wordId={item.word} /> : item.phrase ? <AlignedSentence src={PHRASE_BY_ID[item.phrase].src} audioId={item.id} size="md" /> : null)}
      <motion.button
        type="button"
        data-nav
        data-testid="speak-go"
        aria-label="record"
        disabled={state !== 'idle' && state !== 'nomic'}
        className={`flex h-32 w-32 items-center justify-center rounded-full shadow-xl tv:h-44 tv:w-44 ${state === 'rec' ? 'bg-red-500' : 'bg-rose-400'}`}
        animate={state === 'rec' ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={state === 'rec' ? { repeat: Infinity, duration: 0.8 } : {}}
        onClick={() => void go()}
      >
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="white" aria-hidden>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17v4M9 21h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.button>
      {state === 'nomic' && <p className="rounded-2xl bg-white px-4 py-2 text-lg">🎤 ✗</p>}
    </div>
  )
}
