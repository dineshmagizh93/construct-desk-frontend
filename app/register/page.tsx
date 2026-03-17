"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setAuthToken } from "@/lib/config"
import { apiClient } from "@/lib/api/client"
import { Building2 } from "lucide-react"
import Link from "next/link"

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
        message?: string; 
        requiresApproval?: boolean;
        access_token?: string; 
        user: any; 
        company: any 
      }>("/auth/register", {
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      // If token is provided, save and redirect to dashboard (immediate login)
      if (response.access_token) {
        setAuthToken(response.access_token)
        router.push("/dashboard")
        router.refresh()
        return
      }

      // Fallback: if no token but registration succeeded, redirect to login
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
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ConstructDesk</h1>
          <p className="text-xs text-muted-foreground">Manage your construction projects efficiently</p>
        </div>

        <Card className="shadow-xl border-2 w-full">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Register</CardTitle>
            <CardDescription className="text-xs">Create a new company account</CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            {error && (
              <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-medium">Company Name</Label>
              <Input
                id="companyName"
                placeholder="My Construction Company"
                {...register("companyName")}
                className="h-9 text-sm"
              />
              {errors.companyName && (
                <p className="text-xs text-destructive mt-0.5">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register("email")}
                className="h-9 text-sm"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                  className="h-9 text-sm"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-0.5">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                  className="h-9 text-sm"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-0.5">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="h-9 text-sm"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-0.5">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-9 text-sm mt-2" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

