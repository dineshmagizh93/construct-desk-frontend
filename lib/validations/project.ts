import { z } from "zod"

export const projectFormSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID is required")
    .min(3, "Project ID must be at least 3 characters"),
  name: z.string().trim().min(1, "Project name is required").min(3, "Project name must be at least 3 characters"),
  clientName: z.string().trim().min(1, "Client name is required"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().optional(),
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
  message: "End date must be after start date",
  path: ["endDate"],
})

export type ProjectFormSchema = z.infer<typeof projectFormSchema>

