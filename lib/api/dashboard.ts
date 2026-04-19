import { apiClient } from "./client"
import { Expense } from "@/types/expense"
import { Lead } from "@/types/lead"
import { Payment } from "@/types/payment"
import { Project } from "@/types/project"

export interface DashboardSummary {
  metrics: {
    projects: {
      total: number
      inProgress: number
      completed: number
      planning: number
      onHold: number
      overdue: number
      avgProgress: number
      totalBudget: number
    }
    financial: {
      totalPayments: number
      totalExpenses: number
      pendingPayments: number
      overduePayments: number
      netProfit: number
      expenseCount: number
    }
    leads: {
      totalLeads: number
      totalClients: number
      newLeads: number
      converted: number
    }
    inventory: {
      totalItems: number
      lowStockCount: number
      inventoryValue: number
    }
  }
  recentProjects: Project[]
  recentPayments: Payment[]
  recentExpenses: Expense[]
  recentLeads: Lead[]
}

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>("/dashboard/summary")
  },
}
