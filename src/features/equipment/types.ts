export type EquipmentStatus = 'available' | 'in_use' | 'maintenance'

export interface EquipmentServiceLog {
  id: string
  date: string
  type: string
  cost: number
  performedBy?: string
  notes?: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  status: EquipmentStatus
  projectId?: string
  lastServiceDate: string
  nextServiceDate: string
  ownershipType?: string
  rentalCost?: number
  serviceLogs: EquipmentServiceLog[]
}
