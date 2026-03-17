"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, removeAuthToken } from "@/lib/config"
import { apiClient } from "@/lib/api/client"

// Global cache to prevent multiple auth checks
let authCache: {
  user: any
  isAuthenticated: boolean
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    // Initialize from cache if available
    if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
      return authCache.isAuthenticated
    }
    return null
  })
  const [user, setUser] = useState<any>(() => {
    // Initialize from cache if available
    if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
      return authCache.user
    }
    return null
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const checkAuthCalled = useRef(false)

  useEffect(() => {
    // Only check auth once per session
    if (!checkAuthCalled.current) {
      checkAuthCalled.current = true
      checkAuth()
    } else {
      // If already checked, use cache
      if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
        setLoading(false)
      }
    }
  }, [])

  const checkAuth = async () => {
    const token = getAuthToken()
    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      authCache = null
      return
    }

    // Use cache if available and fresh
    const now = Date.now()
    if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
      setUser(authCache.user)
      setIsAuthenticated(authCache.isAuthenticated)
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.get<{ user: any; company: any }>("/auth/me")
      // Backend returns { user: {...}, company: {...} }
      const userData = {
        ...response.user,
        company: response.company,
      }
      setUser(userData)
      setIsAuthenticated(true)
      
      // Update cache
      authCache = {
        user: userData,
        isAuthenticated: true,
        timestamp: now,
      }
      
      // Store currency in localStorage for quick access
      if (response.company?.currency && typeof window !== "undefined") {
        localStorage.setItem("company_currency", response.company.currency)
      }
    } catch (error) {
      // Token invalid or expired
      removeAuthToken()
      setIsAuthenticated(false)
      setUser(null)
      authCache = null
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    setIsAuthenticated(false)
    setUser(null)
    authCache = null
    router.push("/login")
    router.refresh()
  }

  return {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    logout,
  }
}

