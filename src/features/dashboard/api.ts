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

/** Budget, progress and late/over-budget counts for the projects on screen (see backend shared/projectMonitoring.ts). */
export interface ProjectSummary {
  projectCount: number
  budget: number
  spent: number
  utilizedPercent: number | null
  completionRate: number | null
  behindSchedule: number
  overBudget: number
}

export interface TaskSummary { open: number; overdue: number }
export interface MoneySummary { pendingPayments: number; overdueInvoices: number; overdueAmount: number; revenueThisMonth: number }
export interface TrendPoint { month: string; revenue: number; expense: number }
export interface BudgetBar { id: string; name: string; code: string; budget: number; spent: number }
export interface CostSlice { category: string; amount: number; percent: number }
export interface WorkloadBar { id: string; name: string; code: string; completed: number; remaining: number; overdue: number }

/** Each part is null when the signed-in user can't see that data, so the page leaves it out. */
export interface Monitoring {
  summary: ProjectSummary
  tasks: TaskSummary | null
  money: MoneySummary | null
  trend: TrendPoint[] | null
  budgetByProject: BudgetBar[]
  costBreakdown: CostSlice[] | null
  workload: WorkloadBar[] | null
}

export interface DashboardData {
  monitoring: Monitoring | null
  attention: AttentionItem[]
}

/** "all" means no filter on that dimension. */
export interface DashboardFilters {
  projectId: string
  status: string
}

export const DEFAULT_FILTERS: DashboardFilters = { projectId: 'all', status: 'all' }

export function useDashboard(filters: DashboardFilters) {
  const params = new URLSearchParams()
  if (filters.projectId !== 'all') params.set('projectId', filters.projectId)
  if (filters.status !== 'all') params.set('status', filters.status)
  const query = params.toString()
  return useQuery({ queryKey: ['dashboard', filters.projectId, filters.status], queryFn: () => http<DashboardData>(`/dashboard${query ? `?${query}` : ''}`) })
}
