import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'

export interface FinanceReport {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    outstanding: number
  }
  cashFlow: { month: string; inflow: number; outflow: number }[]
}

export function useFinanceReport() {
  return useQuery({ queryKey: ['reports', 'finance'], queryFn: () => http<FinanceReport>('/reports/finance') })
}
