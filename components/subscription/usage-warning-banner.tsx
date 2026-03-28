"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, X, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlanUsageStats } from "@/lib/api/company"

interface UsageWarningBannerProps {
  usage: PlanUsageStats
  onDismiss?: () => void
}

export function UsageWarningBanner({ usage, onDismiss }: UsageWarningBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = React.useState(false)

  // Check if any usage exceeds 80%
  const shouldShow =
    !dismissed &&
    (usage.users.percentage >= 80 ||
      usage.projects.percentage >= 80 ||
      usage.storage.percentage >= 80)

  if (!shouldShow) return null

  const getHighestUsage = () => {
    const usages = [
      { type: "users", percentage: usage.users.percentage },
      { type: "projects", percentage: usage.projects.percentage },
      { type: "storage", percentage: usage.storage.percentage },
    ]
    return usages.reduce((max, curr) =>
      curr.percentage > max.percentage ? curr : max
    )
  }

  const highestUsage = getHighestUsage()

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-[linear-gradient(90deg,rgba(255,251,235,0.98),rgba(255,247,214,0.92))] px-4 py-3 text-amber-900 shadow-[0_14px_36px_rgba(180,83,9,0.08)]",
        "animate-in slide-in-from-top"
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm">
          You're close to reaching your {highestUsage.type} limit ({highestUsage.percentage}% used).
          Consider upgrading your plan.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
          onClick={handleUpgrade}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Upgrade
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
