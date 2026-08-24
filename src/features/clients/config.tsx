import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Client } from './types'

export const CLIENT_TYPE_OPTIONS = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Developer', value: 'Developer' },
  { label: 'Government', value: 'Government' },
  { label: 'Corporate', value: 'Corporate' },
]

export const clientColumns: Column<Client>[] = [
  { key: 'name', header: 'Client' },
  { key: 'contactPerson', header: 'Contact Person' },
  { key: 'phone', header: 'Phone' },
  { key: 'type', header: 'Type', render: (row) => <Badge variant="outline">{row.type}</Badge> },
  { key: 'address', header: 'Address' },
]

export const clientFields: FieldConfig[] = [
  { name: 'name', label: 'Client / Company Name', type: 'text', required: true, colSpan: 2 },
  { name: 'contactPerson', label: 'Contact Person', type: 'text', colSpan: 1 },
  { name: 'type', label: 'Client Type', type: 'select', options: CLIENT_TYPE_OPTIONS, colSpan: 1 },
  { name: 'phone', label: 'Phone', type: 'text', colSpan: 1 },
  { name: 'email', label: 'Email', type: 'email', colSpan: 1 },
  { name: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
]

export const clientImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Client / Company Name', example: 'Greenfield Developers', required: true },
  { key: 'contactPerson', header: 'Contact Person', example: 'Ramesh Gowda', required: true },
  { key: 'type', header: 'Client Type', example: 'Developer', required: true, hint: 'One of: Individual, Developer, Government, Corporate' },
  { key: 'phone', header: 'Phone', example: '+91 99887 76655' },
  { key: 'email', header: 'Email', example: 'contact@example.com' },
  { key: 'address', header: 'Address', example: 'MG Road, Bengaluru' },
]
