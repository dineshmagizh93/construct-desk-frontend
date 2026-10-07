export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export interface EstimateLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

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
  lineItems: EstimateLineItem[]
  /** Set by the server once a contract has been raised from this (approved) estimate. */
  contractId?: string | null
}
