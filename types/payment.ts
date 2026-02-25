export type PaymentStatus = "Pending" | "Paid" | "Overdue"

export interface Payment {
  id: string
  projectId: string
  projectName: string
  milestone: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentFormData {
  projectId: string
  milestone: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paidDate?: string
  notes?: string
}

