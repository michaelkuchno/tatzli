import type { Lang } from '@content/types'
import { db } from './db'
import { audioText } from './content'
import { timeLapse } from './testSpeed'

/**
 * Pronunciation playback with layered sources (first available wins):
 *   1. family recording (IndexedDB, parent studio)  2. AI-generated audio for approved AI content (IndexedDB)
 *   3. build-time generated file shipped with the app (public/audio, manifest)  4. device speech synthesis
 * Every playback also emits a caption (subtitles for sounds). If nothing can play, a visible notice is emitted.
 */

export type AudioSource = 'family' | 'ai' | 'bundled' | 'device' | 'none' | 'muted'
export interface CaptionEvent {
  text: string
  lang: Lang
  source: AudioSource
  failed?: boolean
}

type Manifest = { version: number; items: Record<string, Partial<Record<Lang, string>>>; sources?: Partial<Record<Lang, string>> }

let manifest: Manifest | null = null
let manifestPromise: Promise<Manifest | null> | null = null
let volume = 0.9
/** Strict mode (default): only verified recordings are played – never the device synthesiser. */
let strict = true
export function setStrictAudio(v: boolean) {
  strict = v
}
/** speaking speed (0.6–1.0); pitch is preserved */
let rate = 1
export function setSpeechRate(r: number) {
  rate = Math.max(0.5, Math.min(1, r || 1))
  if (current) applySpeechRate(current)
}
/** Every spoken audio element (recordings, family/AI clips, previews, the child's own voice) uses the chosen speed, pitch kept. */
export function applySpeechRate(a: HTMLMediaElement) {
  a.playbackRate = Math.min(16, rate * timeLapse())
  a.defaultPlaybackRate = a.playbackRate
  const pp = a as HTMLMediaElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean; mozPreservesPitch?: boolean }
  pp.preservesPitch = true
  pp.webkitPreservesPitch = true
  pp.mozPreservesPitch = true
}
export function getSpeechRate() {
  return rate
}
/** Pauses (ms at normal speed; they get longer when the speech is slower) – two clips are never glued together. */
export const PAUSE = { between: 500, langs: 800, items: 600 }
const scaled = (ms: number) => Math.round(ms / rate / timeLapse())
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
/** when the last clip played to its end (0 = interrupted / nothing yet) */
let lastEnd = 0
let current: HTMLAudioElement | null = null
/** settles the promise of the clip that is playing now (so an interrupted clip never leaves its caller waiting) */
let settleCurrent: ((ok: boolean) => void) | null = null
let playToken = 0
const listeners = new Set<(e: CaptionEvent | null) => void>()

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (current) current.volume = volume
}
export function getVolume() {
  return volume
}

