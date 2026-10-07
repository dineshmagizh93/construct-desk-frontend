import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { Payment } from '@/features/payments/types'

export interface RaiseInvoiceInput {
  /** Exactly one of percent / amount. */
  percent?: number
  amount?: number
  retentionPercent?: number
  dueDate?: string
  description?: string
}

export interface RaiseInvoiceResult {
  invoice: Payment
  billed: number
  remaining: number
}

export function useRaiseInvoice(contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: RaiseInvoiceInput) =>
      http<RaiseInvoiceResult>(`/contracts/${contractId}/invoices`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      // Outstanding receivables move on the dashboard and finance report.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast({ title: 'Invoice raised', description: `${result.invoice.invoiceNumber} is in Payments & Invoices.`, variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Could not raise invoice', description: error.message, variant: 'destructive' }),
  })
}
