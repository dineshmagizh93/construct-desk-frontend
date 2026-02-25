"use client"

import { useState, useEffect, useCallback } from "react"
import { Labour } from "@/types/labour"
import { labourApi, CreateLabourDto, UpdateLabourDto } from "@/lib/api/labour"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let labourCache: { data: Labour[]; timestamp: number; projectId?: string } | null = null
const CACHE_DURATION = 30000 // 30 seconds

export function useLabour() {
  // Initialize with cache if available to prevent loading state
  const [labour, setLabour] = useState<Labour[]>(() => {
    const now = Date.now()
    if (labourCache && (now - labourCache.timestamp) < CACHE_DURATION) {
      return labourCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(labourCache && (now - labourCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadLabour = useCallback(async (projectId?: string, force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && labourCache && (now - labourCache.timestamp) < CACHE_DURATION && labourCache.projectId === projectId) {
      setLabour(labourCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!labourCache || force || labourCache.projectId !== projectId) {
        setLoading(true)
      }
      setError(null)
      const data = await labourApi.getAll(projectId)
      setLabour(data)
      // Update cache
      labourCache = { data, timestamp: now, projectId }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load labour"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Labour API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading labour:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Only load if no cached data
  useEffect(() => {
    const now = Date.now()
    if (!labourCache || (now - labourCache.timestamp) >= CACHE_DURATION) {
      loadLabour()
    }
  }, [loadLabour])

  const loadLabourByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await labourApi.getAll(projectId)
      return data
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load labour")
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createLabour = useCallback(async (labourData: CreateLabourDto) => {
    try {
      setError(null)
      const newLabour = await labourApi.create(labourData)
      setLabour((prev) => [...prev, newLabour])
      // Update cache
      if (labourCache) {
        labourCache.data = [...labourCache.data, newLabour]
        labourCache.timestamp = Date.now()
      }
      return newLabour
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create labour"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateLabour = useCallback(async (id: string, updates: UpdateLabourDto) => {
    try {
      setError(null)
      const updated = await labourApi.update(id, updates)
      setLabour((prev) => prev.map((l) => (l.id === id ? updated : l)))
      // Update cache
      if (labourCache) {
        labourCache.data = labourCache.data.map((l) => (l.id === id ? updated : l))
        labourCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update labour"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteLabour = useCallback(async (id: string) => {
    try {
      setError(null)
      await labourApi.delete(id)
      setLabour((prev) => prev.filter((l) => l.id !== id))
      // Update cache
      if (labourCache) {
        labourCache.data = labourCache.data.filter((l) => l.id !== id)
        labourCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete labour"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    labour,
    loading,
    error,
    loadLabour,
    loadLabourByProject,
    createLabour,
    updateLabour,
    deleteLabour,
  }
}