export function onCaption(fn: (e: CaptionEvent | null) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
function emit(e: CaptionEvent | null) {
  for (const l of listeners) l(e)
  // also as a DOM event (used by automated audio audits)
  if (e && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tatzli-caption', { detail: e }))
}

const base = () => (import.meta.env?.BASE_URL ?? '/')

export async function loadManifest(): Promise<Manifest | null> {
  if (manifest) return manifest
  if (!manifestPromise) {
    // a failed load (flaky mobile network, app just woken up) is retried and never remembered as "no recordings"
    manifestPromise = (async () => {
      for (let i = 0; i < 4 && !manifest; i++) {
        if (i) await sleep(800 * i)
        try {
          const r = await fetch(`${base()}audio/manifest.json`, { cache: i ? 'default' : 'no-cache' })
          if (r.ok) manifest = (await r.json()) as Manifest
        } catch {
          /* retried */
        }
      }
      if (!manifest) manifestPromise = null
      return manifest
    })()
  }
  return manifestPromise
}

/** True when a verified recording exists for every requested language (bundled, family or AI). */
export function hasRecording(audioId: string, langs: Lang[]): boolean {
  return langs.every((l) => !!manifest?.items[audioId]?.[l])
}

export function bundledUrl(audioId: string, lang: Lang): string | null {
  const f = manifest?.items[audioId]?.[lang]
  return f ? `${base()}audio/${f}` : null
}

async function blobFor(audioId: string, lang: Lang): Promise<{ blob: Blob; source: AudioSource } | null> {
  try {
    const rec = await db.recordings.get(`${audioId}:${lang}`)
    if (rec) return { blob: rec.blob, source: 'family' }
    const ai = await db.aiAudio.get(`${audioId}:${lang}`)
    if (ai) return { blob: ai.blob, source: 'ai' }
  } catch {
    /* IndexedDB unavailable – fall through */
  }
  return null
}

/**
 * ONE shared audio element for every recording. iOS/Safari only lets an element play without a fresh tap once that
 * element has been started inside a tap – a new Audio() per clip would be blocked for every clip that follows a pause,
 * a timer or another clip (chains, cinema, stories). The element is unlocked on the first touch (unlockAudio).
 */
let voiceEl: HTMLAudioElement | null = null
let unlocked = false
let playSeq = 0
function voice(): HTMLAudioElement {
  if (!voiceEl) {
    voiceEl = new Audio()
    voiceEl.preload = 'auto'
    voiceEl.setAttribute('playsinline', '')
    applySpeechRate(voiceEl)
  }
  return voiceEl
}
/** 0.1 s of silence (16-bit mono WAV) used to unlock the element inside the first tap */
function silentUrl(): string {
  const n = 2400
  const b = new Uint8Array(44 + n * 2)
  const v = new DataView(b.buffer)
  const w = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, 24000, true); v.setUint32(28, 48000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true)
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))
}
/** Call inside a user gesture (installed globally): unlocks the shared element for later, programmatic playback. */
export function unlockAudio() {
  if (unlocked || typeof window === 'undefined') return
  const a = voice()
  if (current) return // something is playing from this tap anyway → it unlocks the element
  try {
    a.muted = true
    a.src = silentUrl()
    const p = a.play()
    const ok = () => {
      unlocked = true
      if (!current) a.pause()
      a.muted = false
    }
    if (p) p.then(ok).catch(() => (a.muted = false))
    else ok()
  } catch {
    a.muted = false
  }
}
export function installAudioUnlock() {
  if (typeof window === 'undefined') return
  const h = () => {
    unlockAudio()
    if (unlocked) for (const e of ['touchend', 'click', 'keydown']) window.removeEventListener(e, h, true)
  }
  for (const e of ['touchend', 'click', 'keydown']) window.addEventListener(e, h, true)
}

function playUrl(url: string, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (token !== playToken) return resolve(false)
    const a = voice()
    const id = ++playSeq
    a.pause()
    a.muted = false
    a.volume = volume
    a.src = url
    applySpeechRate(a) // a new source resets the rate on some browsers
    current = a
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      if (settleCurrent === done) settleCurrent = null
      resolve(ok)
    }
    settleCurrent = done
    a.onended = () => {
      if (id !== playSeq) return
      lastEnd = Date.now()
      done(true)
    }
    a.onerror = () => id === playSeq && done(false)
    a.onloadedmetadata = () => id === playSeq && applySpeechRate(a)
    const p = a.play()
    if (p)
      p.then(() => {
        unlocked = true
      }).catch(() => id === playSeq && done(false))
    // safety timeout (very long clips are not expected)
    setTimeout(() => done(true), scaled(20000))
  })
}

/** Play a clip that is not part of the content (the child's own voice, a studio take, a translator voice) on the shared, unlocked element. */
export function playClip(url: string): Promise<boolean> {
  stopAll()
  return playUrl(url, playToken)
}

const SPEECH_LANG: Record<Lang, string[]> = {
  be: ['de-CH', 'gsw', 'de-DE', 'de'],
  de: ['de-DE', 'de-AT', 'de-CH', 'de'],
  pl: ['pl-PL', 'pl'],
  en: ['en-GB', 'en-US', 'en'],
}

export function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  for (const tag of SPEECH_LANG[lang]) {
    const exact = voices.filter((v) => v.lang.toLowerCase() === tag.toLowerCase())
    const pref = exact.find((v) => /natural|neural|premium|enhanced|google/i.test(v.name)) ?? exact[0]
    if (pref) return pref
    const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(tag.toLowerCase()))
    if (prefix) return prefix
  }
  return null
}

function speakDevice(text: string, lang: Lang, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return resolve(false)
    if (token !== playToken) return resolve(false)
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice(lang)
    if (v) u.voice = v
    u.lang = v?.lang ?? SPEECH_LANG[lang][0]
    u.rate = 0.85 * rate // device voice follows the chosen speed too
    u.pitch = 1.1
    u.volume = volume
    let settled = false
    const done = (ok: boolean) => {
      if (!settled) {
        settled = true
        resolve(ok)
      }
    }
    u.onend = () => done(true)
    u.onerror = () => done(false)
    try {
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    } catch {
      done(false)
    }
    setTimeout(() => done(true), Math.max(3000, text.length * 150))
  })
}

