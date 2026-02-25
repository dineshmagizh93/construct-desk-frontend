"use client"

import * as React from "react"
import { DashboardLayout } from "./dashboard-layout"

// Memoize to prevent re-renders on navigation
export const DashboardLayoutWrapper = React.memo(function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
})

