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

export interface DashboardActivity {
  id: string
  type: 'lead' | 'payment' | 'task' | 'site'
  title: string
  description: string
  timestamp: string | null
}

/** A `null` figure means the signed-in user can't see that data, so its card is hidden. */
export interface DashboardData {
  kpis: {
    activeProjects: number | null
    revenueMtd: number | null
    pendingPayments: number | null
    retentionHeld: number | null
    openTasks: number | null
    leadsInPipeline: number | null
    lowStockItems: number | null
  }
  revenueTrend: { month: string; revenue: number; expense: number }[] | null
  projectsByStatus: { status: string; count: number }[] | null
  attention: AttentionItem[]
  activity: DashboardActivity[]
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => http<DashboardData>('/dashboard') })
}
