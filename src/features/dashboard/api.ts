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

export interface StageCount { status: string; count: number }
export interface WorkloadBar { id: string; name: string; code: string; completed: number; remaining: number; overdue: number }

/**
 * One entry per module, straight from that module's own records. A card is null when the signed-in person
 * cannot open that module, so the page leaves it out (see backend modules/dashboard/routes.ts).
 */
export interface DashboardCards {
  leads: { pipeline: number; quiet: number } | null
  projects: { running: number; onHold: number; behind: number; total: number } | null
  tasks: { open: number; overdue: number } | null
  siteProgress: { reportsThisWeek: number; lastReport: string | null } | null
  invoices: { overdue: number; overdueAmount: number; toCollect: number } | null
  expenses: { awaitingApproval: number } | null
  stock: { low: number; total: number } | null
  equipment: { dueForService: number; total: number } | null
}

export interface DashboardCharts {
  leadsByStage: StageCount[] | null
  projectsByStatus: StageCount[] | null
  tasksByProject: WorkloadBar[] | null
}

export interface DashboardData {
  cards: DashboardCards
  charts: DashboardCharts
  attention: AttentionItem[]
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => http<DashboardData>('/dashboard') })
}
