"use client"

import { useState, useEffect, useCallback } from "react"
import { SiteProgress } from "@/types/site-progress"
import { siteProgressApi, CreateSiteProgressDto, UpdateSiteProgressDto } from "@/lib/api/site-progress"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let siteProgressCache: { data: SiteProgress[]; timestamp: number; projectId?: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useSiteProgress() {
  // Initialize with cache if available to prevent loading state
  const [progress, setProgress] = useState<SiteProgress[]>(() => {
    const now = Date.now()
    if (siteProgressCache && (now - siteProgressCache.timestamp) < CACHE_DURATION) {
      return siteProgressCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(siteProgressCache && (now - siteProgressCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadProgress = useCallback(async (projectId?: string, force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && siteProgressCache && (now - siteProgressCache.timestamp) < CACHE_DURATION && siteProgressCache.projectId === projectId) {
      setProgress(siteProgressCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!siteProgressCache || force || siteProgressCache.projectId !== projectId) {
        setLoading(true)
      }
      setError(null)
      const data = await siteProgressApi.getAll(projectId)
      const sortedData = data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setProgress(sortedData)
      // Update cache
      siteProgressCache = { data: sortedData, timestamp: now, projectId }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load site progress"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Site Progress API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading site progress:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!siteProgressCache || (now - siteProgressCache.timestamp) >= CACHE_DURATION) {
      loadProgress()
    }
  }, [loadProgress])

  const loadProgressByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await siteProgressApi.getAll(projectId)
      return data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load site progress")
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createProgress = useCallback(async (progressData: CreateSiteProgressDto) => {
    try {
      setError(null)
      const newProgress = await siteProgressApi.create(progressData)
      const updated = [newProgress, ...progress].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setProgress(updated)
      // Update cache
      if (siteProgressCache) {
        siteProgressCache.data = updated
        siteProgressCache.timestamp = Date.now()
      }
      return newProgress
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create site progress"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [progress])

  const updateProgress = useCallback(async (id: string, updates: UpdateSiteProgressDto) => {
    try {
      setError(null)
      const updated = await siteProgressApi.update(id, updates)
      const updatedList = progress.map((p) => (p.id === id ? updated : p)).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setProgress(updatedList)
      // Update cache
      if (siteProgressCache) {
        siteProgressCache.data = updatedList
        siteProgressCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update site progress"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [progress])

  const deleteProgress = useCallback(async (id: string) => {
    try {
      setError(null)
      await siteProgressApi.delete(id)
      setProgress((prev) => prev.filter((p) => p.id !== id))
      // Update cache
      if (siteProgressCache) {
        siteProgressCache.data = siteProgressCache.data.filter((p) => p.id !== id)
        siteProgressCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete site progress"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    progress,
    loading,
    error,
    loadProgress,
    loadProgressByProject,
    createProgress,
    updateProgress,
    deleteProgress,
  }
}

