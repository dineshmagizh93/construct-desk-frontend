"use client"

import { useState, useEffect, useCallback } from "react"
import { User } from "@/types/user"
import { usersApi, CreateUserDto, UpdateUserDto } from "@/lib/api/users"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let usersCache: { data: User[]; timestamp: number } | null = null
const usersSubscribers = new Set<(data: User[]) => void>()
const CACHE_DURATION = 120000 // 2 minutes

function syncUsersCache(data: User[]) {
  usersCache = { data, timestamp: Date.now() }
}

function notifyUsersSubscribers(data: User[]) {
  usersSubscribers.forEach((listener) => listener(data))
}

export function useUsers() {
  // Initialize with cache if available to prevent loading state
  const [users, setUsers] = useState<User[]>(() => {
    const now = Date.now()
    if (usersCache && (now - usersCache.timestamp) < CACHE_DURATION) {
      return usersCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(usersCache && (now - usersCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const listener = (data: User[]) => {
      setUsers(data)
    }

    usersSubscribers.add(listener)
    return () => {
      usersSubscribers.delete(listener)
    }
  }, [])

  const loadUsers = useCallback(async (includeInactive: boolean = false, force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && usersCache && (now - usersCache.timestamp) < CACHE_DURATION) {
      setUsers(usersCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!usersCache || force) {
        setLoading(true)
      }
      setError(null)
      const data = await usersApi.getAll(includeInactive)
      setUsers(data)
      syncUsersCache(data)
      notifyUsersSubscribers(data)
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load users"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Users API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!usersCache || (now - usersCache.timestamp) >= CACHE_DURATION) {
      loadUsers(false, false).catch(err => {
        console.error('Failed to load users in useEffect:', err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const createUser = useCallback(async (user: CreateUserDto) => {
    try {
      setError(null)
      const newUser = await usersApi.create(user)
      const currentUsers = usersCache?.data || users
      const updatedUsers = [...currentUsers, newUser]
      setUsers(updatedUsers)
      syncUsersCache(updatedUsers)
      notifyUsersSubscribers(updatedUsers)
      return newUser
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create user"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [users])

  const updateUser = useCallback(async (id: string, updates: UpdateUserDto) => {
    try {
      setError(null)
      const updated = await usersApi.update(id, updates)
      const currentUsers = usersCache?.data || users
      const updatedUsers = currentUsers.map((u) => (u.id === id ? updated : u))
      setUsers(updatedUsers)
      syncUsersCache(updatedUsers)
      notifyUsersSubscribers(updatedUsers)
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update user"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [users])

  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null)
      await usersApi.delete(id)
      const currentUsers = usersCache?.data || users
      const updatedUsers = currentUsers.filter((u) => u.id !== id)
      setUsers(updatedUsers)
      syncUsersCache(updatedUsers)
      notifyUsersSubscribers(updatedUsers)
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete user"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [users])

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
