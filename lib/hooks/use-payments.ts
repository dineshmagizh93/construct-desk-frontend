"use client"

import { useState, useEffect, useCallback } from "react"
import { Payment } from "@/types/payment"
import { paymentsApi, CreatePaymentDto, UpdatePaymentDto, PaymentListParams } from "@/lib/api/payments"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let paymentsCache: { data: Payment[]; total: number; timestamp: number; key: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function usePayments(params?: PaymentListParams) {
  const cacheKey = JSON.stringify(params ?? {})
  // Initialize with cache if available to prevent loading state
  const [payments, setPayments] = useState<Payment[]>(() => {
    const now = Date.now()
    if (paymentsCache && (now - paymentsCache.timestamp) < CACHE_DURATION && paymentsCache.key === cacheKey) {
      return paymentsCache.data
    }
    return []
  })
  const [total, setTotal] = useState(() => {
    const now = Date.now()
    if (paymentsCache && (now - paymentsCache.timestamp) < CACHE_DURATION && paymentsCache.key === cacheKey) {
      return paymentsCache.total
    }
    return 0
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(paymentsCache && (now - paymentsCache.timestamp) < CACHE_DURATION && paymentsCache.key === cacheKey)
  })
  const [error, setError] = useState<string | null>(null)

  const loadPayments = useCallback(async (projectId?: string, force = false) => {
    const effectiveParams = projectId ? { ...params, projectId } : params
    const effectiveKey = JSON.stringify(effectiveParams ?? {})
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && paymentsCache && (now - paymentsCache.timestamp) < CACHE_DURATION && paymentsCache.key === effectiveKey) {
      setPayments(paymentsCache.data)
      setTotal(paymentsCache.total)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!paymentsCache || force || paymentsCache.key !== effectiveKey) {
        setLoading(true)
      }
      setError(null)
      if (effectiveParams?.page || effectiveParams?.limit || effectiveParams?.status || effectiveParams?.search || effectiveParams?.dueDate) {
        const response = await paymentsApi.getPage(effectiveParams)
        setPayments(response.items)
        setTotal(response.total)
        paymentsCache = { data: response.items, total: response.total, timestamp: now, key: effectiveKey }
      } else {
        const data = await paymentsApi.getAll(projectId)
        setPayments(data)
        setTotal(data.length)
        paymentsCache = { data, total: data.length, timestamp: now, key: effectiveKey }
      }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load payments"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Payments API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading payments:", err)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const now = Date.now()
    if (!paymentsCache || (now - paymentsCache.timestamp) >= CACHE_DURATION || paymentsCache.key !== cacheKey) {
      loadPayments()
    }
  }, [cacheKey, loadPayments])

  const loadPaymentsByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentsApi.getAll(projectId)
      return data
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load payments")
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createPayment = useCallback(async (payment: CreatePaymentDto) => {
    try {
      setError(null)
      const newPayment = await paymentsApi.create(payment)
      setPayments((prev) => [...prev, newPayment])
      // Update cache
      if (paymentsCache) {
        paymentsCache.data = [...paymentsCache.data, newPayment]
        paymentsCache.timestamp = Date.now()
      }
      return newPayment
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create payment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const bulkCreatePayments = useCallback(async (payments: any[]) => {
    try {
      setError(null)
      const res = await paymentsApi.bulkCreate(payments)
      // Invalidate cache immediately
      if (paymentsCache) {
        paymentsCache.timestamp = 0
      }
      return res
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to bulk create payments"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updatePayment = useCallback(async (id: string, updates: UpdatePaymentDto) => {
    try {
      setError(null)
      const updated = await paymentsApi.update(id, updates)
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)))
      // Update cache
      if (paymentsCache) {
        paymentsCache.data = paymentsCache.data.map((p) => (p.id === id ? updated : p))
        paymentsCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update payment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deletePayment = useCallback(async (id: string) => {
    try {
      setError(null)
      await paymentsApi.delete(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      // Update cache
      if (paymentsCache) {
        paymentsCache.data = paymentsCache.data.filter((p) => p.id !== id)
        paymentsCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete payment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    payments,
    total,
    loading,
    error,
    loadPayments,
    loadPaymentsByProject,
    createPayment,
    bulkCreatePayments,
    updatePayment,
    deletePayment,
  }
}

