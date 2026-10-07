import { useMemo, useState } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap } from '@/features/projects/hooks'
import { useVendorNameMap, useVendorOptions } from '@/features/vendors/hooks'
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder } from '../api'
import { workOrderColumns, workOrderFields, type WorkOrderRow } from '../config'
import { WorkOrderDialog } from '../components/WorkOrderDialog'
import type { WorkOrder } from '../types'

export function WorkOrdersPage() {
  const { data = [], isLoading } = useWorkOrders()
  const createMutation = useCreateWorkOrder()
  const updateMutation = useUpdateWorkOrder()
  const deleteMutation = useDeleteWorkOrder()
  const [openId, setOpenId] = useState<string | null>(null)

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const vendorOptions = useVendorOptions()
  const vendorNameMap = useVendorNameMap()

  const enriched = useMemo<WorkOrderRow[]>(
    () =>
      data.map((o) => ({
        ...o,
        projectName: projectNameMap[o.projectId] ?? o.projectId,
        vendorName: o.vendor?.name ?? vendorNameMap[o.vendorId],
      })),
    [data, projectNameMap, vendorNameMap],
  )

  const fields = useMemo(
    () =>
      workOrderFields.map((f) => {
        if (f.name === 'projectId') return { ...f, options: projectOptions }
        if (f.name === 'vendorId') return { ...f, options: vendorOptions }
        return f
      }),
    [projectOptions, vendorOptions],
  )

  const openOrder = openId ? (enriched.find((o) => o.id === openId) ?? null) : null

  return (
    <>
      <EntityListPage<WorkOrderRow>
        title="Subcontractor Work Orders"
        description="Award work to subcontractors at agreed rates, measure progress, and pay against it. Click a work order to manage its items, measurements and payments."
        data={enriched}
        columns={workOrderColumns}
        fields={fields}
        keyField="id"
        moduleKey="contracts"
        historyEntity="WorkOrder"
        isLoading={isLoading}
        searchKeys={['title', 'vendorName', 'projectName']}
        entityLabel="work order"
        addButtonLabel="New Work Order"
        getCreateDefaults={() => ({ status: 'active', retentionPercent: 0 })}
        onRowClick={(row) => setOpenId(row.id)}
        onCreate={async (values) => {
          const created = await createMutation.mutateAsync(values as Partial<WorkOrder>)
          // Land straight in the dialog so the items can be added.
          setOpenId(created.id)
          return created
        }}
        onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<WorkOrder> })}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
      />

      <WorkOrderDialog order={openOrder} onOpenChange={(open) => !open && setOpenId(null)} />
    </>
  )
}
