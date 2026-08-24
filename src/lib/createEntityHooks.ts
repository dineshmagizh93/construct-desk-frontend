import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MockApi } from './createMockApi'
import { toast } from '@/hooks/use-toast'

export function createEntityHooks<T extends { id: string }>(queryKey: string, api: MockApi<T>) {
  function useEntityList() {
    return useQuery({ queryKey: [queryKey], queryFn: api.list })
  }

  function useEntityCreate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (values: Partial<T>) => api.create(values),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        toast({ title: 'Created', description: 'Record created successfully.', variant: 'success' })
      },
      onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
    })
  }

  function useEntityUpdate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, values }: { id: string; values: Partial<T> }) => api.update(id, values),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        toast({ title: 'Updated', description: 'Changes saved.', variant: 'success' })
      },
      onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
    })
  }

  function useEntityRemove() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        toast({ title: 'Deleted', description: 'Record removed.', variant: 'success' })
      },
      onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
    })
  }

  return { useEntityList, useEntityCreate, useEntityUpdate, useEntityRemove }
}
