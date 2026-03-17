"use client"

import * as React from "react"
import { Task, TaskStatus, TaskPriority, UpdateTaskPositionDto } from "@/lib/api/tasks"
import { useTasks } from "@/lib/hooks/use-tasks"
import { TaskCard } from "./task-card"
import { TaskForm } from "./task-form"
import { TaskDetail } from "./task-detail"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUsers } from "@/lib/hooks/use-users"
import { TaskFilters } from "@/lib/api/tasks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid, List } from "lucide-react"

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.TODO, label: "To Do", color: "bg-gray-100" },
  { status: TaskStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-100" },
  { status: TaskStatus.REVIEW, label: "Review", color: "bg-yellow-100" },
  { status: TaskStatus.DONE, label: "Done", color: "bg-green-100" },
  { status: TaskStatus.BLOCKED, label: "Blocked", color: "bg-red-100" },
]

interface KanbanBoardProps {
  viewMode?: "kanban" | "list"
  setViewMode?: (mode: "kanban" | "list") => void
}

export function KanbanBoard({ viewMode, setViewMode }: KanbanBoardProps = {}) {
  const { projects } = useProjects()
  const { users } = useUsers()
  const [filters, setFilters] = React.useState<TaskFilters>({})
  const { tasks, loading, error, createTask, updateTaskPosition, loadTasks } = useTasks(filters)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = React.useState<Task | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = React.useState<string | null>(null)

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
      [TaskStatus.BLOCKED]: [],
    }

    tasks.forEach((task) => {
      if (grouped[task.status as TaskStatus]) {
        grouped[task.status as TaskStatus].push(task)
      }
    })

    // Sort by position
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.position - b.position)
    })

    return grouped
  }, [tasks])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOverColumn(status)
  }

  const handleDragLeave = () => {
    setDraggedOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    setDraggedOverColumn(null)

    if (!draggedTask) return

    const targetColumnTasks = tasksByStatus[targetStatus]
    const newPosition = targetColumnTasks.length

    // If moving to same column, don't do anything
    if (draggedTask.status === targetStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const updateData: UpdateTaskPositionDto = {
        taskId: draggedTask.id,
        newStatus: targetStatus,
        newPosition,
      }

      await updateTaskPosition(updateData)
    } catch (error) {
      console.error("Failed to move task:", error)
    } finally {
      setDraggedTask(null)
    }
  }

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data)
      setCreateDialogOpen(false)
    } catch (error) {
      throw error
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500"
      case TaskPriority.HIGH:
        return "bg-orange-500"
      case TaskPriority.MEDIUM:
        return "bg-yellow-500"
      case TaskPriority.LOW:
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Only show loading if we have no tasks at all (initial load)
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-medium mb-2">Error loading tasks</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => loadTasks()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 pt-4 sm:pt-6 pb-0.5 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-0 text-xs">Manage your tasks with Kanban board</p>
        </div>
        <div className="flex items-center gap-2">
          {setViewMode && (
            <div className="inline-flex rounded-md border" role="group">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4 mr-1.5" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none border-l"
              >
                <List className="h-4 w-4 mr-1.5" />
                List
              </Button>
            </div>
          )}
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        <select
          value={filters.projectId || "all"}
          onChange={(e) => setFilters({ ...filters, projectId: e.target.value === "all" ? undefined : e.target.value })}
          className="w-[200px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={filters.assignedTo || "all"}
          onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value === "all" ? undefined : e.target.value })}
          className="w-[180px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || `${user.firstName} ${user.lastName}`}
            </option>
          ))}
        </select>
        <select
          value={filters.priority || "all"}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value === "all" ? undefined : e.target.value })}
          className="w-[150px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
        {(filters.search || filters.projectId || filters.assignedTo || filters.priority) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-1.5 overflow-hidden min-h-0">
        {COLUMNS.map((column) => {
          const columnTasks = tasksByStatus[column.status]
          const isDraggedOver = draggedOverColumn === column.status

          return (
            <div
              key={column.status}
              className={`flex-1 min-w-0 flex flex-col rounded-lg border-2 ${
                isDraggedOver ? "border-primary bg-primary/5" : "border-border"
              } transition-colors`}
              style={{ width: '20%', maxWidth: '20%', minWidth: 0 }}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className={`p-1.5 rounded-t-lg ${column.color} border-b flex-shrink-0`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 min-w-0">
                    <h3 className="text-xs font-semibold truncate">{column.label}</h3>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 flex-shrink-0">{columnTasks.length}</Badge>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => setSelectedTask(task)}
                      isDragging={draggedTask?.id === task.id}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Task Dialog */}
      {createDialogOpen && (
        <TaskForm
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateTask}
          projects={projects}
          users={users}
        />
      )}

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetail
          taskId={selectedTask.id}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  )
}

