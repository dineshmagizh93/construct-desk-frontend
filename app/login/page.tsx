"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { setAuthToken } from "@/lib/config"
import { authApi } from "@/lib/api/auth"
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  React.useEffect(() => {
    if (searchParams.get("passwordReset") === "true") {
      setSuccessMessage("Password reset successful! Please login with your new password.")
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.login({
        email: data.email,
        password: data.password,
      })

      if (response.mustChangePassword) {
        sessionStorage.setItem("changePasswordEmail", data.email)
        router.push("/change-password")
        return
      }

      if (response.access_token) {
        setAuthToken(response.access_token)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      const errorMessage = Array.isArray(err.message)
        ? err.message.join(", ")
        : err.message || "Login failed. Please check your credentials."

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.45),transparent_85%)]" />
      <div className="pointer-events-none absolute left-[10%] top-20 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[8%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center">
        <div className="grid w-full items-center gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="hidden xl:block">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Secure Access for Your Construction Team
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 2xl:text-5xl">
                  Welcome back to
                  <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                    ConstructDesk
                  </span>
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-slate-600 2xl:text-lg">
                  Access your projects, teams, materials, and financial data from one clean workspace built for modern construction operations.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Live Visibility</p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    Keep sites, staff, materials, and spend aligned in real time.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/80 bg-slate-900 p-4 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Fast Sign In</p>
                  <p className="mt-2 text-sm leading-5 text-slate-200">
                    Jump back into your dashboard and continue work without friction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <div className="h-2 bg-[linear-gradient(90deg,#2563eb,#4f46e5,#f97316)]" />
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)]">
                  <LogIn className="h-5 w-5" />
                </div>
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">ConstructDesk</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Enter your credentials to access your account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {successMessage && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 pr-11 shadow-sm focus-visible:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(37,99,235,0.34)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">Logging in...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center text-sm text-slate-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                    Register here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 z-10 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] px-4 py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.22)]">
              <Building2 className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
