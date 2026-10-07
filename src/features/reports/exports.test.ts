import { describe, expect, it } from 'vitest'
import { expenseBreakdown, inventoryStatus, projectSummary, vendorPerformance } from './exports'

const project = (over: Record<string, unknown> = {}) =>
  ({
    id: 'p1', code: 'PRJ-0001', name: 'Tower', clientId: 'c', clientName: 'Acme', type: 'Residential', status: 'in_progress',
    location: 'BLR', projectManager: 'K', startDate: '2026-01-05T00:00:00.000Z', endDate: '2026-12-01T00:00:00.000Z',
    budget: 1_000_000, spent: 250_000, progress: 40, description: '', milestones: [], tasks: [], expenses: [], documents: [], ...over,
  }) as never

const expense = (id: string, category: string, projectId: string, amount: number, status = 'paid') =>
  ({ id, category, projectId, amount, status, date: '', paidTo: '', receipts: [] }) as never

describe('projectSummary', () => {
  it('lists budget, spent, remaining and percent used', () => {
    const { rows } = projectSummary([project()])
    expect(rows[0]).toEqual(['PRJ-0001', 'Tower', 'Acme', 'Residential', 'in progress', 'BLR', 'K', '2026-01-05', '2026-12-01', 40, 1_000_000, 250_000, 750_000, 25])
  })

  it('shows 0% — not NaN or Infinity — for a project with no budget', () => {
    expect(projectSummary([project({ budget: 0, spent: 10 })]).rows[0][13]).toBe(0)
  })

  it('writes the same number of cells as headers on every row', () => {
    const table = projectSummary([project(), project({ id: 'p2', startDate: '', endDate: '' })])
    expect(table.rows.every((r) => r.length === table.headers.length)).toBe(true)
  })
})

describe('expenseBreakdown', () => {
  it('groups by category and project, biggest first, with a TOTAL row, leaving rejected expenses out', () => {
    const { rows } = expenseBreakdown(
      [expense('1', 'Steel', 'p1', 500), expense('2', 'Steel', 'p1', 300), expense('3', 'Labour', 'p1', 900), expense('4', 'Steel', 'p1', 99_999, 'rejected'), expense('5', 'Steel', 'p2', 100)],
      { p1: 'Tower' },
    )
    expect(rows).toEqual([
      ['Labour', 'Tower', 1, 900],
      ['Steel', 'Tower', 2, 800],
      ['Steel', 'p2', 1, 100], // unknown project falls back to its id
      ['TOTAL', '', 4, 1800],
    ])
  })

  it('has no rows at all — not a lone TOTAL — when there is nothing to report', () => {
    expect(expenseBreakdown([], {}).rows).toEqual([])
    expect(expenseBreakdown([expense('1', 'X', 'p1', 5, 'rejected')], {}).rows).toEqual([])
  })
})

describe('inventoryStatus', () => {
  it('computes stock value and flags items at or below the reorder level', () => {
    const { rows } = inventoryStatus(
      [
        { id: 'i1', name: 'Cement', category: 'C', unit: 'bags', quantity: 10, reorderLevel: 10, unitCost: 400, projectId: 'p1' },
        { id: 'i2', name: 'Sand', category: 'S', unit: 't', quantity: 11, reorderLevel: 10, unitCost: 100, projectId: 'p1' },
      ],
      { p1: 'Tower' },
    )
    expect([rows[0][7], rows[0][8], rows[1][8]]).toEqual([4000, 'Low Stock', 'In Stock'])
  })
})

describe('vendorPerformance', () => {
  const vendors = [
    { id: 'v1', name: 'Shakti', category: 'Steel', rating: 4.5, status: 'active' },
    { id: 'v2', name: 'Idle', category: '', rating: 0, status: 'active' },
  ] as never
  const contracts = [
    { vendorId: 'v1', amount: 1000, status: 'approved' },
    { vendorId: 'v1', amount: 500, status: 'rejected' },
    { vendorId: 'v1', amount: 200, status: 'draft' },
  ] as never
  const orders = [
    { vendorId: 'v1', status: 'active', retentionPercent: 0, items: [{ quantity: 10, rate: 100, measurements: [{ quantity: 4 }] }], payments: [{ amount: 300 }] },
    { vendorId: 'v1', status: 'cancelled', retentionPercent: 0, items: [{ quantity: 99, rate: 99, measurements: [] }], payments: [] },
  ] as never

  it('counts non-rejected contracts and non-cancelled work orders only', () => {
    expect(vendorPerformance(vendors, contracts, orders).rows[0]).toEqual(['Shakti', 'Steel', 'active', 4.5, 2, 1200, 1, 1000, 400, 300])
  })

  it('reports zeros for a vendor with no business', () => {
    expect(vendorPerformance(vendors, contracts, orders).rows[1].slice(4)).toEqual([0, 0, 0, 0, 0, 0])
  })
})
