import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'

export interface FinanceReport {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    outstanding: number
    /** Retention the clients are still withholding on issued bills. */
    retentionHeld: number
  }
  cashFlow: { month: string; inflow: number; outflow: number }[]
  /** What clients still owe (net of retention), grouped by how long past due. Always all five buckets, in order. */
  receivablesAging: { key: string; label: string; count: number; amount: number }[]
}

export function useFinanceReport() {
  return useQuery({ queryKey: ['reports', 'finance'], queryFn: () => http<FinanceReport>('/reports/finance') })
}
