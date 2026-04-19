"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { Lock, CheckCircle2, Eye, EyeOff, X } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PasswordStrengthRule {
  label: string
  test: (password: string) => boolean
}

const passwordRules: PasswordStrengthRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrengthLevel(password: string): { score: number; label: string; color: string; barColor: string } {
  if (!password) return { score: 0, label: "", color: "", barColor: "" }
  const passed = passwordRules.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: 1, label: "Very Weak", color: "text-red-600", barColor: "bg-red-500" }
  if (passed === 2) return { score: 2, label: "Weak", color: "text-orange-500", barColor: "bg-orange-500" }
  if (passed === 3) return { score: 3, label: "Fair", color: "text-yellow-600", barColor: "bg-yellow-500" }
  if (passed === 4) return { score: 4, label: "Strong", color: "text-blue-600", barColor: "bg-blue-500" }
  return { score: 5, label: "Very Strong", color: "text-emerald-600", barColor: "bg-emerald-500" }
}

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const token = searchParams.get("token")

  React.useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.")
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const newPasswordValue = watch("newPassword", "")
  const strength = getStrengthLevel(newPasswordValue || "")

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await authApi.resetPassword(token, data.newPassword)

      setSuccess(true)

      setTimeout(() => {
        router.push("/login?passwordReset=true")
      }, 2000)
    } catch (err: any) {
      const errorMessage = Array.isArray(err.message)
        ? err.message.join(", ")
        : err.message || "Failed to reset password. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg font-semibold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button className="w-full" variant="default">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button className="w-full mt-2" variant="outline">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-green-600">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.10),_transparent_40%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_50%,#ffffff_100%)] px-4 py-8">
      <Card className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="h-2 bg-[linear-gradient(90deg,#2563eb,#4f46e5,#f97316)]" />
        <CardHeader className="space-y-1 text-center px-6 pt-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)]">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Reset Your Password</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("newPassword")}
                  className="h-11 rounded-xl border-slate-200 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password strength */}
              {newPasswordValue && newPasswordValue.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                            level <= strength.score ? strength.barColor : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(newPasswordValue)
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                          ) : (
                            <X className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
                          )}
                          <span className={`text-xs ${passed ? "text-emerald-700" : "text-slate-500"}`}>
                            {rule.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className="h-11 rounded-xl border-slate-200 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(37,99,235,0.32)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  Resetting Password...
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
          <Card className="w-full max-w-md shadow-xl border-2">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-lg font-semibold">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  )
}
