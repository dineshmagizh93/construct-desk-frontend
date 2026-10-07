export type PurchaseRequestStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'received'

export interface PurchaseRequestItem {
  id: string
  /** Linked stock item — receiving the request books stock for linked lines only. */
  inventoryItemId?: string | null
  description: string
  quantity: number
  unit?: string | null
  estimatedRate: number
}

export interface PurchaseRequest {
  id: string
  projectId: string
  vendorId?: string | null
  title: string
  neededBy?: string | null
  notes?: string | null
  status: PurchaseRequestStatus
  items: PurchaseRequestItem[]
  /** Server-owned: Profile ids, decision trail, the PO raised from this request, receipt date. */
  createdById?: string | null
  decidedById?: string | null
  decidedAt?: string | null
  decisionNote?: string | null
  contractId?: string | null
  contract?: { id: string; title: string } | null
  receivedAt?: string | null
}
