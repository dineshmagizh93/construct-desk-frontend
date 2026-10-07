export type PaymentStatus = 'paid' | 'unpaid' | 'overdue'

export interface PaymentLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

export interface Payment {
  id: string
  invoiceNumber: string
  clientName: string
  projectId: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paymentMethod?: string
  lineItems: PaymentLineItem[]
  /** Share of the gross `amount` the client withholds until the defects liability period ends. */
  retentionPercent: number
  /** Set by the server once the withheld retention has been released. */
  retentionReleasedAt?: string | null
  /** Set by the server when this invoice was raised against a client contract. */
  contractId?: string | null
}
