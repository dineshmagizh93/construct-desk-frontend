"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { expensesApi } from "@/lib/api/expenses"
import { Expense } from "@/types/expense"
import { ExpenseFormSchema } from "@/lib/validations/expense"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { projectsApi } from "@/lib/api/projects"

export default function EditExpensePage() {
  const params = useParams()
  const router = useRouter()
  const { updateExpense } = useExpenses()
  const [expense, setExpense] = React.useState<Expense | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadExpense = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await expensesApi.getById(params.id)
          setExpense(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadExpense()
  }, [params.id])

  const handleSubmit = async (data: ExpenseFormSchema) => {
    if (!expense) return

    const project = await projectsApi.getById(data.projectId)

    await updateExpense(expense.id, {
      ...data,
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      notes: data.notes || undefined,
      attachment: data.attachment || undefined,
    })

    router.push(`/expenses/${expense.id}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading expense...</div>
  }

  if (!expense) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/expenses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Expense not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/expenses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-muted-foreground text-sm mt-1">Update expense information</p>
        </div>
      </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm expense={expense} onSubmit={handleSubmit} onCancel={() => router.push("/expenses")} />
        </CardContent>
      </Card>
    </div>
  )
}
