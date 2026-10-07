import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig } from '@/components/shared/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseRequest, PurchaseRequestStatus } from './types'

export const REQUEST_STATUS_VARIANT: Record<PurchaseRequestStatus, 'warning' | 'success' | 'destructive' | 'accent' | 'secondary'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  ordered: 'accent',
  received: 'secondary',
}

export type PurchaseRequestRow = PurchaseRequest & { projectName?: string; vendorName?: string; total: number }

export const purchaseRequestColumns: Column<PurchaseRequestRow>[] = [
  { key: 'title', header: 'Request' },
  { key: 'projectName', header: 'Project' },
  { key: 'vendorName', header: 'Vendor', render: (row) => row.vendorName ?? '—' },
  { key: 'items', header: 'Items', render: (row) => row.items.length },
  { key: 'total', header: 'Est. Value', render: (row) => (row.total ? formatCurrency(row.total) : '—') },
  { key: 'neededBy', header: 'Needed By', render: (row) => (row.neededBy ? formatDate(row.neededBy) : '—') },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={REQUEST_STATUS_VARIANT[row.status] ?? 'secondary'}>{row.status}</Badge> },
]

// Status and the approval trail are server-owned, so they're not form fields. Line items are added
// from the request dialog (click a row).
export const purchaseRequestFields: FieldConfig[] = [
  { name: 'title', label: 'Request Title', type: 'text', required: true, placeholder: 'e.g. Cement for 3rd floor slab', colSpan: 2 },
  { name: 'projectId', label: 'Project / Site', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'vendorId', label: 'Preferred Vendor (optional)', type: 'select', options: [], colSpan: 1 },
  { name: 'neededBy', label: 'Needed By', type: 'date', colSpan: 1 },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
]
