"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar } from "lucide-react"
import toast from "react-hot-toast"
import { Payment, PaymentStatus } from "@/types/payment"
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
import { PaymentForm } from "./payment-form"
import { usePayments } from "@/lib/hooks/use-payments"
import { useProjects } from "@/lib/hooks/use-projects"
import { projectsApi } from "@/lib/api/projects"
import { PaymentFormSchema } from "@/lib/validations/payment"

interface PaymentListProps {
  projectId?: string
  onCreatePayment: (data: Omit<Payment, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function PaymentList({ projectId, onCreatePayment }: PaymentListProps) {
  const { payments, loading, deletePayment, loadPayments } = usePayments()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<PaymentStatus | "all">("all")
  const [dueDateFilter, setDueDateFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [paymentToDelete, setPaymentToDelete] = React.useState<Payment | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Filter payments
  const filteredPayments = React.useMemo(() => {
    return payments.filter((payment) => {
      // Project filter - if projectId is provided, only show that project's payments
      const matchesProject = projectId
        ? payment.projectId === projectId
        : projectFilter === "all" || payment.projectId === projectFilter

      // Search filter
      const matchesSearch =
        payment.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.projectName.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter

      // Due date filter
      const matchesDueDate = !dueDateFilter || payment.dueDate === dueDateFilter

      return matchesProject && matchesSearch && matchesStatus && matchesDueDate
    })
  }, [payments, projectId, projectFilter, searchQuery, statusFilter, dueDateFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage))
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, statusFilter, dueDateFilter])

  // Adjust current page if it's out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handleDelete = async (payment: Payment) => {
    setPaymentToDelete(payment)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!paymentToDelete) return
    
    try {
      await deletePayment(paymentToDelete.id)
      await loadPayments(projectId, true) // Force refresh
      toast.success("Payment deleted successfully")
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredPayments.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete payment:", error)
      const errorMessage = error?.message || "Failed to delete payment. Please try again."
      toast.error(errorMessage)
    }
  }

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return "success"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "outline"
    }
  }


  // Only show loading if we have no payments at all (initial load)
  if (loading && payments.length === 0) {
    return <div className="flex items-center justify-center p-8">Loading payments...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            {projectId ? "Project payments" : "Manage all payments"}
          </p>
        </div>
        <CreatePaymentButton onCreate={onCreatePayment} projectId={projectId} onRefresh={loadPayments} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by milestone or project..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
          className="w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </Select>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            placeholder="Filter by due date"
            className="w-[180px] pl-9"
          />
        </div>
        {dueDateFilter && (
          <Button variant="ghost" size="sm" onClick={() => setDueDateFilter("")}>
            Clear
          </Button>
        )}
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projects/${payment.projectId}`} className="hover:underline">
                      {payment.projectName}
                    </Link>
                  </TableCell>
                  <TableCell>{payment.milestone}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <PaymentActionsMenu 
                      payment={payment} 
                      onDelete={handleDelete}
                      isOpen={openDropdownId === payment.id}
                      onOpenChange={(open) => setOpenDropdownId(open ? payment.id : null)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
        
        {/* Summary */}
        {filteredPayments.length > 0 && (
          <div className="flex justify-end gap-4 text-sm px-4 py-3 border-t">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">
                {formatCurrency(
                  filteredPayments.reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Paid: </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  filteredPayments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Pending: </span>
              <span className="font-semibold text-yellow-600">
                {formatCurrency(
                  filteredPayments.filter((p) => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}

        {/* Pagination - Always at bottom */}
        <div className="flex-shrink-0 border-t bg-card">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredPayments.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
          <div 
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete Payment</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the payment for "{paymentToDelete?.milestone}"? This
              action cannot be undone.
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

function PaymentActionsMenu({
  payment,
  onDelete,
  isOpen,
  onOpenChange,
}: {
  payment: Payment
  onDelete: (payment: Payment) => void
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
          <Link href={`/payments/${payment.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/payments/${payment.id}/edit`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(payment)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreatePaymentButton({
  onCreate,
  projectId,
  onRefresh,
}: {
  onCreate: (data: Omit<Payment, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId?: string
  onRefresh?: () => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: PaymentFormSchema) => {
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
        paidDate: data.paidDate || undefined,
        notes: data.notes || undefined,
      } as Omit<Payment, "id" | "createdAt" | "updatedAt">)
      
      setOpen(false)
      // Immediately refresh the list to show the new payment
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create payment. Please try again.")
      console.error("Error creating payment:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {projectId ? "Add Payment" : "New Payment"}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Payment</h2>
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
            <PaymentForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

