import { z } from "zod"

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters").max(80, "Name must be 80 characters or less"),
  phone: z.string().trim().min(1, "Phone is required").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").max(100, "Email must be 100 characters or less").optional().or(z.literal("")),
  source: z.enum(["Broker", "Portal", "Referral", "Direct"], {
    required_error: "Source is required",
  }),
  status: z.enum(["New", "Contacted", "Qualified", "Converted", "Lost"], {
    required_error: "Status is required",
  }),
  assignedTo: z.string().max(80, "Assigned To must be 80 characters or less").optional(),
  notes: z.string().max(250, "Notes must be 250 characters or less").optional(),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

