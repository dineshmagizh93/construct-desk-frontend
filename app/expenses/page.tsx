"use client"

import * as React from "react"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { ExpenseFormSchema } from "@/lib/validations/expense"
import { Expense } from "@/types/expense"
import { projectsApi } from "@/lib/api/projects"
import { TableSkeleton } from "@/components/ui/loading-skeleton"

// Lazy load heavy component to speed up navigation
const ExpenseList = React.lazy(() => 
  import("@/components/expenses/expense-list").then(module => ({ default: module.ExpenseList }))
)

export default function ExpensesPage() {
  const { createExpense, loadExpenses } = useExpenses()

  const handleCreateExpense = async (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Convert to CreateExpenseDto format
      const expenseDto = {
        projectId: data.projectId,
        category: data.category,
        amount: data.amount,
        date: data.date,
        paidTo: data.paidTo,
        notes: data.notes,
        attachment: data.attachment,
      }
      
      // Create expense - this updates the hook state immediately
      await createExpense(expenseDto)
      // Immediately refresh to ensure ExpenseList component sees the update
      await loadExpenses()
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  return (
    <React.Suspense fallback={<TableSkeleton />}>
      <ExpenseList onCreateExpense={handleCreateExpense} />
    </React.Suspense>
  )
}

