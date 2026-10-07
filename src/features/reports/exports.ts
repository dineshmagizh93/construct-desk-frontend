import type { CsvCell } from '@/lib/csv'
import type { Contract } from '@/features/contracts/types'
import type { Expense } from '@/features/expenses/types'
import type { InventoryItem } from '@/features/inventory/types'
import type { Project } from '@/features/projects/types'
import type { Vendor } from '@/features/vendors/types'
import { workOrderFigures } from '@/features/work-orders/math'
import type { WorkOrder } from '@/features/work-orders/types'

export interface ReportTable {
  headers: string[]
  rows: CsvCell[][]
}

const day = (value?: string | null) => (value ? String(value).slice(0, 10) : '')
const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0)

export function projectSummary(projects: Project[]): ReportTable {
  return {
    headers: ['Project ID', 'Name', 'Client', 'Type', 'Status', 'Location', 'Project Manager', 'Start Date', 'End Date', 'Progress %', 'Budget (INR)', 'Spent (INR)', 'Remaining (INR)', 'Budget Used %'],
    rows: projects.map((p) => [
      p.code,
      p.name,
      p.clientName,
      p.type,
      p.status.replace('_', ' '),
      p.location,
      p.projectManager,
      day(p.startDate),
      day(p.endDate),
      p.progress,
      p.budget,
      p.spent,
      p.budget - p.spent,
      percent(p.spent, p.budget),
    ]),
  }
}

/** Spend by category and project. Rejected expenses never happened, so they're left out. */
export function expenseBreakdown(expenses: Expense[], projectNames: Record<string, string>): ReportTable {
  const groups = new Map<string, { category: string; project: string; count: number; total: number }>()
  for (const e of expenses) {
    if (e.status === 'rejected') continue
    const project = projectNames[e.projectId] ?? e.projectId
    const key = `${e.category}\u0000${project}`
    const group = groups.get(key) ?? { category: e.category, project, count: 0, total: 0 }
    group.count += 1
    group.total += e.amount
    groups.set(key, group)
  }
  const sorted = [...groups.values()].sort((a, b) => b.total - a.total)
  const rows: CsvCell[][] = sorted.map((g) => [g.category, g.project, g.count, g.total])
  if (sorted.length > 0) {
    rows.push(['TOTAL', '', sorted.reduce((s, g) => s + g.count, 0), sorted.reduce((s, g) => s + g.total, 0)])
  }
  return { headers: ['Category', 'Project', 'Entries', 'Total (INR)'], rows }
}

export function inventoryStatus(items: InventoryItem[], projectNames: Record<string, string>): ReportTable {
  return {
    headers: ['Material', 'Category', 'Project', 'Unit', 'In Stock', 'Reorder Level', 'Unit Cost (INR)', 'Stock Value (INR)', 'Status'],
    rows: items.map((i) => [
      i.name,
      i.category,
      projectNames[i.projectId] ?? i.projectId,
      i.unit,
      i.quantity,
      i.reorderLevel,
      i.unitCost,
      i.quantity * i.unitCost,
      i.quantity <= i.reorderLevel ? 'Low Stock' : 'In Stock',
    ]),
  }
}

/** Per-vendor volume: contracts / purchase orders (not rejected) plus subcontractor work orders (not cancelled). */
export function vendorPerformance(vendors: Vendor[], contracts: Contract[], workOrders: WorkOrder[]): ReportTable {
  return {
    headers: ['Vendor', 'Category', 'Status', 'Rating', 'Contracts / POs', 'Contract Value (INR)', 'Work Orders', 'Work Order Value (INR)', 'Work Done (INR)', 'Paid (INR)'],
    rows: vendors.map((v) => {
      const linked = contracts.filter((c) => c.vendorId === v.id && c.status !== 'rejected')
      const orders = workOrders.filter((o) => o.vendorId === v.id && o.status !== 'cancelled')
      const figures = orders.map(workOrderFigures)
      return [
        v.name,
        v.category,
        v.status,
        v.rating,
        linked.length,
        linked.reduce((s, c) => s + c.amount, 0),
        orders.length,
        figures.reduce((s, f) => s + f.contractValue, 0),
        figures.reduce((s, f) => s + f.executedValue, 0),
        figures.reduce((s, f) => s + f.paid, 0),
      ]
    }),
  }
}
