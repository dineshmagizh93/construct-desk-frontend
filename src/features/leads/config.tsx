import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Lead } from './types'
import { formatCurrency } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import type { KanbanColumn } from '@/components/shared/KanbanBoard'

export const LEAD_STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Site Visit', value: 'site_visit' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
]

export const LEAD_SOURCE_OPTIONS = [
  { label: 'Website', value: 'Website' },
  { label: 'Referral', value: 'Referral' },
  { label: 'Walk-in', value: 'Walk-in' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Advertisement', value: 'Advertisement' },
]

export const LEAD_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'new', label: 'New', accentClassName: 'bg-muted-foreground' },
  { id: 'contacted', label: 'Contacted', accentClassName: 'bg-warning' },
  { id: 'site_visit', label: 'Site Visit', accentClassName: 'bg-warning' },
  { id: 'quoted', label: 'Quoted', accentClassName: 'bg-primary' },
  { id: 'won', label: 'Won', accentClassName: 'bg-success' },
  { id: 'lost', label: 'Lost', accentClassName: 'bg-destructive' },
]

export function leadStatusLabel(status: string) {
  return LEAD_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export const leadColumns: Column<Lead>[] = [
  { key: 'name', header: 'Lead' },
  { key: 'projectType', header: 'Project Type' },
  { key: 'estimatedBudget', header: 'Est. Budget', render: (row) => formatCurrency(row.estimatedBudget) },
  { key: 'source', header: 'Source', render: (row) => <Badge variant="outline">{row.source}</Badge> },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{leadStatusLabel(row.status)}</Badge>,
  },
  { key: 'assignedTo', header: 'Assigned To' },
]

export const leadFields: FieldConfig[] = [
  { name: 'name', label: 'Lead / Company Name', type: 'text', required: true, colSpan: 2 },
  { name: 'phone', label: 'Phone', type: 'text', colSpan: 1 },
  { name: 'email', label: 'Email', type: 'email', colSpan: 1 },
  { name: 'projectType', label: 'Project Type', type: 'text', colSpan: 2 },
  { name: 'estimatedBudget', label: 'Estimated Budget (₹)', type: 'number', colSpan: 1 },
  { name: 'source', label: 'Source', type: 'select', options: LEAD_SOURCE_OPTIONS, colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: LEAD_STATUS_OPTIONS, colSpan: 1 },
  { name: 'assignedTo', label: 'Assigned To', type: 'text', colSpan: 1 },
  { name: 'location', label: 'Location', type: 'text', colSpan: 2 },
]

export const leadImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Lead / Company Name', example: 'Vikram Singh', required: true },
  { key: 'phone', header: 'Phone', example: '+91 98765 43210' },
  { key: 'email', header: 'Email', example: 'lead@example.com' },
  { key: 'projectType', header: 'Project Type', example: '3BHK Villa Construction', required: true },
  { key: 'estimatedBudget', header: 'Estimated Budget (INR)', example: 5000000, type: 'number' },
  { key: 'source', header: 'Source', example: 'Website', required: true, hint: 'One of: Website, Referral, Walk-in, Social Media, Advertisement' },
  { key: 'status', header: 'Status', example: 'new', required: true, hint: 'One of: new, contacted, site_visit, quoted, won, lost' },
  { key: 'assignedTo', header: 'Assigned To', example: 'Rohan Shah' },
  { key: 'location', header: 'Location', example: 'Whitefield, Bengaluru' },
]
