"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TaskFormSchema, taskFormSchema } from "@/lib/validations/task"
import { TaskStatus, TaskPriority } from "@/lib/api/tasks"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormSchema) => Promise<void>
  projects: Array<{ id: string; name: string }>
  users: Array<{ id: string; name?: string; firstName?: string; lastName?: string; email: string }>
  initialData?: Partial<TaskFormSchema>
}

export function TaskForm({ open, onOpenChange, onSubmit, projects, users, initialData }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      projectId: initialData?.projectId || "",
      status: initialData?.status || TaskStatus.TODO,
      priority: initialData?.priority || TaskPriority.MEDIUM,
      dueDate: initialData?.dueDate || "",
      assignedTo: initialData?.assignedTo || "",
      labels: initialData?.labels || "",
      estimatedHours: initialData?.estimatedHours,
    },
  })

  React.useEffect(() => {
    if (open && initialData) {
      reset(initialData)
    } else if (open && !initialData) {
      reset({
        title: "",
        description: "",
        projectId: "",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: "",
        assignedTo: "",
        labels: "",
        estimatedHours: undefined,
      })
    }
  }, [open, initialData, reset])

  const onFormSubmit = async (data: TaskFormSchema) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update task details" : "Add a new task to your Kanban board"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter task title"
              className="mt-1"
              maxLength={120}
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter task description"
              className="mt-1"
              rows={4}
              maxLength={500}
              required
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <Label htmlFor="projectId">
                Project <span className="text-destructive">*</span>
              </Label>
              <select
                id="projectId"
                {...register("projectId")}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-sm text-destructive mt-1">{errors.projectId.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.DONE}>Done</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">
                Priority <span className="text-destructive">*</span>
              </Label>
              <select
                id="priority"
                {...register("priority")}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
              {errors.priority && (
                <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <Label htmlFor="assignedTo">
                Assign To <span className="text-destructive">*</span>
              </Label>
              <select
                id="assignedTo"
                {...register("assignedTo")}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select an assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || `${user.firstName} ${user.lastName}`}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-sm text-destructive mt-1">{errors.assignedTo.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="mt-1"
                required
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Estimated Hours */}
            <div>
              <Label htmlFor="estimatedHours">
                Estimated Hours <span className="text-destructive">*</span>
              </Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                {...register("estimatedHours", { valueAsNumber: true })}
                placeholder="Enter estimated hours"
                className="mt-1"
                required
              />
              {errors.estimatedHours && (
                <p className="text-sm text-destructive mt-1">{errors.estimatedHours.message}</p>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <Label htmlFor="labels">Labels (comma-separated) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <Input
              id="labels"
              {...register("labels")}
              placeholder="e.g., Frontend, Bug, Urgent"
              className="mt-1"
              maxLength={120}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

