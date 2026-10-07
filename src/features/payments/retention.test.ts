import { describe, expect, it } from 'vitest'
import { netDue, retentionAmount } from './retention'

// Same numbers as backend/src/shared/paymentMath.test.ts — the frontend mirrors the server's maths.
describe('invoice retention maths (parity with the backend)', () => {
  it('splits a 5% retention off a ₹10,00,000 bill', () => {
    const bill = { amount: 1_000_000, retentionPercent: 5 }
    expect(retentionAmount(bill)).toBe(50_000)
    expect(netDue(bill)).toBe(950_000)
  })

  it('does nothing when there is no retention (every legacy invoice)', () => {
    const bill = { amount: 1_000_000, retentionPercent: 0 }
    expect(retentionAmount(bill)).toBe(0)
    expect(netDue(bill)).toBe(1_000_000)
  })

  it('rounds to whole rupees and net + retention always equals gross', () => {
    const bill = { amount: 333_333, retentionPercent: 7.5 }
    expect(Number.isInteger(retentionAmount(bill))).toBe(true)
    expect(netDue(bill) + retentionAmount(bill)).toBe(333_333)
  })
})
