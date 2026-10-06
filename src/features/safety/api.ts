import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { SafetyIncident } from './types'

export const safetyApi = createRestApi<SafetyIncident>('/safety-incidents')
export const {
  useEntityList: useSafetyIncidents,
  useEntityCreate: useCreateSafetyIncident,
  useEntityUpdate: useUpdateSafetyIncident,
  useEntityRemove: useDeleteSafetyIncident,
} = createEntityHooks('safety-incidents', safetyApi)
