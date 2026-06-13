import { apiClient } from "./client"

export interface Notification {
  id: string
  userId: string
  companyId: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<{ items: Notification[]; total: number; unreadCount: number }>(`/notifications?page=${page}&limit=${limit}`),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count"),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    apiClient.patch("/notifications/mark-all-read", {}),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),

  deleteAll: () =>
    apiClient.delete("/notifications"),
}
