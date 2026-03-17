"use client"

import { useState, useEffect, useCallback } from "react"
import { Expense } from "@/types/expense"
import { expensesApi, CreateExpenseDto, UpdateExpenseDto } from "@/lib/api/expenses"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let expensesCache: { data: Expense[]; timestamp: number; projectId?: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useExpenses() {
  // Initialize with cache if available to prevent loading state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const now = Date.now()
    if (expensesCache && (now - expensesCache.timestamp) < CACHE_DURATION) {
      return expensesCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(expensesCache && (now - expensesCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadExpenses = useCallback(async (projectId?: string, force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && expensesCache && (now - expensesCache.timestamp) < CACHE_DURATION && expensesCache.projectId === projectId) {
      setExpenses(expensesCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!expensesCache || force || expensesCache.projectId !== projectId) {
        setLoading(true)
      }
      setError(null)
      const data = await expensesApi.getAll(projectId)
      setExpenses(data)
      // Update cache
      expensesCache = { data, timestamp: now, projectId }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load expenses"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Expenses API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading expenses:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!expensesCache || (now - expensesCache.timestamp) >= CACHE_DURATION) {
      loadExpenses()
    }
  }, [loadExpenses])

  const loadExpensesByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await expensesApi.getAll(projectId)
      return data
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load expenses")
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createExpense = useCallback(async (expense: CreateExpenseDto) => {
    try {
      setError(null)
      const newExpense = await expensesApi.create(expense)
      setExpenses((prev) => [...prev, newExpense])
      // Update cache
      if (expensesCache) {
        expensesCache.data = [...expensesCache.data, newExpense]
        expensesCache.timestamp = Date.now()
      }
      return newExpense
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create expense"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateExpense = useCallback(async (id: string, updates: UpdateExpenseDto) => {
    try {
      setError(null)
      const updated = await expensesApi.update(id, updates)
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      // Update cache
      if (expensesCache) {
        expensesCache.data = expensesCache.data.map((e) => (e.id === id ? updated : e))
        expensesCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update expense"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    try {
      setError(null)
      await expensesApi.delete(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      // Update cache
      if (expensesCache) {
        expensesCache.data = expensesCache.data.filter((e) => e.id !== id)
        expensesCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete expense"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    loadExpensesByProject,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}

