import { useInfiniteQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { ChangeMap } from './format'

export interface AuditEntry {
  id: string
  userId: string | null
  userName: string
  /** create | update | delete, or a named action such as approve or raise-invoice. */
  action: string
  /** The kind of record, e.g. Expense, PurchaseRequest. */
  entity: string
  entityId: string | null
  label: string | null
  changes: ChangeMap | null
  createdAt: string
}

interface AuditPage {
  items: AuditEntry[]
  /** createdAt of the last row, to fetch the next older page; null when there is no more. */
  nextBefore: string | null
}

export function useAuditLog(filters: { entity?: string; entityId?: string }) {
  return useInfiniteQuery({
    queryKey: ['audit-log', filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '50' })
      if (filters.entity) params.set('entity', filters.entity)
      if (filters.entityId) params.set('entityId', filters.entityId)
      if (pageParam) params.set('before', pageParam)
      return http<AuditPage>(`/audit-log?${params.toString()}`)
    },
    getNextPageParam: (last) => last.nextBefore,
  })
}
