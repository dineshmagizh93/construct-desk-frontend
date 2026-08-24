import { useQuery } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Client } from './types'

export const clientsApi = createRestApi<Client>('/clients')
export const {
  useEntityList: useClients,
  useEntityCreate: useCreateClient,
  useEntityUpdate: useUpdateClient,
  useEntityRemove: useDeleteClient,
} = createEntityHooks('clients', clientsApi)

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.get(id as string),
    enabled: !!id,
  })
}
