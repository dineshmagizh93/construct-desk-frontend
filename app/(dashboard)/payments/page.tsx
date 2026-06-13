"use client"

import * as React from "react"
import { usePayments } from "@/lib/hooks/use-payments"
import { PaymentFormSchema } from "@/lib/validations/payment"
import { Payment } from "@/types/payment"
import { projectsApi } from "@/lib/api/projects"
import { TableSkeleton } from "@/components/ui/loading-skeleton"

// Lazy load heavy component to speed up navigation
const PaymentList = React.lazy(() => 
  import("@/components/payments/payment-list").then(module => ({ default: module.PaymentList }))
)

export default function PaymentsPage() {
  const { createPayment, loadPayments } = usePayments()

  const handleCreatePayment = async (data: Omit<Payment, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Convert to CreatePaymentDto format
      const paymentDto = {
        projectId: data.projectId,
        milestone: data.milestone,
        amount: data.amount,
        dueDate: data.dueDate,
        status: data.status,
        paidDate: data.paidDate,
        notes: data.notes,
      }
      
      // Create payment - this updates the hook state immediately
      await createPayment(paymentDto)
      // Immediately refresh to ensure PaymentList component sees the update
      await loadPayments()
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  return (
    <React.Suspense fallback={<TableSkeleton />}>
      <PaymentList onCreatePayment={handleCreatePayment} />
    </React.Suspense>
  )
}

