import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { CompanyRole } from './types'
import type { PermissionMap } from '@/lib/modules'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: () => http<CompanyRole[]>('/roles') })
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => http<CompanyRole>(`/roles/${id}`),
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: { name: string; description?: string; permissions: PermissionMap }) =>
      http<CompanyRole>('/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          permissions: Object.entries(values.permissions).map(([moduleKey, p]) => ({
            moduleKey,
            canView: p.view,
            canCreate: p.create,
            canEdit: p.edit,
            canDelete: p.delete,
          })),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast({ title: 'Role created', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: { name?: string; description?: string | null; permissions?: PermissionMap }
    }) =>
      http<CompanyRole>(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...(values.name !== undefined ? { name: values.name } : {}),
          ...(values.description !== undefined ? { description: values.description } : {}),
          ...(values.permissions
            ? {
                permissions: Object.entries(values.permissions).map(([moduleKey, p]) => ({
                  moduleKey,
                  canView: p.view,
                  canCreate: p.create,
                  canEdit: p.edit,
                  canDelete: p.delete,
                })),
              }
            : {}),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast({ title: 'Role updated', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast({ title: 'Role deleted', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
