import { z } from "zod"

export const documentFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  name: z.string().trim().min(1, "Document name is required"),
  type: z.enum(["Agreement", "Drawing", "Bill", "Invoice", "Approval", "Permit", "Receipt", "Other"], {
    required_error: "Document type is required",
  }),
  fileUrl: z.string().url("Invalid file URL").min(1, "File URL is required"),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  notes: z.string().optional(),
})

export type DocumentFormSchema = z.infer<typeof documentFormSchema>

