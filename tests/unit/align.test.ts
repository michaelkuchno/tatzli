import { describe, expect, it } from 'vitest'
import { parseAligned, parseSentence, plain, validateAlignment, matchingSegments } from '@/lib/align'

const SRC = { be: '[I]1 [gange]2 [id Chindsgi]3.', de: '[Ich]1 [gehe]2 [in den Kindergarten]3.', pl: '[Idę]1+2 [do przedszkola]3.', en: '[I]1 [go]2 [to kindergarten]3.' }

describe('phrase alignment', () => {
  it('parses segments with groups and keeps unaligned text', () => {
    const s = parseAligned(SRC.be)
    expect(s.map((x) => x.text)).toEqual(['I', ' ', 'gange', ' ', 'id Chindsgi', '.'])
    expect(s[4].groups).toEqual([3])
  })
  it('supports one segment covering several groups (word order differs)', () => {
    expect(parseAligned(SRC.pl)[0]).toEqual({ text: 'Idę', groups: [1, 2] })
  })
  it('finds equivalents across languages', () => {
    const s = parseSentence(SRC)
    expect(matchingSegments(s, 'pl', [2]).map((i) => s.pl[i].text)).toEqual(['Idę'])
    expect(matchingSegments(s, 'de', [1, 2]).map((i) => s.de[i].text)).toEqual(['Ich', 'gehe'])
  })
  it('produces plain text', () => {
    expect(plain(SRC.de)).toBe('Ich gehe in den Kindergarten.')
  })
  it('validates group consistency', () => {
    expect(validateAlignment(SRC)).toEqual([])
    expect(validateAlignment({ ...SRC, en: '[I]1 [go]2 to kindergarten.' })).toContain('en: missing group 3')
    expect(validateAlignment({ ...SRC, de: '[Ich 1 gehe' })).not.toEqual([])
  })
})
