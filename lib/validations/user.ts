import { z } from "zod"

export const userFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
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
  phone: z.string().optional(),
})

export const changePasswordSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  currentPassword: z.string().optional(), // Not shown in form, comes from session
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type UserFormSchema = z.infer<typeof userFormSchema>

