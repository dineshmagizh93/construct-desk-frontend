import { useMemo, useState } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment } from '../api'
import { equipmentColumns, equipmentFields, equipmentImportColumns } from '../config'
import { ServiceLogDialog } from '../components/ServiceLogDialog'
import type { Equipment } from '../types'

export function EquipmentListPage() {
  const { data = [], isLoading } = useEquipment()
  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()
  const deleteMutation = useDeleteEquipment()
  const { moduleText } = useIndustryConfig()
  const [serviceEquipmentId, setServiceEquipmentId] = useState<string | null>(null)
  const serviceEquipment = serviceEquipmentId ? (data.find((e) => e.id === serviceEquipmentId) ?? null) : null

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((e) => ({ ...e, projectName: e.projectId ? projectNameMap[e.projectId] ?? e.projectId : undefined })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => equipmentFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <>
    <EntityListPage<Equipment & { projectName?: string }>
      title={moduleText.equipment.title}
      description={moduleText.equipment.description}
      data={enriched}
      columns={equipmentColumns}
      fields={fields}
      keyField="id"
      moduleKey="equipment"
      isLoading={isLoading}
      searchKeys={['name', 'type', 'projectName']}
      entityLabel={moduleText.equipment.entityLabel ?? 'equipment'}
      onRowClick={(row) => setServiceEquipmentId(row.id)}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Equipment>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Equipment> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: equipmentImportColumns, fileName: 'equipment-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        if (!code) return null
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />

    <ServiceLogDialog equipment={serviceEquipment} onOpenChange={(open) => !open && setServiceEquipmentId(null)} />
    </>
  )
}
