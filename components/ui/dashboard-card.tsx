import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: string | number
  secondaryInfo?: string
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function DashboardCard({
  title,
  value,
  secondaryInfo,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  trend,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.08)]",
        "h-[108px]",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-100 via-slate-200/60 to-transparent" />
      <div className="flex-1 min-w-0 pr-2">
        <p className="mb-2 truncate text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-[24px] font-bold leading-none text-foreground">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-[12px] font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {secondaryInfo && (
          <p className="mt-2 truncate text-[13px] text-muted-foreground">
            {secondaryInfo}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ring-black/5",
          iconBgColor
        )}
      >
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
    </div>
  )
}
