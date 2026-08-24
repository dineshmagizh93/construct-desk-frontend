import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '../api'
import { inventoryColumns, inventoryFields, inventoryImportColumns } from '../config'
import type { InventoryItem } from '../types'

export function InventoryListPage() {
  const { data = [], isLoading } = useInventory()
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()
  const { moduleText } = useIndustryConfig()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((i) => ({ ...i, projectName: projectNameMap[i.projectId] ?? i.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => inventoryFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<InventoryItem & { projectName: string }>
      title={moduleText.inventory.title}
      description={moduleText.inventory.description}
      data={enriched}
      columns={inventoryColumns}
      fields={fields}
      keyField="id"
      moduleKey="inventory"
      isLoading={isLoading}
      searchKeys={['name', 'category', 'projectName']}
      entityLabel={moduleText.inventory.entityLabel ?? 'material'}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<InventoryItem>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<InventoryItem> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: inventoryImportColumns, fileName: 'inventory-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
