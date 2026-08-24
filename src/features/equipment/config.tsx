import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Equipment } from './types'
import { formatDate } from '@/lib/utils'

export const EQUIPMENT_STATUS_OPTIONS = [
  { label: 'Available', value: 'available' },
  { label: 'In Use', value: 'in_use' },
  { label: 'Maintenance', value: 'maintenance' },
]

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  available: 'success',
  in_use: 'warning',
  maintenance: 'destructive',
}

export const equipmentColumns: Column<Equipment & { projectName?: string }>[] = [
  { key: 'name', header: 'Equipment' },
  { key: 'type', header: 'Type' },
  { key: 'projectName', header: 'Assigned Project', render: (row) => row.projectName ?? '—' },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status.replace('_', ' ')}</Badge> },
  { key: 'nextServiceDate', header: 'Next Service', render: (row) => formatDate(row.nextServiceDate) },
]

export const equipmentFields: FieldConfig[] = [
  { name: 'name', label: 'Equipment Name', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Type', type: 'text', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: EQUIPMENT_STATUS_OPTIONS, colSpan: 1 },
  { name: 'projectId', label: 'Assigned Project (optional)', type: 'select', options: [], colSpan: 1 },
  { name: 'lastServiceDate', label: 'Last Service Date', type: 'date', colSpan: 1 },
  { name: 'nextServiceDate', label: 'Next Service Date', type: 'date', colSpan: 1 },
]

export const equipmentImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Equipment Name', example: 'Tower Crane TC-04', required: true },
  { key: 'type', header: 'Type', example: 'Crane', required: true },
  { key: 'status', header: 'Status', example: 'available', required: true, hint: 'One of: available, in_use, maintenance' },
  { key: 'projectId', header: 'Assigned Project ID', example: 'PRJ-0001', hint: 'Optional — leave blank if not currently assigned. If filled, must match a real Project ID.' },
  { key: 'lastServiceDate', header: 'Last Service Date', example: '2026-06-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'nextServiceDate', header: 'Next Service Date', example: '2026-09-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
]
