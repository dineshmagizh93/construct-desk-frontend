import { z } from "zod"

export const projectFormSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required")
    .min(3, "Project ID must be at least 3 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(45, "Project name must be 45 characters or less"),
  clientName: z.string().trim().min(1, "Client name is required").max(100, "Client name must be 100 characters or less"),
  location: z.string().trim().min(1, "Location is required").max(150, "Location must be 150 characters or less"),
  description: z
    .string()
    .max(250, "Description must be 250 characters or less")
    .optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["Planning", "In Progress", "On Hold", "Completed"], {
    required_error: "Status is required",
  }),
  estimatedBudget: z.union([
    z.number().min(0.01, "Budget must be greater than 0"),
    z.string().min(1, "Budget is required").transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new z.ZodError([{
          code: "custom",
          path: ["estimatedBudget"],
          message: "Budget must be a positive number",
        }])
      }
      return num
    }),
  ]),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end >= start
}, {
  message: "End date must be greater than the start date",
  path: ["endDate"],
}).refine((data) => {
  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDate = new Date(data.startDate)
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

  if (startDateOnly > todayDateOnly) {
    return data.status === "Planning"
  }

  return true
}, {
  message: "Future start date projects must stay in Planning status",
  path: ["status"],
})

export type ProjectFormSchema = z.infer<typeof projectFormSchema>

