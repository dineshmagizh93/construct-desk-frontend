import { create } from 'zustand'
import { nextId } from '@/lib/utils'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
}

interface ToastState {
  toasts: ToastItem[]
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function toast(item: Omit<ToastItem, 'id'>) {
  const id = nextId('toast')
  useToastStore.setState((state) => ({ toasts: [...state.toasts, { ...item, id }] }))
  return id
}

export function useToast() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)
  return { toasts, dismiss, toast }
}
