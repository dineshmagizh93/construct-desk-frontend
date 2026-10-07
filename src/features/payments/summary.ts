import { collectedAmount, outstandingAmount, retentionAmount } from './retention'
import type { Payment } from './types'

export interface PaymentSummary {
  outstanding: number
  overdueCount: number
  overdueAmount: number
  collected: number
  retentionHeld: number
}

type Money = Pick<Payment, 'amount' | 'retentionPercent' | 'status' | 'retentionReleasedAt' | 'receivedAmount'>

/** Headline totals for the Payments list, using the same retention-aware definitions as the dashboard and Financial Reports. */
export function summarisePayments(payments: Money[]): PaymentSummary {
  const overdue = payments.filter((p) => p.status === 'overdue')
  return {
    outstanding: payments.reduce((sum, p) => sum + outstandingAmount(p), 0),
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, p) => sum + outstandingAmount(p), 0),
    collected: payments.reduce((sum, p) => sum + collectedAmount(p), 0),
    retentionHeld: payments.reduce((sum, p) => sum + (p.retentionReleasedAt ? 0 : retentionAmount(p)), 0),
  }
}
