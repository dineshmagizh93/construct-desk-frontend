"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Trash2, Search, Plus, Package, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"
import toast from "react-hot-toast"
import { InventoryTransaction, TransactionType, inventoryApi, CreateInventoryTransactionDto } from "@/lib/api/inventory"
import { useInventoryTransactions } from "@/lib/hooks/use-inventory"
import { useProjects } from "@/lib/hooks/use-projects"
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
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { InventoryTransactionForm } from "./inventory-transaction-form"

interface InventoryTransactionListProps {
  projectId?: string
  itemId?: string
  onCreateTransaction?: (data: CreateInventoryTransactionDto) => Promise<void>
  onAddClick?: boolean
  onAddClickClear?: () => void
}

export function InventoryTransactionList({ projectId, itemId, onCreateTransaction, onAddClick, onAddClickClear }: InventoryTransactionListProps) {
  const { transactions, loading, deleteTransaction, loadTransactions } = useInventoryTransactions(itemId, projectId)
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [transactionToDelete, setTransactionToDelete] = React.useState<InventoryTransaction | null>(null)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (onAddClick) {
      setFormDialogOpen(true)
      if (onAddClickClear) onAddClickClear()
    }
  }, [onAddClick, onAddClickClear])

  // Load transactions when filters change
  React.useEffect(() => {
    loadTransactions(itemId, projectId)
  }, [itemId, projectId, loadTransactions])

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => {
      // Project filter
      const matchesProject = projectId
        ? transaction.projectId === projectId
        : projectFilter === "all" || transaction.projectId === projectFilter

      // Search filter
      const matchesSearch =
        transaction.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false

      // Type filter
      const matchesType = typeFilter === "all" || transaction.type === typeFilter

      return matchesProject && matchesSearch && matchesType
    })
  }, [transactions, projectId, projectFilter, searchQuery, typeFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, projectFilter, typeFilter])

  // Reset to page 1 when itemsPerPage changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Adjust current page if it's out of bounds
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    } else if (currentPage < 1) {
      setCurrentPage(1)
    }
  }, [totalPages, itemsPerPage])

  const handleDelete = async (transaction: InventoryTransaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!transactionToDelete) return

    try {
      await deleteTransaction(transactionToDelete.id)
      await loadTransactions(itemId, projectId)
      toast.success("Transaction deleted successfully")
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete transaction")
    }
  }

  const handleCreate = async (data: CreateInventoryTransactionDto) => {
    if (onCreateTransaction) {
      await onCreateTransaction(data)
    } else {
      // Default create handler
      await loadTransactions(itemId, projectId)
    }
    setFormDialogOpen(false)
  }

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.IN:
        return <ArrowDown className="h-4 w-4 text-green-600" />
      case TransactionType.OUT:
        return <ArrowUp className="h-4 w-4 text-red-600" />
      case TransactionType.ADJUSTMENT:
        return <RotateCcw className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case TransactionType.IN:
        return "success"
      case TransactionType.OUT:
        return "destructive"
      case TransactionType.ADJUSTMENT:
        return "default"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading transactions...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0 gap-1">
      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by item, reference, or notes..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | "all")}
          className="w-[150px]"
        >
          <option value="all">All Types</option>
          <option value={TransactionType.IN}>Stock In</option>
          <option value={TransactionType.OUT}>Stock Out</option>
          <option value={TransactionType.ADJUSTMENT}>Adjustment</option>
        </Select>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div
          className={cn(
            "flex-1 min-h-0 overflow-x-auto", // Horizontal scroll on mobile
            "overflow-y-auto" // Always allow vertical scroll for table content
          )}
          data-table-scroll-container
        >
        <Table className="border-0 rounded-none min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Item</TableHead>
              <TableHead className="min-w-[100px]">Type</TableHead>
              <TableHead className="min-w-[100px]">Quantity</TableHead>
              {!projectId && <TableHead className="min-w-[150px]">Project</TableHead>}
              <TableHead className="min-w-[120px]">Date</TableHead>
              <TableHead className="min-w-[150px]">Reference</TableHead>
              <TableHead className="min-w-[200px]">Notes</TableHead>
              <TableHead className="text-center min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={projectId ? 7 : 8} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium min-w-[150px]">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {transaction.item?.name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <div className="flex items-center gap-1.5">
                      {getTypeIcon(transaction.type)}
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    {transaction.quantity} {transaction.item?.unit || ""}
                  </TableCell>
                  {!projectId && (
                    <TableCell className="min-w-[150px]">
                      {transaction.projectId ? (
                        <span className="truncate block">
                          {projects.find(p => p.id === transaction.projectId)?.name || "Unknown Project"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No project</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="min-w-[120px]">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {transaction.reference || "-"}
                  </TableCell>
                  <TableCell className="min-w-[200px] max-w-[300px]">
                    <span className="truncate block" title={transaction.notes || ""}>
                      {transaction.notes || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center min-w-[80px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/inventory/${transaction.itemId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Item
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(transaction)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Always at bottom */}
      <div className="flex-shrink-0 border-t border-border/50 -mt-px">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredTransactions.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>

    {/* Create Transaction Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Inventory Transaction</DialogTitle>
          </DialogHeader>
          <InventoryTransactionForm
            itemId={itemId}
            projectId={projectId}
            onSubmit={handleCreate}
            onCancel={() => setFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this transaction? This action cannot be undone and will affect inventory stock levels.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
