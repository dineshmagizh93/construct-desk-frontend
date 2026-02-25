import { z } from "zod"

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required").min(2, "Vendor name must be at least 2 characters"),
  type: z.enum([
    "Material Supplier",
    "Contractor",
    "Electrician",
    "Plumber",
    "Transport",
    "Equipment Rental",
    "Other",
  ], {
    required_error: "Vendor type is required",
  }),
  phone: z.string().trim().min(1, "Phone is required").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["Active", "Inactive"], {
    required_error: "Status is required",
  }),
})

export type VendorFormSchema = z.infer<typeof vendorFormSchema>

