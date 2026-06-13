import { apiClient } from "./client"

export interface AuditLogEntry {
  id: string
  companyId: string
  userId: string
  userEmail: string
  action: string
  module: string
  entityId?: string
  entityName?: string
  details?: string
  ipAddress?: string
  createdAt: string
}

export const auditLogApi = {
  getAll: (params?: {
    module?: string
    userId?: string
    action?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.module) query.set("module", params.module)
    if (params?.userId) query.set("userId", params.userId)
    if (params?.action) query.set("action", params.action)
    if (params?.startDate) query.set("startDate", params.startDate)
    if (params?.endDate) query.set("endDate", params.endDate)
    if (params?.page) query.set("page", String(params.page))
    if (params?.limit) query.set("limit", String(params.limit))
    return apiClient.get<{ items: AuditLogEntry[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `/audit-log?${query.toString()}`
    )
  },
}
