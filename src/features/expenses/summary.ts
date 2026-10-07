import type { Expense } from './types'

export interface ExpenseSummary {
  pendingCount: number
  pendingAmount: number
  approvedAmount: number
  paidAmount: number
  /** Everything that counts as spend: all but rejected. */
  totalSpend: number
}

type Money = Pick<Expense, 'amount' | 'status'>

/** Headline totals for the Expenses list. Rejected expenses are excluded from every figure. */
export function summariseExpenses(expenses: Money[]): ExpenseSummary {
  const total = (status: Expense['status']) => expenses.filter((e) => e.status === status).reduce((sum, e) => sum + e.amount, 0)
  const pending = expenses.filter((e) => e.status === 'pending')
  const approvedAmount = total('approved')
  const paidAmount = total('paid')
  const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0)
  return { pendingCount: pending.length, pendingAmount, approvedAmount, paidAmount, totalSpend: pendingAmount + approvedAmount + paidAmount }
}
