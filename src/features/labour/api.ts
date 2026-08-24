import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { LabourRecord } from './types'

export const labourApi = createRestApi<LabourRecord>('/labour')
export const {
  useEntityList: useLabour,
  useEntityCreate: useCreateLabour,
  useEntityUpdate: useUpdateLabour,
  useEntityRemove: useDeleteLabour,
} = createEntityHooks('labour', labourApi)
