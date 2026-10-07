import { describe, expect, it } from 'vitest'
import { dueLabel } from './dueLabel'

// 2026-10-07, 10:00 in India
const now = new Date('2026-10-07T04:30:00Z')
const due = (iso: string) => `${iso}T00:00:00.000Z`

describe('dueLabel', () => {
  it('counts days overdue', () => {
    expect(dueLabel(due('2026-10-06'), false, now)).toEqual({ text: 'Overdue 1 day', tone: 'overdue' })
    expect(dueLabel(due('2026-10-02'), false, now)).toEqual({ text: 'Overdue 5 days', tone: 'overdue' })
  })

  it('says today and tomorrow', () => {
    expect(dueLabel(due('2026-10-07'), false, now)).toEqual({ text: 'Due today', tone: 'soon' })
    expect(dueLabel(due('2026-10-08'), false, now)).toEqual({ text: 'Due tomorrow', tone: 'soon' })
  })

  it('shows the date for anything further out', () => {
    expect(dueLabel(due('2026-10-20'), false, now)).toEqual({ text: 'Due 20 Oct', tone: 'normal' })
  })

  it('never calls a finished task overdue', () => {
    expect(dueLabel(due('2026-08-01'), true, now)).toEqual({ text: 'Due 01 Aug', tone: 'normal' })
  })

  it('uses the Indian calendar day', () => {
    // 20:00 UTC on the 7th is already the 8th in India, so a task due the 7th is overdue
    expect(dueLabel(due('2026-10-07'), false, new Date('2026-10-07T20:00:00Z'))).toEqual({ text: 'Overdue 1 day', tone: 'overdue' })
  })

  it('has no label without a usable date', () => {
    expect(dueLabel(null, false, now)).toBeNull()
    expect(dueLabel('', false, now)).toBeNull()
    expect(dueLabel('not a date', false, now)).toBeNull()
  })
})
