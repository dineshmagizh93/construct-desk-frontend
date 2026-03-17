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
        "relative flex items-center justify-between p-4 rounded-[10px] border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20",
        "h-[90px]",
        className
      )}
    >
      {/* Left Side - Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] text-muted-foreground font-medium mb-1 truncate">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-[22px] font-bold text-foreground leading-none">
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
          <p className="text-[12px] text-muted-foreground mt-1.5 truncate">
            {secondaryInfo}
          </p>
        )}
      </div>

      {/* Right Side - Icon */}
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
          iconBgColor
        )}
      >
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
    </div>
  )
}
