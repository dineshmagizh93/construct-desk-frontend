import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Vendor } from './types'

export const vendorsApi = createRestApi<Vendor>('/vendors')
export const {
  useEntityList: useVendors,
  useEntityCreate: useCreateVendor,
  useEntityUpdate: useUpdateVendor,
  useEntityRemove: useDeleteVendor,
} = createEntityHooks('vendors', vendorsApi)
