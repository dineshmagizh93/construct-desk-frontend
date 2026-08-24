import { FileText, Paperclip } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { DocumentItem } from './types'
import { formatDate } from '@/lib/utils'
import { formatFileSize } from '@/lib/file'

export const DOCUMENT_CATEGORY_OPTIONS = [
  { label: 'Drawing', value: 'Drawing' },
  { label: 'Permit', value: 'Permit' },
  { label: 'Contract', value: 'Contract' },
  { label: 'License', value: 'License' },
  { label: 'Certificate', value: 'Certificate' },
  { label: 'Other', value: 'Other' },
]

export const documentColumns: Column<DocumentItem & { projectName?: string }>[] = [
  {
    key: 'name',
    header: 'Document',
    render: (row) => (
      <span className="flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" /> {row.name}
      </span>
    ),
  },
  { key: 'category', header: 'Category', render: (row) => <Badge variant="outline">{row.category}</Badge> },
  { key: 'projectName', header: 'Project' },
  { key: 'uploadedBy', header: 'Uploaded By' },
  { key: 'uploadedAt', header: 'Uploaded', render: (row) => formatDate(row.uploadedAt) },
  {
    key: 'file',
    header: 'File',
    render: (row) =>
      row.file[0] ? (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Paperclip className="size-3.5" /> {formatFileSize(row.file[0].size)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">No file attached</span>
      ),
  },
]

export const documentFields: FieldConfig[] = [
  { name: 'name', label: 'Document Name', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', options: DOCUMENT_CATEGORY_OPTIONS, colSpan: 1 },
  { name: 'projectId', label: 'Project', type: 'select', options: [], required: true, colSpan: 1 },
  { name: 'uploadedBy', label: 'Uploaded By', type: 'text', colSpan: 1 },
  { name: 'uploadedAt', label: 'Upload Date', type: 'date', colSpan: 1 },
  {
    name: 'file',
    label: 'Attach File',
    type: 'file',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.dwg',
    multiple: false,
    colSpan: 2,
    uploadFolder: 'documents',
  },
]

export const documentImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Document Name', example: 'Structural Drawings Rev 4.pdf', required: true },
  { key: 'category', header: 'Category', example: 'Drawing', required: true, hint: 'One of: Drawing, Permit, Contract, License, Certificate, Other' },
  { key: 'projectId', header: 'Project ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
  { key: 'uploadedBy', header: 'Uploaded By', example: 'Priya Nair', required: true },
  { key: 'uploadedAt', header: 'Upload Date', example: '2026-08-01', type: 'date', hint: 'Format: YYYY-MM-DD' },
]
