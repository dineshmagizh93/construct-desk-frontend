import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { StockTransaction } from './types'

interface StockMovementInput {
  type: 'received' | 'issued' | 'returned' | 'adjustment'
  quantity: number
  date?: string
  reference?: string
  notes?: string
}

// Keyed under ['inventory', …] so any inventory invalidation (including edits made through the
// item form, which also write ledger rows) refreshes the open ledger too.
export function useStockTransactions(itemId: string | undefined) {
  return useQuery({
    queryKey: ['inventory', 'transactions', itemId],
    queryFn: () => http<StockTransaction[]>(`/inventory/${itemId}/transactions`),
    enabled: !!itemId,
  })
}

export function useRecordStockMovement(itemId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: StockMovementInput) =>
      http<StockTransaction>(`/inventory/${itemId}/transactions`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({ title: 'Stock updated', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
