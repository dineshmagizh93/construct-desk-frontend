import type { LabourRecord } from './types'

export interface PayrollRow {
  workerId: string
  name: string
  role: string
  contractor: string
  projectId: string
  daysPresent: number
  daysAbsent: number
  /** Wages for the days marked present — absent days carry no wage. */
  wages: number
}

export interface ContractorTotal {
  contractor: string
  workers: number
  daysPresent: number
  wages: number
}

export interface Payroll {
  rows: PayrollRow[]
  byContractor: ContractorTotal[]
  totalDaysPresent: number
  totalWages: number
}

/** The calendar day of an attendance date ("2026-10-07T00:00:00.000Z" -> "2026-10-07"). */
const dayOf = (iso: string) => iso.slice(0, 10)

/**
 * Wages owed for attendance between `from` and `to` (inclusive, yyyy-mm-dd), per worker and per
 * contractor. Only workers with at least one entry in the period appear. Workers without a contractor
 * are grouped as "In-house".
 */
export function buildPayroll(workers: LabourRecord[], from: string, to: string): Payroll {
  const rows: PayrollRow[] = []
  for (const worker of workers) {
    const entries = (worker.attendance ?? []).filter((e) => {
      const day = dayOf(e.date)
      return day >= from && day <= to
    })
    if (entries.length === 0) continue
    const present = entries.filter((e) => e.present)
    rows.push({
      workerId: worker.id,
      name: worker.name,
      role: worker.role ?? '',
      contractor: worker.contractor?.trim() || 'In-house',
      projectId: worker.projectId,
      daysPresent: present.length,
      daysAbsent: entries.length - present.length,
      wages: present.reduce((sum, e) => sum + e.wageAmount, 0),
    })
  }
  rows.sort((a, b) => a.contractor.localeCompare(b.contractor) || a.name.localeCompare(b.name))

  const totals = new Map<string, ContractorTotal>()
  for (const row of rows) {
    const total = totals.get(row.contractor) ?? { contractor: row.contractor, workers: 0, daysPresent: 0, wages: 0 }
    total.workers += 1
    total.daysPresent += row.daysPresent
    total.wages += row.wages
    totals.set(row.contractor, total)
  }
  return {
    rows,
    byContractor: [...totals.values()],
    totalDaysPresent: rows.reduce((sum, r) => sum + r.daysPresent, 0),
    totalWages: rows.reduce((sum, r) => sum + r.wages, 0),
  }
}

/** First and last day of the month containing `now`, as yyyy-mm-dd. */
export function monthRange(now: Date): { from: string; to: string } {
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(y, m + 1, 0).getDate()
  return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(lastDay)}` }
}
