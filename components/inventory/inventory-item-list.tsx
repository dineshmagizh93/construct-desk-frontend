"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, Package, AlertTriangle, Upload } from "lucide-react"
import toast from "react-hot-toast"
import { InventoryItem, InventoryCategory, inventoryApi } from "@/lib/api/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { InventoryItemForm } from "./inventory-item-form"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { INVENTORY_ITEM_BULK_HEADERS, generateInventoryItemCsvTemplate, parseBulkInventoryItemsFromCsv } from "./inventory-bulk-utils"
import { useInventoryItems } from "@/lib/hooks/use-inventory"
import { formatCurrency } from "@/lib/utils/currency"

interface InventoryItemListProps {
  onCreateItem?: () => void
  onAddClick?: boolean
  onAddClickClear?: () => void
}

export function InventoryItemList({ onCreateItem, onAddClick, onAddClickClear }: InventoryItemListProps) {
  const { items, loading, deleteItem, loadItems, bulkCreateItems } = useInventoryItems()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<InventoryCategory | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<InventoryItem | undefined>(undefined)
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)

  React.useEffect(() => {
    if (onAddClick) {
      handleCreate()
      if (onAddClickClear) onAddClickClear()
    }
  }, [onAddClick, onAddClickClear])

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, categoryFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter])

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

  const handleDelete = async (item: InventoryItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteItem(itemToDelete.id)
      await loadItems() // Force refresh
      toast.success("Item deleted successfully")
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredItems.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete item:", error)
      const errorMessage = error?.message || "Failed to delete item. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingItem(undefined)
    setFormDialogOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await inventoryApi.updateItem(editingItem.id, data)
      } else {
        await inventoryApi.createItem(data)
      }
      setFormDialogOpen(false)
      setEditingItem(undefined)
      // Refresh the list after creation/update
      await loadItems()
      if (onCreateItem) onCreateItem()
    } catch (error) {
      console.error("Error saving item:", error)
      throw error
    }
  }

  const isLowStock = (item: InventoryItem) => {
    return item.currentStock <= item.minStock
  }

  const getCategoryBadgeVariant = (category: InventoryCategory) => {
    switch (category) {
      case InventoryCategory.MATERIAL:
        return "default"
      case InventoryCategory.TOOL:
        return "secondary"
      case InventoryCategory.EQUIPMENT:
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading inventory items...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        <Button variant="outline" onClick={() => setBulkUploadOpen(true)} className="mr-2">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </div>
      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, SKU, or description..."
        filters={
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | "all")}
            className="h-[40px] w-[180px] text-[13px]"
          >
            <option value="all">All Categories</option>
            <option value={InventoryCategory.MATERIAL}>Material</option>
            <option value={InventoryCategory.TOOL}>Tool</option>
            <option value={InventoryCategory.EQUIPMENT}>Equipment</option>
            <option value={InventoryCategory.OTHER}>Other</option>
          </Select>
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
            <Table className="border-0 rounded-none min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Item Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[120px]">SKU</TableHead>
                <TableHead className="min-w-[100px]">Stock</TableHead>
                <TableHead className="min-w-[100px]">Min Stock</TableHead>
                <TableHead className="min-w-[120px]">Unit Price</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="text-center min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium min-w-[200px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate block flex-1 min-w-0" title={item.name}>{item.name}</span>
                        {isLowStock(item) && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">
                      <Badge variant={getCategoryBadgeVariant(item.category)}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <span className="truncate block max-w-[120px]" title={item.sku || "-"}>{item.sku || "-"}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">
                      <span className={isLowStock(item) ? "text-destructive font-semibold" : ""}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[100px]">{item.minStock} {item.unit}</TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">{item.unitPrice ? formatCurrency(item.unitPrice) : "-"}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <span className="truncate block max-w-[150px]" title={item.location || "-"}>{item.location || "-"}</span>
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
                            <Link href={`/inventory/${item.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
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
        </div>

        {/* Pagination - Pinned to bottom of viewport */}
        <div className="flex-shrink-0 border-t border-border/40 bg-muted/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredItems.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormDialogOpen(false)
              setEditingItem(undefined)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

