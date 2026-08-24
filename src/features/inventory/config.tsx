import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig, ImportColumn } from '@/components/shared/types'
import type { InventoryItem } from './types'
import { formatCurrency } from '@/lib/utils'

export const inventoryColumns: Column<InventoryItem & { projectName?: string }>[] = [
  { key: 'name', header: 'Material' },
  { key: 'category', header: 'Category' },
  { key: 'projectName', header: 'Project' },
  { key: 'quantity', header: 'Stock', render: (row) => `${row.quantity} ${row.unit}` },
  { key: 'unitCost', header: 'Unit Cost', render: (row) => formatCurrency(row.unitCost) },
  {
    key: 'reorderLevel',
    header: 'Status',
    render: (row) =>
      row.quantity <= row.reorderLevel ? (
        <Badge variant="destructive">Low Stock</Badge>
      ) : (
        <Badge variant="success">In Stock</Badge>
      ),
  },
]

export const inventoryFields: FieldConfig[] = [
  { name: 'name', label: 'Material Name', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'text', colSpan: 1 },
  { name: 'unit', label: 'Unit', type: 'text', placeholder: 'bags, tons, cu.m…', colSpan: 1 },
  { name: 'quantity', label: 'Quantity in Stock', type: 'number', colSpan: 1 },
  { name: 'reorderLevel', label: 'Reorder Level', type: 'number', colSpan: 1 },
  { name: 'unitCost', label: 'Unit Cost (₹)', type: 'number', colSpan: 1 },
  { name: 'projectId', label: 'Project / Site', type: 'select', options: [], required: true, colSpan: 1 },
]

export const inventoryImportColumns: ImportColumn[] = [
  { key: 'name', header: 'Material Name', example: 'Cement (OPC 53 Grade)', required: true },
  { key: 'category', header: 'Category', example: 'Cement', required: true },
  { key: 'unit', header: 'Unit', example: 'bags', required: true },
  { key: 'quantity', header: 'Quantity in Stock', example: 200, required: true, type: 'number' },
  { key: 'reorderLevel', header: 'Reorder Level', example: 100, required: true, type: 'number' },
  { key: 'unitCost', header: 'Unit Cost (INR)', example: 380, required: true, type: 'number' },
  { key: 'projectId', header: 'Project / Site ID', example: 'PRJ-0001', required: true, hint: 'Must match an existing Project ID — see the Projects module.' },
]
