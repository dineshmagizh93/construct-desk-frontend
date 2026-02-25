"use client"

import { useState, useEffect, useCallback } from "react"
import { projectsApi, ProjectStats } from "@/lib/api/projects"
import { ApiError } from "@/lib/api/client"

export function useProjectStats() {
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectsApi.getStats()
      setStats(data)
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load project statistics"
      
      // Provide more helpful error messages
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Stats API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading stats:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    error,
    loadStats,
  }
}

