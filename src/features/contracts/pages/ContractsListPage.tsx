import { useMemo, useState } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useVendorOptions, useVendorNameMap } from '@/features/vendors/hooks'
import { useAuth } from '@/hooks/useAuth'
import { statusOptionsFor } from '../approval'
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '../api'
import { contractColumns, contractFields, contractImportColumns } from '../config'
import { ContractBillingDialog } from '../components/ContractBillingDialog'
import type { Contract } from '../types'

export function ContractsListPage() {
  const { data = [], isLoading } = useContracts()
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const deleteMutation = useDeleteContract()
  const { user } = useAuth()

  const [billingId, setBillingId] = useState<string | null>(null)

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()
  const vendorOptions = useVendorOptions()
  const vendorNameMap = useVendorNameMap()

  const enriched = useMemo(
    () => data.map((c) => ({ ...c, projectName: projectNameMap[c.projectId] ?? c.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () =>
      contractFields.map((f) => {
        if (f.name === 'projectId') return { ...f, options: projectOptions }
        if (f.name === 'vendorId') return { ...f, options: vendorOptions }
        return f
      }),
    [projectOptions, vendorOptions],
  )

  // vendorId is the authoritative link when a real Vendor record was picked; party is denormalized
  // from it, or left as free text for a counterparty not in the vendor list (vendorId null).
  function reconcileVendor(values: Record<string, unknown>) {
    const vendorId = values.vendorId ? String(values.vendorId) : ''
    return {
      ...values,
      vendorId: vendorId || null,
      party: vendorId ? (vendorNameMap[vendorId] ?? String(values.party ?? '')) : String(values.party ?? ''),
    }
  }

  const billingContract = billingId ? (enriched.find((c) => c.id === billingId) ?? null) : null

  return (
    <>
    <EntityListPage<Contract & { projectName: string }>
      title="Contracts & Purchase Orders"
      description="Client contracts and vendor purchase orders, tracked from draft to approval."
      data={enriched}
      columns={contractColumns}
      fields={fields}
      // Only administrators can approve or reject; everyone else picks draft or pending (the server enforces it).
      getFields={(row) => fields.map((f) => (f.name === 'status' ? { ...f, options: statusOptionsFor(user?.role, row?.status) } : f))}
      keyField="id"
      moduleKey="contracts"
      historyEntity="Contract"
      isLoading={isLoading}
      searchKeys={['title', 'party', 'projectName']}
      entityLabel="contract"
      onRowClick={(row) => setBillingId(row.id)}
      onCreate={(values) => createMutation.mutateAsync(reconcileVendor(values) as Partial<Contract>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: reconcileVendor(values) as Partial<Contract> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: contractImportColumns, fileName: 'contracts-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />

    <ContractBillingDialog contract={billingContract} onOpenChange={(open) => !open && setBillingId(null)} />
    </>
  )
}
