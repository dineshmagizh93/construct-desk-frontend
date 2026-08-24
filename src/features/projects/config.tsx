import { Badge } from '@/components/ui/badge'
import { CopyableId } from '@/components/shared/CopyableId'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Project } from './types'
import { formatCurrency } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const PROJECT_STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const PROJECT_TYPE_OPTIONS = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Infrastructure', value: 'Infrastructure' },
  { label: 'Industrial', value: 'Industrial' },
]

export function statusLabel(status: string) {
  if (!status) return '—'
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export const projectColumns: Column<Project>[] = [
  { key: 'code', header: 'Project ID', render: (row) => <CopyableId value={row.code} /> },
  { key: 'name', header: 'Project' },
  { key: 'clientName', header: 'Client' },
  { key: 'type', header: 'Type' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{statusLabel(row.status)}</Badge>
    ),
  },
  {
    key: 'progress',
    header: 'Progress',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${row.progress}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{row.progress}%</span>
      </div>
    ),
  },
  { key: 'budget', header: 'Budget', render: (row) => formatCurrency(row.budget) },
]

export const projectFields: FieldConfig[] = [
  { name: 'code', label: 'Project ID', type: 'text', required: true, colSpan: 1, placeholder: 'PRJ-0001' },
  { name: 'name', label: 'Project Name', type: 'text', required: true, colSpan: 1 },
  { name: 'clientName', label: 'Client Name', type: 'text', required: true },
  { name: 'type', label: 'Project Type', type: 'select', options: PROJECT_TYPE_OPTIONS, required: true, colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS_OPTIONS, required: true, colSpan: 1 },
  { name: 'location', label: 'Location', type: 'text', colSpan: 1 },
  { name: 'projectManager', label: 'Project Manager', type: 'text', colSpan: 1 },
  { name: 'startDate', label: 'Start Date', type: 'date', colSpan: 1 },
  { name: 'endDate', label: 'End Date', type: 'date', colSpan: 1 },
  { name: 'budget', label: 'Budget (₹)', type: 'number', colSpan: 1 },
  { name: 'progress', label: 'Progress (%)', type: 'number', colSpan: 1 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
]

export const projectImportColumns: ImportColumn[] = [
  { key: 'code', header: 'Project ID', example: 'PRJ-0017', required: true, hint: 'Unique project code. Leave blank-safe by checking the Projects list first — duplicates will be rejected.' },
  { key: 'name', header: 'Project Name', example: 'Lakeside Villas', required: true },
  { key: 'clientName', header: 'Client Name', example: 'Greenfield Developers', required: true },
  { key: 'type', header: 'Project Type', example: 'Residential', required: true, hint: 'One of: Residential, Commercial, Infrastructure, Industrial' },
  { key: 'status', header: 'Status', example: 'planning', required: true, hint: 'One of: planning, in_progress, on_hold, completed, cancelled' },
  { key: 'location', header: 'Location', example: 'Whitefield, Bengaluru' },
  { key: 'projectManager', header: 'Project Manager', example: 'Priya Nair' },
  { key: 'startDate', header: 'Start Date', example: '2026-08-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'endDate', header: 'End Date', example: '2027-02-28', type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'budget', header: 'Budget (INR)', example: 25000000, type: 'number' },
  { key: 'progress', header: 'Progress (%)', example: 0, type: 'number' },
  { key: 'description', header: 'Description', example: 'Short project description' },
]
