import { describe, expect, it } from 'vitest'
import { nextProjectCode, projectCodePrefix } from './utils'

// The same cases run on the server (backend shared/leadConversion.test.ts): the form suggests a code and the
// server allocates one on conversion, and the two must always agree.
const codes = (...list: string[]) => list.map((code) => ({ code }))

describe('projectCodePrefix', () => {
  it('uses the initials of a multi-word name', () => {
    expect(projectCodePrefix('Magizh Construction')).toBe('MC')
    expect(projectCodePrefix('Sri Ranga Builders Pvt Ltd')).toBe('SRB')
    expect(projectCodePrefix('Tamil Nadu Housing Board Contractors')).toBe('TNH')
  })

  it('ignores legal-form words and punctuation', () => {
    expect(projectCodePrefix('Magizh Construction Pvt. Ltd.')).toBe('MC')
    expect(projectCodePrefix('Ram & Sons Co')).toBe('RS')
    expect(projectCodePrefix('  the  big-build   company ')).toBe('BB')
  })

  it('takes the first three letters of a one-word name', () => {
    expect(projectCodePrefix('Prestige')).toBe('PRE')
    expect(projectCodePrefix('Ab')).toBe('AB')
  })

  it('falls back to PRJ when there is nothing usable', () => {
    expect(projectCodePrefix('')).toBe('PRJ')
    expect(projectCodePrefix(null)).toBe('PRJ')
    expect(projectCodePrefix(undefined)).toBe('PRJ')
    expect(projectCodePrefix('Pvt Ltd')).toBe('PRJ')
    expect(projectCodePrefix('மகிழ்')).toBe('PRJ')
    expect(projectCodePrefix('123 456')).toBe('PRJ')
  })
})

describe('nextProjectCode', () => {
  it('starts at 001 for a company with no projects', () => {
    expect(nextProjectCode([])).toBe('PRJ-001')
    expect(nextProjectCode([], 'MC')).toBe('MC-001')
  })

  it('continues the company sequence after the highest number, not the count', () => {
    expect(nextProjectCode(codes('MC-001', 'MC-007', 'MC-003'), 'MC')).toBe('MC-008')
    expect(nextProjectCode(codes('MC-010'), 'MC')).toBe('MC-011')
  })

  it('ignores other prefixes and other formats, and handles case and whitespace', () => {
    expect(nextProjectCode(codes('CUSTOM-9', ' mc-0012 ', 'MC-', 'ABC', 'PRJ-0099'), 'MC')).toBe('MC-0013')
  })

  it('keeps the width the company already uses', () => {
    expect(nextProjectCode(codes('MC-0009'), 'MC')).toBe('MC-0010')
    expect(nextProjectCode(codes('MC-009'), 'MC')).toBe('MC-010')
  })

  it('grows past the width without breaking', () => {
    expect(nextProjectCode(codes('MC-999'), 'MC')).toBe('MC-1000')
  })

  it('does not mistake a longer prefix for this one', () => {
    expect(nextProjectCode(codes('MCX-050'), 'MC')).toBe('MC-001')
  })
})
