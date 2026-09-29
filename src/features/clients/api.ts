import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { Client, ClientContactLog } from './types'

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

export function useAddClientContactLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clientId, note, date }: { clientId: string; note: string; date?: string }) =>
      http<ClientContactLog>(`/clients/${clientId}/contact-log`, {
        method: 'POST',
        body: JSON.stringify({ note, date: date ?? new Date().toISOString() }),
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clients', vars.clientId] })
      toast({ title: 'Note added', description: 'Saved to this client.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
