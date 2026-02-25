"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePasswordSchema } from "@/lib/validations/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"
import toast from "react-hot-toast"
import type { z } from "zod"

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState<string>("")

  React.useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('changePasswordEmail')
    if (!storedEmail) {
      // If no email in session, redirect to login
      router.push("/login")
      return
    }
    setEmail(storedEmail)
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      email: email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Update form when email is loaded
  React.useEffect(() => {
    if (email) {
      setValue("email", email)
    }
  }, [email, setValue])

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current password from sessionStorage (temporary token)
      const tempPassword = sessionStorage.getItem('changePasswordTempToken')
      if (!tempPassword) {
        setError("Session expired. Please login again.")
        toast.error("Session expired. Please login again.")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (!email) {
        setError("Email not found. Please login again.")
        toast.error("Email not found. Please login again.")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      console.log("Changing password for:", email)
      console.log("Using temp password from session")

      // Call change password API
      const response = await apiClient.post("/auth/change-password", {
        email: email,
        currentPassword: tempPassword,
        newPassword: data.newPassword,
      })

      console.log("Change password response:", response)

      // Clear session storage
      sessionStorage.removeItem('changePasswordEmail')
      sessionStorage.removeItem('changePasswordTempToken')

      // Show success message and redirect to login
      toast.success("Password changed successfully! Please login with your new password.")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      console.error("Change password error:", err)
      // Show the actual backend error message
      const errorMessage = Array.isArray(err.message) 
        ? err.message.join(', ') 
        : err.message || "Failed to change password. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
          <CardDescription>
            You must change your default password before continuing. Please enter your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                value={email}
                disabled
                className="bg-muted"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is your login email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                {...register("newPassword")}
                required
                minLength={6}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                required
                minLength={6}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

