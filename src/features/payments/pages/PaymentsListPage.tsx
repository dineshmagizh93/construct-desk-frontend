import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '../api'
import { paymentColumns, paymentFields, paymentImportColumns } from '../config'
import type { Payment } from '../types'

export function PaymentsListPage() {
  const { data = [], isLoading } = usePayments()
  const createMutation = useCreatePayment()
  const updateMutation = useUpdatePayment()
  const deleteMutation = useDeletePayment()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((p) => ({ ...p, projectName: projectNameMap[p.projectId] ?? p.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => paymentFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<Payment & { projectName: string }>
      title="Payments & Invoices"
      description="Client invoices and payment status across every project."
      data={enriched}
      columns={paymentColumns}
      fields={fields}
      keyField="id"
      moduleKey="payments"
      isLoading={isLoading}
      searchKeys={['invoiceNumber', 'clientName', 'projectName']}
      entityLabel="invoice"
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Payment>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Payment> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: paymentImportColumns, fileName: 'payments-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
