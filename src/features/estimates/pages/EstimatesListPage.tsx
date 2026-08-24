import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useEstimates, useCreateEstimate, useUpdateEstimate, useDeleteEstimate } from '../api'
import { estimateColumns, estimateFields, estimateImportColumns } from '../config'
import type { Estimate } from '../types'

export function EstimatesListPage() {
  const { data = [], isLoading } = useEstimates()
  const createMutation = useCreateEstimate()
  const updateMutation = useUpdateEstimate()
  const deleteMutation = useDeleteEstimate()
  const { moduleText } = useIndustryConfig()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((e) => ({ ...e, projectName: e.projectId ? projectNameMap[e.projectId] ?? e.projectId : undefined })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => estimateFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<Estimate & { projectName?: string }>
      title={moduleText.estimates.title}
      description={moduleText.estimates.description}
      data={enriched}
      columns={estimateColumns}
      fields={fields}
      keyField="id"
      moduleKey="estimates"
      isLoading={isLoading}
      searchKeys={['title', 'clientName']}
      entityLabel={moduleText.estimates.entityLabel ?? 'estimate'}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Estimate>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Estimate> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: estimateImportColumns, fileName: 'estimates-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        if (!code) return null
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
