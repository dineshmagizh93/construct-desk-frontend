import { useNotificationsQuery, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from './api'

export function useNotifications() {
  const { data: items = [] } = useNotificationsQuery()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()

  return {
    items,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(items.filter((n) => !n.read).map((n) => n.id)),
    remove: (id: string) => deleteMutation.mutate(id),
  }
}

export function useNotificationsUnreadCount() {
  const { data: items = [] } = useNotificationsQuery()
  return items.filter((n) => !n.read).length
}
