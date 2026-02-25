"use client"

import { PaymentsSummary } from "@/components/reports/payments-summary"
import { ExpensesSummary } from "@/components/reports/expenses-summary"
import { ProjectOverview } from "@/components/reports/project-overview"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Reports
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive overview of payments, expenses, and projects
        </p>
      </div>

      {/* Payments Summary */}
      <PaymentsSummary />

      {/* Expenses Summary */}
      <ExpensesSummary />

      {/* Project Overview */}
      <ProjectOverview />
    </div>
  )
}

