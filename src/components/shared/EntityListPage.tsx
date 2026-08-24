import { type ReactNode, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Upload } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { DataTable } from './DataTable'
import { DrawerForm } from './DrawerForm'
import { ConfirmDialog } from './ConfirmDialog'
import { Pagination } from './Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/lib/permissions'
import type { Column, FieldConfig, ImportConfig } from './types'

const ImportDialog = lazy(() => import('./ImportDialog').then((m) => ({ default: m.ImportDialog })))

interface EntityListPageProps<T extends object> {
  title?: string
  description?: string
  hideHeader?: boolean
  data: T[]
  columns: Column<T>[]
  fields: FieldConfig[]
  keyField: keyof T
  isLoading?: boolean
  searchKeys?: (keyof T)[]
  addButtonLabel?: string
  entityLabel?: string
  onCreate: (values: Record<string, unknown>) => Promise<unknown> | void
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<unknown> | void
  onDelete: (id: string) => Promise<unknown> | void
  getFormDefaults?: (row: T) => Record<string, unknown>
  getCreateDefaults?: () => Record<string, unknown>
  getFields?: (row: T | null) => FieldConfig[]
  onRowClick?: (row: T) => void
  headerActions?: ReactNode
  toolbarStart?: ReactNode
  rowActions?: (row: T) => ReactNode
  moduleKey?: string
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  pageSize?: number
  fillHeight?: boolean
  importConfig?: ImportConfig
  validateImportRow?: (row: Record<string, unknown>) => string | null
}

export function EntityListPage<T extends object>({
  title,
  description,
  hideHeader,
  data,
  columns,
  fields,
  keyField,
  isLoading,
  searchKeys,
  addButtonLabel,
  entityLabel = 'record',
  onCreate,
  onUpdate,
  onDelete,
  getFormDefaults,
  getCreateDefaults,
  getFields,
  onRowClick,
  headerActions,
  toolbarStart,
  rowActions,
  moduleKey,
  canCreate: canCreateProp,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
  pageSize: initialPageSize = 10,
  fillHeight = true,
  importConfig,
  validateImportRow,
}: EntityListPageProps<T>) {
  const permCreate = usePermission(moduleKey || 'dashboard', 'create')
  const permEdit = usePermission(moduleKey || 'dashboard', 'edit')
  const permDelete = usePermission(moduleKey || 'dashboard', 'delete')
  const canCreate = moduleKey ? (canCreateProp ?? permCreate) : (canCreateProp ?? true)
  const canEdit = moduleKey ? (canEditProp ?? permEdit) : (canEditProp ?? true)
  const canDelete = moduleKey ? (canDeleteProp ?? permDelete) : (canDeleteProp ?? true)

  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim() || !searchKeys?.length) return data
    const q = search.toLowerCase()
    return data.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)))
  }, [data, search, searchKeys])

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  )

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = (row: T) => {
    setEditing(row)
    setDrawerOpen(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editing) {
      await onUpdate(String(editing[keyField]), values)
    } else {
      await onCreate(values)
    }
  }

  const actionButtons = (
    <>
      {importConfig && canCreate && (
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload /> Import
        </Button>
      )}
      {canCreate && (
        <Button onClick={openCreate}>
          <Plus /> {addButtonLabel ?? `Add ${entityLabel}`}
        </Button>
      )}
    </>
  )

  const activeFields = getFields ? getFields(editing) : fields

  const searchInput = searchKeys?.length ? (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={`Search ${entityLabel}s…`}
        className="pl-8"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  ) : null

  return (
    <div className={fillHeight ? 'flex h-full flex-col' : undefined}>
      <div className="shrink-0">
        {hideHeader ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {toolbarStart}
            {searchInput}
            <div className="ml-auto flex items-center gap-2">{actionButtons}</div>
          </div>
        ) : (
          <>
            <PageHeader
              title={title ?? ''}
              description={description}
              actions={
                <>
                  {headerActions}
                  {actionButtons}
                </>
              }
            />
            {searchInput && <div className="mb-4">{searchInput}</div>}
          </>
        )}
      </div>

      <div className={fillHeight ? 'min-h-0 flex-1' : undefined}>
        <DataTable
          data={paginated}
          columns={columns}
          keyField={keyField}
          loading={isLoading}
          onRowClick={onRowClick}
          emptyTitle={`No ${entityLabel}s yet`}
          emptyDescription={`Add your first ${entityLabel} to get started.`}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              {rowActions?.(row)}
              {canEdit && (
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
                  <Pencil className="size-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {!isLoading && filtered.length > 0 && (
        <div className="shrink-0">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      )}

      <DrawerForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
        fields={activeFields}
        defaultValues={editing ? getFormDefaults?.(editing) ?? (editing as Record<string, unknown>) : (getCreateDefaults?.() ?? {})}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save changes' : 'Create'}
      />

      {importConfig && importOpen && (
        <Suspense fallback={null}>
          <ImportDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            entityLabel={entityLabel}
            columns={importConfig.columns}
            fileName={importConfig.fileName}
            validateRow={validateImportRow}
            onConfirm={async (rows) => {
              for (const row of rows) {
                await onCreate(row)
              }
            }}
          />
        </Suspense>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${entityLabel}`}
        description={`This will permanently remove this ${entityLabel}. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) return onDelete(String(deleteTarget[keyField]))
        }}
      />
    </div>
  )
}
