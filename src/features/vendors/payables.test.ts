import { describe, expect, it } from 'vitest'
import { summarisePayables, vendorPayables } from './payables'

type Order = Parameters<typeof vendorPayables>[0][number]

// 100 units at ₹1,000, 40 measured = ₹40,000 executed
const order = (vendorId: string, over: Partial<Order> = {}, paid = 0, measured = 40): Order => ({
  vendorId,
  status: 'active',
  retentionPercent: 0,
  items: [{ id: 'i', description: 'Brickwork', quantity: 100, rate: 1000, measurements: measured ? [{ id: 'm', date: '', quantity: measured }] : [] }],
  payments: paid ? [{ id: 'p', date: '', amount: paid }] : [],
  ...over,
})

describe('vendorPayables', () => {
  it('owes executed value less what has been paid', () => {
    expect(vendorPayables([order('v1', {}, 15_000)]).get('v1')).toEqual({ owed: 25_000, advance: 0, ordersOwed: 1 })
  })

  it('takes retention off what is owed', () => {
    // 40,000 executed, 10% retention = 36,000 net, 6,000 paid
    expect(vendorPayables([order('v1', { retentionPercent: 10 }, 6_000)]).get('v1')?.owed).toBe(30_000)
  })

  it('adds up several orders for one vendor', () => {
    const p = vendorPayables([order('v1', {}, 10_000), order('v1', {}, 0, 20)]).get('v1')
    expect(p).toEqual({ owed: 30_000 + 20_000, advance: 0, ordersOwed: 2 })
  })

  it('reports an overpaid order as an advance, without netting it against another order', () => {
    const p = vendorPayables([order('v1', {}, 50_000), order('v1', {}, 0, 10)]).get('v1')
    expect(p).toEqual({ owed: 10_000, advance: 10_000, ordersOwed: 1 })
  })

  it('ignores cancelled orders and orders with nothing measured or owed', () => {
    const map = vendorPayables([order('v1', { status: 'cancelled' }), order('v2', {}, 0, 0), order('v3', {}, 40_000)])
    expect(map.has('v1')).toBe(false)
    expect(map.get('v2')).toEqual({ owed: 0, advance: 0, ordersOwed: 0 })
    expect(map.get('v3')).toEqual({ owed: 0, advance: 0, ordersOwed: 0 })
  })

  it('keeps vendors apart', () => {
    const map = vendorPayables([order('v1'), order('v2', {}, 10_000)])
    expect(map.get('v1')?.owed).toBe(40_000)
    expect(map.get('v2')?.owed).toBe(30_000)
  })
})

describe('summarisePayables', () => {
  it('totals what is owed, the advances, and how many vendors are owed', () => {
    const map = vendorPayables([order('v1'), order('v2', {}, 10_000), order('v3', {}, 50_000), order('v4', {}, 40_000)])
    expect(summarisePayables(map)).toEqual({ totalOwed: 70_000, totalAdvance: 10_000, vendorsOwed: 2 })
  })

  it('is empty for nothing', () => {
    expect(summarisePayables(new Map())).toEqual({ totalOwed: 0, totalAdvance: 0, vendorsOwed: 0 })
  })
})
