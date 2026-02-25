"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, removeAuthToken } from "@/lib/config"
import { apiClient } from "@/lib/api/client"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getAuthToken()
    if (!token) {
      setIsAuthenticated(false)
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
      
      // Store currency in localStorage for quick access
      if (response.company?.currency && typeof window !== "undefined") {
        localStorage.setItem("company_currency", response.company.currency)
      }
    } catch (error) {
      // Token invalid or expired
      removeAuthToken()
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    setIsAuthenticated(false)
    setUser(null)
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

