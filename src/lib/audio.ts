import type { Lang } from '@content/types'
import { db } from './db'
import { audioText } from './content'

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
let current: HTMLAudioElement | null = null
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
    manifestPromise = fetch(`${base()}audio/manifest.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .catch(() => null)
      .then((m) => {
        manifest = m
        return m
      })
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

function playUrl(url: string, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (token !== playToken) return resolve(false)
    const a = new Audio(url)
    a.volume = volume
    current = a
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }
    a.onended = () => done(true)
    a.onerror = () => done(false)
    a.play().catch(() => done(false))
    // safety timeout (very long clips are not expected)
    setTimeout(() => done(true), 20000)
  })
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
    u.rate = 0.85
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
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Play one item in one language. `text` overrides content lookup (AI items, segments). */
export async function play(audioId: string, lang: Lang, text?: string): Promise<AudioSource> {
  stopAll()
  const token = playToken
  return playInner(audioId, lang, token, text)
}

async function playInner(audioId: string, lang: Lang, token: number, text?: string): Promise<AudioSource> {
  const caption = text ?? audioText(audioId)?.[lang] ?? ''
  const own = await blobFor(audioId, lang)
  if (own) {
    emit({ text: caption, lang, source: own.source })
    const url = URL.createObjectURL(own.blob)
    const ok = await playUrl(url, token)
    URL.revokeObjectURL(url)
    if (ok) return own.source
  }
  await loadManifest()
  const url = bundledUrl(audioId, lang)
  if (url) {
    emit({ text: caption, lang, source: 'bundled' })
    if (await playUrl(url, token)) return 'bundled'
  }
  if (strict) {
    // no verified recording yet: show the text silently instead of guessing a pronunciation
    if (token === playToken) emit({ text: caption || '…', lang, source: 'muted' })
    await new Promise((r) => setTimeout(r, Math.min(2500, 700 + caption.length * 40)))
    return 'muted'
  }
  if (caption) {
    emit({ text: caption, lang, source: 'device' })
    if (await speakDevice(caption, lang, token)) return 'device'
  }
  if (token === playToken) emit({ text: caption || '…', lang, source: 'none', failed: true })
  return 'none'
}

/** Play in the profile's sound language, optionally repeated in the second language. */
export async function playSequence(audioId: string, langs: Lang[], text?: Partial<Record<Lang, string>>): Promise<void> {
  stopAll()
  const token = playToken
  for (const l of langs) {
    if (token !== playToken) return
    await playInner(audioId, l, token, text?.[l])
    await new Promise((r) => setTimeout(r, 250))
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
