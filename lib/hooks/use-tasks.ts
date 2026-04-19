"use client"

import { useState, useEffect, useCallback } from "react"
import { Task, TaskFilters, TaskListParams, CreateTaskDto, UpdateTaskDto, UpdateTaskPositionDto, TaskComment } from "@/lib/api/tasks"
import { tasksApi } from "@/lib/api/tasks"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let tasksCache: { data: Task[]; total: number; timestamp: number; filters?: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useTasks(filters?: TaskListParams) {
  // Initialize with cache if available to prevent loading state
  const cacheKey = filters ? JSON.stringify(filters) : "default"
  const [tasks, setTasks] = useState<Task[]>(() => {
    const now = Date.now()
    if (tasksCache && (now - tasksCache.timestamp) < CACHE_DURATION && tasksCache.filters === cacheKey) {
      return tasksCache.data
    }
    return []
  })
  const [total, setTotal] = useState(() => {
    const now = Date.now()
    if (tasksCache && (now - tasksCache.timestamp) < CACHE_DURATION && tasksCache.filters === cacheKey) {
      return tasksCache.total
    }
    return 0
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(tasksCache && (now - tasksCache.timestamp) < CACHE_DURATION && tasksCache.filters === cacheKey)
  })
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async (force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && tasksCache && (now - tasksCache.timestamp) < CACHE_DURATION && tasksCache.filters === cacheKey) {
      setTasks(tasksCache.data)
      setTotal(tasksCache.total)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!tasksCache || force || tasksCache.filters !== cacheKey) {
        setLoading(true)
      }
      setError(null)
      if (filters?.page || filters?.limit) {
        const response = await tasksApi.getPage(filters)
        setTasks(response.items)
        setTotal(response.total)
        tasksCache = { data: response.items, total: response.total, timestamp: now, filters: cacheKey }
      } else {
        const data = await tasksApi.getAll(filters)
        setTasks(data)
        setTotal(data.length)
        tasksCache = { data, total: data.length, timestamp: now, filters: cacheKey }
      }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load tasks"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Tasks API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [filters, cacheKey])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = useCallback(async (task: CreateTaskDto) => {
    try {
      setError(null)
      const newTask = await tasksApi.create(task)
      setTasks((prev) => [...prev, newTask])
      return newTask
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create task"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const bulkCreateTasks = useCallback(async (tasks: any[]) => {
    try {
      setError(null)
      const res = await tasksApi.bulkCreate(tasks)
      await loadTasks(true) // Force refetch
      return res
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to bulk create tasks"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadTasks])

  const updateTask = useCallback(async (id: string, updates: UpdateTaskDto) => {
    try {
      setError(null)
      const updated = await tasksApi.update(id, updates)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update task"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateTaskPosition = useCallback(async (data: UpdateTaskPositionDto) => {
    try {
      setError(null)
      const updated = await tasksApi.updatePosition(data)
      // Reload tasks to get correct order
      await loadTasks()
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to move task"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null)
      await tasksApi.delete(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete task"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const addComment = useCallback(async (taskId: string, content: string) => {
    try {
      setError(null)
      const comment = await tasksApi.addComment(taskId, content)
      return comment
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to add comment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    tasks,
    total,
    loading,
    error,
    loadTasks,
    createTask,
    bulkCreateTasks,
    updateTask,
    updateTaskPosition,
    deleteTask,
    addComment,
  }
}

