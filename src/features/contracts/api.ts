import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Contract } from './types'

export const contractsApi = createRestApi<Contract>('/contracts')
export const {
  useEntityList: useContracts,
  useEntityCreate: useCreateContract,
  useEntityUpdate: useUpdateContract,
  useEntityRemove: useDeleteContract,
} = createEntityHooks('contracts', contractsApi)
