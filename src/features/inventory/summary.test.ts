import { describe, expect, it } from 'vitest'
import { summariseInventory } from './summary'

describe('summariseInventory', () => {
  it('values stock at unit cost, keeping paise on rates until the total is rounded', () => {
    expect(
      summariseInventory([
        { quantity: 120, reorderLevel: 200, unitCost: 380 }, // 45,600 - low
        { quantity: 10, reorderLevel: 10, unitCost: 62.75 }, // 627.5 - low (at the level)
        { quantity: 500, reorderLevel: 100, unitCost: 8 }, // 4,000
      ]),
    ).toEqual({ items: 3, stockValue: 50228, lowStock: 2 })
  })

  it('handles an empty store', () => {
    expect(summariseInventory([])).toEqual({ items: 0, stockValue: 0, lowStock: 0 })
  })
})
