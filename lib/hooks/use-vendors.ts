"use client"

import { useState, useEffect, useCallback } from "react"
import { Vendor } from "@/types/vendor"
import { vendorsApi, CreateVendorDto, UpdateVendorDto } from "@/lib/api/vendors"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let vendorsCache: { data: Vendor[]; timestamp: number } | null = null
const CACHE_DURATION = 120000 // 2 minutes

export function useVendors() {
  // Initialize with cache if available to prevent loading state
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const now = Date.now()
    if (vendorsCache && (now - vendorsCache.timestamp) < CACHE_DURATION) {
      return vendorsCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(vendorsCache && (now - vendorsCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadVendors = useCallback(async (force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && vendorsCache && (now - vendorsCache.timestamp) < CACHE_DURATION) {
      setVendors(vendorsCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!vendorsCache || force) {
        setLoading(true)
      }
      setError(null)
      const data = await vendorsApi.getAll()
      setVendors(data)
      // Update cache
      vendorsCache = { data, timestamp: now }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load vendors"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Vendors API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading vendors:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (!vendorsCache || (now - vendorsCache.timestamp) >= CACHE_DURATION) {
      loadVendors()
    }
  }, [loadVendors])

  const createVendor = useCallback(async (vendor: CreateVendorDto) => {
    try {
      setError(null)
      const newVendor = await vendorsApi.create(vendor)
      setVendors((prev) => [...prev, newVendor])
      return newVendor
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create vendor"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateVendor = useCallback(async (id: string, updates: UpdateVendorDto) => {
    try {
      setError(null)
      const updated = await vendorsApi.update(id, updates)
      setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)))
      // Update cache
      if (vendorsCache) {
        vendorsCache.data = vendorsCache.data.map((v) => (v.id === id ? updated : v))
        vendorsCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update vendor"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteVendor = useCallback(async (id: string) => {
    try {
      setError(null)
      await vendorsApi.delete(id)
      setVendors((prev) => prev.filter((v) => v.id !== id))
      // Update cache
      if (vendorsCache) {
        vendorsCache.data = vendorsCache.data.filter((v) => v.id !== id)
        vendorsCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete vendor"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const toggleVendorStatus = useCallback(async (id: string) => {
    try {
      setError(null)
      const vendor = vendors.find((v) => v.id === id)
      if (!vendor) throw new Error("Vendor not found")
      
      const updated = await vendorsApi.update(id, {
        // Backend doesn't have status field, so we'll skip this for now
        // This can be implemented later if needed
      })
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to toggle vendor status"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [vendors])

  return {
    vendors,
    loading,
    error,
    loadVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    toggleVendorStatus,
  }
}

