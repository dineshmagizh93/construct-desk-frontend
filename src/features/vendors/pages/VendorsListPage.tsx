import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { SummaryStrip } from '@/components/shared/SummaryStrip'
import { useContracts } from '@/features/contracts/api'
import { workOrdersApi } from '@/features/work-orders/api'
import { usePermission } from '@/lib/permissions'
import { formatCurrency } from '@/lib/utils'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../api'
import { VENDOR_STATUS_OPTIONS, vendorColumns, vendorFields, vendorImportColumns, type VendorRow } from '../config'
import { summarisePayables, vendorPayables } from '../payables'
import type { Vendor } from '../types'

export function VendorsListPage() {
  const { data = [], isLoading } = useVendors()
  const { data: contracts = [] } = useContracts()
  // Subcontract balances come from work orders, so they are only read (and shown) for people who may open them.
  const canSeePayables = usePermission('contracts', 'view')
  const { data: workOrders = [] } = useQuery({ queryKey: ['work-orders'], queryFn: workOrdersApi.list, enabled: canSeePayables })
  const payables = useMemo(() => vendorPayables(workOrders), [workOrders])
  const payableSummary = useMemo(() => summarisePayables(payables), [payables])
  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const deleteMutation = useDeleteVendor()

  // Contracts/POs linked to each vendor via Contract.vendorId (rejected ones don't count as business).
  const enriched = useMemo<VendorRow[]>(
    () =>
      data.map((v) => {
        const linked = contracts.filter((c) => c.vendorId === v.id && c.status !== 'rejected')
        return {
          ...v,
          contractCount: linked.length,
          contractValue: linked.reduce((sum, c) => sum + c.amount, 0),
          payable: canSeePayables ? (payables.get(v.id)?.owed ?? 0) : undefined,
        }
      }),
    [data, contracts, payables, canSeePayables],
  )

  const columns = useMemo(
    () => [
      ...vendorColumns,
      ...(canSeePayables
        ? [{ key: 'payable', header: 'Payable', className: 'text-right', render: (row: VendorRow) => (row.payable ? <span className="font-medium text-warning">{formatCurrency(row.payable)}</span> : '—') }]
        : []),
    ],
    [canSeePayables],
  )

  return (
    <EntityListPage<VendorRow>
      title="Vendors & Suppliers"
      description="The material and service suppliers powering every site."
      moduleKey="vendors"
      historyEntity="Vendor"
      bulkStatus={{ field: 'status', options: VENDOR_STATUS_OPTIONS }}
      data={enriched}
      columns={columns}
      summary={
        canSeePayables && data.length > 0 ? (
          <SummaryStrip
            items={[
              { label: 'Payable to subcontractors', value: formatCurrency(payableSummary.totalOwed), hint: 'Work done, not yet paid', tone: payableSummary.totalOwed > 0 ? 'warning' : undefined },
              { label: 'Vendors owed', value: String(payableSummary.vendorsOwed) },
              { label: 'Advances paid', value: formatCurrency(payableSummary.totalAdvance), hint: 'Paid ahead of work done' },
            ]}
          />
        ) : undefined
      }
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
