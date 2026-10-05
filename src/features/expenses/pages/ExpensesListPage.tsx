import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import type { UploadedFile } from '@/components/shared/types'
import { http } from '@/lib/http'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../api'
import { expenseColumns, expenseFields, expenseImportColumns } from '../config'
import type { Expense } from '../types'

// `receipts` is a relation on the backend (populated via a nested endpoint after upload), not a
// scalar field. New (not-yet-persisted) files have a client-generated id (`file-…`); persisted ones
// have a real UUID. On save we attach the new files AND delete any persisted receipt the user removed.
async function syncReceipts(expenseId: string, original: UploadedFile[] | undefined, submitted: UploadedFile[] | undefined) {
  const list = submitted ?? []
  const keptIds = new Set(list.map((f) => f.id))
  const removed = (original ?? []).filter((f) => !f.id.startsWith('file-') && !keptIds.has(f.id))
  const added = list.filter((f) => f.id.startsWith('file-'))
  await Promise.all([
    ...removed.map((f) => http(`/expenses/${expenseId}/receipts/${f.id}`, { method: 'DELETE' })),
    ...added.map((f) => http(`/expenses/${expenseId}/receipts`, { method: 'POST', body: JSON.stringify(f) })),
  ])
}

export function ExpensesListPage() {
  const { data = [], isLoading } = useExpenses()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const deleteMutation = useDeleteExpense()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((e) => ({ ...e, projectName: projectNameMap[e.projectId] ?? e.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => expenseFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<Expense & { projectName: string }>
      title="Expenses"
      description="Every project expense, categorized and tracked through approval."
      data={enriched}
      columns={expenseColumns}
      fields={fields}
      keyField="id"
      moduleKey="expenses"
      isLoading={isLoading}
      searchKeys={['category', 'projectName', 'paidTo']}
      entityLabel="expense"
      onCreate={async (values) => {
        const { receipts, ...rest } = values as Partial<Expense>
        const created = await createMutation.mutateAsync(rest)
        await syncReceipts(created.id, undefined, receipts)
        return created
      }}
      onUpdate={async (id, values) => {
        const { receipts, ...rest } = values as Partial<Expense>
        const original = data.find((e) => e.id === id)?.receipts
        const updated = await updateMutation.mutateAsync({ id, values: rest })
        await syncReceipts(id, original, receipts)
        return updated
      }}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: expenseImportColumns, fileName: 'expenses-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
