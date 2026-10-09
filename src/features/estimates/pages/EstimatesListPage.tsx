import { useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/lib/permissions'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useEstimates, useCreateEstimate, useUpdateEstimate, useDeleteEstimate } from '../api'
import { estimateColumns, estimateFields, estimateImportColumns } from '../config'
import { EstimateLineItemsDialog } from '../components/EstimateLineItemsDialog'
import { useDuplicateEstimate } from '../duplicate-api'
import type { Estimate } from '../types'

export function EstimatesListPage() {
  const { data = [], isLoading } = useEstimates()
  const createMutation = useCreateEstimate()
  const updateMutation = useUpdateEstimate()
  const deleteMutation = useDeleteEstimate()
  const duplicateMutation = useDuplicateEstimate()
  const canCreate = usePermission('estimates', 'create')
  const { moduleText } = useIndustryConfig()
  const [lineItemsEstimateId, setLineItemsEstimateId] = useState<string | null>(null)
  const lineItemsEstimate = lineItemsEstimateId ? (data.find((e) => e.id === lineItemsEstimateId) ?? null) : null

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
    <>
      <EntityListPage<Estimate & { projectName?: string }>
        title={moduleText.estimates.title}
        description={moduleText.estimates.description}
        data={enriched}
        columns={estimateColumns}
        fields={fields}
        keyField="id"
        moduleKey="estimates"
        historyEntity="Estimate"
        rowActions={(row) =>
          canCreate ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy estimate"
              title="Copy as a new draft"
              disabled={duplicateMutation.isPending}
              onClick={() => duplicateMutation.mutate(row, { onSuccess: ({ created }) => setLineItemsEstimateId(created.id) })}
            >
              <Copy className="size-3.5" />
            </Button>
          ) : null
        }
        isLoading={isLoading}
        searchKeys={['title', 'clientName']}
        entityLabel={moduleText.estimates.entityLabel ?? 'estimate'}
        onRowClick={(row) => setLineItemsEstimateId(row.id)}
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

      <EstimateLineItemsDialog estimate={lineItemsEstimate} onOpenChange={(open) => !open && setLineItemsEstimateId(null)} />
    </>
  )
}
