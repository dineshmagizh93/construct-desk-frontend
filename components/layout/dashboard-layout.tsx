"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { TrialExpiredLockout } from "./trial-lockout"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import { getAuthToken } from "@/lib/config"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Global auth check state to prevent multiple checks
let globalAuthChecked = false
let globalAuthPromise: Promise<boolean> | null = null

// Memoize to prevent re-renders on navigation
export const DashboardLayout = React.memo(function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading, user } = useAuth()
  const { isSuperAdmin } = useSuperAdmin()
  const [authInitialized, setAuthInitialized] = React.useState(globalAuthChecked)

  // Redirect super admin away from normal CRM pages to admin dashboard
  React.useEffect(() => {
    if (isSuperAdmin && authInitialized && pathname) {
      // Allow admin pages, login, register, and other public pages
      const allowedPaths = ['/admin', '/login', '/register', '/', '/pricing', '/contact', '/features', '/solutions']
      const isAllowedPath = allowedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
      
      if (!isAllowedPath && !pathname.startsWith('/admin')) {
        // Redirect to admin dashboard
        router.push('/admin')
      }
    }
  }, [isSuperAdmin, authInitialized, pathname, router])

  // Only check auth once globally, not on every navigation
  React.useEffect(() => {
    if (!globalAuthChecked && !loading) {
      if (globalAuthPromise) {
        globalAuthPromise.then((authenticated) => {
          if (!authenticated) {
            router.push("/login")
          }
          globalAuthChecked = true
          setAuthInitialized(true)
        })
      } else {
        const token = getAuthToken()
        if (!token || !isAuthenticated) {
          globalAuthPromise = Promise.resolve(false)
          router.push("/login")
        } else {
          globalAuthPromise = Promise.resolve(true)
        }
        globalAuthChecked = true
        setAuthInitialized(true)
      }
    } else if (globalAuthChecked) {
      setAuthInitialized(true)
    }
  }, [isAuthenticated, loading, router])

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  // Prefetch all module routes on mount for instant navigation
  React.useEffect(() => {
    const moduleRoutes = [
      "/dashboard", "/usage", "/projects", "/tasks", "/leads", "/site-progress",
      "/payments", "/expenses", "/inventory", "/vendors", "/labour",
      "/documents", "/reports", "/users", "/settings"
    ]
    
    // Prefetch all routes in background
    moduleRoutes.forEach(route => {
      if (route !== pathname) {
        router.prefetch(route)
      }
    })
  }, [pathname, router])

  // Show loading only on very first auth check
  if (!authInitialized && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated && authInitialized) {
    return null
  }

  // Check if trial has expired
  const isSettingsOrPricing = pathname === '/settings' || pathname === '/pricing' || pathname?.startsWith('/settings/')
  const isTrial = user?.company?.subscriptionStatus === 'trial'
  const trialEndDate = user?.company?.subscriptionEndDate ? new Date(user.company.subscriptionEndDate) : null
  const isTrialExpired = !!(isTrial && trialEndDate && new Date() > trialEndDate)
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
    
  const shouldLockout = isTrialExpired && !isSettingsOrPricing

  return (
    <div className="app-shell min-h-screen">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className={cn(
          "flex h-screen flex-col transition-all duration-300",
          "pl-0",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-[200px]"
        )}
      >
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-16 sm:px-5 sm:pb-5 sm:pt-16 lg:px-6 lg:pb-6 min-h-0">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-col">
            {isTrial && !isTrialExpired && trialEndDate && (
              <div className="mb-4 rounded-2xl border border-amber-200/80 bg-[linear-gradient(90deg,rgba(255,251,235,0.98),rgba(255,247,214,0.95))] px-4 py-3 text-sm text-amber-900 shadow-[0_12px_30px_rgba(180,83,9,0.08)]">
                Your 3-day free trial is active. {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left
                (ends on {trialEndDate.toLocaleDateString()}).
              </div>
            )}
            {shouldLockout ? <TrialExpiredLockout /> : children}
          </div>
        </main>
      </div>
    </div>
  )
})
