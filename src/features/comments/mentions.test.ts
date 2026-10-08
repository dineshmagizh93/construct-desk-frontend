import { describe, expect, it } from 'vitest'
import { extractMentions, insertMention, segmentBody, type Mentionable } from './mentions'

const people: Mentionable[] = [
  { id: 'p1', name: 'Priya Nair' },
  { id: 'p2', name: 'Raj' },
  { id: 'p3', name: 'Rajesh Kumar' },
  { id: 'p4', name: 'Raj K' },
]

describe('segmentBody', () => {
  it('returns one plain segment when nobody is tagged', () => {
    expect(segmentBody('Pour starts Monday', people)).toEqual([{ text: 'Pour starts Monday' }])
  })

  it('splits out a mention and keeps the text around it', () => {
    expect(segmentBody('Please check @Priya Nair before noon', people)).toEqual([
      { text: 'Please check ' },
      { text: '@Priya Nair', mention: people[0] },
      { text: ' before noon' },
    ])
  })

  it('ignores case and finds several mentions', () => {
    const segments = segmentBody('@priya nair and @RAJ please look', people)
    expect(segments.filter((s) => s.mention).map((s) => s.mention!.id)).toEqual(['p1', 'p2'])
  })

  it('does not read a short name inside a longer one', () => {
    const segments = segmentBody('ping @Rajesh Kumar', people)
    expect(segments.filter((s) => s.mention).map((s) => s.mention!.id)).toEqual(['p3'])
  })

  it('prefers the longer name when two both fit', () => {
    const segments = segmentBody('ping @Raj K now', people)
    expect(segments.filter((s) => s.mention).map((s) => s.mention!.id)).toEqual(['p4'])
  })

  it('does not tag an @ glued to the end of another word or followed by more letters', () => {
    expect(segmentBody('mail me at me@Rajiv', people).some((s) => s.mention)).toBe(false)
    expect(segmentBody('@Rajan is not Raj', people).some((s) => s.mention)).toBe(false)
  })

  it('handles a mention at the very start and end', () => {
    const segments = segmentBody('@Raj', people)
    expect(segments).toEqual([{ text: '@Raj', mention: people[1] }])
    expect(segmentBody('hi @Raj.', people).filter((s) => s.mention)).toHaveLength(1)
  })
})

describe('extractMentions', () => {
  it('lists each tagged teammate once, in order', () => {
    expect(extractMentions('@Raj then @Priya Nair then @Raj again', people).map((p) => p.id)).toEqual(['p2', 'p1'])
  })

  it('is empty without mentions', () => {
    expect(extractMentions('nothing here', people)).toEqual([])
    expect(extractMentions('@Nobody Known', people)).toEqual([])
  })
})

describe('insertMention', () => {
  it('adds the tag, with a space before it only when needed', () => {
    expect(insertMention('', 'Priya Nair')).toBe('@Priya Nair ')
    expect(insertMention('Please see', 'Raj')).toBe('Please see @Raj ')
    expect(insertMention('Please see ', 'Raj')).toBe('Please see @Raj ')
  })
})
