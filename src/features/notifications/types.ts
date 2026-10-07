export interface NotificationItem {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
  /** In-app path opened when the notification is clicked (e.g. "/payments"); absent on older ones. */
  link?: string | null
  type: 'info' | 'success' | 'warning' | 'destructive'
}
