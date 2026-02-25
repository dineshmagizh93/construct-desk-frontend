import { z } from "zod"
import { TaskStatus, TaskPriority } from "@/lib/api/tasks"

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  projectId: z.string().min(1, "Project is required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Status is required" }),
  priority: z.nativeEnum(TaskPriority, { required_error: "Priority is required" }),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  labels: z.string().optional().or(z.literal("")),
  estimatedHours: z.union([
    z.number().min(0.1, "Estimated hours must be greater than 0"),
    z.string().min(1, "Estimated hours is required").transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new Error("Estimated hours must be a valid number greater than 0")
      }
      return num
    }),
  ]),
})

export type TaskFormSchema = z.infer<typeof taskFormSchema>

export const taskCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").trim(),
})

export type TaskCommentSchema = z.infer<typeof taskCommentSchema>

