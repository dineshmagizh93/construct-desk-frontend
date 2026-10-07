import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatRate } from './utils'

describe('formatDate', () => {
  it('formats a real date', () => {
    expect(formatDate('2026-10-07T00:00:00.000Z')).toBe('07 Oct 2026')
    expect(formatDate(new Date(2026, 0, 5))).toBe('05 Jan 2026')
  })

  it('shows a dash — never 01 Jan 1970 — for a missing date', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('shows a dash for an unparseable date instead of throwing', () => {
    expect(formatDate('not-a-date')).toBe('—')
    expect(formatDate(new Date('garbage'))).toBe('—')
  })
})

describe('formatCurrency', () => {
  it('uses Indian digit grouping with no decimals', () => {
    expect(formatCurrency(4500000)).toBe('₹45,00,000')
    expect(formatCurrency(0)).toBe('₹0')
    expect(formatCurrency(1234.6)).toBe('₹1,235')
  })
})

describe('formatRate', () => {
  it('keeps paise on a rate and drops them when there are none', () => {
    expect(formatRate(62.75)).toBe('₹62.75')
    expect(formatRate(380.5)).toBe('₹380.50')
    expect(formatRate(380)).toBe('₹380')
    expect(formatRate(1850000)).toBe('₹18,50,000')
    expect(formatRate(0)).toBe('₹0')
  })
})
