import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { WorkOrder } from './types'

/** Releases the retention held on a completed work order, so it becomes payable to the subcontractor. */
export function useReleaseWorkOrderRetention(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => http<WorkOrder>(`/work-orders/${orderId}/release-retention`, { method: 'POST', body: JSON.stringify({}) }),
    onSuccess: () => {
      // The balance owed (and the vendor payables built from it) change.
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      toast({ title: 'Retention released', description: 'It now counts as payable — record a payment when you pay it.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Could not release the retention', description: error.message, variant: 'destructive' }),
  })
}
