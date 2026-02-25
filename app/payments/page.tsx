"use client"

import { PaymentList } from "@/components/payments/payment-list"
import { usePayments } from "@/lib/hooks/use-payments"
import { PaymentFormSchema } from "@/lib/validations/payment"
import { Payment } from "@/types/payment"
import { projectsApi } from "@/lib/api/projects"

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
      console.error("Error creating payment:", error)
      throw error // Re-throw to let the form handle the error
    }
  }

  return <PaymentList onCreatePayment={handleCreatePayment} />
}

