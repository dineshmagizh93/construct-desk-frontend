import { z } from "zod"

export const paymentFormSchema = z
  .object({
    projectId: z.string().min(1, "Project is required"),
    milestone: z.string().trim().min(1, "Milestone name is required").min(2, "Milestone must be at least 2 characters"),
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
    dueDate: z.string().min(1, "Due date is required"),
    status: z.enum(["Pending", "Paid", "Overdue"], {
      required_error: "Status is required",
    }),
    paidDate: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Paid") {
        return !!data.paidDate && data.paidDate.length > 0
      }
      return true
    },
    {
      message: "Paid date is required when status is Paid",
      path: ["paidDate"],
    }
  )

export type PaymentFormSchema = z.infer<typeof paymentFormSchema>

