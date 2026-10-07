import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig } from '@/components/shared/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { workOrderFigures } from './math'
import type { WorkOrder, WorkOrderStatus } from './types'

export const WORK_ORDER_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const WORK_ORDER_STATUS_VARIANT: Record<WorkOrderStatus, 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
}

export type WorkOrderRow = WorkOrder & { projectName?: string; vendorName?: string }

export const workOrderColumns: Column<WorkOrderRow>[] = [
  { key: 'title', header: 'Work Order' },
  { key: 'vendorName', header: 'Subcontractor' },
  { key: 'projectName', header: 'Project' },
  { key: 'items', header: 'Order Value', render: (row) => formatCurrency(workOrderFigures(row).contractValue) },
  {
    key: 'payments',
    header: 'Progress',
    render: (row) => {
      const { percentComplete } = workOrderFigures(row)
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 min-w-0 max-w-20 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percentComplete)}%` }} />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{percentComplete}%</span>
        </div>
      )
    },
  },
  {
    key: 'retentionPercent',
    header: 'Balance Due',
    render: (row) => {
      const { balance } = workOrderFigures(row)
      return balance < 0 ? <span className="text-warning">Paid ahead {formatCurrency(-balance)}</span> : formatCurrency(balance)
    },
  },
  { key: 'endDate', header: 'Due', render: (row) => (row.endDate ? formatDate(row.endDate) : '—') },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={WORK_ORDER_STATUS_VARIANT[row.status] ?? 'secondary'}>{row.status}</Badge> },
]

// Items, measurements and payments are managed in the work order dialog (click a row).
export const workOrderFields: FieldConfig[] = [
  { name: 'title', label: 'Work Order Title', type: 'text', required: true, placeholder: 'e.g. Brickwork & plastering — Block A', colSpan: 2 },
  { name: 'vendorId', label: 'Subcontractor (vendor)', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'projectId', label: 'Project / Site', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'startDate', label: 'Start Date', type: 'date', colSpan: 1 },
  { name: 'endDate', label: 'Completion Date', type: 'date', colSpan: 1 },
  { name: 'retentionPercent', label: 'Retention Held (%)', type: 'number', step: '0.5', placeholder: '0', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: WORK_ORDER_STATUS_OPTIONS, colSpan: 1 },
  { name: 'scope', label: 'Scope of Work', type: 'textarea', colSpan: 2 },
]
