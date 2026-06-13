"use client"

import { useState, useEffect, useCallback } from "react"
import { auditLogApi, AuditLogEntry } from "@/lib/api/audit-log"

interface AuditLogFilters {
  module?: string
  userId?: string
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function useAuditLog(initialFilters: AuditLogFilters = {}) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogFilters>({ limit: 50, page: 1, ...initialFilters })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await auditLogApi.getAll(filters)
      setEntries(res.items)
      setTotal(res.total)
    } catch {
      // silently fail — audit log is non-critical UI
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const updateFilters = (updates: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }))
  }

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  return { entries, total, loading, filters, updateFilters, goToPage, refetch: fetchLogs }
}
