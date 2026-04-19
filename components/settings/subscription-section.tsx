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
import { formatDateDMY } from "@/lib/utils/date"

export function SubscriptionSection() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [details, setDetails] = React.useState<{
    plan: string
    status: string
    startDate?: string
    endDate?: string | null
    razorpaySubscriptionId?: string | null
    autoRenew: boolean
  } | null>(null)

  const subscriptionPlan = user?.company?.subscriptionPlan || "TRIAL"
  const subscriptionStatus = user?.company?.subscriptionStatus || "trial"

  const planLabels: Record<string, string> = {
    TRIAL: "3-Day Free Trial",
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

  React.useEffect(() => {
    const load = async () => {
      try {
        const d = await subscriptionApi.getDetails()
        setDetails(d)
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const handleCancelAutoRenew = async () => {
    if (!details?.autoRenew) return
    if (!confirm("Cancel auto-renew? Your subscription stays active until period end.")) return
    try {
      setLoading(true)
      await subscriptionApi.cancelAutoRenew()
      const d = await subscriptionApi.getDetails()
      setDetails(d)
      toast.success("Auto-renew cancelled")
    } catch (e: any) {
      toast.error(e?.message || "Failed to cancel auto-renew")
    } finally {
      setLoading(false)
    }
  }

  const isActive = subscriptionStatus === "active"
  const isTrial = subscriptionStatus === "trial"
  const isPastDue = subscriptionStatus === "past_due"
  const isCancelled = subscriptionStatus === "cancelled"
  const subscriptionEndDate = user?.company?.subscriptionEndDate
  const isTrialExpired = isTrial && !!subscriptionEndDate && new Date() > new Date(subscriptionEndDate)
  const trialDaysLeft = isTrial && subscriptionEndDate
    ? Math.max(0, Math.ceil((new Date(subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

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
          {isTrial && (
            <Badge variant={isTrialExpired ? "destructive" : "secondary"}>
              {isTrialExpired ? "Trial Ended" : `Trial: ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`}
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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Current Plan</div>
            <div className="mt-1 font-semibold">{planLabels[subscriptionPlan] || subscriptionPlan}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Subscribed on</div>
            <div className="mt-1 text-sm">{details?.startDate ? formatDateDMY(details.startDate) : "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{details?.autoRenew ? "Next renewal on" : "Ends on"}</div>
            <div className="mt-1 text-sm">{details?.endDate ? formatDateDMY(details.endDate) : "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Auto‑renew</div>
            <div className="mt-1 text-sm">{details?.autoRenew ? "On" : "Off"}</div>
          </div>
        </div>

        {subscriptionPlan !== "ENTERPRISE" && !isActive && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUpgrade}
          >
            Upgrade Plan
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}

        {isActive && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loading}
            >
              {loading ? "Loading..." : "Manage Subscription"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            {details?.autoRenew && (
              <Button variant="destructive" onClick={handleCancelAutoRenew} disabled={loading}>
                Cancel Auto‑Renew
              </Button>
            )}
          </div>
        )}

        {!isActive && subscriptionPlan === "STARTER" && (
          <p className="text-xs text-muted-foreground text-center">
            Upgrade to a paid plan to manage your subscription
          </p>
        )}
      </CardContent>
    </Card>
  )
}
