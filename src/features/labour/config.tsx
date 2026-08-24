import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { LabourRecord } from './types'
import { formatCurrency } from '@/lib/utils'

export const LABOUR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const labourColumns: Column<LabourRecord & { projectName?: string }>[] = [
  { key: 'name', header: 'Name' },
  { key: 'projectName', header: 'Assigned Project' },
  { key: 'role', header: 'Role' },
  { key: 'contractor', header: 'Contractor' },
  { key: 'dailyWage', header: 'Daily Wage', render: (row) => formatCurrency(row.dailyWage) },
  { key: 'phone', header: 'Phone' },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{row.status}</Badge> },
]

export const labourFields: FieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, colSpan: 2 },
  { name: 'projectId', label: 'Assigned Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'role', label: 'Role / Trade', type: 'text', colSpan: 1 },
  { name: 'contractor', label: 'Contractor', type: 'text', colSpan: 1 },
  { name: 'dailyWage', label: 'Daily Wage (₹)', type: 'number', colSpan: 1 },
  { name: 'phone', label: 'Phone', type: 'text', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: LABOUR_STATUS_OPTIONS, colSpan: 1 },
  { name: 'joinedDate', label: 'Joined Date', type: 'date', colSpan: 1 },
]

export const labourImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Full Name', example: 'Ramu Naidu', required: true },
  { key: 'projectId', header: 'Assigned Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'role', header: 'Role / Trade', example: 'Mason', required: true },
  { key: 'contractor', header: 'Contractor', example: 'In-house' },
  { key: 'dailyWage', header: 'Daily Wage (INR)', example: 900, required: true, type: 'number' },
  { key: 'phone', header: 'Phone', example: '+91 90001 11111' },
  { key: 'status', header: 'Status', example: 'active', required: true, hint: 'One of: active, inactive' },
  { key: 'joinedDate', header: 'Joined Date', example: '2026-01-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
]
