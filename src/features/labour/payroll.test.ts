import { describe, expect, it } from 'vitest'
import { buildPayroll, monthRange } from './payroll'
import type { LabourRecord } from './types'

const worker = (id: string, name: string, contractor: string, attendance: [string, boolean, number][]): LabourRecord => ({
  id,
  projectId: 'p1',
  name,
  role: 'Mason',
  contractor,
  dailyWage: 900,
  phone: '',
  status: 'active',
  joinedDate: '',
  attendance: attendance.map(([date, present, wageAmount], i) => ({ id: `${id}-${i}`, date: `${date}T00:00:00.000Z`, present, wageAmount })),
})

const workers = [
  worker('w1', 'Ramu', 'Balaji', [['2026-10-01', true, 900], ['2026-10-02', true, 450], ['2026-10-03', false, 0], ['2026-09-30', true, 900]]),
  worker('w2', 'Shyam', 'Balaji', [['2026-10-05', true, 1100]]),
  worker('w3', 'Gopal', '', [['2026-10-04', true, 1000]]),
  worker('w4', 'Idle', 'Balaji', [['2026-08-01', true, 700]]),
]

describe('buildPayroll', () => {
  const payroll = buildPayroll(workers, '2026-10-01', '2026-10-31')

  it('totals present days and wages per worker within the period only', () => {
    const ramu = payroll.rows.find((r) => r.name === 'Ramu')!
    expect(ramu).toMatchObject({ daysPresent: 2, daysAbsent: 1, wages: 1350 })
  })

  it('leaves out workers with no attendance in the period', () => {
    expect(payroll.rows.map((r) => r.name).sort()).toEqual(['Gopal', 'Ramu', 'Shyam'])
    expect(payroll.rows.some((r) => r.name === 'Idle')).toBe(false)
  })

  it('groups by contractor, putting contractor-less workers under In-house', () => {
    expect(payroll.byContractor).toEqual([
      { contractor: 'Balaji', workers: 2, daysPresent: 3, wages: 2450 },
      { contractor: 'In-house', workers: 1, daysPresent: 1, wages: 1000 },
    ])
    expect(payroll.totalWages).toBe(3450)
    expect(payroll.totalDaysPresent).toBe(4)
  })

  it('includes both boundary days', () => {
    expect(buildPayroll(workers, '2026-10-01', '2026-10-01').totalWages).toBe(900)
    expect(buildPayroll(workers, '2026-10-05', '2026-10-05').totalWages).toBe(1100)
  })

  it('does not count wages on absent days', () => {
    const w = worker('x', 'X', 'C', [['2026-10-01', false, 500]])
    expect(buildPayroll([w], '2026-10-01', '2026-10-31').totalWages).toBe(0)
  })
})

describe('monthRange', () => {
  it('spans the first to last day of the month', () => {
    expect(monthRange(new Date(2026, 9, 17))).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(monthRange(new Date(2028, 1, 3))).toEqual({ from: '2028-02-01', to: '2028-02-29' })
  })
})
