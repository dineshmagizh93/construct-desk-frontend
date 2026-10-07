import type { InventoryItem } from './types'

export interface InventorySummary {
  items: number
  /** Stock on hand valued at unit cost, rounded to whole rupees. */
  stockValue: number
  lowStock: number
}

/** Headline totals for the Inventory list; "low" matches the Low Stock badge (at or below reorder level). */
export function summariseInventory(items: Pick<InventoryItem, 'quantity' | 'reorderLevel' | 'unitCost'>[]): InventorySummary {
  return {
    items: items.length,
    stockValue: Math.round(items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)),
    lowStock: items.filter((i) => i.quantity <= i.reorderLevel).length,
  }
}
