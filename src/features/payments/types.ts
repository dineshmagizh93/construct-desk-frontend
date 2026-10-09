export type PaymentStatus = 'paid' | 'unpaid' | 'overdue'

export interface PaymentLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

export interface PaymentReceipt {
  id: string
  amount: number
  date: string
  method?: string | null
  reference?: string | null
  notes?: string | null
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
  /** When the client is due to release the withheld retention; drives the reminder. */
  retentionDueDate?: string | null
  /** Set by the server when this invoice was raised against a client contract. */
  contractId?: string | null
  /** Part-payments received so far; the server keeps it equal to the sum of `receipts`. */
  receivedAmount?: number
  receipts?: PaymentReceipt[]
}
