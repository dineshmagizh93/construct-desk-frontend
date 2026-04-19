"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { setAuthToken } from "@/lib/config"
import { apiClient } from "@/lib/api/client"
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, ShieldCheck, UserPlus, X } from "lucide-react"

const passwordStrengthSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")

const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordStrengthSchema,
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
})

type RegisterFormData = z.infer<typeof registerSchema>

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

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordValue, setPasswordValue] = React.useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch("password", "")

  React.useEffect(() => {
    setPasswordValue(watchedPassword || "")
  }, [watchedPassword])

  const strength = getStrengthLevel(passwordValue)
  const passedRequirements = passwordRules.filter((rule) => rule.test(passwordValue)).length

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.post<{
        message?: string
        requiresApproval?: boolean
        access_token?: string
        user: any
        company: any
      }>("/auth/register", {
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (response.access_token) {
        setAuthToken(response.access_token)
        router.push("/dashboard")
        router.refresh()
        return
      }

      if (response.message && !response.requiresApproval) {
        router.push("/login")
        return
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-3 sm:px-6 sm:py-4 lg:px-8 [@media(max-height:860px)]:py-2">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.45),transparent_85%)]" />
      <div className="pointer-events-none absolute left-[10%] top-20 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[8%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center py-1 [@media(max-height:860px)]:py-0.5">
        <div className="grid w-full items-center gap-4 min-[1450px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] min-[1450px]:gap-6">
          <div className="hidden min-[1450px]:block">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-4 py-2 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Start with a Professional Setup
              </div>
              <div className="space-y-2.5">
                <h1 className="text-4xl font-extrabold leading-[0.98] tracking-tight text-slate-900 2xl:text-5xl">
                  Create your
                  <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                    ConstructDesk account
                  </span>
                </h1>
                <p className="max-w-lg text-[15px] leading-7 text-slate-600 2xl:text-base">
                  Set up your company workspace and bring projects, inventory, labour, vendors, and finances together from day one.
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/80 bg-white/80 p-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Quick company onboarding</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">Create your workspace in minutes and move straight into your operations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-900 p-3.5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">Built for growing teams</p>
                    <p className="mt-1 text-sm leading-5 text-slate-300">Give site and office teams one shared system instead of scattered tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl [@media(max-height:860px)]:rounded-[1.5rem]">
            <div className="h-2 bg-[linear-gradient(90deg,#2563eb,#4f46e5,#f97316)]" />
            <CardContent className="p-4 sm:p-5 [@media(max-height:860px)]:p-3">
              <div className="mb-3 text-center [@media(max-height:860px)]:mb-2">
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] [@media(max-height:860px)]:mb-2 [@media(max-height:860px)]:h-9 [@media(max-height:860px)]:w-9">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">ConstructDesk</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl [@media(max-height:860px)]:text-lg">Create Account</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm [@media(max-height:860px)]:mt-0.5 [@media(max-height:860px)]:leading-4">
                  Set up a new company account to get started.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                className="space-y-2 [@media(max-height:860px)]:space-y-1.5"
              >
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2 [@media(max-height:860px)]:space-y-1">
                  <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="My Construction Company"
                    {...register("companyName")}
                    autoComplete="organization"
                    className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200 [@media(max-height:860px)]:h-9"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2 [@media(max-height:860px)]:space-y-1">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                    autoComplete="off"
                    className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200 [@media(max-height:860px)]:h-9"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 [@media(max-height:860px)]:gap-1.5">
                  <div className="space-y-2 [@media(max-height:860px)]:space-y-1">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register("firstName")}
                    className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200 [@media(max-height:860px)]:h-9"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 [@media(max-height:860px)]:space-y-1">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register("lastName")}
                    className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200 [@media(max-height:860px)]:h-9"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 [@media(max-height:860px)]:space-y-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...register("password")}
                      autoComplete="new-password"
                      className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 pr-11 shadow-sm focus-visible:ring-blue-200 [@media(max-height:860px)]:h-9"
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

                  <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2 [@media(max-height:860px)]:space-y-1.5 [@media(max-height:860px)]:p-1.5">
                    <div className="space-y-1.5 [@media(max-height:860px)]:space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Password Strength
                        </p>
                        {passwordValue.length > 0 ? (
                          <span className={`text-xs font-semibold ${strength.color}`}>
                            {strength.label}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Start typing</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordValue.length > 0 && level <= strength.score ? strength.barColor : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600 [@media(max-height:860px)]:text-[10px]">
                        {passedRequirements} of {passwordRules.length} requirements met
                      </p>
                    </div>

                    <div className="grid gap-1 [@media(max-height:860px)]:gap-0.5">
                      {passwordRules.map((rule) => {
                        const isMet = rule.test(passwordValue)

                        return (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] leading-4 transition-colors [@media(max-height:860px)]:px-1.5 [@media(max-height:860px)]:py-0.5 [@media(max-height:860px)]:text-[10px] ${
                              isMet
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white/80 text-slate-600"
                            }`}
                          >
                            {isMet ? (
                              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            )}
                            <span className="truncate">{rule.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-10 w-full rounded-xl bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(37,99,235,0.34)] [@media(max-height:860px)]:h-9"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-1.5 text-center text-sm text-slate-600 [@media(max-height:860px)]:py-1 [@media(max-height:860px)]:text-xs">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative z-10 shrink-0 pt-0.5 text-center text-[10px] text-slate-500 sm:pt-1 [@media(max-height:860px)]:hidden">
        <p>&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
      </div>
    </div>
  )
}
