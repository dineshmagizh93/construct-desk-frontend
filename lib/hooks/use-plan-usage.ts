"use client"

import { useState, useEffect, useCallback } from "react"
import { companyApi, PlanUsageStats } from "@/lib/api/company"
import { ApiError } from "@/lib/api/client"

const CACHE_DURATION = 60000 // 1 minute

let usageCache: { data: PlanUsageStats; timestamp: number } | null = null

export function usePlanUsage() {
  const [usage, setUsage] = useState<PlanUsageStats | null>(usageCache?.data || null)
  const [loading, setLoading] = useState(!usageCache)
  const [error, setError] = useState<string | null>(null)

  const loadUsage = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && usageCache && (now - usageCache.timestamp) < CACHE_DURATION) {
      setUsage(usageCache.data)
      setLoading(false)
      return
    }

    try {
      if (!usageCache || force) {
        setLoading(true)
      }
      setError(null)
      const data = await companyApi.getUsageStats()
      setUsage(data)
      usageCache = { data, timestamp: now }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load usage statistics")
      console.error("Error loading usage stats:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!usageCache || (now - usageCache.timestamp) >= CACHE_DURATION) {
      loadUsage()
    }
  }, [loadUsage])

  return {
    usage,
    loading,
    error,
    loadUsage,
  }
}
