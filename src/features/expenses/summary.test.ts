import { describe, expect, it } from 'vitest'
import { summariseExpenses } from './summary'

describe('summariseExpenses', () => {
  it('totals each status and leaves rejected out of spend', () => {
    expect(
      summariseExpenses([
        { amount: 100, status: 'pending' },
        { amount: 250, status: 'pending' },
        { amount: 400, status: 'approved' },
        { amount: 1000, status: 'paid' },
        { amount: 5000, status: 'rejected' },
      ]),
    ).toEqual({ pendingCount: 2, pendingAmount: 350, approvedAmount: 400, paidAmount: 1000, totalSpend: 1750 })
  })

  it('is all zero for no expenses', () => {
    expect(summariseExpenses([])).toEqual({ pendingCount: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0, totalSpend: 0 })
  })
})
