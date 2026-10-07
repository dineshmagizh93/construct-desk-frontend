import { useMemo, useState } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap } from '@/features/projects/hooks'
import { useVendorNameMap, useVendorOptions } from '@/features/vendors/hooks'
import {
  usePurchaseRequests,
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useDeletePurchaseRequest,
} from '../api'
import { purchaseRequestColumns, purchaseRequestFields, type PurchaseRequestRow } from '../config'
import { PurchaseRequestDialog } from '../components/PurchaseRequestDialog'
import type { PurchaseRequest } from '../types'

export function PurchaseRequestsPage() {
  const { data = [], isLoading } = usePurchaseRequests()
  const createMutation = useCreatePurchaseRequest()
  const updateMutation = useUpdatePurchaseRequest()
  const deleteMutation = useDeletePurchaseRequest()
  const [openId, setOpenId] = useState<string | null>(null)

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const vendorOptions = useVendorOptions()
  const vendorNameMap = useVendorNameMap()

  const enriched = useMemo<PurchaseRequestRow[]>(
    () =>
      data.map((r) => ({
        ...r,
        projectName: projectNameMap[r.projectId] ?? r.projectId,
        vendorName: r.vendorId ? vendorNameMap[r.vendorId] : undefined,
        total: r.items.reduce((sum, i) => sum + i.quantity * i.estimatedRate, 0),
      })),
    [data, projectNameMap, vendorNameMap],
  )

  const fields = useMemo(
    () =>
      purchaseRequestFields.map((f) => {
        if (f.name === 'projectId') return { ...f, options: projectOptions }
        if (f.name === 'vendorId') return { ...f, options: vendorOptions }
        return f
      }),
    [projectOptions, vendorOptions],
  )

  const openRequest = openId ? (enriched.find((r) => r.id === openId) ?? null) : null

  return (
    <>
      <EntityListPage<PurchaseRequestRow>
        title="Purchase Requests"
        description="Raise material requests from site, get them approved, and turn them into purchase orders. Click a request to manage its items and status."
        data={enriched}
        columns={purchaseRequestColumns}
        fields={fields}
        keyField="id"
        moduleKey="inventory"
        historyEntity="PurchaseRequest"
        isLoading={isLoading}
        searchKeys={['title', 'projectName', 'vendorName']}
        entityLabel="purchase request"
        addButtonLabel="New Request"
        onRowClick={(row) => setOpenId(row.id)}
        onCreate={async (values) => {
          const created = await createMutation.mutateAsync(values as Partial<PurchaseRequest>)
          // Land straight in the dialog so the items can be added.
          setOpenId(created.id)
          return created
        }}
        onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<PurchaseRequest> })}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
      />

      <PurchaseRequestDialog request={openRequest} onOpenChange={(open) => !open && setOpenId(null)} />
    </>
  )
}
