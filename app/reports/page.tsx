"use client"

import { PaymentsSummary } from "@/components/reports/payments-summary"
import { ExpensesSummary } from "@/components/reports/expenses-summary"
import { ProjectOverview } from "@/components/reports/project-overview"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Header */}
      <div className="pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <h1 className="text-2xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground mt-0 text-xs">
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
    </div>
  )
}

