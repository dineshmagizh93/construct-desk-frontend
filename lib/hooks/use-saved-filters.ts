"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"

interface SavedFilter {
  id: string
  name: string
  module: string
  filters: Record<string, any>
  createdAt: string
}

export function useSavedFilters(module: string) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFilters = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<SavedFilter[]>(`/saved-filters?module=${module}`)
      setSavedFilters(data)
    } catch {
      // non-critical
    } finally {
      setLoading(false)
    }
  }, [module])

  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  const saveFilter = async (name: string, filters: Record<string, any>) => {
    const created = await apiClient.post<SavedFilter>("/saved-filters", { name, module, filters })
    setSavedFilters((prev) => [created, ...prev])
    return created
  }

  const deleteFilter = async (id: string) => {
    await apiClient.delete(`/saved-filters/${id}`)
    setSavedFilters((prev) => prev.filter((f) => f.id !== id))
  }

  return { savedFilters, loading, saveFilter, deleteFilter, refetch: fetchFilters }
}
