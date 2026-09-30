import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { EstimateLineItem } from './types'

interface LineItemInput {
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

export function useCreateEstimateLineItem(estimateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LineItemInput) =>
      http<EstimateLineItem>(`/estimates/${estimateId}/line-items`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estimates'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useUpdateEstimateLineItem(estimateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<LineItemInput> }) =>
      http<EstimateLineItem>(`/estimates/${estimateId}/line-items/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estimates'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteEstimateLineItem(estimateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/estimates/${estimateId}/line-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estimates'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
