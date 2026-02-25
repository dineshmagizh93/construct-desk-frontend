"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import { Expense, ExpenseCategory } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
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
import { Pagination } from "@/components/ui/pagination"
import { ExpenseForm } from "./expense-form"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { useProjects } from "@/lib/hooks/use-projects"
import { projectsApi } from "@/lib/api/projects"
import { ExpenseFormSchema } from "@/lib/validations/expense"

interface ExpenseListProps {
  projectId?: string
  onCreateExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function ExpenseList({ projectId, onCreateExpense }: ExpenseListProps) {
  const { expenses, loading, deleteExpense, loadExpenses } = useExpenses()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<ExpenseCategory | "all">("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Filter expenses
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      // Project filter
      const matchesProject = projectId
        ? expense.projectId === projectId
        : projectFilter === "all" || expense.projectId === projectFilter

      // Search filter
      const matchesSearch =
        expense.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false

      // Category filter
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

      // Date range filter
      const expenseDate = new Date(expense.date)
      const matchesStartDate = !startDate || expenseDate >= new Date(startDate)
      const matchesEndDate = !endDate || expenseDate <= new Date(endDate)

      return matchesProject && matchesSearch && matchesCategory && matchesStartDate && matchesEndDate
    })
  }, [expenses, projectId, projectFilter, searchQuery, categoryFilter, startDate, endDate])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage))
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, categoryFilter, startDate, endDate])

  // Adjust current page if it's out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

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
      const newTotalPages = Math.max(1, Math.ceil((filteredExpenses.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete expense:", error)
      const errorMessage = error?.message || "Failed to delete expense. Please try again."
      toast.error(errorMessage)
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
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project expenses" : "Track and manage project expenses"}
          </p>
        </div>
        <CreateExpenseButton onCreate={onCreateExpense} projectId={projectId} onRefresh={loadExpenses} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by paid to or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {!projectId && (
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-[200px]"
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
          className="w-[150px]"
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
            className="w-[150px]"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="w-[150px]"
          />
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => {
              setStartDate("")
              setEndDate("")
            }}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Paid To</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projects/${expense.projectId}`} className="hover:underline">
                      {expense.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(expense.category)}>
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.paidTo}</TableCell>
                  <TableCell>
                    <ExpenseActionsMenu 
                      expense={expense} 
                      onDelete={handleDelete}
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
        
        {/* Summary */}
        {filteredExpenses.length > 0 && (
          <div className="flex justify-end px-4 py-3 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Total Expenses: </span>
              <span className="font-semibold text-lg">
                {formatCurrency(
                  filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}

        {/* Pagination - Fixed at bottom */}
        {filteredExpenses.length > 0 && (
          <div className="flex-shrink-0 border-t bg-card">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredExpenses.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

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

function ExpenseActionsMenu({
  expense,
  onDelete,
  isOpen,
  onOpenChange,
}: {
  expense: Expense
  onDelete: (expense: Expense) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
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

