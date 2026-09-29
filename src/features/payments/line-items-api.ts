import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { PaymentLineItem } from './types'

interface LineItemInput {
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

export function useCreateLineItem(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LineItemInput) =>
      http<PaymentLineItem>(`/payments/${paymentId}/line-items`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useUpdateLineItem(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LineItemInput> }) =>
      http<PaymentLineItem>(`/payments/${paymentId}/line-items/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteLineItem(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/payments/${paymentId}/line-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
