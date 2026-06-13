"use client"

import * as React from "react"
import { UsageTracker } from "@/components/subscription/usage-tracker"
import { usePlanUsage } from "@/lib/hooks/use-plan-usage"
import { UsageWarningBanner } from "@/components/subscription/usage-warning-banner"

export default function UsagePage() {
  const { usage, loading, error, loadUsage } = usePlanUsage()

  if (loading && !usage) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading usage tracker...</p>
        </div>
      </div>
    )
  }

  if (error && !usage) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">Failed to load usage statistics.</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => loadUsage(true)}
            className="text-xs px-3 py-1 rounded-md border border-border hover:bg-accent transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      {/* Optional banner if nearing limits */}
      {usage && <UsageWarningBanner usage={usage} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 flex-shrink-0 pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Usage Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor how your team is using users, projects, and storage based on your current plan.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-6 pr-2 space-y-6">
        {usage && (
          <div className="space-y-4">
            <UsageTracker usage={usage} />
            <p className="text-xs text-muted-foreground">
              Limits are determined by your subscription plan. Upgrade your plan from the pricing page or header
              upgrade button when you are close to or have exceeded your limits.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

