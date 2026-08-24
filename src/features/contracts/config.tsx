import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Contract } from './types'
import { formatCurrency } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const CONTRACT_TYPE_OPTIONS = [
  { label: 'Contract', value: 'Contract' },
  { label: 'Purchase Order', value: 'Purchase Order' },
]

export const CONTRACT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const contractColumns: Column<Contract & { projectName?: string }>[] = [
  { key: 'title', header: 'Title' },
  { key: 'type', header: 'Type', render: (row) => <Badge variant="outline">{row.type}</Badge> },
  { key: 'party', header: 'Party' },
  { key: 'projectName', header: 'Project' },
  { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{row.status}</Badge> },
]

export const contractFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Type', type: 'select', options: CONTRACT_TYPE_OPTIONS, colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: CONTRACT_STATUS_OPTIONS, colSpan: 1 },
  { name: 'party', label: 'Party (Client/Vendor)', type: 'text', colSpan: 1 },
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'amount', label: 'Amount (₹)', type: 'number', colSpan: 1 },
  { name: 'signedDate', label: 'Signed Date', type: 'date', colSpan: 1 },
]

export const contractImportColumns: ImportColumn[] = [
  { key: 'title', header: 'Title', example: 'PO-2210 — Cement Supply', required: true },
  { key: 'type', header: 'Type', example: 'Purchase Order', required: true, hint: 'One of: Contract, Purchase Order' },
  { key: 'party', header: 'Party (Client/Vendor)', example: 'Shakti Steel Traders', required: true },
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'amount', header: 'Amount (INR)', example: 500000, required: true, type: 'number' },
  { key: 'status', header: 'Status', example: 'draft', required: true, hint: 'One of: draft, pending, approved, rejected' },
  { key: 'signedDate', header: 'Signed Date', example: '2026-08-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
]
