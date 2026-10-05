import type { UploadedFile } from '@/components/shared/types'

export type ExpenseStatus = 'pending' | 'approved' | 'paid'

export interface Expense {
  id: string
  projectId: string
  category: string
  amount: number
  date: string
  paidTo: string
  status: ExpenseStatus
  receipts: UploadedFile[]
}
