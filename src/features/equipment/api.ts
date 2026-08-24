import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Equipment } from './types'

export const equipmentApi = createRestApi<Equipment>('/equipment')
export const {
  useEntityList: useEquipment,
  useEntityCreate: useCreateEquipment,
  useEntityUpdate: useUpdateEquipment,
  useEntityRemove: useDeleteEquipment,
} = createEntityHooks('equipment', equipmentApi)
