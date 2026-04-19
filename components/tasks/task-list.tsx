"use client"

import * as React from "react"
import { Task, TaskStatus, TaskPriority, UpdateTaskDto } from "@/lib/api/tasks"
import { useTasks } from "@/lib/hooks/use-tasks"
import toast from "react-hot-toast"
import { TaskForm } from "./task-form"
import { TaskDetail } from "./task-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { Plus, Search, Calendar, User, Clock, Edit, Trash2, MoreVertical, Eye, LayoutGrid, List, Upload } from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUsers } from "@/lib/hooks/use-users"
import { TaskListParams } from "@/lib/api/tasks"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { formatDateDMY } from "@/lib/utils/date"
import { downloadTaskBulkTemplate, parseBulkTasksFromCsv } from "./task-bulk-utils"

interface TaskListProps {
  viewMode?: "kanban" | "list"
  setViewMode?: (mode: "kanban" | "list") => void
}

export function TaskList({ viewMode, setViewMode }: TaskListProps = {}) {
  const { projects } = useProjects()
  const { users } = useUsers()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  // Filtering
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [assignedFilter, setAssignedFilter] = React.useState<string>("all")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const filters = React.useMemo<TaskListParams>(() => {
    const nextFilters: TaskListParams = {
      page: currentPage,
      limit: itemsPerPage,
    }
    if (statusFilter !== "all") nextFilters.status = statusFilter
    if (priorityFilter !== "all") nextFilters.priority = priorityFilter
    if (assignedFilter !== "all") nextFilters.assignedTo = assignedFilter
    if (projectFilter !== "all") nextFilters.projectId = projectFilter
    if (searchQuery) nextFilters.search = searchQuery
    return nextFilters
  }, [assignedFilter, currentPage, itemsPerPage, priorityFilter, projectFilter, searchQuery, statusFilter])
  const { tasks, total, loading, error, createTask, updateTask, deleteTask, loadTasks, bulkCreateTasks } = useTasks(filters)

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, priorityFilter, assignedFilter, projectFilter, searchQuery])

  // Reset to page 1 when itemsPerPage changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Adjust current page if it's out of bounds after filtering or page size change
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    } else if (currentPage < 1) {
      setCurrentPage(1)
    }
  }, [totalPages, itemsPerPage])

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data)
      setCreateDialogOpen(false)
      await loadTasks()
    } catch (error) {
      throw error
    }
  }

  const handleEditTask = async (data: any) => {
    if (!taskToEdit) return
    try {
      const updateData: UpdateTaskDto = {
        title: data.title,
        description: data.description,
        projectId: data.projectId || undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
        assignedTo: data.assignedTo || undefined,
        labels: data.labels || undefined,
        estimatedHours: data.estimatedHours,
      }
      await updateTask(taskToEdit.id, updateData)
      setEditDialogOpen(false)
      setTaskToEdit(null)
      await loadTasks()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask(taskToDelete.id)
      await loadTasks() // Force refresh
      toast.success("Task deleted successfully")
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error: any) {
      console.error("Failed to delete task:", error)
      const errorMessage = error?.message || "Failed to delete task. Please try again."
      toast.error(errorMessage)
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500 text-white"
      case TaskPriority.HIGH:
        return "bg-orange-500 text-white"
      case TaskPriority.MEDIUM:
        return "bg-yellow-500 text-white"
      case TaskPriority.LOW:
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800"
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800"
      case TaskStatus.REVIEW:
        return "bg-yellow-100 text-yellow-800"
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800"
      case TaskStatus.BLOCKED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (user?: { firstName?: string; lastName?: string; email?: string }) => {
    if (!user) return "?"
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return "?"
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE
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
    <div className="flex flex-col h-full min-h-0 gap-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 flex-shrink-0 pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">View and manage all tasks in a list format</p>
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkUploadOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row flex-shrink-0 my-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[150px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.REVIEW}>Review</option>
          <option value={TaskStatus.DONE}>Done</option>
          <option value={TaskStatus.BLOCKED}>Blocked</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-[150px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Priorities</option>
          <option value={TaskPriority.LOW}>Low</option>
          <option value={TaskPriority.MEDIUM}>Medium</option>
          <option value={TaskPriority.HIGH}>High</option>
          <option value={TaskPriority.URGENT}>Urgent</option>
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="w-[180px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || `${user.firstName} ${user.lastName}`}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div
          className={cn(
            "flex-1 min-h-0 overflow-x-auto", // Horizontal scroll on mobile
            "overflow-y-auto" // Always allow vertical scroll for table content
          )}
          data-table-scroll-container
        >
          <Table className="border-0 rounded-none min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Estimated</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div
                          className="font-medium cursor-pointer hover:text-primary truncate"
                          onClick={() => setSelectedTask(task)}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 truncate">
                            {task.description}
                          </p>
                        )}
                        {task.labels && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.labels.split(",").slice(0, 3).map((label, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                                {label.trim()}
                              </Badge>
                            ))}
                            {task.labels.split(",").length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                +{task.labels.split(",").length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {task.project ? (
                        <span className="truncate block" title={task.project.name}>
                          {task.project.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No project</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Avatar className="h-4 w-4 flex-shrink-0">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1 ${isOverdue(task) ? "text-destructive" : ""}`}>
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{formatDateDMY(task.dueDate)}</span>
                          {isOverdue(task) && (
                            <span className="text-[10px] text-destructive ml-1 flex-shrink-0">(Overdue)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {task.estimatedHours ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {task.estimatedHours}h
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="relative text-center">
                      <DropdownMenu
                        open={openDropdownId === task.id}
                        onOpenChange={(open) => setOpenDropdownId(open ? task.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTaskToEdit(task)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTaskToDelete(task)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 border-t border-border/50 -mt-px">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={total}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
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

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Bulk Upload Tasks"
        description="Upload a CSV file containing tasks. Project IDs should match exactly or leave blank. Invalid projects are skipped."
        requiredHeaders={["Project ID", "Title", "Status"]}
        onDownloadTemplate={downloadTaskBulkTemplate}
        onParseCsv={parseBulkTasksFromCsv}
        onUpload={async (rows) => {
          const res = await bulkCreateTasks(rows)
          return res
        }}
      />

      {/* Edit Task Dialog */}
      {editDialogOpen && taskToEdit && (
        <TaskForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleEditTask}
          projects={projects}
          users={users}
          initialData={{
            title: taskToEdit.title,
            description: taskToEdit.description || "",
            projectId: taskToEdit.projectId || "",
            status: taskToEdit.status,
            priority: taskToEdit.priority,
            dueDate: taskToEdit.dueDate || "",
            assignedTo: taskToEdit.assignedTo || "",
            labels: taskToEdit.labels || "",
            estimatedHours: taskToEdit.estimatedHours,
          }}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && taskToDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{taskToDelete.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteTask()
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

