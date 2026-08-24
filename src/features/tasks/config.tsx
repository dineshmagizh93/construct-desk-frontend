import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Task } from './types'
import { formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export const TASK_STATUS_OPTIONS = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export const TASK_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const PRIORITY_COLORS: Record<string, 'secondary' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
}

export function taskStatusLabel(status: string) {
  return TASK_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

export const taskColumns: Column<Task>[] = [
  { key: 'title', header: 'Task' },
  { key: 'projectName', header: 'Project' },
  { key: 'assignee', header: 'Assignee' },
  { key: 'priority', header: 'Priority', render: (row) => <Badge variant={PRIORITY_COLORS[row.priority]}>{row.priority}</Badge> },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] ?? 'secondary'}>{taskStatusLabel(row.status)}</Badge> },
  { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
]

export const taskFields: FieldConfig[] = [
  { name: 'title', label: 'Task Title', type: 'text', required: true, colSpan: 2 },
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'assignee', label: 'Assignee', type: 'text', colSpan: 1 },
  { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITY_OPTIONS, colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS, colSpan: 1 },
  { name: 'dueDate', label: 'Due Date', type: 'date', colSpan: 1 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
]

export const taskImportColumns: ImportColumn[] = [
  { key: 'title', header: 'Task Title', example: 'Electrical rough-in — Block C', required: true },
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'assignee', header: 'Assignee', example: 'Suresh Kumar', required: true },
  { key: 'priority', header: 'Priority', example: 'medium', required: true, hint: 'One of: low, medium, high' },
  { key: 'status', header: 'Status', example: 'todo', required: true, hint: 'One of: todo, in_progress, done' },
  { key: 'dueDate', header: 'Due Date', example: '2026-08-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'description', header: 'Description', example: 'Short task description' },
]
