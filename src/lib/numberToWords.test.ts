import { describe, expect, it } from 'vitest'
import { rupeesInWords } from './numberToWords'

describe('rupeesInWords', () => {
  it('handles zero and small numbers', () => {
    expect(rupeesInWords(0)).toBe('Rupees Zero Only')
    expect(rupeesInWords(7)).toBe('Rupees Seven Only')
    expect(rupeesInWords(13)).toBe('Rupees Thirteen Only')
    expect(rupeesInWords(40)).toBe('Rupees Forty Only')
    expect(rupeesInWords(99)).toBe('Rupees Ninety Nine Only')
  })

  it('handles hundreds and thousands', () => {
    expect(rupeesInWords(100)).toBe('Rupees One Hundred Only')
    expect(rupeesInWords(567)).toBe('Rupees Five Hundred Sixty Seven Only')
    expect(rupeesInWords(1000)).toBe('Rupees One Thousand Only')
    expect(rupeesInWords(45_250)).toBe('Rupees Forty Five Thousand Two Hundred Fifty Only')
  })

  it('uses lakh and crore, not million', () => {
    expect(rupeesInWords(100_000)).toBe('Rupees One Lakh Only')
    expect(rupeesInWords(1_234_567)).toBe('Rupees Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Only')
    expect(rupeesInWords(10_000_000)).toBe('Rupees One Crore Only')
    expect(rupeesInWords(4_50_00_000)).toBe('Rupees Four Crore Fifty Lakh Only')
  })

  it('skips empty places', () => {
    expect(rupeesInWords(1_00_001)).toBe('Rupees One Lakh One Only')
    expect(rupeesInWords(5_00_00_000 + 5)).toBe('Rupees Five Crore Five Only')
  })

  it('handles a hundred crore and more', () => {
    expect(rupeesInWords(100_00_00_000)).toBe('Rupees One Hundred Crore Only')
  })

  it('rounds fractions to whole rupees and handles negatives', () => {
    expect(rupeesInWords(1999.6)).toBe('Rupees Two Thousand Only')
    expect(rupeesInWords(1999.4)).toBe('Rupees One Thousand Nine Hundred Ninety Nine Only')
    expect(rupeesInWords(-250)).toBe('Rupees Minus Two Hundred Fifty Only')
  })
})
