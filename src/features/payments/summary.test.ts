import { describe, expect, it } from 'vitest'
import { summarisePayments } from './summary'

const pay = (amount: number, status: 'paid' | 'unpaid' | 'overdue', retentionPercent = 0, released = false) => ({
  amount,
  status,
  retentionPercent,
  retentionReleasedAt: released ? '2026-10-01T00:00:00.000Z' : null,
})

describe('summarisePayments', () => {
  it('matches the backend retention-aware definitions', () => {
    expect(
      summarisePayments([
        pay(1000, 'paid', 10), // collected 900, retention 100 held
        pay(1000, 'paid', 10, true), // collected 1000, nothing held
        pay(500, 'unpaid'), // outstanding 500
        pay(2000, 'overdue', 5), // outstanding 1900, retention 100 held
      ]),
    ).toEqual({ outstanding: 2400, overdueCount: 1, overdueAmount: 1900, collected: 1900, retentionHeld: 200 })
  })

  it('is all zero for no invoices', () => {
    expect(summarisePayments([])).toEqual({ outstanding: 0, overdueCount: 0, overdueAmount: 0, collected: 0, retentionHeld: 0 })
  })
})
