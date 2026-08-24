import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox' | 'file'

export interface SelectOption {
  label: string
  value: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  key: string
  url: string
}

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  options?: SelectOption[]
  required?: boolean
  colSpan?: 1 | 2
  step?: string
  accept?: string
  multiple?: boolean
  /** Max characters for text/email/textarea fields. Falls back to a per-type default when omitted. */
  maxLength?: number
  /** For type: 'file' — which R2 folder/presign category this field's uploads belong to. */
  uploadFolder?: 'site-progress' | 'documents'
}

export interface ImportColumn {
  key: string
  header: string
  example: string | number
  required?: boolean
  type?: 'text' | 'number' | 'date'
  hint?: string
}

export interface ImportConfig {
  columns: ImportColumn[]
  fileName?: string
}
