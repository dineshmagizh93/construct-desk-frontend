"use client"

import * as React from "react"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskList } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

type ViewMode = "kanban" | "list"

export default function TasksPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("kanban")

  return (
    <div className="flex flex-col h-full">
      {/* View Toggle */}
      <div className="flex justify-end gap-2 mb-4 flex-shrink-0">
        <div className="inline-flex rounded-md border" role="group">
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none border-l"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "kanban" ? <KanbanBoard /> : <TaskList />}
      </div>
    </div>
  )
}
