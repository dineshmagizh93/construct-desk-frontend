import { z } from "zod"

export const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required").min(2, "Vendor name must be at least 2 characters").max(100, "Vendor name must be 100 characters or less"),
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
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be 20 characters or less").regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").max(100, "Email must be 100 characters or less").optional().or(z.literal("")),
  address: z.string().max(150, "Address must be 150 characters or less").optional(),
  city: z.string().max(60, "City must be 60 characters or less").optional(),
  state: z.string().max(60, "State must be 60 characters or less").optional(),
  country: z.string().max(60, "Country must be 60 characters or less").optional(),
  notes: z.string().max(250, "Notes must be 250 characters or less").optional(),
  status: z.enum(["Active", "Inactive"], {
    required_error: "Status is required",
  }),
})

export type VendorFormSchema = z.infer<typeof vendorFormSchema>

