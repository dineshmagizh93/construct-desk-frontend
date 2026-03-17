"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { paymentsApi } from "@/lib/api/payments"
import { Payment } from "@/types/payment"
import { PaymentFormSchema } from "@/lib/validations/payment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentForm } from "@/components/payments/payment-form"
import { usePayments } from "@/lib/hooks/use-payments"
import { projectsApi } from "@/lib/api/projects"

export default function EditPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { updatePayment } = usePayments()
  const [payment, setPayment] = React.useState<Payment | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadPayment = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await paymentsApi.getById(params.id)
          setPayment(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadPayment()
  }, [params.id])

  const handleSubmit = async (data: PaymentFormSchema) => {
    if (!payment) return

    const project = await projectsApi.getById(data.projectId)

    await updatePayment(payment.id, {
      ...data,
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      paidDate: data.paidDate || undefined,
      notes: data.notes || undefined,
    })

    router.push(`/payments/${payment.id}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading payment...</div>
  }

  if (!payment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Payment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/payments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Payment</h1>
          <p className="text-muted-foreground text-sm mt-1">Update payment information</p>
        </div>
      </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm payment={payment} onSubmit={handleSubmit} onCancel={() => router.push("/payments")} />
        </CardContent>
      </Card>
    </div>
  )
}
