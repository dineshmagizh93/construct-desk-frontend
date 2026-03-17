"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, X, CreditCard, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"

export default function TestPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentLinkId = searchParams.get("payment_link_id")
  const amount = searchParams.get("amount")
  const plan = searchParams.get("plan")
  const billing = searchParams.get("billing")
  
  const [processing, setProcessing] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handlePayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setProcessing(false)
    setSuccess(true)
    
    toast.success("Payment successful! Redirecting...")
    
    // Redirect to success page after 1 second
    setTimeout(() => {
      router.push(`/subscription/success?payment_link_id=${paymentLinkId}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.push("/pricing")
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Redirecting to confirmation page...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center border-b pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Test Payment Page</CardTitle>
          <CardDescription className="mt-2">
            🧪 This is a mock payment page for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Payment Details */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan:</span>
              <span className="font-semibold">{plan || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Billing:</span>
              <span className="font-semibold capitalize">{billing || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-semibold">Amount:</span>
              <span className="text-lg font-bold text-primary">₹{amount || "0.00"}</span>
            </div>
          </div>

          {/* Test Card Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🧪 Test Mode - No Real Payment
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              This is a simulated payment page. Click "Pay Now" to simulate a successful payment.
              No actual money will be charged.
            </p>
          </div>

          {/* Payment Link ID */}
          {paymentLinkId && (
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              <span className="font-mono">Payment Link: {paymentLinkId}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={processing}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            In production, this would redirect to Razorpay's secure payment page
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
