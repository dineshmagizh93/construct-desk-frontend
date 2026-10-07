import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { PurchaseRequest, PurchaseRequestItem } from './types'

export const purchaseRequestsApi = createRestApi<PurchaseRequest>('/purchase-requests')
export const {
  useEntityList: usePurchaseRequests,
  useEntityCreate: useCreatePurchaseRequest,
  useEntityUpdate: useUpdatePurchaseRequest,
  useEntityRemove: useDeletePurchaseRequest,
} = createEntityHooks('purchase-requests', purchaseRequestsApi)

export interface ItemInput {
  inventoryItemId?: string
  description?: string
  quantity: number
  unit?: string
  estimatedRate?: number
}

const onError = (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' })

export function useAddRequestItem(requestId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ItemInput) =>
      http<PurchaseRequestItem>(`/purchase-requests/${requestId}/items`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] }),
    onError,
  })
}

export function useDeleteRequestItem(requestId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => http<void>(`/purchase-requests/${requestId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-requests'] }),
    onError,
  })
}

export type RequestAction = 'approve' | 'reject' | 'create-po' | 'receive'

const ACTION_TOAST: Record<RequestAction, string> = {
  approve: 'Request approved',
  reject: 'Request rejected',
  'create-po': 'Purchase order created',
  receive: 'Marked as received — stock updated',
}

export function useRequestAction(requestId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, note, vendorId }: { action: RequestAction; note?: string; vendorId?: string }) =>
      http<PurchaseRequest>(`/purchase-requests/${requestId}/${action}`, { method: 'POST', body: JSON.stringify({ note, vendorId }) }),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      // A PO shows up in Contracts; receiving moves stock and the ledger.
      if (action === 'create-po') queryClient.invalidateQueries({ queryKey: ['contracts'] })
      if (action === 'receive') queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({ title: ACTION_TOAST[action], variant: 'success' })
    },
    onError,
  })
}
