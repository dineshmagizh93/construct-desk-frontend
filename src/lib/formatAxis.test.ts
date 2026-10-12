import { describe, expect, it } from 'vitest'
import { formatRupeeAxis } from './formatAxis'

describe('formatRupeeAxis', () => {
  it('shows small amounts plainly', () => {
    expect(formatRupeeAxis(0)).toBe('₹0')
    expect(formatRupeeAxis(500)).toBe('₹500')
  })

  it('uses thousands, lakhs and crores', () => {
    expect(formatRupeeAxis(25_000)).toBe('₹25K')
    expect(formatRupeeAxis(1_500_000)).toBe('₹15L')
    expect(formatRupeeAxis(6_000_000)).toBe('₹60L')
    expect(formatRupeeAxis(80_000_000)).toBe('₹8 Cr')
    expect(formatRupeeAxis(25_000_000)).toBe('₹2.5 Cr')
  })

  it('moves to crores at exactly one crore, and lakhs at one lakh', () => {
    expect(formatRupeeAxis(10_000_000)).toBe('₹1 Cr')
    expect(formatRupeeAxis(100_000)).toBe('₹1L')
  })

  it('keeps the sign for negative values', () => {
    expect(formatRupeeAxis(-1_500_000)).toBe('-₹15L')
    expect(formatRupeeAxis(-30_000_000)).toBe('-₹3 Cr')
  })
})
