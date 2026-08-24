import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../api'
import { expenseColumns, expenseFields, expenseImportColumns } from '../config'
import type { Expense } from '../types'

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
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Expense>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Expense> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: expenseImportColumns, fileName: 'expenses-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
