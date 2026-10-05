export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  reorderLevel: number
  unitCost: number
  projectId: string
}

export type StockTransactionType = 'opening' | 'received' | 'issued' | 'returned' | 'adjustment'

export interface StockTransaction {
  id: string
  type: StockTransactionType
  /** Signed delta: positive adds stock, negative removes it. */
  quantity: number
  balanceAfter: number
  date: string
  reference?: string
  notes?: string
}
