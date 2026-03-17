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
        "flex items-center gap-2 mb-3 h-[40px] flex-shrink-0",
        className
      )}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-[40px] pl-9 pr-9 text-[13px]"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {filters && <div className="flex items-center gap-2">{filters}</div>}

      {/* Action Button */}
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          size="sm"
          className="h-[40px] px-4 flex-shrink-0"
        >
          {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
          {actionButton.label}
        </Button>
      )}
    </div>
  )
}
