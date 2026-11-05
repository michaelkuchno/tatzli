/**
 * Quiet, pleasant synthesized sound effects and gentle background music (Web Audio, original).
 * No samples are loaded – everything is generated, so it works offline and weighs nothing.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicGain: GainNode | null = null
let sfxLevel = 0.5
let musicOn = false
let musicTimer: number | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = sfxLevel
    master.connect(ctx.destination)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0.12
    musicGain.connect(master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setSfxVolume(v: number) {
  sfxLevel = v
  if (master) master.gain.value = v
}

const hz = (semi: number) => 261.63 * Math.pow(2, semi / 12)

/** Soft mallet-like tone. */
export function tone(semi: number, dur = 0.25, when = 0, gain = 0.25, dest?: AudioNode) {
  const c = ac()
  if (!c || !master) return
  const t = c.currentTime + when
  const o = c.createOscillator()
  const o2 = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o2.type = 'triangle'
  o.frequency.value = hz(semi)
  o2.frequency.value = hz(semi) * 2
  const g2 = c.createGain()
  g2.gain.value = 0.15
  o.connect(g)
  o2.connect(g2).connect(g)
  g.connect(dest ?? master)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.12, dur))
  o.start(t)
  o2.start(t)
  o.stop(t + dur + 0.05)
  o2.stop(t + dur + 0.05)
}

export const sfx = {
  tap: () => tone(12, 0.12, 0, 0.15),
  pop: () => {
    tone(19, 0.08, 0, 0.12)
    tone(24, 0.1, 0.05, 0.1)
  },
  success: () => {
    tone(12, 0.18, 0, 0.18)
    tone(16, 0.18, 0.1, 0.18)
    tone(19, 0.3, 0.2, 0.2)
  },
  sticker: () => [0, 4, 7, 12, 16].forEach((s, i) => tone(12 + s, 0.25, i * 0.08, 0.15)),
  soft: () => tone(7, 0.2, 0, 0.12),
  whoosh: () => [12, 9, 7, 4].forEach((s, i) => tone(s, 0.1, i * 0.04, 0.06)),
  boing: () => {
    tone(7, 0.12, 0, 0.15)
    tone(14, 0.15, 0.08, 0.12)
  },
  sparkle: () => [24, 28, 31].forEach((s, i) => tone(s, 0.12, i * 0.05, 0.06)),
  lullaby: () => [7, 4, 0, 4, 7, 7, 5, 4, 2, 0].forEach((s, i) => tone(s, 0.5, i * 0.45, 0.12)),
}

/** Play a song melody (beats → seconds). Returns total seconds; onNote called per note index. */
export function playMelody(notes: { n: number | null; d: number }[], bpm: number, onNote?: (i: number) => void): { stop: () => void; seconds: number } {
  const beat = 60 / bpm
  let t = 0
  const timers: number[] = []
  notes.forEach((note, i) => {
    if (note.n !== null) tone(note.n, note.d * beat * 0.95, t, 0.22)
    if (onNote) timers.push(window.setTimeout(() => onNote(i), t * 1000))
    t += note.d * beat
  })
  return {
    seconds: t,
    stop: () => {
      timers.forEach((x) => clearTimeout(x))
      if (ctx && master) {
        // quick fade to cut scheduled tones
        const g = master.gain
        g.cancelScheduledValues(ctx.currentTime)
        g.setValueAtTime(g.value, ctx.currentTime)
        g.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
        g.linearRampToValueAtTime(sfxLevel, ctx.currentTime + 0.3)
      }
    },
  }
}

/** Calm generative background music: pentatonic, slow, very quiet. */
export function setMusic(on: boolean) {
  musicOn = on
  if (!on) {
    if (musicTimer) clearInterval(musicTimer)
    musicTimer = null
    return
  }
  if (musicTimer) return
  const scale = [0, 2, 4, 7, 9, 12, 14]
  let step = 0
  musicTimer = window.setInterval(() => {
    if (!musicOn || !musicGain) return
    const c = ac()
    if (!c || document.hidden) return
    const s = scale[(step * 3 + Math.floor(step / 4)) % scale.length]
    tone(s - 12, 1.6, 0, 0.18, musicGain)
    if (step % 2 === 0) tone(s - 5, 1.2, 0.4, 0.1, musicGain)
    step++
  }, 1400)
}

export function unlockAudio() {
  ac()
}
