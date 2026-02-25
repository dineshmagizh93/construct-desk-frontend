"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { getAuthToken } from "@/lib/config"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Memoize to prevent re-renders on navigation
export const DashboardLayout = React.memo(function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // Only check auth once, not on every navigation
  const authChecked = React.useRef(false)
  
  React.useEffect(() => {
    if (!loading && !authChecked.current) {
      authChecked.current = true
      const token = getAuthToken()
      if (!token || !isAuthenticated) {
        router.push("/login")
      }
    }
  }, [isAuthenticated, loading, router])

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  // Show loading only on initial auth check
  if (loading && !authChecked.current) {
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
  if (!isAuthenticated && authChecked.current) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="p-6 lg:p-8 pt-24 lg:pt-28 min-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1920px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
})

