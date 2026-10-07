import { describe, expect, it } from 'vitest'
import { describeSchedule, scheduleStatus } from './schedule'

const project = (progress: number, over: Partial<Parameters<typeof scheduleStatus>[0]> = {}) => ({
  status: 'in_progress',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-11T00:00:00.000Z',
  progress,
  ...over,
})
const halfway = new Date('2026-01-06T00:00:00Z')
const after = new Date('2026-03-01T00:00:00Z')

// The same cases as backend/src/shared/schedule.test.ts, so the two copies can't drift apart.
describe('scheduleStatus (parity with the backend)', () => {
  it('on track / at risk / behind thresholds', () => {
    expect(scheduleStatus(project(50), halfway)).toEqual({ expectedPercent: 50, variance: 0, level: 'on_track' })
    expect(scheduleStatus(project(46), halfway)?.level).toBe('on_track')
    expect(scheduleStatus(project(45), halfway)).toMatchObject({ variance: -5, level: 'at_risk' })
    expect(scheduleStatus(project(35), halfway)).toMatchObject({ variance: -15, level: 'behind' })
  })

  it('expects completion after the end date', () => {
    expect(scheduleStatus(project(90), after)).toEqual({ expectedPercent: 100, variance: -10, level: 'at_risk' })
    expect(scheduleStatus(project(60), after)?.level).toBe('behind')
    expect(scheduleStatus(project(100), after)?.level).toBe('on_track')
  })

  it('cannot judge projects that are not running, lack dates, or have not started', () => {
    expect(scheduleStatus(project(10, { status: 'planning' }), halfway)).toBeNull()
    expect(scheduleStatus(project(10, { startDate: null }), halfway)).toBeNull()
    expect(scheduleStatus(project(10, { endDate: undefined }), halfway)).toBeNull()
    expect(scheduleStatus(project(10, { endDate: '2025-12-01T00:00:00.000Z' }), halfway)).toBeNull()
    expect(scheduleStatus(project(0), new Date('2025-12-20T00:00:00Z'))).toBeNull()
    expect(scheduleStatus(project(10, { startDate: 'junk' }), halfway)).toBeNull()
  })
})

describe('describeSchedule', () => {
  it('words ahead, on and behind plan', () => {
    expect(describeSchedule({ expectedPercent: 50, variance: 0, level: 'on_track' })).toBe('On plan (expected 50%)')
    expect(describeSchedule({ expectedPercent: 50, variance: 10, level: 'on_track' })).toBe('10 points ahead of plan (expected 50%)')
    expect(describeSchedule({ expectedPercent: 50, variance: -15, level: 'behind' })).toBe('15 points behind plan (expected 50%)')
    expect(describeSchedule({ expectedPercent: 50, variance: -1, level: 'on_track' })).toBe('1 point behind plan (expected 50%)')
  })
})
