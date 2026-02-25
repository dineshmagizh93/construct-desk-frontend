"use client"

import * as React from "react"
import { PaymentList } from "./payment-list"
import { usePayments } from "@/lib/hooks/use-payments"
import { PaymentFormSchema } from "@/lib/validations/payment"
import { Payment } from "@/types/payment"
import { projectsApi } from "@/lib/api/projects"

interface ProjectPaymentsTabProps {
  projectId: string
}

export function ProjectPaymentsTab({ projectId }: ProjectPaymentsTabProps) {
  const { createPayment } = usePayments()

  const handleCreatePayment = async (data: PaymentFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    await createPayment({
      ...data,
      projectId: data.projectId || projectId,
      projectName: project?.name || "",
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      paidDate: data.paidDate || undefined,
      notes: data.notes || undefined,
    } as Omit<Payment, "id" | "createdAt" | "updatedAt">)
  }

  return <PaymentList projectId={projectId} onCreatePayment={async () => {}} />
}

