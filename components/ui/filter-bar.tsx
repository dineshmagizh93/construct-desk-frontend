import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Plus } from "lucide-react"

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  actionButton?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
  className?: string
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actionButton,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "panel-surface mb-4 flex flex-wrap items-center gap-3 rounded-[1.25rem] p-3",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-[42px] rounded-xl pl-9 pr-9 text-[13px]"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filters && <div className="flex items-center gap-2">{filters}</div>}

      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          size="sm"
          className="h-[42px] flex-shrink-0 px-4"
        >
          {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
          {actionButton.label}
        </Button>
      )}
    </div>
  )
}
