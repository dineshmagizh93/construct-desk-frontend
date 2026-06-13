"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, DollarSign, Upload, Download, CheckCircle2, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { Expense, ExpenseCategory } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { FilterBar } from "@/components/ui/filter-bar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ExpenseForm } from "./expense-form"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { downloadExpenseBulkTemplate, parseBulkExpensesFromCsv } from "./expense-bulk-utils"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { ExpenseListParams, expensesApi } from "@/lib/api/expenses"
import { downloadCsv } from "@/lib/utils/export-csv"
import { useProjects } from "@/lib/hooks/use-projects"
import { projectsApi } from "@/lib/api/projects"
import { ExpenseFormSchema } from "@/lib/validations/expense"
import { formatDateDMY } from "@/lib/utils/date"

interface ExpenseListProps {
  projectId?: string
  onCreateExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function ExpenseList({ projectId, onCreateExpense }: ExpenseListProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<ExpenseCategory | "all">("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const listParams = React.useMemo<ExpenseListParams>(() => ({
    page: currentPage,
    limit: itemsPerPage,
    projectId: projectId || (projectFilter !== "all" ? projectFilter : undefined),
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: searchQuery || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [categoryFilter, currentPage, endDate, itemsPerPage, projectFilter, projectId, searchQuery, startDate])
  const { expenses, total, loading, deleteExpense, loadExpenses, bulkCreateExpenses } = useExpenses(listParams)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, categoryFilter, startDate, endDate])

  // Reset to page 1 when itemsPerPage changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Adjust current page if it's out of bounds after filtering or page size change
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    } else if (currentPage < 1) {
      setCurrentPage(1)
    }
  }, [totalPages, itemsPerPage])

  const handleDelete = async (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return

    try {
      await deleteExpense(expenseToDelete.id)
      await loadExpenses(projectId, true) // Force refresh
      toast.success("Expense deleted successfully")
      setDeleteDialogOpen(false)
      setExpenseToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil(Math.max(total - 1, 0) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete expense:", error)
      const errorMessage = error?.message || "Failed to delete expense. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleApprove = async (expense: Expense) => {
    try {
      await expensesApi.approve(expense.id)
      await loadExpenses(projectId, true)
      toast.success("Expense approved")
    } catch {
      toast.error("Failed to approve expense")
    }
  }

  const handleReject = async (expense: Expense) => {
    try {
      await expensesApi.reject(expense.id)
      await loadExpenses(projectId, true)
      toast.success("Expense rejected")
    } catch {
      toast.error("Failed to reject expense")
    }
  }

  const handleExportCsv = async () => {
    try {
      const csv = await expensesApi.exportCsv(projectId)
      downloadCsv(typeof csv === "string" ? csv : JSON.stringify(csv), "expenses.csv")
    } catch {
      toast.error("Export failed")
    }
  }

  const getCategoryBadgeVariant = (category: ExpenseCategory) => {
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
        return "outline"
    }
  }


  // Only show loading if we have no expenses at all (initial load)
  if (loading && expenses.length === 0) {
    return <div className="flex items-center justify-center p-8">Loading expenses...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-800">Expenses</h1>
          <p className="text-[13px] text-slate-500">{projectId ? "Project expenses" : "Track and manage project expenses"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by paid to or notes..."
        actionButton={
          !projectId
            ? {
                label: "Bulk Upload",
                icon: <Upload className="h-4 w-4" />,
                onClick: () => setBulkUploadOpen(true),
              }
            : undefined
        }
        filters={
          <>
            {!projectId && (
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="h-[40px] w-[180px] text-[13px]"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            )}
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "all")}
              className="h-[40px] w-[150px] text-[13px]"
            >
              <option value="all">All Categories</option>
              <option value="Material">Material</option>
              <option value="Labour">Labour</option>
              <option value="Transport">Transport</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="h-[40px] w-[140px] text-[13px]"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="h-[40px] w-[140px] text-[13px]"
              />
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" className="h-[40px]" onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        }
      />

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-[10px] border border-border/50 overflow-hidden bg-card shadow-sm mt-3">
        {/* Table Wrapper - Scrollable area that fills space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            className={cn(
              "flex-1 min-h-0 overflow-x-auto overflow-y-auto"
            )}
            data-table-scroll-container
          >
            <Table className="border-0 rounded-none min-w-[800px]">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Paid To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                  expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <span className="truncate block" title={expense.projectName}>{expense.projectName}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getCategoryBadgeVariant(expense.category)}>{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateDMY(expense.date)}</TableCell>
                    <TableCell>
                      <span className="truncate block" title={expense.paidTo || "-"}>{expense.paidTo || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <ApprovalBadge status={(expense as any).approvalStatus} />
                    </TableCell>
                    <TableCell className="relative text-center">
                      <ExpenseActionsMenu
                        expense={expense}
                        onDelete={handleDelete}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isOpen={openDropdownId === expense.id}
                        onOpenChange={(open) => setOpenDropdownId(open ? expense.id : null)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Summary */}
        {expenses.length > 0 && (
          <div className="flex justify-end gap-4 text-[13px] px-4 py-2.5 border-t border-border/40 bg-muted/30 flex-shrink-0">
            <div>
              <span className="text-muted-foreground">Total Expenses: </span>
              <span className="font-semibold">
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}

        {/* Pagination - Pinned to bottom of viewport */}
        <div className="flex-shrink-0 border-t border-border/40 bg-muted/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={total}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Bulk Upload Expenses"
        description="Upload a CSV file containing your expenses. The Project ID column should match the ID of your existing projects. Invalid projects will be skipped."
        requiredHeaders={["Project ID", "Category", "Amount", "Date", "Paid To"]}
        onDownloadTemplate={downloadExpenseBulkTemplate}
        onParseCsv={parseBulkExpensesFromCsv}
        onUpload={async (rows) => {
          const res = await bulkCreateExpenses(rows)
          await loadExpenses(projectId, true)
          return res
        }}
      />

      {/* Create Expense Dialog */}
      {createDialogOpen && (
        <CreateExpenseDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={onCreateExpense}
          projectId={projectId}
          onRefresh={loadExpenses}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete Expense</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this expense of {formatCurrency(expenseToDelete?.amount || 0)} paid to{" "}
              "{expenseToDelete?.paidTo}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  confirmDelete()
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CreateExpenseDialog({
  open,
  onOpenChange,
  onCreate,
  projectId,
  onRefresh,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId?: string
  onRefresh?: () => Promise<void>
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: ExpenseFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const finalProjectId = data.projectId || projectId || ""

      if (!finalProjectId) {
        setError("Please select a project")
        return
      }

      const project = await projectsApi.getById(finalProjectId)

      await onCreate({
        ...data,
        projectId: finalProjectId,
        projectName: project?.name || "",
        amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
        notes: data.notes || undefined,
        attachment: data.attachment || undefined,
      } as Omit<Expense, "id" | "createdAt" | "updatedAt">)

      onOpenChange(false)
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create expense. Please try again.")
      console.error("Error creating expense:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create New Expense</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !isSubmitting && onOpenChange(false)}
            className="h-6 w-6"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && onOpenChange(false)} projectId={projectId} />
      </div>
    </>
  )
}

function ApprovalBadge({ status }: { status?: string }) {
  if (!status || status === "pending") {
    return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Pending</span>
  }
  if (status === "approved") {
    return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Approved</span>
  }
  return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">Rejected</span>
}

function ExpenseActionsMenu({
  expense,
  onDelete,
  onApprove,
  onReject,
  isOpen,
  onOpenChange,
}: {
  expense: Expense
  onDelete: (expense: Expense) => void
  onApprove: (expense: Expense) => void
  onReject: (expense: Expense) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const approvalStatus = (expense as any).approvalStatus
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/expenses/${expense.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/expenses/${expense.id}/edit`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        {approvalStatus !== "approved" && (
          <DropdownMenuItem onClick={() => onApprove(expense)} className="text-green-600">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        {approvalStatus !== "rejected" && (
          <DropdownMenuItem onClick={() => onReject(expense)} className="text-orange-600">
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(expense)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateExpenseButton({
  onCreate,
  projectId,
  onRefresh,
}: {
  onCreate: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId?: string
  onRefresh?: () => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: ExpenseFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const finalProjectId = data.projectId || projectId || ""

      if (!finalProjectId) {
        setError("Please select a project")
        return
      }

      const project = await projectsApi.getById(finalProjectId)

      await onCreate({
        ...data,
        projectId: finalProjectId,
        projectName: project?.name || "",
        amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
        notes: data.notes || undefined,
        attachment: data.attachment || undefined,
      } as Omit<Expense, "id" | "createdAt" | "updatedAt">)

      setOpen(false)
      // Immediately refresh the list to show the new expense
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create expense. Please try again.")
      console.error("Error creating expense:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {projectId ? "Add Expense" : "New Expense"}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Expense</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !isSubmitting && setOpen(false)}
                className="h-6 w-6"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <ExpenseForm
              onSubmit={handleSubmit}
              onCancel={() => !isSubmitting && setOpen(false)}
              projectId={projectId}
            />
          </div>
        </>
      )}
    </>
  )
}

