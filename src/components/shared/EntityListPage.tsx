import { type ReactNode, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Upload, Download } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { DataTable } from './DataTable'
import { DrawerForm } from './DrawerForm'
import { ConfirmDialog } from './ConfirmDialog'
import { Pagination } from './Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { bulkSummary, runBulk } from '@/lib/bulk'
import { HistoryButton } from '@/features/audit/components/HistoryButton'
import { downloadCsv } from '@/lib/csv'
import { rowsForExport } from '@/lib/exportRows'
import { usePermission } from '@/lib/permissions'
import type { Column, FieldConfig, ImportConfig, SelectOption } from './types'

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
  /** Used for each row of a bulk import instead of onCreate (e.g. to skip a per-record confirmation). */
  onImportRow?: (values: Record<string, unknown>) => Promise<unknown> | void
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<unknown> | void
  onDelete: (id: string) => Promise<unknown> | void
  getFormDefaults?: (row: T) => Record<string, unknown>
  getCreateDefaults?: () => Record<string, unknown>
  getFields?: (row: T | null) => FieldConfig[]
  onRowClick?: (row: T) => void
  headerActions?: ReactNode
  toolbarStart?: ReactNode
  rowActions?: (row: T) => ReactNode
  /** Lets people tick rows and change this select field on all of them at once (only where a plain status change is safe). */
  bulkStatus?: { field: string; label?: string; options: SelectOption[] }
  /** Headline figures (e.g. a SummaryStrip) shown between the header and the table. */
  summary?: ReactNode
  /** Audit entity name (e.g. "Expense") — adds a History button to each row for people who can read the Activity Log. */
  historyEntity?: string
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
  onImportRow,
  onUpdate,
  onDelete,
  getFormDefaults,
  getCreateDefaults,
  getFields,
  onRowClick,
  headerActions,
  toolbarStart,
  rowActions,
  summary,
  bulkStatus,
  historyEntity,
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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

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

  // ---- bulk actions: tick rows, then change a status or delete them together ----
  const bulkCanEdit = !!bulkStatus && canEdit
  const selectable = canDelete || bulkCanEdit
  const selectedRows = useMemo(() => data.filter((row) => selected.has(String(row[keyField]))), [data, selected, keyField])
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleMany = (ids: string[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })

  const finishBulk = (result: Awaited<ReturnType<typeof runBulk>>, verb: string) => {
    const summary = bulkSummary(result, verb, entityLabel)
    toast({ title: summary.title, description: summary.description, variant: summary.failed ? 'destructive' : 'success' })
    setSelected(new Set())
    setBulkBusy(false)
  }

  const applyBulkStatus = async (value: string) => {
    if (!bulkStatus || bulkBusy) return
    setBulkBusy(true)
    const rows = selectedRows.filter((row) => (row as Record<string, unknown>)[bulkStatus.field] !== value)
    const byId = new Map(rows.map((row) => [String(row[keyField]), row]))
    const result = await runBulk([...byId.keys()], (id) => {
      const row = byId.get(id)!
      // The same values the Edit form would submit for this row, with just the status changed.
      const rowFields = getFields ? getFields(row) : fields
      const base = getFormDefaults?.(row) ?? Object.fromEntries(rowFields.map((f) => [f.name, (row as Record<string, unknown>)[f.name]]))
      return onUpdate(id, { ...base, [bulkStatus.field]: value })
    })
    finishBulk(result, 'updated')
  }

  const runBulkDelete = async () => {
    setBulkBusy(true)
    const result = await runBulk(selectedRows.map((row) => String(row[keyField])), (id) => onDelete(id))
    finishBulk(result, 'deleted')
  }

  // Everything the search currently matches (not just the visible page), with the table's own columns.
  const exportCsv = () => {
    const { headers, rows } = rowsForExport(columns, filtered)
    const slug = entityLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadCsv(`${slug}s-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  const actionButtons = (
    <>
      {!isLoading && filtered.length > 0 && (
        <Button variant="outline" onClick={exportCsv} title={`Download ${filtered.length} ${entityLabel}${filtered.length === 1 ? '' : 's'} as a spreadsheet`}>
          <Download /> Export
        </Button>
      )}
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
    <div className={fillHeight ? 'entity-list-page flex min-h-full min-w-0 flex-col' : 'entity-list-page min-w-0'}>
      <div className="shrink-0">
        {hideHeader ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {toolbarStart}
            {searchInput}
            <div className="ml-auto flex flex-wrap items-center gap-2">{actionButtons}</div>
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
            {summary}
            {searchInput && <div className="mb-3">{searchInput}</div>}
          </>
        )}
      </div>

      {selectable && selectedRows.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2 text-sm">
          <span className="px-1 font-medium">{selectedRows.length} selected</span>
          {bulkCanEdit && bulkStatus && (
            <Select value="" onValueChange={applyBulkStatus} disabled={bulkBusy}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder={`Set ${bulkStatus.label ?? 'status'}…`} />
              </SelectTrigger>
              <SelectContent>
                {bulkStatus.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} disabled={bulkBusy}>
            Clear
          </Button>
          {bulkBusy && <span className="text-xs text-muted-foreground">Working…</span>}
        </div>
      )}

      <div className={fillHeight ? 'min-w-0 flex-1' : undefined}>
        <DataTable
          selection={selectable ? { selected, onToggle: toggleOne, onToggleAll: toggleMany } : undefined}
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
              {historyEntity && <HistoryButton entity={historyEntity} entityId={String(row[keyField])} />}
              {canEdit && (
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${entityLabel}`} onClick={() => openEdit(row)}>
                  <Pencil className="size-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button variant="ghost" size="icon-sm" aria-label={`Delete ${entityLabel}`} onClick={() => setDeleteTarget(row)}>
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
        defaultValues={
          editing
            ? (getFormDefaults?.(editing) ??
              // Only pass the row's real form fields through — `data` is often enriched with
              // derived display-only columns (e.g. `projectName`, `assigneeName`) that aren't
              // real fields on the model. react-hook-form includes every defaultValues key in
              // the submitted payload regardless of registration, so leaking one of these into
              // an update silently 400s (the backend rejects the unknown column).
              Object.fromEntries(activeFields.map((f) => [f.name, (editing as Record<string, unknown>)[f.name]])))
            : (getCreateDefaults?.() ?? {})
        }
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
                await (onImportRow ?? onCreate)(row)
              }
            }}
          />
        </Suspense>
      )}

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedRows.length} ${entityLabel}${selectedRows.length === 1 ? '' : 's'}`}
        description={`This will permanently remove the ${selectedRows.length} selected ${entityLabel}${selectedRows.length === 1 ? '' : 's'}. Any that are in use elsewhere will be kept and reported. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={runBulkDelete}
      />

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
