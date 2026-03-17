"use client"

import { useState, useEffect, useCallback } from "react"
import { Project } from "@/types/project"
import { projectsApi, CreateProjectDto, UpdateProjectDto } from "@/lib/api/projects"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let projectsCache: { data: Project[]; timestamp: number } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useProjects() {
  // Initialize with cache if available to prevent loading state
  const [projects, setProjects] = useState<Project[]>(() => {
    const now = Date.now()
    if (projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION) {
      return projectsCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async (force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION) {
      setProjects(projectsCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!projectsCache || force) {
        setLoading(true)
      }
      setError(null)
      const data = await projectsApi.getAll()
      setProjects(data)
      // Update cache
      projectsCache = { data, timestamp: now }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load projects"
      
      // Provide more helpful error messages
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Projects API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading projects:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!projectsCache || (now - projectsCache.timestamp) >= CACHE_DURATION) {
      loadProjects()
    }
  }, [loadProjects])

  const createProject = useCallback(async (project: CreateProjectDto) => {
    try {
      setError(null)
      const newProject = await projectsApi.create(project)
      setProjects((prev) => [...prev, newProject])
      // Invalidate cache
      if (projectsCache) {
        projectsCache.data = [...projectsCache.data, newProject]
        projectsCache.timestamp = Date.now()
      }
      return newProject
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create project"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateProject = useCallback(async (id: string, updates: UpdateProjectDto) => {
    try {
      setError(null)
      const updated = await projectsApi.update(id, updates)
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
      // Update cache
      if (projectsCache) {
        projectsCache.data = projectsCache.data.map((p) => (p.id === id ? updated : p))
        projectsCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update project"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    try {
      setError(null)
      await projectsApi.delete(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      // Update cache
      if (projectsCache) {
        projectsCache.data = projectsCache.data.filter((p) => p.id !== id)
        projectsCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete project"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  averageProgress: number
  byStatus: Record<string, number>
}

export function useProjectStats(projects: Project[]): ProjectStats {
  const total = projects.length
  const active = projects.filter((p) => p.status === "In Progress" || p.status === "Planning").length
  const averageProgress =
    projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0

  const byStatus = {
    Planning: projects.filter((p) => p.status === "Planning").length,
    "In Progress": projects.filter((p) => p.status === "In Progress").length,
    "On Hold": projects.filter((p) => p.status === "On Hold").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  }

  return {
    total,
    active,
    completed: projects.filter((p) => p.status === "Completed").length,
    averageProgress: Math.round(averageProgress),
    byStatus,
  }
}

