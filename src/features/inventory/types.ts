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
