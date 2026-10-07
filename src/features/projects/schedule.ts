export type ScheduleLevel = 'on_track' | 'at_risk' | 'behind'

export interface ScheduleStatus {
  expectedPercent: number
  /** Actual progress minus expected: negative = behind plan. */
  variance: number
  level: ScheduleLevel
}

/** Mirrors backend/src/shared/schedule.ts — keep the thresholds and rules identical. */
const AT_RISK_POINTS = 5
const BEHIND_POINTS = 15

export function scheduleStatus(
  project: { status: string; startDate?: string | null; endDate?: string | null; progress: number },
  now: Date,
): ScheduleStatus | null {
  if (project.status !== 'in_progress' || !project.startDate || !project.endDate) return null
  const start = new Date(project.startDate).getTime()
  const end = new Date(project.endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start || now.getTime() < start) return null

  const expectedPercent = Math.round(Math.min(1, (now.getTime() - start) / (end - start)) * 100)
  const variance = project.progress - expectedPercent
  const level: ScheduleLevel = variance <= -BEHIND_POINTS ? 'behind' : variance <= -AT_RISK_POINTS ? 'at_risk' : 'on_track'
  return { expectedPercent, variance, level }
}

/** One short line for the progress card, e.g. "15 points behind plan (expected 50%)". */
export function describeSchedule(s: ScheduleStatus): string {
  if (s.variance >= 0) return s.variance === 0 ? `On plan (expected ${s.expectedPercent}%)` : `${s.variance} points ahead of plan (expected ${s.expectedPercent}%)`
  return `${-s.variance} point${s.variance === -1 ? '' : 's'} behind plan (expected ${s.expectedPercent}%)`
}
