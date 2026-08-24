import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { CompanyUser, RoleOption } from './types'

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => http<CompanyUser[]>('/users') })
}

export function useRoleOptions() {
  return useQuery({ queryKey: ['users', 'role-options'], queryFn: () => http<RoleOption[]>('/users/roles/options') })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => http<CompanyUser>('/users', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User added', description: 'Team member created successfully.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      http<CompanyUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'Updated', description: 'User saved.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'Deactivated', description: 'User has been deactivated.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
