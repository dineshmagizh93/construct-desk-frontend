"use client"

import { useState, useEffect, useCallback } from "react"
import { Project } from "@/types/project"
import { projectsApi, CreateProjectDto, UpdateProjectDto, ProjectListParams } from "@/lib/api/projects"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let projectsCache: { data: Project[]; total: number; timestamp: number; key: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useProjects(params?: ProjectListParams) {
  const cacheKey = JSON.stringify(params ?? {})
  // Initialize with cache if available to prevent loading state
  const [projects, setProjects] = useState<Project[]>(() => {
    const now = Date.now()
    if (projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION && projectsCache.key === cacheKey) {
      return projectsCache.data
    }
    return []
  })
  const [total, setTotal] = useState(() => {
    const now = Date.now()
    if (projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION && projectsCache.key === cacheKey) {
      return projectsCache.total
    }
    return 0
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION && projectsCache.key === cacheKey)
  })
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async (force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && projectsCache && (now - projectsCache.timestamp) < CACHE_DURATION && projectsCache.key === cacheKey) {
      setProjects(projectsCache.data)
      setTotal(projectsCache.total)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!projectsCache || force || projectsCache.key !== cacheKey) {
        setLoading(true)
      }
      setError(null)
      if (params?.page || params?.limit || params?.search || params?.status) {
        const response = await projectsApi.getPage(params)
        setProjects(response.items)
        setTotal(response.total)
        projectsCache = { data: response.items, total: response.total, timestamp: now, key: cacheKey }
      } else {
        const data = await projectsApi.getAll()
        setProjects(data)
        setTotal(data.length)
        projectsCache = { data, total: data.length, timestamp: now, key: cacheKey }
      }
      // Update cache
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
  }, [cacheKey, params])

  useEffect(() => {
    const now = Date.now()
    if (!projectsCache || (now - projectsCache.timestamp) >= CACHE_DURATION || projectsCache.key !== cacheKey) {
      loadProjects()
    }
  }, [cacheKey, loadProjects])

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

  const bulkCreateProjects = useCallback(async (projects: CreateProjectDto[]) => {
    try {
      // Do not touch the global `error` state used by the projects page.
      // Bulk upload failures should be shown inside the bulk upload dialog.
      const res = await projectsApi.bulkCreate(projects)
      return res
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to bulk upload projects"
      throw new Error(errorMessage)
    }
  }, [])

  return {
    projects,
    total,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    bulkCreateProjects,
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

