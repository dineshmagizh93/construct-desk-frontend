import { z } from "zod"

export const userFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").min(2, "First name must be at least 2 characters").max(50, "First name must be 50 characters or less"),
  lastName: z.string().trim().min(1, "Last name is required").min(2, "Last name must be at least 2 characters").max(50, "Last name must be 50 characters or less"),
  email: z.string().trim().email("Invalid email address").min(1, "Email is required").refine(
    (email) => {
      // Strict email validation - must be a valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    {
      message: "Please enter a valid email address (e.g., user@example.com)",
    }
  ),
  role: z.enum(["admin", "user"], {
    required_error: "Role is required",
  }),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional(),
})

export const changePasswordSchema = z
  .object({
    email: z.string().email("Invalid email address").max(100, "Email must be 100 characters or less").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type UserFormSchema = z.infer<typeof userFormSchema>

