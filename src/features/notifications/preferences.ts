import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'

export interface NotificationCategoryInfo {
  key: string
  label: string
  description: string
}

export interface NotificationPreferences {
  categories: NotificationCategoryInfo[]
  /** Category keys this person has switched off. */
  muted: string[]
}

/** The muted list after switching one category on (receive = true) or off, without duplicates or reordering the rest. */
export function withCategory(muted: string[], key: string, receive: boolean): string[] {
  const rest = muted.filter((k) => k !== key)
  return receive ? rest : [...rest, key]
}

export function useNotificationPreferences() {
  return useQuery({ queryKey: ['notifications', 'preferences'], queryFn: () => http<NotificationPreferences>('/notifications/preferences') })
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (muted: string[]) => http<NotificationPreferences>('/notifications/preferences', { method: 'PUT', body: JSON.stringify({ muted }) }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['notifications', 'preferences'], saved)
      // What is hidden or shown changes immediately, including the unread dot in the top bar.
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: true })
    },
    onError: (error: Error) => toast({ title: 'Could not save your choice', description: error.message, variant: 'destructive' }),
  })
}
