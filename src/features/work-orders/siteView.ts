import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'

/** What a site engineer is shown of a work order: scope and progress in quantities — never rates, retention or payments. */
export interface SiteWorkOrder {
  id: string
  title: string
  projectId: string
  vendor: { name: string } | null
  items: {
    id: string
    description: string
    unit: string | null
    quantity: number
    measurements: { id: string; date: string; quantity: number; notes: string | null; createdById: string | null }[]
  }[]
}

// Under the 'work-orders' key so recording or removing a measurement refreshes it along with everything else.
export const useSiteWorkOrders = () =>
  useQuery({ queryKey: ['work-orders', 'site-view'], queryFn: () => http<SiteWorkOrder[]>('/work-orders/site-view') })

/** Share of the ordered quantity measured so far, capped for the progress bar. */
export function percentMeasured(ordered: number, measured: number): number {
  if (ordered <= 0) return 0
  return Math.min(100, Math.round((measured / ordered) * 100))
}
