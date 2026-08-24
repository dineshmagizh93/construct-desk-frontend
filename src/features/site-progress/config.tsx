import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { SiteProgressEntry } from './types'
import { formatDate } from '@/lib/utils'
import { PhotosCell } from './components/PhotosCell'

export const WEATHER_OPTIONS = [
  { label: 'Clear', value: 'Clear' },
  { label: 'Rainy', value: 'Rainy' },
  { label: 'Cloudy', value: 'Cloudy' },
  { label: 'Extreme Heat', value: 'Extreme Heat' },
]

export const siteProgressColumns: Column<SiteProgressEntry & { projectName?: string }>[] = [
  { key: 'projectName', header: 'Project' },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  {
    key: 'progressPercent',
    header: 'Progress',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${row.progressPercent}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{row.progressPercent}%</span>
      </div>
    ),
  },
  { key: 'workforceCount', header: 'Workforce' },
  { key: 'weather', header: 'Weather' },
  { key: 'photos', header: 'Photos', render: (row) => <PhotosCell photos={row.photos} title={row.projectName ?? row.projectId} /> },
]

export const siteProgressFields: FieldConfig[] = [
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 2 },
  { name: 'date', label: 'Date', type: 'date', colSpan: 1 },
  { name: 'progressPercent', label: 'Progress (%)', type: 'number', colSpan: 1 },
  { name: 'workforceCount', label: 'Workforce Count', type: 'number', colSpan: 1 },
  { name: 'weather', label: 'Weather', type: 'select', options: WEATHER_OPTIONS, colSpan: 1 },
  { name: 'notes', label: 'Site Notes', type: 'textarea', colSpan: 2 },
  { name: 'photos', label: 'Site Photos', type: 'file', accept: 'image/*', multiple: true, colSpan: 2, uploadFolder: 'site-progress' },
]

export const siteProgressImportColumns: ImportColumn[] = [
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'date', header: 'Date', example: '2026-07-05', required: true, type: 'date', hint: 'Format: YYYY-MM-DD' },
  { key: 'progressPercent', header: 'Progress (%)', example: 50, required: true, type: 'number' },
  { key: 'workforceCount', header: 'Workforce Count', example: 40, type: 'number' },
  { key: 'weather', header: 'Weather', example: 'Clear', hint: 'One of: Clear, Rainy, Cloudy, Extreme Heat' },
  { key: 'notes', header: 'Site Notes', example: 'Progress notes for the day' },
]
