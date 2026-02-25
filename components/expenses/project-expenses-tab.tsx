"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { Plus, DollarSign } from "lucide-react"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { Expense } from "@/types/expense"
import { ExpenseFormSchema } from "@/lib/validations/expense"
import { projectsApi } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "./expense-form"
import { X } from "lucide-react"
import { ExpenseList } from "./expense-list"

interface ProjectExpensesTabProps {
  projectId: string
}

export function ProjectExpensesTab({ projectId }: ProjectExpensesTabProps) {
  const { createExpense, loadExpensesByProject } = useExpenses()
  const [projectExpenses, setProjectExpenses] = React.useState<Expense[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await loadExpensesByProject(projectId)
      setProjectExpenses(data)
      setLoading(false)
    }
    load()
  }, [projectId, loadExpensesByProject])

  const handleCreateExpense = async (data: ExpenseFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    await createExpense({
      ...data,
      projectId: data.projectId || projectId,
      projectName: project?.name || "",
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      notes: data.notes || undefined,
      attachment: data.attachment || undefined,
    } as Omit<Expense, "id" | "createdAt" | "updatedAt">)
    
    // Reload expenses
    const updated = await loadExpensesByProject(projectId)
    setProjectExpenses(updated)
  }


  const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0)

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading expenses...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Expenses</h3>
          <p className="text-sm text-muted-foreground">Track all expenses for this project</p>
        </div>
        <CreateExpenseButton onCreate={handleCreateExpense} projectId={projectId} />
      </div>

      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {projectExpenses.length} expense{projectExpenses.length !== 1 ? "s" : ""} recorded
          </p>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <ExpenseList projectId={projectId} onCreateExpense={async () => {}} />
    </div>
  )
}

function CreateExpenseButton({
  onCreate,
  projectId,
}: {
  onCreate: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: ExpenseFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)

    await onCreate({
      ...data,
      projectId: data.projectId || projectId,
      projectName: project?.name || "",
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      notes: data.notes || undefined,
      attachment: data.attachment || undefined,
    } as Omit<Expense, "id" | "createdAt" | "updatedAt">)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ExpenseForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

