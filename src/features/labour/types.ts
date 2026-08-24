export interface LabourRecord {
  id: string
  projectId: string
  name: string
  role: string
  contractor: string
  dailyWage: number
  phone: string
  status: 'active' | 'inactive'
  joinedDate: string
}
