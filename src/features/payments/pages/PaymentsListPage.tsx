import { useMemo, useState } from 'react'
import { SummaryStrip } from '@/components/shared/SummaryStrip'
import { formatCurrency } from '@/lib/utils'
import { summarisePayments } from '../summary'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '../api'
import { paymentColumns, paymentFields, paymentImportColumns } from '../config'
import { PaymentLineItemsDialog } from '../components/PaymentLineItemsDialog'
import type { Payment } from '../types'

export function PaymentsListPage() {
  const { data = [], isLoading } = usePayments()
  const createMutation = useCreatePayment()
  const updateMutation = useUpdatePayment()
  const deleteMutation = useDeletePayment()
  const [lineItemsPaymentId, setLineItemsPaymentId] = useState<string | null>(null)
  const lineItemsPayment = lineItemsPaymentId ? (data.find((p) => p.id === lineItemsPaymentId) ?? null) : null

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const summary = useMemo(() => summarisePayments(data), [data])
  const enriched = useMemo(
    () => data.map((p) => ({ ...p, projectName: projectNameMap[p.projectId] ?? p.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => paymentFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <>
      <EntityListPage<Payment & { projectName: string }>
        title="Payments & Invoices"
        description="Client invoices and payment status across every project."
        data={enriched}
        columns={paymentColumns}
        fields={fields}
        keyField="id"
        moduleKey="payments"
        historyEntity="Payment"
        summary={
          data.length > 0 ? (
            <SummaryStrip
              items={[
                { label: 'Outstanding', value: formatCurrency(summary.outstanding), hint: 'Net of retention' },
                { label: 'Overdue', value: formatCurrency(summary.overdueAmount), hint: `${summary.overdueCount} invoice${summary.overdueCount === 1 ? '' : 's'}`, tone: summary.overdueCount > 0 ? 'destructive' : undefined },
                { label: 'Collected', value: formatCurrency(summary.collected), tone: 'success' },
                { label: 'Retention held', value: formatCurrency(summary.retentionHeld), hint: 'Withheld by clients' },
              ]}
            />
          ) : undefined
        }
        isLoading={isLoading}
        searchKeys={['invoiceNumber', 'clientName', 'projectName']}
        entityLabel="invoice"
        onRowClick={(row) => setLineItemsPaymentId(row.id)}
        onCreate={(values) => createMutation.mutateAsync(values as Partial<Payment>)}
        onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Payment> })}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        importConfig={{ columns: paymentImportColumns, fileName: 'payments-template.xlsx' }}
        validateImportRow={(row) => {
          const code = String(row.projectId ?? '').trim()
          return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
        }}
      />

      <PaymentLineItemsDialog payment={lineItemsPayment} onOpenChange={(open) => !open && setLineItemsPaymentId(null)} />
    </>
  )
}
