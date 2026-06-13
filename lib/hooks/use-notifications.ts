"use client"

import * as React from "react"
import { notificationsApi, Notification } from "../api/notifications"

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const fetchNotifications = React.useCallback(async () => {
    try {
      const data = await notificationsApi.getAll(1, 20)
      setNotifications(data.items)
      setUnreadCount(data.unreadCount)
    } catch {
      // Silently fail - notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = React.useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }, [])

  const markAllAsRead = React.useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }, [])

  const deleteNotification = React.useCallback(async (id: string) => {
    try {
      await notificationsApi.delete(id)
      const target = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {}
  }, [notifications])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications }
}
