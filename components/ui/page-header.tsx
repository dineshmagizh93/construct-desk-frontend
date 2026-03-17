import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  const ActionIcon = action?.icon

  return (
    <div
      className={cn(
        "flex items-center justify-between pb-3 border-b border-border/40 mb-4 mt-6",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size="sm"
          className="h-[36px] px-4 flex-shrink-0 ml-4"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
