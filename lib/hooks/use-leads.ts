"use client"

import { useState, useEffect, useCallback } from "react"
import { Lead } from "@/types/lead"
import { leadsApi, CreateLeadDto, UpdateLeadDto, LeadListParams } from "@/lib/api/leads"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let leadsCache: { data: Lead[]; total: number; timestamp: number; key: string } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useLeads(params?: LeadListParams) {
  const cacheKey = JSON.stringify(params ?? {})
  // Initialize with cache if available to prevent loading state
  const [leads, setLeads] = useState<Lead[]>(() => {
    const now = Date.now()
    if (leadsCache && (now - leadsCache.timestamp) < CACHE_DURATION && leadsCache.key === cacheKey) {
      return leadsCache.data
    }
    return []
  })
  const [total, setTotal] = useState(() => {
    const now = Date.now()
    if (leadsCache && (now - leadsCache.timestamp) < CACHE_DURATION && leadsCache.key === cacheKey) {
      return leadsCache.total
    }
    return 0
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(leadsCache && (now - leadsCache.timestamp) < CACHE_DURATION && leadsCache.key === cacheKey)
  })
  const [error, setError] = useState<string | null>(null)

  const loadLeads = useCallback(async (type?: string, force = false) => {
    const effectiveParams = type ? { ...params, type } : params
    const effectiveKey = JSON.stringify(effectiveParams ?? {})
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && leadsCache && (now - leadsCache.timestamp) < CACHE_DURATION && leadsCache.key === effectiveKey) {
      setLeads(leadsCache.data)
      setTotal(leadsCache.total)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!leadsCache || force || leadsCache.key !== effectiveKey) {
        setLoading(true)
      }
      setError(null)
      if (effectiveParams?.page || effectiveParams?.limit || effectiveParams?.status || effectiveParams?.search) {
        const response = await leadsApi.getPage(effectiveParams)
        setLeads(response.items)
        setTotal(response.total)
        leadsCache = { data: response.items, total: response.total, timestamp: now, key: effectiveKey }
      } else {
        const data = await leadsApi.getAll(type)
        setLeads(data)
        setTotal(data.length)
        leadsCache = { data, total: data.length, timestamp: now, key: effectiveKey }
      }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load leads"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Leads API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading leads:", err)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const now = Date.now()
    if (!leadsCache || (now - leadsCache.timestamp) >= CACHE_DURATION || leadsCache.key !== cacheKey) {
      loadLeads()
    }
  }, [cacheKey, loadLeads])

  const createLead = useCallback(async (lead: CreateLeadDto) => {
    try {
      setError(null)
      const newLead = await leadsApi.create(lead)
      setLeads((prev) => [...prev, newLead])
      return newLead
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create lead"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const bulkCreateLeads = useCallback(async (leads: any[]) => {
    try {
      setError(null)
      const res = await leadsApi.bulkCreate(leads)
      // Invalidate cache immediately
      if (leadsCache) {
        leadsCache.timestamp = 0
      }
      return res
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to bulk create leads"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateLead = useCallback(async (id: string, updates: UpdateLeadDto) => {
    try {
      setError(null)
      const updated = await leadsApi.update(id, updates)
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update lead"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteLead = useCallback(async (id: string) => {
    try {
      setError(null)
      await leadsApi.delete(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete lead"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const convertToClient = useCallback(async (id: string) => {
    try {
      setError(null)
      const updated = await leadsApi.convertToClient(id)
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to convert lead to client"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    leads,
    total,
    loading,
    error,
    loadLeads,
    createLead,
    bulkCreateLeads,
    updateLead,
    deleteLead,
    convertToClient,
  }
}

