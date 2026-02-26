"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, Building2, User, Mail } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import toast from "react-hot-toast"

export const dynamic = "force-dynamic"

function AdminApprovePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  const [userData, setUserData] = React.useState<any>(null)
  const [fetching, setFetching] = React.useState(true)

  const userId = searchParams.get("userId")
  const companyId = searchParams.get("companyId")

  React.useEffect(() => {
    if (!userId || !companyId) {
      toast.error("Invalid approval link. Missing user or company ID.")
      setFetching(false)
      return
    }

    // Fetch user and company details for display
    const fetchDetails = async () => {
      try {
        // Note: This would require a public endpoint or admin authentication
        // For now, we'll just show the IDs
        // In production, you'd want to add an admin auth check here
        setUserData({ userId, companyId })
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      } finally {
        setFetching(false)
      }
    }

    fetchDetails()
  }, [userId, companyId])

  const handleApproval = async (approved: boolean) => {
    if (!userId || !companyId) {
      toast.error("Invalid approval link")
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.post<{ message: string; user: any }>("/auth/approve-user", {
        userId,
        companyId,
        approved,
      })

      if (approved) {
        toast.success("User approved successfully! They can now login.")
      } else {
        toast.success("User registration rejected.")
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Approval error:", error)
      toast.error(error.message || "Failed to process approval. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userId || !companyId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              This approval link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Review Registration</CardTitle>
          <CardDescription>
            Approve or reject this user registration request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Company ID</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{companyId}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Click "Approve User" to allow this registration, or "Reject Registration" to decline it.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleApproval(true)}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve User
                </>
              )}
            </Button>

            <Button
              onClick={() => handleApproval(false)}
              disabled={loading}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Registration
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminApprovePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AdminApprovePageContent />
    </Suspense>
  )
}