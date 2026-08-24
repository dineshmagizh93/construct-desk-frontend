export type ExpenseStatus = 'pending' | 'approved' | 'paid'

export interface Expense {
  id: string
  projectId: string
  category: string
  amount: number
  date: string
  paidTo: string
  status: ExpenseStatus
}
