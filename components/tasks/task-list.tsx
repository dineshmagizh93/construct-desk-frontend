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
import { Plus, Search, Calendar, User, Clock, Edit, Trash2, MoreVertical, Eye } from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUsers } from "@/lib/hooks/use-users"
import { TaskFilters } from "@/lib/api/tasks"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function TaskList() {
  const { projects } = useProjects()
  const { users } = useUsers()
  const [filters, setFilters] = React.useState<TaskFilters>({})
  const { tasks, loading, error, createTask, updateTask, deleteTask, loadTasks } = useTasks(filters)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(25)

  // Filtering
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [assignedFilter, setAssignedFilter] = React.useState<string>("all")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const newFilters: TaskFilters = {}
    if (statusFilter !== "all") newFilters.status = statusFilter
    if (priorityFilter !== "all") newFilters.priority = priorityFilter
    if (assignedFilter !== "all") newFilters.assignedTo = assignedFilter
    if (projectFilter !== "all") newFilters.projectId = projectFilter
    if (searchQuery) newFilters.search = searchQuery
    setFilters(newFilters)
    setCurrentPage(1)
  }, [statusFilter, priorityFilter, assignedFilter, projectFilter, searchQuery])

  // Filter and paginate tasks
  const filteredTasks = React.useMemo(() => {
    return tasks
  }, [tasks])

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage))
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  React.useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, priorityFilter, assignedFilter, projectFilter, searchQuery])

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
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground">View and manage all tasks in a list format</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap flex-shrink-0">
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
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Estimated</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div
                          className="font-medium cursor-pointer hover:text-primary"
                          onClick={() => setSelectedTask(task)}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        {task.labels && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.labels.split(",").slice(0, 3).map((label, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {label.trim()}
                              </Badge>
                            ))}
                            {task.labels.split(",").length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.labels.split(",").length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {task.project ? (
                        <span className="text-sm">{task.project.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No project</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1 text-sm ${isOverdue(task) ? "text-destructive" : ""}`}>
                          <Calendar className="h-4 w-4" />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                          {isOverdue(task) && (
                            <span className="text-xs text-destructive ml-1">(Overdue)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.estimatedHours ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {task.estimatedHours}h
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
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
        {filteredTasks.length > 0 && (
          <div className="flex-shrink-0 border-t bg-card">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredTasks.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
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

