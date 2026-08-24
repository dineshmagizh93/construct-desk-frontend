import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { InventoryItem } from './types'

export const inventoryApi = createRestApi<InventoryItem>('/inventory')
export const {
  useEntityList: useInventory,
  useEntityCreate: useCreateInventoryItem,
  useEntityUpdate: useUpdateInventoryItem,
  useEntityRemove: useDeleteInventoryItem,
} = createEntityHooks('inventory', inventoryApi)
