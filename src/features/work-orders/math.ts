import type { WorkOrder, WorkOrderItem } from './types'

/** Mirrors backend/src/shared/workOrder.ts so list and dialog show the same figures the server uses. */
export const measuredQuantity = (item: Pick<WorkOrderItem, 'measurements'>) => item.measurements.reduce((sum, m) => sum + m.quantity, 0)

export interface WorkOrderFigures {
  contractValue: number
  executedValue: number
  percentComplete: number
  retention: number
  netPayable: number
  paid: number
  /** Still owed to the subcontractor; negative means they've been paid ahead (advance). */
  balance: number
}

export function workOrderFigures(order: Pick<WorkOrder, 'items' | 'payments' | 'retentionPercent'>): WorkOrderFigures {
  const contractValue = order.items.reduce((sum, i) => sum + Math.round(i.quantity * i.rate), 0)
  const executedValue = order.items.reduce((sum, i) => sum + Math.round(measuredQuantity(i) * i.rate), 0)
  const retention = Math.round((executedValue * order.retentionPercent) / 100)
  const netPayable = executedValue - retention
  const paid = order.payments.reduce((sum, p) => sum + p.amount, 0)
  return {
    contractValue,
    executedValue,
    percentComplete: contractValue > 0 ? Math.round((executedValue / contractValue) * 100) : 0,
    retention,
    netPayable,
    paid,
    balance: netPayable - paid,
  }
}

/** Quantities can be fractional; trim float noise for display. */
export const formatQuantity = (value: number) => String(Number(value.toFixed(3)))
