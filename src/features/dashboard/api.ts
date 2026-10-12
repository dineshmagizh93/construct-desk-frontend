import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'

export interface AttentionItem {
  key: string
  label: string
  count: number
  amount?: number
  to: string
  tone: 'warning' | 'destructive' | 'info'
}

/** A `null` figure means the signed-in user can't see that data, so its card is hidden. */
export interface DashboardData {
  kpis: {
    activeProjects: number | null
    revenueMtd: number | null
    pendingPayments: number | null
    openTasks: number | null
  }
  revenueTrend: { month: string; revenue: number; expense: number }[] | null
  attention: AttentionItem[]
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => http<DashboardData>('/dashboard') })
}
