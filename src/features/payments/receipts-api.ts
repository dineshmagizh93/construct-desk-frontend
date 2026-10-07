import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { PaymentReceipt } from './types'

export interface ReceiptInput {
  amount: number
  date?: string
  method?: string
  reference?: string
  notes?: string
}

// A receipt moves the invoice's status and the receivables / revenue figures, so refresh all of them.
function useRefresh() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useAddReceipt(paymentId: string) {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (values: ReceiptInput) => http<PaymentReceipt>(`/payments/${paymentId}/receipts`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      refresh()
      toast({ title: 'Payment recorded', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Could not record the payment', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteReceipt(paymentId: string) {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (receiptId: string) => http(`/payments/${paymentId}/receipts/${receiptId}`, { method: 'DELETE' }),
    onSuccess: refresh,
    onError: (error: Error) => toast({ title: 'Could not remove the payment', description: error.message, variant: 'destructive' }),
  })
}
