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
import { useRole } from "@/lib/hooks/use-role"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { parseCsv, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"
import { CreateExpenseDto } from "@/lib/api/expenses"
import { ExpenseCategory } from "@/types/expense"

interface ProjectExpensesTabProps {
  projectId: string
}

export function ProjectExpensesTab({ projectId }: ProjectExpensesTabProps) {
  const { createExpense, loadExpensesByProject } = useExpenses()
  const { isAdmin } = useRole()
  const [projectExpenses, setProjectExpenses] = React.useState<Expense[]>([])
  const [loading, setLoading] = React.useState(true)

  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkError, setBulkError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreateExpenseDto[]>([])

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

  const downloadBulkTemplate = () => {
    const headers = ["projectId", "category", "amount", "date", "paidTo", "notes", "attachment"]
    const sample = [
      projectId || "YOUR_PROJECT_ID",
      "Material",
      "2500",
      "2024-01-15",
      "Vendor Name",
      "Optional notes",
      "",
    ]

    const escapeCell = (v: string) => {
      const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r")
      const escaped = v.replace(/"/g, '""')
      return needsQuotes ? `"${escaped}"` : escaped
    }

    const csv = `${headers.map(escapeCell).join(",")}\n${sample.map((c) => escapeCell(String(c))).join(",")}\n`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "expenses-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseBulkExpensesFromCsv = (csvText: string): CreateExpenseDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["category", "amount", "date", "paidto"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const normalizeCategory = (raw: string): ExpenseCategory | "" => {
      const s = raw.trim().toLowerCase()
      if (!s) return ""
      if (s === "material") return "Material"
      if (s === "labour") return "Labour"
      if (s === "transport") return "Transport"
      if (s === "equipment") return "Equipment"
      if (s === "other") return "Other"
      return ""
    }

    const rows: CreateExpenseDto[] = []
    const mismatch: string[] = []

    for (const row of dataRows) {
      const rowProjectIdRaw = get(row, "projectid")
      if (rowProjectIdRaw && rowProjectIdRaw !== projectId) mismatch.push(rowProjectIdRaw)
      const finalProjectId = rowProjectIdRaw || projectId

      const category = normalizeCategory(get(row, "category"))
      const date = normalizeDateToYmd(get(row, "date"))
      const amount = parseFloat(get(row, "amount"))
      const paidTo = get(row, "paidto")
      const notes = get(row, "notes")
      const attachment = get(row, "attachment")

      if (!category || !date || !paidTo || Number.isNaN(amount) || amount <= 0) continue

      rows.push({
        projectId: finalProjectId,
        category,
        amount,
        date,
        paidTo,
        notes: notes || undefined,
        attachment: attachment || undefined,
      })
    }

    if (mismatch.length > 0) {
      throw new Error(`CSV projectId mismatch. All rows must match current project (${projectId}).`)
    }

    return rows
  }

  const handleBulkUpload = async () => {
    setBulkError(null)
    try {
      if (bulkRows.length === 0) {
        setBulkError("No valid rows to upload.")
        return
      }

      for (const row of bulkRows) {
        await createExpense({
          projectId,
          category: row.category,
          amount: row.amount,
          date: row.date,
          paidTo: row.paidTo,
          notes: row.notes,
          attachment: row.attachment,
        })
      }

      const updated = await loadExpensesByProject(projectId)
      setProjectExpenses(updated)
      toast.success("Bulk expenses uploaded successfully")
      setBulkOpen(false)
      setBulkRows([])
    } catch (err: any) {
      const raw = err?.message as string
      const cleaned = raw?.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
      setBulkError(cleaned || "Bulk upload failed")
    }
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
        <div className="flex items-center gap-2">
          <CreateExpenseButton onCreate={handleCreateExpense} projectId={projectId} />
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkOpen(true)
                setBulkError(null)
                setBulkRows([])
              }}
            >
              Bulk Upload
            </Button>
          )}
        </div>
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

      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open)
          if (!open) {
            setBulkError(null)
            setBulkRows([])
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[calc(100vh-1rem)] p-3 hide-scrollbar gap-2">
          <DialogHeader>
            <DialogTitle>Bulk Upload Expenses</DialogTitle>
            <DialogDescription className="text-xs">
              Upload CSV for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={downloadBulkTemplate}>
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Required: category,amount,date,paidTo</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-expenses">Choose CSV file</Label>
              <Input
                id="bulk-expenses"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const rows = parseBulkExpensesFromCsv(text)
                    setBulkRows(rows)
                    if (rows.length === 0) setBulkError("No valid rows found. Check CSV values.")
                  } catch (err: any) {
                    setBulkError(err?.message || "Failed to parse CSV.")
                  }
                }}
              />
            </div>

            {bulkError && (
              <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{bulkError}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={bulkRows.length === 0} onClick={handleBulkUpload}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

