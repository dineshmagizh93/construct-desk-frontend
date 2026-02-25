import { z } from "zod"

export const labourFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  category: z.enum(["Mason", "Helper", "Carpenter", "Electrician", "Plumber", "Painter", "Other"], {
    required_error: "Category is required",
  }),
  headcount: z.union([
    z.number().min(1, "Headcount must be at least 1").int("Headcount must be a whole number"),
    z.string().min(1, "Headcount is required").transform((val) => {
      const num = parseInt(val)
      if (isNaN(num) || num < 1) {
        throw new z.ZodError([{
          code: "custom",
          path: ["headcount"],
          message: "Headcount must be at least 1",
        }])
      }
      return num
    }),
  ]),
  costPerDay: z.union([
    z.number().min(0.01, "Cost per day must be greater than 0"),
    z.string().min(1, "Cost per day is required").transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new z.ZodError([{
          code: "custom",
          path: ["costPerDay"],
          message: "Cost per day must be greater than 0",
        }])
      }
      return num
    }),
  ]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

export type LabourFormSchema = z.infer<typeof labourFormSchema>

