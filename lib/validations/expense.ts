import { z } from "zod"

export const expenseFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  category: z.enum(["Material", "Labour", "Transport", "Equipment", "Other"], {
    required_error: "Category is required",
  }),
  amount: z.union([
    z.number().min(0.01, "Amount must be greater than 0"),
    z.string().min(1, "Amount is required").transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new z.ZodError([{
          code: "custom",
          path: ["amount"],
          message: "Amount must be greater than 0",
        }])
      }
      return num
    }),
  ]),
  date: z.string().min(1, "Date is required"),
  paidTo: z
    .string()
    .trim()
    .min(1, "Paid To is required")
    .min(2, "Paid To must be at least 2 characters")
    .max(80, "Paid To must be 80 characters or less"),
  notes: z.string().max(250, "Notes must be 250 characters or less").optional(),
  attachment: z.string().url("Invalid URL").max(500, "Attachment URL must be 500 characters or less").optional().or(z.literal("")),
})

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>

