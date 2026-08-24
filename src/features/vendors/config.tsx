import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { Vendor } from './types'

export const VENDOR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const vendorColumns: Column<Vendor>[] = [
  { key: 'name', header: 'Vendor' },
  { key: 'category', header: 'Category' },
  { key: 'contactPerson', header: 'Contact Person' },
  { key: 'phone', header: 'Phone' },
  {
    key: 'rating',
    header: 'Rating',
    render: (row) => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`size-3.5 ${i < row.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
        ))}
      </div>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{row.status}</Badge> },
]

export const vendorFields: FieldConfig[] = [
  { name: 'name', label: 'Vendor Name', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'text', colSpan: 1 },
  { name: 'status', label: 'Status', type: 'select', options: VENDOR_STATUS_OPTIONS, colSpan: 1 },
  { name: 'contactPerson', label: 'Contact Person', type: 'text', colSpan: 1 },
  { name: 'phone', label: 'Phone', type: 'text', colSpan: 1 },
  { name: 'email', label: 'Email', type: 'email', colSpan: 1 },
  { name: 'rating', label: 'Rating (1-5)', type: 'number', colSpan: 1 },
]

export const vendorImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Vendor Name', example: 'Shakti Steel Traders', required: true },
  { key: 'category', header: 'Category', example: 'Steel & Rebar', required: true },
  { key: 'status', header: 'Status', example: 'active', required: true, hint: 'One of: active, inactive' },
  { key: 'contactPerson', header: 'Contact Person', example: 'Rajiv Malhotra' },
  { key: 'phone', header: 'Phone', example: '+91 98111 22334' },
  { key: 'email', header: 'Email', example: 'sales@example.com' },
  { key: 'rating', header: 'Rating (1-5)', example: 4, type: 'number' },
]
