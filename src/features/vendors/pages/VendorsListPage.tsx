import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useContracts } from '@/features/contracts/api'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../api'
import { vendorColumns, vendorFields, vendorImportColumns, type VendorRow } from '../config'
import type { Vendor } from '../types'

export function VendorsListPage() {
  const { data = [], isLoading } = useVendors()
  const { data: contracts = [] } = useContracts()
  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const deleteMutation = useDeleteVendor()

  // Contracts/POs linked to each vendor via Contract.vendorId (rejected ones don't count as business).
  const enriched = useMemo<VendorRow[]>(
    () =>
      data.map((v) => {
        const linked = contracts.filter((c) => c.vendorId === v.id && c.status !== 'rejected')
        return { ...v, contractCount: linked.length, contractValue: linked.reduce((sum, c) => sum + c.amount, 0) }
      }),
    [data, contracts],
  )

  return (
    <EntityListPage<VendorRow>
      title="Vendors & Suppliers"
      description="The material and service suppliers powering every site."
      moduleKey="vendors"
      data={enriched}
      columns={vendorColumns}
      fields={vendorFields}
      keyField="id"
      isLoading={isLoading}
      searchKeys={['name', 'category', 'contactPerson']}
      entityLabel="vendor"
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Vendor>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Vendor> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: vendorImportColumns, fileName: 'vendors-template.xlsx' }}
    />
  )
}
