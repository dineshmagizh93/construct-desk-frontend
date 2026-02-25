"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setAuthToken } from "@/lib/config"
import { authApi } from "@/lib/api/auth"
import { LogIn, Building2, Lock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (searchParams.get('passwordReset') === 'true') {
      setSuccessMessage('Password reset successful! Please login with your new password.')
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

      // Check if user must change password
      if (response.mustChangePassword) {
        // Store email in sessionStorage for change password page
        sessionStorage.setItem('changePasswordEmail', data.email)
        sessionStorage.setItem('changePasswordTempToken', data.password) // Store temporarily for verification
        // Redirect to change password page
        router.push("/change-password")
        return
      }

      // Save token (backend returns access_token, not accessToken)
      if (response.access_token) {
        setAuthToken(response.access_token)
        // Redirect to dashboard
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      // Show the actual backend error message
      const errorMessage = Array.isArray(err.message) 
        ? err.message.join(', ') 
        : err.message || "Login failed. Please check your credentials."
      
      // Check if it's an approval pending error
      if (errorMessage.includes('pending approval') || errorMessage.includes('approval')) {
        alert(errorMessage)
      }
      
      setError(errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Construction CRM</h1>
          <p className="text-muted-foreground">Manage your construction projects efficiently</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {successMessage && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@construction.com"
                  {...register("email")}
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-11"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-shadow" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Logging in...</span>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary font-medium hover:underline transition-colors">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 Construction CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

