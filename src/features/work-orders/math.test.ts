import { describe, expect, it } from 'vitest'
import { formatQuantity, measuredQuantity, workOrderFigures } from './math'

// These fixtures and expected numbers are the same ones backend/src/shared/workOrder.test.ts uses.
// The frontend mirrors the server's maths, so if one side changes and the other doesn't, one of the
// two suites fails — that's the point.
const items = [
  { id: 'a', description: 'Brickwork', quantity: 100, rate: 5000, measurements: [{ id: 'm1', date: '', quantity: 40 }, { id: 'm2', date: '', quantity: 25.5 }] },
  { id: 'b', description: 'Plaster', quantity: 200, rate: 300, measurements: [] },
]

describe('workOrderFigures (parity with the backend)', () => {
  it('values the contract and the work done so far', () => {
    expect(measuredQuantity(items[0])).toBe(65.5)
    const f = workOrderFigures({ items, payments: [], retentionPercent: 0 })
    expect(f.contractValue).toBe(100 * 5000 + 200 * 300)
    expect(f.executedValue).toBe(327_500)
  })

  it('applies retention, payments and the balance', () => {
    const f = workOrderFigures({ items, retentionPercent: 10, payments: [{ id: 'p1', date: '', amount: 100_000 }, { id: 'p2', date: '', amount: 50_000 }] })
    expect(f).toEqual({
      contractValue: 560_000,
      executedValue: 327_500,
      percentComplete: Math.round((327_500 / 560_000) * 100),
      retention: 32_750,
      netPayable: 294_750,
      paid: 150_000,
      balance: 144_750,
    })
  })

  it('goes negative when the subcontractor has been paid ahead', () => {
    expect(workOrderFigures({ items, retentionPercent: 0, payments: [{ id: 'p', date: '', amount: 400_000 }] }).balance).toBe(-72_500)
  })

  it('handles an order with nothing in it', () => {
    expect(workOrderFigures({ items: [], payments: [], retentionPercent: 5 })).toMatchObject({ contractValue: 0, percentComplete: 0, balance: 0 })
  })
})

describe('formatQuantity', () => {
  it('trims float noise but keeps real fractions', () => {
    expect(formatQuantity(0.1 + 0.2)).toBe('0.3')
    expect(formatQuantity(12.5)).toBe('12.5')
    expect(formatQuantity(100)).toBe('100')
  })
})

describe('workOrderFigures with released retention', () => {
  const order = (released: string | null) => ({
    retentionPercent: 10,
    retentionReleasedAt: released,
    items: [{ id: 'a', description: 'Brickwork', quantity: 100, rate: 1000, measurements: [{ id: 'm', date: '', quantity: 40 }] }],
    payments: [{ id: 'p', date: '', amount: 20_000 }],
  })

  it('holds the retention back until it is released', () => {
    expect(workOrderFigures(order(null))).toMatchObject({ retention: 4_000, netPayable: 36_000, balance: 16_000 })
  })

  it('counts it as payable once released', () => {
    expect(workOrderFigures(order('2026-10-09T00:00:00.000Z'))).toMatchObject({ retention: 0, netPayable: 40_000, balance: 20_000 })
  })
})
