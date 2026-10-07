import { describe, expect, it } from 'vitest'
import { percentMeasured } from './siteView'

describe('percentMeasured', () => {
  it('is the measured share of the ordered quantity, rounded', () => {
    expect(percentMeasured(200, 50)).toBe(25)
    expect(percentMeasured(3, 1)).toBe(33)
  })

  it('stops at 100 and survives a zero order', () => {
    expect(percentMeasured(100, 130)).toBe(100)
    expect(percentMeasured(0, 5)).toBe(0)
  })
})
