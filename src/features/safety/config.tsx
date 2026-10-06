import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig } from '@/components/shared/types'
import { formatDate } from '@/lib/utils'
import type { IncidentSeverity, SafetyIncident } from './types'

export const INCIDENT_TYPE_OPTIONS = [
  { label: 'Near Miss', value: 'Near Miss' },
  { label: 'First Aid', value: 'First Aid' },
  { label: 'Injury', value: 'Injury' },
  { label: 'Property Damage', value: 'Property Damage' },
  { label: 'Unsafe Condition', value: 'Unsafe Condition' },
  { label: 'Toolbox Talk', value: 'Toolbox Talk' },
]

export const INCIDENT_SEVERITY_OPTIONS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

export const INCIDENT_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

const SEVERITY_VARIANT: Record<IncidentSeverity, 'secondary' | 'accent' | 'warning' | 'destructive'> = {
  Low: 'secondary',
  Medium: 'accent',
  High: 'warning',
  Critical: 'destructive',
}

export const safetyColumns: Column<SafetyIncident & { projectName?: string }>[] = [
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  { key: 'projectName', header: 'Project' },
  { key: 'type', header: 'Type', render: (row) => <Badge variant="outline">{row.type}</Badge> },
  { key: 'severity', header: 'Severity', render: (row) => <Badge variant={SEVERITY_VARIANT[row.severity] ?? 'secondary'}>{row.severity}</Badge> },
  { key: 'description', header: 'What happened', render: (row) => <span className="line-clamp-2 max-w-md">{row.description}</span> },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'open' ? 'warning' : 'success'}>{row.status}</Badge> },
]

export const safetyFields: FieldConfig[] = [
  { name: 'projectId', label: 'Project / Site', type: 'select', options: [], required: true, colSpan: 2 },
  { name: 'date', label: 'Date', type: 'date', required: true, colSpan: 1 },
  { name: 'type', label: 'Type', type: 'select', options: INCIDENT_TYPE_OPTIONS, required: true, colSpan: 1 },
  { name: 'severity', label: 'Severity', type: 'select', options: INCIDENT_SEVERITY_OPTIONS, colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: INCIDENT_STATUS_OPTIONS, colSpan: 1 },
  { name: 'description', label: 'What happened', type: 'textarea', required: true, colSpan: 2 },
  { name: 'personInvolved', label: 'Person(s) Involved', type: 'text', colSpan: 2 },
  { name: 'actionTaken', label: 'Action Taken / Corrective Measures', type: 'textarea', colSpan: 2 },
]
