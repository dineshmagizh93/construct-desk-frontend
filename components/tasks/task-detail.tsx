"use client"

import * as React from "react"
import { tasksApi, Task, TaskComment, TaskActivity, TaskStatus, TaskPriority, UpdateTaskDto } from "@/lib/api/tasks"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUsers } from "@/lib/hooks/use-users"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, User, MessageSquare, Clock, Edit, Trash2, Send, X } from "lucide-react"
import { format } from "date-fns"
import { TaskForm } from "./task-form"
import { TaskFormSchema } from "@/lib/validations/task"
import { formatDateDMY, formatDateTimeDMY } from "@/lib/utils/date"

interface TaskDetailProps {
  taskId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function TaskDetail({ taskId, open, onOpenChange, onUpdate }: TaskDetailProps) {
  const { projects } = useProjects()
  const { users } = useUsers()
  const { updateTask, deleteTask, addComment } = useTasks()
  const [task, setTask] = React.useState<Task & { comments: TaskComment[]; activities: TaskActivity[] } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [editMode, setEditMode] = React.useState(false)
  const [commentText, setCommentText] = React.useState("")
  const [submittingComment, setSubmittingComment] = React.useState(false)

  React.useEffect(() => {
    if (open && taskId) {
      loadTask()
    }
  }, [open, taskId])

  const loadTask = async () => {
    try {
      setLoading(true)
      const data = await tasksApi.getById(taskId)
      setTask(data)
    } catch (error) {
      console.error("Failed to load task:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data: TaskFormSchema) => {
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
      await updateTask(taskId, updateData)
      setEditMode(false)
      await loadTask()
      onUpdate()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      await deleteTask(taskId)
      onOpenChange(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      await addComment(taskId, commentText)
      setCommentText("")
      await loadTask()
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setSubmittingComment(false)
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading task...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!task) {
    return null
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE

  return (
    <>
      <Dialog open={open && !editMode} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl h-[90vh] max-h-none overflow-hidden overflow-y-hidden p-0"
        >
          <div className="flex h-full flex-col">
            <DialogHeader className="border-b bg-background px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl pr-6 sm:pr-0 break-words">{task.title}</DialogTitle>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid flex-1 min-h-0 gap-5 overflow-hidden px-5 py-4 md:grid-cols-[minmax(0,1fr)_440px]">
            {/* Left: Task info */}
            <div className="min-h-0 overflow-y-auto pr-1">
              <div className="space-y-4">
                <div className="rounded-2xl border bg-white/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Details</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project</label>
                      <p className="mt-1 text-sm break-words">{task.project?.name || "No project"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned To</label>
                      <div className="mt-1 flex items-center gap-2">
                        {task.assignee ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0 truncate text-sm">{task.assignee.firstName} {task.assignee.lastName}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Due Date</label>
                      <p className={`mt-1 flex items-center gap-1 text-sm ${isOverdue ? "text-destructive" : ""}`}>
                        <Calendar className="h-4 w-4" />
                        {task.dueDate ? formatDateDMY(task.dueDate) : "No due date"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Hours</label>
                      <p className="mt-1 flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        {task.estimatedHours || "Not estimated"}
                      </p>
                    </div>
                  </div>
                </div>

                {task.description && (
                  <div className="rounded-2xl border bg-white/70 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Description</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{task.description}</p>
                  </div>
                )}

                {task.labels && (
                  <div className="rounded-2xl border bg-white/70 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Labels</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.labels.split(",").map((label, idx) => (
                        <Badge key={idx} variant="outline">
                          {label.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Collaboration */}
            <div className="min-h-0 overflow-y-auto pl-0 pr-1 md:border-l md:pl-5">
              <div className="space-y-4">
                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-sm font-semibold text-slate-900">Comments ({task.comments.length})</h3>
                  </div>

                  <div className="mt-3 space-y-4">
                    {task.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : (
                      task.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comment.user.firstName} {comment.user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTimeDMY(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="min-h-[92px] flex-1 resize-none"
                      maxLength={250}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                      className="h-[92px] w-[52px] self-stretch px-0"
                      title="Send"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {task.activities.length > 0 && (
                  <div className="rounded-2xl border bg-white/70 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
                    <div className="mt-3 space-y-3">
                      {task.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 text-sm">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {getInitials(activity.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium text-slate-900">
                                {activity.user.firstName} {activity.user.lastName}
                              </span>{" "}
                              {activity.action} {activity.details && `- ${activity.details}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTimeDMY(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Mode */}
      {editMode && task && (
        <TaskForm
          open={editMode}
          onOpenChange={setEditMode}
          onSubmit={handleUpdate}
          projects={projects}
          users={users}
          initialData={{
            title: task.title,
            description: task.description || "",
            projectId: task.projectId || "",
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate || "",
            assignedTo: task.assignedTo || "",
            labels: task.labels || "",
            estimatedHours: task.estimatedHours,
          }}
        />
      )}
    </>
  )
}