export function stopAll() {
  playToken++
  if (current) {
    current.pause()
    current = null
  }
  // interrupted → resolve right away (false = not played to the end); callers check the token and stop
  if (settleCurrent) {
    const s = settleCurrent
    settleCurrent = null
    s(false)
  }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Play one item in one language. `text` overrides content lookup (AI items, segments). */
export async function play(audioId: string, lang: Lang, text?: string): Promise<AudioSource> {
  stopAll()
  lastEnd = 0 // a direct tap plays at once
  const token = playToken
  return playInner(audioId, lang, token, text)
}

async function playInner(audioId: string, lang: Lang, token: number, text?: string): Promise<AudioSource> {
  const caption = text ?? audioText(audioId)?.[lang] ?? ''
  // a clip that follows another one directly always gets a breathing pause first
  const since = Date.now() - lastEnd
  if (lastEnd && since < scaled(PAUSE.between)) await sleep(scaled(PAUSE.between) - since)
  if (token !== playToken) return 'none'
  const own = await blobFor(audioId, lang)
  if (own) {
    emit({ text: caption, lang, source: own.source })
    const url = URL.createObjectURL(own.blob)
    const ok = await playUrl(url, token)
    URL.revokeObjectURL(url)
    if (ok) return own.source
    if (token !== playToken) return 'none'
  }
  await loadManifest()
  const url = bundledUrl(audioId, lang)
  if (url) {
    emit({ text: caption, lang, source: 'bundled' })
    if (await playUrl(url, token)) return 'bundled'
    if (token !== playToken) return 'none'
  }
  if (strict) {
    // no verified recording yet: show the text silently instead of guessing a pronunciation
    if (token === playToken) emit({ text: caption || '…', lang, source: 'muted' })
    await sleep(scaled(Math.min(2500, 700 + caption.length * 40)))
    if (token === playToken) lastEnd = Date.now()
    return 'muted'
  }
  if (caption) {
    emit({ text: caption, lang, source: 'device' })
    if (await speakDevice(caption, lang, token)) return 'device'
  }
  if (token === playToken) emit({ text: caption || '…', lang, source: 'none', failed: true })
  return 'none'
}

/** Play one item in every sound language, one after another (with a clear pause between the languages). */
export async function playSequence(audioId: string, langs: Lang[], text?: Partial<Record<Lang, string>>): Promise<void> {
  return playGroups([audioId], langs, text ? { [audioId]: text } : undefined)
}

/**
 * Play several items per language: ["ui.where", "w.aff"] in BE+DE → «Wo isch …? · dr Aff» … «Wo ist …? · der Affe».
 * Pause between the items of one language (PAUSE.items) and a longer one before the next language (PAUSE.langs).
 */
export async function playGroups(ids: string[], langs: Lang[], text?: Record<string, Partial<Record<Lang, string>> | undefined>): Promise<void> {
  stopAll()
  const token = playToken
  for (let li = 0; li < langs.length; li++) {
    for (let k = 0; k < ids.length; k++) {
      if (token !== playToken) return
      if (k > 0) await sleep(scaled(PAUSE.items))
      if (token !== playToken) return
      await playInner(ids[k], langs[li], token, text?.[ids[k]]?.[langs[li]])
    }
    if (li < langs.length - 1) {
      await sleep(scaled(PAUSE.langs))
      if (token !== playToken) return
    }
  }
}

/** Fetch every bundled audio file once so the PWA works fully offline (service worker caches them). */
export async function prefetchAll(ids: string[], onProgress?: (done: number, total: number) => void): Promise<number> {
  const m = await loadManifest()
  if (!m) return 0
  const urls: string[] = []
  for (const id of ids) for (const f of Object.values(m.items[id] ?? {})) if (f) urls.push(`${base()}audio/${f}`)
  let done = 0
  const workers = Array.from({ length: 6 }, async () => {
    while (urls.length) {
      const u = urls.pop()!
      try {
        await fetch(u)
      } catch {
        /* offline – ignore */
      }
      done++
      if (done % 20 === 0) onProgress?.(done, done + urls.length)
    }
  })
  await Promise.all(workers)
  onProgress?.(done, done)
  return done
}
