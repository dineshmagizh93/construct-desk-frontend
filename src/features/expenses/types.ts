import type { UploadedFile } from '@/components/shared/types'

export type ExpenseStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface Expense {
  id: string
  projectId: string
  category: string
  amount: number
  date: string
  paidTo: string
  status: ExpenseStatus
  receipts: UploadedFile[]
  /** Approval trail — set by the server only. Profile ids. */
  createdById?: string | null
  decidedById?: string | null
  decidedAt?: string | null
  decisionNote?: string | null
}
