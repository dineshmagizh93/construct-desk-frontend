"use client"

import { PaymentsSummary } from "@/components/reports/payments-summary"
import { ExpensesSummary } from "@/components/reports/expenses-summary"
import { ProjectOverview } from "@/components/reports/project-overview"
import { BarChart3, Sliders } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-0 text-xs">
            Comprehensive overview of payments, expenses, and projects
          </p>
        </div>
        <Link href="/reports/custom">
          <Button variant="outline" size="sm">
            <Sliders className="mr-1.5 h-3.5 w-3.5" />
            Custom Report Builder
          </Button>
        </Link>
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

