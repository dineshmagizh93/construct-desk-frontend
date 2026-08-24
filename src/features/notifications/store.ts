import { create } from 'zustand'
import type { NotificationItem } from './types'
import { NOTIFICATIONS_SEED } from './data.mock'

interface NotificationsState {
  items: NotificationItem[]
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: NOTIFICATIONS_SEED,
  markRead: (id) =>
    set((state) => ({ items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () => set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
  remove: (id) => set((state) => ({ items: state.items.filter((n) => n.id !== id) })),
}))
