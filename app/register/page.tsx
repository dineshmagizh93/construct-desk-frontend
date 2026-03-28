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
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, UserPlus } from "lucide-react"

const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

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
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.45),transparent_85%)]" />
      <div className="pointer-events-none absolute left-[10%] top-20 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[8%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center">
        <div className="grid w-full items-center gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="hidden xl:block">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Start with a Professional Setup
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 2xl:text-5xl">
                  Create your
                  <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                    ConstructDesk account
                  </span>
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-slate-600 2xl:text-lg">
                  Set up your company workspace and bring projects, inventory, labour, vendors, and finances together from day one.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Quick company onboarding</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">Create your workspace in minutes and move straight into your operations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-900 p-4 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                  <div>
                    <p className="font-semibold text-white">Built for growing teams</p>
                    <p className="mt-1 text-sm leading-5 text-slate-300">Give site and office teams one shared system instead of scattered tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <div className="h-2 bg-[linear-gradient(90deg,#2563eb,#4f46e5,#f97316)]" />
            <CardContent className="p-5 sm:p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">ConstructDesk</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Set up a new company account to get started.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="My Construction Company"
                    {...register("companyName")}
                    className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                    className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register("firstName")}
                      className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register("lastName")}
                      className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className="h-11 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm focus-visible:ring-blue-200"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(37,99,235,0.34)]"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center text-sm text-slate-600">
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

      <div className="absolute bottom-3 left-0 right-0 z-10 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
      </div>
    </div>
  )
}
