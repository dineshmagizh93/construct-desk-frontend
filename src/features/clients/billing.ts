import { summarisePayments, type PaymentSummary } from '@/features/payments/summary'
import type { Payment } from '@/features/payments/types'

export interface ClientBilling {
  /** The client's invoices, soonest due first (undated last). */
  invoices: Payment[]
  summary: PaymentSummary
}

/**
 * A client's account: every invoice raised on a project linked to them, with the same retention-aware
 * totals the Payments list shows. Invoices are tied to projects (not to clients directly), so a client
 * with no linked project has no billing.
 */
export function clientBilling(payments: Payment[], projectIds: string[]): ClientBilling {
  const linked = new Set(projectIds)
  const invoices = payments
    .filter((p) => linked.has(p.projectId))
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  return { invoices, summary: summarisePayments(invoices) }
}
