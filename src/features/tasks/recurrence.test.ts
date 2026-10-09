import { describe, expect, it } from 'vitest'
import { RECURRENCE_OPTIONS, recurrenceLabel } from './recurrence'

describe('recurrenceLabel', () => {
  it('words each repeat', () => {
    expect(recurrenceLabel('daily')).toBe('Repeats daily')
    expect(recurrenceLabel('weekly')).toBe('Repeats weekly')
    expect(recurrenceLabel('monthly')).toBe('Repeats monthly')
  })

  it('has nothing for one-off tasks or unknown values', () => {
    expect(recurrenceLabel(null)).toBeNull()
    expect(recurrenceLabel(undefined)).toBeNull()
    expect(recurrenceLabel('')).toBeNull()
    expect(recurrenceLabel('none')).toBeNull()
    expect(recurrenceLabel('yearly')).toBeNull()
    expect(recurrenceLabel('toString')).toBeNull()
  })
})

describe('RECURRENCE_OPTIONS', () => {
  it('has a non-empty value for every choice, since a select cannot hold an empty one', () => {
    expect(RECURRENCE_OPTIONS.every((o) => o.value.length > 0)).toBe(true)
    expect(RECURRENCE_OPTIONS.map((o) => o.value)).toEqual(['none', 'daily', 'weekly', 'monthly'])
  })
})
