"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usersApi, UpdateUserDto } from "@/lib/api/users"
import { useAuth } from "@/lib/hooks/use-auth"
import { ApiError } from "@/lib/api/client"
import { Loader2 } from "lucide-react"

// Profile form schema (password is optional for profile updates)
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters").max(50, "First name must be 50 characters or less"),
  lastName: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters").max(50, "Last name must be 50 characters or less"),
  email: z.string().email("Invalid email address").max(100, "Email must be 100 characters or less"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional(),
}).refine((data) => {
  // If password is provided, it must be at least 6 characters
  if (data.password && data.password.length > 0) {
    if (data.password.length < 6) {
      return false
    }
  }
  return true
}, {
  message: "Password must be at least 6 characters",
  path: ["password"],
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ProfileFormSchema = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: any
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { checkAuth, user: authUser } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (data: ProfileFormSchema) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const updateData: UpdateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
      }

      // Only include password if it's provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password
      }

      await usersApi.update(user.id, updateData)

      setSuccess("Profile updated successfully!")
      
      // Refresh auth to get updated user data
      await checkAuth()
      
      // Clear password fields
      setValue("password", "")
      setValue("confirmPassword", "")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = Array.isArray(apiError.message) ? apiError.message[0] : (apiError.message || "Failed to update profile. Please try again.")
      setError(errorMessage)
      console.error("Error updating profile:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="John"
            maxLength={50}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Doe"
            maxLength={50}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@example.com"
          maxLength={100}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+1 (555) 123-4567"
          maxLength={20}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Password Section */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-sm font-medium mb-2">Change Password</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Leave blank if you don't want to change your password
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Leave blank to keep current password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Role Display (Read-only) */}
      <div className="space-y-2">
        <Label>Role</Label>
        <Input
          value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your role cannot be changed. Contact an administrator if you need to change your role.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}

