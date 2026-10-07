import { describe, expect, it } from 'vitest'
import { describeDuplicates, type DuplicateMatch } from './describe'

const m = (name: string, matchedOn: DuplicateMatch['matchedOn'] = 'phone'): DuplicateMatch => ({ id: name, name, matchedOn })

describe('describeDuplicates', () => {
  it('names a single match', () => {
    expect(describeDuplicates([m('Meera Rao')], 'lead')).toBe('A lead that looks like this one is already on file: Meera Rao (same phone). Create it anyway?')
  })

  it('counts several matches and says what matched', () => {
    expect(describeDuplicates([m('A', 'email'), m('B', 'phone and email')], 'client')).toBe(
      '2 clients that look like this one are already on file: A (same email), B (same phone and email). Create it anyway?',
    )
  })

  it('lists at most three names and counts the rest', () => {
    const text = describeDuplicates([m('A'), m('B'), m('C'), m('D'), m('E')], 'lead')
    expect(text).toContain('A (same phone), B (same phone), C (same phone) and 2 more')
    expect(text).not.toContain('D (')
  })
})
