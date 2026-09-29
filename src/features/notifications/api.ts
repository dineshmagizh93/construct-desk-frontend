import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import type { NotificationItem } from './types'

export const notificationsApi = createRestApi<NotificationItem>('/notifications')

export function useNotificationsQuery() {
  return useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// No dedicated bulk-read backend route exists — reuse the generic PUT /notifications/:id per item,
// same as how the rest of the app has no bulk endpoints.
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (unreadIds: string[]) => Promise.all(unreadIds.map((id) => notificationsApi.update(id, { read: true }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
