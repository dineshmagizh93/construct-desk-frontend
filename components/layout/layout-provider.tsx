"use client"

import * as React from "react"
import { DashboardLayout } from "./dashboard-layout"

// Create a context to share layout state
const LayoutContext = React.createContext<{
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
} | null>(null)

export function useLayoutContext() {
  const context = React.useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayoutContext must be used within LayoutProvider")
  }
  return context
}

// Memoized layout provider to prevent re-renders
export const LayoutProvider = React.memo(function LayoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <DashboardLayout>{children}</DashboardLayout>
    </LayoutContext.Provider>
  )
})

