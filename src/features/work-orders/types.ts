export type WorkOrderStatus = 'active' | 'completed' | 'cancelled'

export interface WorkOrderMeasurement {
  id: string
  date: string
  quantity: number
  notes?: string | null
}

export interface WorkOrderItem {
  id: string
  description: string
  unit?: string | null
  /** Quantity awarded in the work order. */
  quantity: number
  /** Agreed unit rate (₹). */
  rate: number
  measurements: WorkOrderMeasurement[]
}

export interface WorkOrderPayment {
  id: string
  date: string
  amount: number
  reference?: string | null
  notes?: string | null
  /** The Expense raised for this payment (approval status lives on the expense). */
  expenseId?: string | null
}

export interface WorkOrder {
  id: string
  projectId: string
  vendorId: string
  vendor?: { id: string; name: string }
  title: string
  scope?: string | null
  startDate?: string | null
  endDate?: string | null
  retentionPercent: number
  /** Set by the server once the withheld retention has been released (it is then payable). */
  retentionReleasedAt?: string | null
  status: WorkOrderStatus
  items: WorkOrderItem[]
  payments: WorkOrderPayment[]
  createdById?: string | null
}
