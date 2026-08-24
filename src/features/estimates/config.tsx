import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Estimate } from './types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const ESTIMATE_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const estimateColumns: Column<Estimate & { projectName?: string }>[] = [
  { key: 'title', header: 'Estimate' },
  { key: 'clientName', header: 'Client' },
  { key: 'projectName', header: 'Linked Project', render: (row) => row.projectName ?? '—' },
  { key: 'totalAmount', header: 'Amount', render: (row) => formatCurrency(row.totalAmount) },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{row.status}</Badge> },
  { key: 'validUntil', header: 'Valid Until', render: (row) => formatDate(row.validUntil) },
]

export const estimateFields: FieldConfig[] = [
  { name: 'title', label: 'Estimate Title', type: 'text', required: true, colSpan: 2 },
  { name: 'clientName', label: 'Client Name', type: 'text', colSpan: 1 },
  { name: 'projectType', label: 'Project Type', type: 'text', colSpan: 1 },
  { name: 'projectId', label: 'Linked Project (optional)', type: 'select', options: [], colSpan: 1 },
  { name: 'totalAmount', label: 'Total Amount (₹)', type: 'number', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: ESTIMATE_STATUS_OPTIONS, colSpan: 1 },
  { name: 'validUntil', label: 'Valid Until', type: 'date', colSpan: 1 },
]

export const estimateImportColumns: ImportColumn[] = [
  { key: 'title', header: 'Estimate Title', example: 'BOQ — New Warehouse', required: true },
  { key: 'clientName', header: 'Client Name', example: 'Precision Auto Components', required: true },
  { key: 'projectId', header: 'Linked Project ID', example: 'PRJ-0006', hint: 'Optional — leave blank if this estimate has no existing project yet. If filled, must match a real Project ID.' },
  { key: 'projectType', header: 'Project Type', example: 'Industrial Warehouse' },
  { key: 'totalAmount', header: 'Total Amount (INR)', example: 5000000, required: true, type: 'number' },
  { key: 'status', header: 'Status', example: 'draft', required: true, hint: 'One of: draft, sent, approved, rejected' },
  { key: 'validUntil', header: 'Valid Until', example: '2026-09-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
]
