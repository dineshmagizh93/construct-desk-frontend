"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { subscriptionApi } from "@/lib/api/subscription"
import toast from "react-hot-toast"

export function SubscriptionSection() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const subscriptionPlan = user?.company?.subscriptionPlan || "STARTER"
  const subscriptionStatus = user?.company?.subscriptionStatus || "active"

  const planLabels: Record<string, string> = {
    STARTER: "Starter",
    GROWTH: "Growth",
    PROFESSIONAL: "Professional",
    ENTERPRISE: "Enterprise",
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const { url } = await subscriptionApi.createPortalSession()
      window.location.href = url
    } catch (error: any) {
      console.error("Error creating portal session:", error)
      toast.error(error?.message || "Failed to open subscription management. Please try again.")
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const isActive = subscriptionStatus === "active"
  const isPastDue = subscriptionStatus === "past_due"
  const isCancelled = subscriptionStatus === "cancelled"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          {isActive && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {isPastDue && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Past Due
            </Badge>
          )}
          {isCancelled && (
            <Badge variant="secondary">
              Cancelled
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage your subscription plan and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <span className="font-semibold">{planLabels[subscriptionPlan] || subscriptionPlan}</span>
          </div>
          {user?.company?.subscriptionEndDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Renews On</span>
              <span className="text-sm">
                {new Date(user.company.subscriptionEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {subscriptionPlan !== "ENTERPRISE" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUpgrade}
          >
            Upgrade Plan
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}

        {user?.company?.stripeCustomerId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageSubscription}
            disabled={loading}
          >
            {loading ? "Loading..." : "Manage Subscription"}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}

        {!user?.company?.stripeCustomerId && subscriptionPlan === "STARTER" && (
          <p className="text-xs text-muted-foreground text-center">
            Upgrade to a paid plan to manage your subscription
          </p>
        )}
      </CardContent>
    </Card>
  )
}
