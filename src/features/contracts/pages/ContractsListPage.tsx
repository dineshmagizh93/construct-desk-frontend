import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '../api'
import { contractColumns, contractFields, contractImportColumns } from '../config'
import type { Contract } from '../types'

export function ContractsListPage() {
  const { data = [], isLoading } = useContracts()
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const deleteMutation = useDeleteContract()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((c) => ({ ...c, projectName: projectNameMap[c.projectId] ?? c.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => contractFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<Contract & { projectName: string }>
      title="Contracts & Purchase Orders"
      description="Client contracts and vendor purchase orders, tracked from draft to approval."
      data={enriched}
      columns={contractColumns}
      fields={fields}
      keyField="id"
      moduleKey="contracts"
      isLoading={isLoading}
      searchKeys={['title', 'party', 'projectName']}
      entityLabel="contract"
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Contract>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Contract> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: contractImportColumns, fileName: 'contracts-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
