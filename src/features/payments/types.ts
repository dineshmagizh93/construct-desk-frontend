export type PaymentStatus = 'paid' | 'unpaid' | 'overdue'

export interface Payment {
  id: string
  invoiceNumber: string
  clientName: string
  projectId: string
  amount: number
  dueDate: string
  status: PaymentStatus
}
