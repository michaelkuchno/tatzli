// Content model for Tatzli. All learner-facing content lives in /content as typed data.
// Every item exists in all four languages. Sentences carry phrase-level alignment.

export const LANGS = ['be', 'de', 'pl', 'en'] as const
export type Lang = (typeof LANGS)[number]
export type L4 = Record<Lang, string>

/** 1 = Chlyni Bärli (2–3), 2 = Chindsgi (4–5), 3 = Schueu (6–7) */
export type Level = 1 | 2 | 3
export const LEVELS: Level[] = [1, 2, 3]

export type BeConfidence = 'high' | 'medium' | 'low'

export type WordCategory =
  | 'animals'
  | 'family'
  | 'body'
  | 'food'
  | 'toys'
  | 'home'
  | 'clothes'
  | 'colors'
  | 'numbers'
  | 'nature'
  | 'transport'
  | 'verbs'
  | 'opposites'
  | 'emotions'
  | 'school'
  | 'holidays'
  | 'time'
  | 'shapes'

export interface Word {
  id: string
  cat: WordCategory
  /** Display form incl. article for BE/DE nouns ("dr Bär" / "der Bär"). */
  text: L4
  /** Lowest level at which the word is introduced. */
  level: Level
  /** Illustration key in the SVG registry (defaults to id). */
  illu: string
  /** Optional onomatopoeia shown/played on main action (animals). */
  sound?: L4
  /** For the toddler keyboard: initial letter key (A–Z) in DE spelling. */
  key?: string
}

/**
 * Aligned sentence. Source notation per language:
 *   "[I]1 [gange]2 [id Chindsgi]3."  -> segments with alignment groups
 *   "[Idę]1+2 [do przedszkola]3."     -> one segment may cover several groups
 * Text outside brackets is unaligned (punctuation, small function words).
 */
export type AlignedSource = L4

export interface Segment {
  text: string
  groups: number[]
}
export type AlignedSentence = Record<Lang, Segment[]>

export interface Phrase {
  id: string
  src: AlignedSource
  level: Level
  /** Word ids that appear in the phrase (for spaced repetition exposure). */
  words?: string[]
  /** Illustration scene key (scene composer) */
  illu?: string
  /** For TPR commands: Tatzli pose to animate */
  pose?: Pose
  tags?: PhraseTag[]
}
export type PhraseTag = 'tpr' | 'greeting' | 'chindsgi' | 'shop' | 'bus' | 'playground' | 'home' | 'question' | 'feelings' | 'season' | 'praise'

export type Pose =
  | 'idle'
  | 'jump'
  | 'clap'
  | 'nose'
  | 'wave'
  | 'turn'
  | 'sit'
  | 'stand'
  | 'sleep'
  | 'dance'
  | 'stomp'
  | 'armsUp'
  | 'big'
  | 'small'
  | 'fly'
  | 'swim'
  | 'eat'
  | 'drink'
  | 'run'
  | 'walk'
  | 'sing'
  | 'laugh'
  | 'cry'
  | 'look'
  | 'listen'
  | 'hug'
  | 'climb'
  | 'paint'
  | 'wash'
  | 'count'
  | 'read'
  | 'build'
  | 'cook'
  | 'ride'
  | 'give'
  | 'take'
  | 'point'
  | 'write'
  | 'tidy'

/** A scene to draw: background place + characters + props, all from the SVG registry. */
export interface SceneSpec {
  place: PlaceId
  /** characters / props by illustration key with optional position (0..100 % of width/height) */
  items: { key: string; x: number; y: number; scale?: number; pose?: Pose; flip?: boolean }[]
  season?: Season
  time?: 'day' | 'evening' | 'night'
}

export interface StoryChoice {
  prompt: AlignedSource
  options: { label: AlignedSource; illu: string; next: number }[]
}

export interface StoryPage {
  scene: SceneSpec
  text: AlignedSource
  choice?: StoryChoice
  /** Question for 6–7 (answer = index into options) */
  question?: { prompt: AlignedSource; options: { illu: string; label: L4 }[]; answer: number }
  end?: boolean
}

export interface Story {
  id: string
  title: L4
  level: Level
  place: PlaceId
  words: string[]
  pages: StoryPage[]
}

export interface SongLine {
  src: AlignedSource
  /** beats this line takes (melody notes are spread across these beats) */
  beats: number
}

export interface Song {
  id: string
  title: L4
  level: Level
  /** Original melody: notes as semitone offsets from C4 with duration in beats; null = rest */
  melody: { n: number | null; d: number }[]
  bpm: number
  lines: SongLine[]
  /** Illustration key shown while singing */
  illu: string
  /** provenance – all songs are original works of this project */
  origin: 'original' | 'public-domain'
  source?: string
}

export type PlaceId =
  | 'home'
  | 'kitchen'
  | 'room'
  | 'garden'
  | 'quarry'
  | 'bus'
  | 'zytglogge'
  | 'baerepark'
  | 'aare'
  | 'gurten'
  | 'zoo'
  | 'market'
  | 'chindsgi'
  | 'school'
  | 'playground'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type ActivityKind =
  | 'discover'
  | 'whereIs'
  | 'tpr'
  | 'memory'
  | 'sort'
  | 'count'
  | 'story'
  | 'song'
  | 'speak'

export interface SortSpec {
  /** two or three bins, each with a label word id and the word ids that belong there */
  bins: { label: L4; illu: string; words: string[] }[]
}

export interface CountSpec {
  word: string
  /** target numbers to drag (picked randomly / adaptively) */
  targets: number[]
  container: string
}

export interface Topic {
  id: string
  level: Level
  place: PlaceId
  title: L4
  /** Illustration key used as topic icon */
  icon: string
  words: string[]
  phrases: string[]
  story?: string
  song?: string
  games: ActivityKind[]
  sort?: SortSpec
  count?: CountSpec
  /** Joint media engagement prompts for the parent (UI languages) */
  parentTips: { pl: string; de: string; en: string }[]
  /** Off-screen transfer task; BE phrase to use is given as phrase id */
  offscreen: { pl: string; de: string; en: string; phrase?: string }
  sticker: string
  /** optional season / holiday window */
  seasonal?: SeasonalWindow
}

export interface SeasonalWindow {
  /** inclusive month-day ranges, e.g. { from: '11-20', to: '11-30' } */
  from: string
  to: string
  holiday?: string
}

export interface BeReviewEntry {
  id: string
  be: string
  confidence: BeConfidence
  sources: string[]
  note?: string
  /** if the form was changed during review */
  changedFrom?: string
}
