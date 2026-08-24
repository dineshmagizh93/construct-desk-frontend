export type EquipmentStatus = 'available' | 'in_use' | 'maintenance'

export interface Equipment {
  id: string
  name: string
  type: string
  status: EquipmentStatus
  projectId?: string
  lastServiceDate: string
  nextServiceDate: string
}
