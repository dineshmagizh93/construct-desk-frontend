export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export interface Estimate {
  id: string
  title: string
  clientName: string
  projectId?: string
  projectType: string
  totalAmount: number
  status: EstimateStatus
  validUntil: string
  createdAt: string
}
