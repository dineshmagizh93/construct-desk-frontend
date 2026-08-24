import type { ReactNode } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Column } from './types'
import { cn } from '@/lib/utils'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  loading?: boolean
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode
  emptyTitle?: string
  emptyDescription?: string
}

function getValue<T>(row: T, key: string) {
  return key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], row)
}

export function DataTable<T extends object>({
  data,
  columns,
  keyField,
  loading,
  onRowClick,
  actions,
  emptyTitle = 'No records yet',
  emptyDescription = 'Data you add will show up here.',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border border-border p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="h-full overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => {
                if (col.render) {
                  return (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  )
                }
                const value = String(getValue(row, col.key) ?? '—')
                // Long free-text values truncate with an ellipsis (full text on hover) so one long
                // entry can't blow out the row height or column width.
                return (
                  <TableCell key={col.key} className={col.className}>
                    <span className="block max-w-[32ch] truncate" title={value}>
                      {value}
                    </span>
                  </TableCell>
                )
              })}
              {actions && (
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
