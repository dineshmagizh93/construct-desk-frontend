import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Estimate } from './types'

export const estimatesApi = createRestApi<Estimate>('/estimates')
export const {
  useEntityList: useEstimates,
  useEntityCreate: useCreateEstimate,
  useEntityUpdate: useUpdateEstimate,
  useEntityRemove: useDeleteEstimate,
} = createEntityHooks('estimates', estimatesApi)
