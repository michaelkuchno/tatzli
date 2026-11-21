import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { TeacherFigure } from '@/illustrations/teacher'
import { onSpeaking } from '@/lib/audio'

/** true while a recording is sounding (the teacher speaks it) */
export function useSpeaking(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => onSpeaking(setOn), [])
  return on
}

/**
 * The teacher who teaches every school lesson – in the Swiss and in the Polish school alike: she stands at her blackboard,
 * her mouth moves exactly while a recording sounds, and she nods gently while she speaks.
 * Purely visual (pointer-events off), so it never takes a tap away from a game.
 */
export function Teacher({ className = '', board = true, testId = 'lesson-teacher' }: { className?: string; board?: boolean; testId?: string }) {
  const talking = useSpeaking()
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      data-testid={testId}
      data-talking={talking ? '1' : '0'}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0, rotate: talking ? [0, -1.5, 1.5, 0] : 0 }}
      transition={talking ? { rotate: { repeat: Infinity, duration: 1.2 } } : { duration: 0.4 }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="illu-live h-full w-full" overflow="visible">
        <TeacherFigure talking={talking} board={board} />
      </svg>
    </motion.div>
  )
}
