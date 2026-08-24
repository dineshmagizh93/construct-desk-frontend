import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useLabour, useCreateLabour, useUpdateLabour, useDeleteLabour } from '../api'
import { labourColumns, labourFields, labourImportColumns } from '../config'
import type { LabourRecord } from '../types'

export function LabourListPage() {
  const { data = [], isLoading } = useLabour()
  const createMutation = useCreateLabour()
  const updateMutation = useUpdateLabour()
  const deleteMutation = useDeleteLabour()
  const { moduleText } = useIndustryConfig()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((l) => ({ ...l, projectName: projectNameMap[l.projectId] ?? l.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => labourFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<LabourRecord & { projectName: string }>
      title={moduleText.labour.title}
      description={moduleText.labour.description}
      data={enriched}
      columns={labourColumns}
      fields={fields}
      keyField="id"
      moduleKey="labour"
      isLoading={isLoading}
      searchKeys={['name', 'role', 'contractor', 'projectName']}
      entityLabel={moduleText.labour.entityLabel ?? 'worker'}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<LabourRecord>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<LabourRecord> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: labourImportColumns, fileName: 'labour-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
