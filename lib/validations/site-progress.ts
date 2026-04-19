import { z } from "zod"

export const siteProgressFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(150, "Notes must be 150 characters or less").optional(),
  photos: z.array(z.string()).default([]),
})

export type SiteProgressFormSchema = z.infer<typeof siteProgressFormSchema>

