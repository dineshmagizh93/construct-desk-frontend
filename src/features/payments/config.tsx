import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Payment } from './types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Overdue', value: 'overdue' },
]

export const paymentColumns: Column<Payment & { projectName?: string }>[] = [
  { key: 'invoiceNumber', header: 'Invoice #' },
  { key: 'clientName', header: 'Client' },
  { key: 'projectName', header: 'Project' },
  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{row.status}</Badge> },
]

export const paymentFields: FieldConfig[] = [
  { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, colSpan: 1 },
  { name: 'clientName', label: 'Client Name', type: 'text', colSpan: 1 },
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'amount', label: 'Amount (₹)', type: 'number', colSpan: 1 },
  { name: 'dueDate', label: 'Due Date', type: 'date', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: PAYMENT_STATUS_OPTIONS, colSpan: 1 },
]

export const paymentImportColumns: ImportColumn[] = [
  { key: 'invoiceNumber', header: 'Invoice Number', example: 'INV-2026-031', required: true },
  { key: 'clientName', header: 'Client Name', example: 'Greenfield Developers', required: true },
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'amount', header: 'Amount (INR)', example: 1000000, required: true, type: 'number' },
  { key: 'dueDate', header: 'Due Date', example: '2026-08-01', required: true, type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'status', header: 'Status', example: 'unpaid', required: true, hint: 'One of: paid, unpaid, overdue' },
]
