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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-lg mb-2">{task.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  {isOverdue && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project</label>
                <p className="mt-1">{task.project?.name || "No project"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                <div className="mt-1 flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(task.assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <p className={`mt-1 flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                  <Calendar className="h-4 w-4" />
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estimated Hours</label>
                <p className="mt-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {task.estimatedHours || "Not estimated"}
                </p>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Labels */}
            {task.labels && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Labels</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {task.labels.split(",").map((label, idx) => (
                    <Badge key={idx} variant="outline">
                      {label.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">Comments ({task.comments.length})</h3>
              </div>

              <div className="space-y-4 mb-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user.firstName} {comment.user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Activity Timeline */}
            {task.activities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Activity</h3>
                <div className="space-y-3">
                  {task.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(activity.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">
                            {activity.user.firstName} {activity.user.lastName}
                          </span>{" "}
                          {activity.action} {activity.details && `- ${activity.details}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

