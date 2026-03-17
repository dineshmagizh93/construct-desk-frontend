"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { TableSkeleton } from "@/components/ui/loading-skeleton"

// Lazy load heavy components to speed up navigation
const KanbanBoard = React.lazy(() => 
  import("@/components/tasks/kanban-board").then(module => ({ default: module.KanbanBoard }))
)
const TaskList = React.lazy(() => 
  import("@/components/tasks/task-list").then(module => ({ default: module.TaskList }))
)

type ViewMode = "kanban" | "list"

export default function TasksPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("kanban")

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 min-h-0">
        <React.Suspense fallback={<TableSkeleton />}>
          {viewMode === "kanban" ? (
            <KanbanBoard viewMode={viewMode} setViewMode={setViewMode} />
          ) : (
            <TaskList viewMode={viewMode} setViewMode={setViewMode} />
          )}
        </React.Suspense>
      </div>
    </div>
  )
}
