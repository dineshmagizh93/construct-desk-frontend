import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Payment } from './types'

export const paymentsApi = createRestApi<Payment>('/payments')
export const {
  useEntityList: usePayments,
  useEntityCreate: useCreatePayment,
  useEntityUpdate: useUpdatePayment,
  useEntityRemove: useDeletePayment,
} = createEntityHooks('payments', paymentsApi)
