"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, DollarSign, Calendar, FileText, CheckCircle } from "lucide-react"
import { paymentsApi } from "@/lib/api/payments"
import { Payment } from "@/types/payment"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDateDMY } from "@/lib/utils/date"

export default function PaymentDetailsPage() {
  const params = useParams()
  const router = useRouter()
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

  const getStatusBadgeVariant = (status: Payment["status"]) => {
    switch (status) {
      case "Paid":
        return "success"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/payments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{payment.milestone}</h1>
            <p className="text-muted-foreground text-xs mt-0">
              Payment for{" "}
              <Link href={`/projects/${payment.projectId}`} className="hover:underline">
                {payment.projectName}
              </Link>
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(payment.status)} className="text-sm px-3 py-1">
          {payment.status}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Amount</p>
                <p className="text-xl font-bold">{formatCurrency(payment.amount)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateDMY(payment.dueDate)}
                </p>
              </div>
            </div>
            {payment.paidDate && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Paid Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateDMY(payment.paidDate)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">Project</p>
              <Link
                href={`/projects/${payment.projectId}`}
                className="text-sm text-primary hover:underline"
              >
                {payment.projectName}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Milestone</p>
              <p className="text-sm text-muted-foreground">{payment.milestone}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(payment.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{payment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
