import type { AlignedSentence, AlignedSource, Lang, Segment } from '@content/types'
import { LANGS } from '@content/types'

const TOKEN = /\[([^\]]+)\](\d+(?:\+\d+)*)/g

/** Parse one language string of the bracket notation into segments (unaligned text kept as group-less segments). */
export function parseAligned(src: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of src.matchAll(TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) out.push({ text: src.slice(last, idx), groups: [] })
    out.push({ text: m[1], groups: m[2].split('+').map(Number) })
    last = idx + m[0].length
  }
  if (last < src.length) out.push({ text: src.slice(last), groups: [] })
  return out
}

export function parseSentence(src: AlignedSource): AlignedSentence {
  return Object.fromEntries(LANGS.map((l) => [l, parseAligned(src[l])])) as AlignedSentence
}

/** Plain text for speech / display. */
export function plain(src: string): string {
  return src.replace(TOKEN, '$1').replace(/\s+/g, ' ').trim()
}
export function plainAll(src: AlignedSource): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, plain(src[l])])) as Record<Lang, string>
}

export function groupSet(segs: Segment[]): Set<number> {
  const s = new Set<number>()
  for (const seg of segs) for (const g of seg.groups) s.add(g)
  return s
}

/** Validate that every group used in any language is present in every language. Returns problems. */
export function validateAlignment(src: AlignedSource): string[] {
  const problems: string[] = []
  const sets = LANGS.map((l) => [l, groupSet(parseAligned(src[l]))] as const)
  const all = new Set<number>()
  for (const [, s] of sets) for (const g of s) all.add(g)
  if (all.size === 0) problems.push('no aligned segments')
  for (const [l, s] of sets) {
    for (const g of all) if (!s.has(g)) problems.push(`${l}: missing group ${g}`)
    const unbalanced = src[l].replace(TOKEN, '').match(/[[\]]/)
    if (unbalanced) problems.push(`${l}: unbalanced bracket`)
  }
  return problems
}

/** Segments in `lang` that share a group with the given groups. */
export function matchingSegments(sentence: AlignedSentence, lang: Lang, groups: number[]): number[] {
  const idx: number[] = []
  sentence[lang].forEach((seg, i) => {
    if (seg.groups.some((g) => groups.includes(g))) idx.push(i)
  })
  return idx
}
