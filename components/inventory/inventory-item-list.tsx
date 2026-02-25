"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, Package, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"
import { InventoryItem, InventoryCategory, inventoryApi } from "@/lib/api/inventory"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { InventoryItemForm } from "./inventory-item-form"
import { useInventoryItems } from "@/lib/hooks/use-inventory"
import { formatCurrency } from "@/lib/utils/currency"

interface InventoryItemListProps {
  onCreateItem?: () => void
}

export function InventoryItemList({ onCreateItem }: InventoryItemListProps) {
  const { items, loading, deleteItem, loadItems } = useInventoryItems()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<InventoryCategory | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<InventoryItem | undefined>(undefined)

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

  // Adjust current page if it's out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

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
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory items and stock levels</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | "all")}
          className="w-[180px]"
        >
          <option value="all">All Categories</option>
          <option value={InventoryCategory.MATERIAL}>Material</option>
          <option value={InventoryCategory.TOOL}>Tool</option>
          <option value={InventoryCategory.EQUIPMENT}>Equipment</option>
          <option value={InventoryCategory.OTHER}>Other</option>
        </Select>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.name}
                      {isLowStock(item) && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(item.category)}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.sku || "-"}</TableCell>
                  <TableCell>
                    <span className={isLowStock(item) ? "text-destructive font-semibold" : ""}>
                      {item.currentStock} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>{item.minStock} {item.unit}</TableCell>
                  <TableCell>
                    {item.unitPrice ? formatCurrency(item.unitPrice) : "-"}
                  </TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell className="text-right">
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
        
        {/* Pagination - Always at bottom */}
        <div className="flex-shrink-0 border-t bg-card">
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

