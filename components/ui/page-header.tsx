import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: React.ReactNode
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
  description,
  action,
  className,
}: PageHeaderProps) {
  const ActionIcon = action?.icon
  const subtext = subtitle ?? description

  return (
    <div
      className={cn(
        "mb-5 mt-1 flex items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtext && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            {subtext}
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
