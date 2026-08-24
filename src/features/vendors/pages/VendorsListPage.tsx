import { EntityListPage } from '@/components/shared/EntityListPage'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../api'
import { vendorColumns, vendorFields, vendorImportColumns } from '../config'
import type { Vendor } from '../types'

export function VendorsListPage() {
  const { data = [], isLoading } = useVendors()
  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const deleteMutation = useDeleteVendor()

  return (
    <EntityListPage<Vendor>
      title="Vendors & Suppliers"
      description="The material and service suppliers powering every site."
      moduleKey="vendors"
      data={data}
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
