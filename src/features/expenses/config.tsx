import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Expense } from './types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const EXPENSE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Paid', value: 'paid' },
]

export const expenseColumns: Column<Expense & { projectName?: string }>[] = [
  { key: 'category', header: 'Category' },
  { key: 'projectName', header: 'Project' },
  { key: 'paidTo', header: 'Paid To' },
  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{row.status}</Badge> },
]

export const expenseFields: FieldConfig[] = [
  { name: 'category', label: 'Category', type: 'text', required: true, colSpan: 2 },
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'paidTo', label: 'Paid To', type: 'text', colSpan: 1 },
  { name: 'amount', label: 'Amount (₹)', type: 'number', colSpan: 1 },
  { name: 'date', label: 'Date', type: 'date', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: EXPENSE_STATUS_OPTIONS, colSpan: 1 },
]

export const expenseImportColumns: ImportColumn[] = [
  { key: 'category', header: 'Category', example: 'Steel & Rebar', required: true },
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'paidTo', header: 'Paid To', example: 'Shakti Steel Traders', required: true },
  { key: 'amount', header: 'Amount (INR)', example: 250000, required: true, type: 'number' },
  { key: 'date', header: 'Date', example: '2026-07-05', required: true, type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'status', header: 'Status', example: 'pending', required: true, hint: 'One of: pending, approved, paid' },
]
