"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, DollarSign, Calendar, FileText, Paperclip, ExternalLink } from "lucide-react"
import { expensesApi } from "@/lib/api/expenses"
import { Expense } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDateDMY } from "@/lib/utils/date"

export default function ExpenseDetailsPage() {
  const params = useParams()
  const router = useRouter()
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

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Material":
        return "default"
      case "Labour":
        return "secondary"
      case "Transport":
        return "outline"
      case "Equipment":
        return "success"
      case "Other":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/expenses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{expense.category}</h1>
            <p className="text-muted-foreground text-xs mt-0">Expense details and information</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
            <CardDescription>Basic expense details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
              <span className="text-lg font-semibold">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Category</span>
              <Badge variant={getCategoryBadgeVariant(expense.category)}>{expense.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Date</span>
              <span className="text-sm">
                {formatDateDMY(expense.date)}
              </span>
            </div>
            {expense.notes && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <p className="text-sm mt-1">{expense.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Related project details</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`/projects/${expense.projectId}`}
              className="text-sm text-primary hover:underline"
            >
              {expense.projectName}
            </Link>
          </CardContent>
        </Card>
      </div>

      {expense.attachment && (
        <Card>
          <CardHeader>
            <CardTitle>Attachment</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={expense.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Paperclip className="h-4 w-4" />
              <span>View Attachment</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
          Edit Expense
        </Button>
        <Button variant="outline" onClick={() => router.push("/expenses")}>
          Back to Expenses
        </Button>
      </div>
    </div>
  )
}
