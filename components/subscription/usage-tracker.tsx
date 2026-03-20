"use client"

import * as React from "react"
import { Users, FolderKanban, HardDrive, AlertTriangle, Sparkles, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlanUsageStats } from "@/lib/api/company"
import { cn } from "@/lib/utils"

interface UsageTrackerProps {
  usage: PlanUsageStats
}

function UsageBar({
  percentage,
}: {
  percentage: number
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage || 0)))
  const isNearLimit = clamped >= 80 && clamped < 100
  const isOverLimit = clamped >= 100

  return (
    <div className="w-full h-2 rounded-full bg-muted/70 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          isOverLimit
            ? "bg-gradient-to-r from-red-500 to-red-600"
            : isNearLimit
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
            : "bg-gradient-to-r from-primary to-primary/70"
        )}
        style={{ width: `${Math.min(clamped, 100)}%` }}
      />
    </div>
  )
}

function UsageCard({
  title,
  icon: Icon,
  current,
  limit,
  percentage,
  subtitle,
  unit,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  current: string
  limit: string
  percentage: number
  subtitle: string
  unit?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage || 0)))
  const isNearLimit = clamped >= 80 && clamped < 100
  const isOverLimit = clamped >= 100

  const badgeVariant = isOverLimit ? "destructive" : isNearLimit ? "warning" : "success"
  const badgeLabel = isOverLimit ? "At Limit" : isNearLimit ? "Almost Full" : "Healthy"

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary/40 to-primary/10 group-hover:from-primary group-hover:via-primary/60 group-hover:to-primary/20" />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-3">
        <div className="space-y-1">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold leading-none">
              {current}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              / {limit} {unit}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <Badge
            variant={badgeVariant as any}
            className="text-[10px] px-2 py-0 h-5 leading-none"
          >
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3 pt-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            {clamped >= 80 && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
            {subtitle}
          </span>
          <span className="font-medium text-[11px] text-foreground/80">
            {clamped}%
          </span>
        </div>
        <UsageBar percentage={percentage} />
      </CardContent>
    </Card>
  )
}

export function UsageTracker({ usage }: UsageTrackerProps) {
  if (!usage) return null

  const formatLimit = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A"
    if (value === Infinity) return "Unlimited"
    return value.toString()
  }

  const rawPlanName =
    (usage.plan as any)?.name ||
    (usage.plan as any)?.planName ||
    (usage.plan as any)?.label ||
    "Active Plan"

  // Convert STARTER / GROWTH / PROFESSIONAL → Starter / Growth / Professional
  const normalizedPlanName =
    typeof rawPlanName === "string" && rawPlanName === rawPlanName.toUpperCase()
      ? rawPlanName.charAt(0) + rawPlanName.slice(1).toLowerCase()
      : rawPlanName

  const storageCurrentGB = usage.storage.current || 0
  const storageLimitGB = usage.storage.limit || usage.plan.storageGB || 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            Current Plan:{" "}
            <span className="font-semibold text-foreground">{normalizedPlanName}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          title="Users"
          icon={Users}
          current={usage.users.current.toString()}
          limit={formatLimit(usage.users.limit)}
          percentage={usage.users.percentage}
          subtitle="Team members using your workspace."
        />

        <UsageCard
          title="Projects"
          icon={FolderKanban}
          current={usage.projects.current.toString()}
          limit={formatLimit(usage.projects.limit)}
          percentage={usage.projects.percentage}
          subtitle="Projects tracked in this account."
        />

        <UsageCard
          title="Storage"
          icon={HardDrive}
          current={storageCurrentGB.toFixed(1)}
          limit={formatLimit(storageLimitGB)}
          percentage={usage.storage.percentage}
          unit="GB"
          subtitle="Document storage used across your team."
        />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold mb-4 text-foreground/90 uppercase tracking-wider">Plan Features</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <FeatureItem 
            label="Inventory Management"
            enabled={usage.plan.inventory === true}
          />
          <FeatureItem 
            label="Vendor Management"
            enabled={usage.plan.vendorManagement === true}
            description={usage.plan.planName === 'STARTER' ? 'Limit 10 vendors' : 'Full Access'}
          />
          <FeatureItem 
            label="Labour Management"
            enabled={usage.plan.labourManagement === true}
            description={usage.plan.planName === 'STARTER' ? 'Limit 20 workers' : 'Full Access'}
          />
          <FeatureItem 
            label="Advanced Analytics"
            enabled={usage.plan.analytics === 'advanced'}
            description={usage.plan.analytics === 'basic' ? 'Basic' : 'Advanced'}
          />
          <FeatureItem 
            label="Role-based Permissions"
            enabled={usage.plan.roleBasedPermissions === true}
          />
          <FeatureItem 
            label="Custom Dashboards"
            enabled={usage.plan.customDashboards === true}
          />
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ label, enabled, description }: { label: string; enabled: boolean; description?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      enabled ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40"
    )}>
      <div className="flex flex-col">
        <span className={cn("text-sm font-medium", enabled ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

