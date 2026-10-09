import { describe, expect, it } from 'vitest'
import { countLines, isLow, restockPlan, restockQuantity, restockTitle, type StockItem } from './restock'

const item = (id: string, quantity: number, reorderLevel: number, projectId = 'p1'): StockItem => ({ id, name: `Item ${id}`, unit: 'bags', quantity, reorderLevel, projectId })

describe('restockQuantity', () => {
  it('tops up to twice the reorder level', () => {
    expect(restockQuantity({ quantity: 120, reorderLevel: 200 })).toBe(280) // 400 - 120
    expect(restockQuantity({ quantity: 0, reorderLevel: 50 })).toBe(100)
  })

  it('is at least one, and a whole number', () => {
    expect(restockQuantity({ quantity: 10, reorderLevel: 5 })).toBe(1) // already above 2x
    expect(restockQuantity({ quantity: 3, reorderLevel: 2.5 })).toBe(2) // 5 - 3
    expect(restockQuantity({ quantity: 1.5, reorderLevel: 2 })).toBe(3) // ceil(2.5)
  })
})

describe('isLow', () => {
  it('includes stock exactly at the reorder level', () => {
    expect(isLow({ quantity: 5, reorderLevel: 5 })).toBe(true)
    expect(isLow({ quantity: 6, reorderLevel: 5 })).toBe(false)
  })
})

describe('restockPlan', () => {
  it('lists only low items, grouped by project', () => {
    const plan = restockPlan([item('a', 1, 5, 'p1'), item('b', 50, 5, 'p1'), item('c', 0, 4, 'p2'), item('d', 5, 5, 'p1')])
    expect(plan).toEqual([
      { projectId: 'p1', lines: [{ inventoryItemId: 'a', name: 'Item a', unit: 'bags', quantity: 9 }, { inventoryItemId: 'd', name: 'Item d', unit: 'bags', quantity: 5 }] },
      { projectId: 'p2', lines: [{ inventoryItemId: 'c', name: 'Item c', unit: 'bags', quantity: 8 }] },
    ])
  })

  it('skips items already on a pending, approved or ordered request', () => {
    const requests = [
      { status: 'pending', items: [{ inventoryItemId: 'a' }] },
      { status: 'ordered', items: [{ inventoryItemId: 'b' }, { inventoryItemId: null }] },
    ]
    const plan = restockPlan([item('a', 0, 5), item('b', 0, 5), item('c', 0, 5)], requests)
    expect(plan[0].lines.map((l) => l.inventoryItemId)).toEqual(['c'])
  })

  it('does not treat rejected or received requests as covering an item', () => {
    const requests = [
      { status: 'rejected', items: [{ inventoryItemId: 'a' }] },
      { status: 'received', items: [{ inventoryItemId: 'b' }] },
    ]
    expect(countLines(restockPlan([item('a', 0, 5), item('b', 0, 5)], requests))).toBe(2)
  })

  it('is empty when nothing is low or everything is already requested', () => {
    expect(restockPlan([item('a', 50, 5)])).toEqual([])
    expect(restockPlan([item('a', 0, 5)], [{ status: 'approved', items: [{ inventoryItemId: 'a' }] }])).toEqual([])
    expect(restockPlan([])).toEqual([])
  })
})

describe('countLines / restockTitle', () => {
  it('counts lines across groups', () => {
    expect(countLines(restockPlan([item('a', 0, 5, 'p1'), item('b', 0, 5, 'p2'), item('c', 0, 5, 'p2')]))).toBe(3)
  })

  it('names the request after the project and the Indian date', () => {
    expect(restockTitle('Prestige Towers', new Date('2026-10-09T04:30:00Z'))).toBe('Restock — Prestige Towers (9 Oct)')
  })
})
