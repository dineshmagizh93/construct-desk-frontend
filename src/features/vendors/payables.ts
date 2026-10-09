import { workOrderFigures } from '@/features/work-orders/math'
import type { WorkOrder } from '@/features/work-orders/types'

export interface VendorPayable {
  /** Work done and not yet paid for, summed over the vendor's live work orders. */
  owed: number
  /** Paid ahead of the work done (advances), summed the same way. */
  advance: number
  /** How many work orders still have a balance to pay. */
  ordersOwed: number
}

export interface PayablesSummary {
  totalOwed: number
  totalAdvance: number
  vendorsOwed: number
}

type OrderLike = Pick<WorkOrder, 'vendorId' | 'status' | 'items' | 'payments' | 'retentionPercent'> & Partial<Pick<WorkOrder, 'retentionReleasedAt'>>

/**
 * What is owed to each subcontractor, from their work orders: executed value, less retention, less what has
 * been paid. Cancelled work orders are ignored. A negative balance on one order is an advance and is NOT
 * netted against another order's balance: each order stands on its own.
 */
export function vendorPayables(orders: OrderLike[]): Map<string, VendorPayable> {
  const byVendor = new Map<string, VendorPayable>()
  for (const order of orders) {
    if (order.status === 'cancelled' || !order.vendorId) continue
    const { balance } = workOrderFigures(order)
    const entry = byVendor.get(order.vendorId) ?? { owed: 0, advance: 0, ordersOwed: 0 }
    if (balance > 0) {
      entry.owed += balance
      entry.ordersOwed += 1
    } else if (balance < 0) {
      entry.advance += -balance
    }
    byVendor.set(order.vendorId, entry)
  }
  return byVendor
}

export function summarisePayables(payables: Map<string, VendorPayable>): PayablesSummary {
  let totalOwed = 0
  let totalAdvance = 0
  let vendorsOwed = 0
  for (const p of payables.values()) {
    totalOwed += p.owed
    totalAdvance += p.advance
    if (p.owed > 0) vendorsOwed += 1
  }
  return { totalOwed, totalAdvance, vendorsOwed }
}
