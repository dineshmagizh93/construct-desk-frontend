import { z } from "zod"

export const documentFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  name: z.string().trim().min(1, "Document name is required").max(120, "Document name must be 120 characters or less"),
  type: z.enum(["Agreement", "Drawing", "Bill", "Invoice", "Approval", "Permit", "Receipt", "Other"], {
    required_error: "Document type is required",
  }),
  fileUrl: z.string().url("Invalid file URL").min(1, "File URL is required").max(500, "File URL must be 500 characters or less"),
  fileName: z.string().max(255, "File name must be 255 characters or less").optional(),
  fileSize: z.number().optional(),
  notes: z.string().max(250, "Notes must be 250 characters or less").optional(),
})

export type DocumentFormSchema = z.infer<typeof documentFormSchema>

