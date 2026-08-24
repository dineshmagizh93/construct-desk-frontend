import { useNotificationsStore } from './store'

export function useNotifications() {
  const items = useNotificationsStore((state) => state.items)
  const markRead = useNotificationsStore((state) => state.markRead)
  const markAllRead = useNotificationsStore((state) => state.markAllRead)
  const remove = useNotificationsStore((state) => state.remove)
  return { items, markRead, markAllRead, remove }
}

export function useNotificationsUnreadCount() {
  return useNotificationsStore((state) => state.items.filter((n) => !n.read).length)
}
