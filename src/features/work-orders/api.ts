import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { WorkOrder } from './types'

export const workOrdersApi = createRestApi<WorkOrder>('/work-orders')
export const {
  useEntityList: useWorkOrders,
  useEntityCreate: useCreateWorkOrder,
  useEntityUpdate: useUpdateWorkOrder,
  useEntityRemove: useDeleteWorkOrder,
} = createEntityHooks('work-orders', workOrdersApi)

const onError = (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' })

export interface ItemInput {
  description: string
  unit?: string
  quantity: number
  rate: number
}

export function useWorkOrderItems(orderId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['work-orders'] })
  const base = `/work-orders/${orderId}/items`
  return {
    add: useMutation({ mutationFn: (v: ItemInput) => http(base, { method: 'POST', body: JSON.stringify(v) }), onSuccess: invalidate, onError }),
    update: useMutation({
      mutationFn: ({ id, ...v }: Partial<ItemInput> & { id: string }) => http(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(v) }),
      onSuccess: invalidate,
      onError,
    }),
    remove: useMutation({ mutationFn: (id: string) => http(`${base}/${id}`, { method: 'DELETE' }), onSuccess: invalidate, onError }),
  }
}

export interface MeasurementInput {
  date: string
  quantity: number
  notes?: string
}

export function useMeasurements(orderId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['work-orders'] })
  return {
    add: useMutation({
      mutationFn: ({ itemId, ...v }: MeasurementInput & { itemId: string }) =>
        http(`/work-orders/${orderId}/items/${itemId}/measurements`, { method: 'POST', body: JSON.stringify(v) }),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Measurement recorded', variant: 'success' })
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: ({ itemId, id }: { itemId: string; id: string }) =>
        http(`/work-orders/${orderId}/items/${itemId}/measurements/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
      onError,
    }),
  }
}

export interface PaymentInput {
  date: string
  amount: number
  reference?: string
  notes?: string
}

export function useWorkOrderPayments(orderId: string) {
  const queryClient = useQueryClient()
  // Every payment raises (or removes) a linked expense, so the Expenses list and project spend move too.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['work-orders'] })
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }
  return {
    add: useMutation({
      mutationFn: (v: PaymentInput) => http(`/work-orders/${orderId}/payments`, { method: 'POST', body: JSON.stringify(v) }),
      onSuccess: () => {
        invalidate()
        toast({ title: 'Payment recorded', variant: 'success' })
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => http(`/work-orders/${orderId}/payments/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
      onError,
    }),
  }
}
