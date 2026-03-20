"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Power, PowerOff, Upload } from "lucide-react"
import toast from "react-hot-toast"
import { Vendor, VendorType, VendorStatus } from "@/types/vendor"
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
import { cn } from "@/lib/utils"
import { VendorForm } from "./vendor-form"
import { useVendors } from "@/lib/hooks/use-vendors"
import { VendorFormSchema } from "@/lib/validations/vendor"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { VENDOR_BULK_HEADERS, generateVendorCsvTemplate, parseBulkVendorsFromCsv } from "./vendor-bulk-utils"

interface VendorListProps {
  onCreateVendor: () => void
}

export function VendorList({ onCreateVendor }: VendorListProps) {
  const { vendors, loading, deleteVendor, toggleVendorStatus, loadVendors, bulkCreateVendors } = useVendors()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<VendorType | "all">("all")
  const [statusFilter, setStatusFilter] = React.useState<VendorStatus | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [vendorToDelete, setVendorToDelete] = React.useState<Vendor | null>(null)
  const [vendorToToggle, setVendorToToggle] = React.useState<Vendor | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)

  // Filter vendors
  const filteredVendors = React.useMemo(() => {
    return vendors.filter((vendor) => {
      // Search filter
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phone.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = typeFilter === "all" || vendor.type === typeFilter

      // Status filter
      const matchesStatus = statusFilter === "all" || vendor.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [vendors, searchQuery, typeFilter, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / itemsPerPage))
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, statusFilter])

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

  const handleDelete = async (vendor: Vendor) => {
    setVendorToDelete(vendor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!vendorToDelete) return

    try {
      await deleteVendor(vendorToDelete.id)
      await loadVendors() // Force refresh
      toast.success("Vendor deleted successfully")
      setDeleteDialogOpen(false)
      setVendorToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredVendors.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete vendor:", error)
      const errorMessage = error?.message || "Failed to delete vendor. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async (vendor: Vendor) => {
    setVendorToToggle(vendor)
    setStatusDialogOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (vendorToToggle) {
      await toggleVendorStatus(vendorToToggle.id)
      setStatusDialogOpen(false)
      setVendorToToggle(null)
    }
  }

  const getTypeBadgeVariant = (type: VendorType) => {
    switch (type) {
      case "Material Supplier":
        return "default"
      case "Contractor":
        return "secondary"
      case "Electrician":
      case "Plumber":
        return "success"
      case "Transport":
        return "outline"
      case "Equipment Rental":
        return "warning"
      case "Other":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading vendors...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 flex-shrink-0 pb-3 border-b border-border/40 mb-4 mt-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your vendors and suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <CreateVendorButton onCreate={async () => { }} onRefresh={loadVendors} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VendorType | "all")}
          className="w-[200px]"
        >
          <option value="all">All Types</option>
          <option value="Material Supplier">Material Supplier</option>
          <option value="Contractor">Contractor</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Transport">Transport</option>
          <option value="Equipment Rental">Equipment Rental</option>
          <option value="Other">Other</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VendorStatus | "all")}
          className="w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
      </div>

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
            <Table className="border-0 rounded-none min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Vendor Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="hover:underline truncate block"
                        title={vendor.name}
                      >
                        {vendor.name}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getTypeBadgeVariant(vendor.type)}>{vendor.type}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{vendor.phone}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={vendor.status === "Active" ? "success" : "destructive"}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="relative text-center">
                      <VendorActionsMenu
                        vendor={vendor}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        isOpen={openDropdownId === vendor.id}
                        onOpenChange={(open) => setOpenDropdownId(open ? vendor.id : null)}
                      />
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
            totalItems={filteredVendors.length}
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
            <h2 className="text-lg font-semibold">Delete Vendor</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{vendorToDelete?.name}"? This action cannot be undone.
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

      {/* Status Toggle Confirmation Dialog */}
      {statusDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setStatusDialogOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <h2 className="text-lg font-semibold">
              {vendorToToggle?.status === "Active" ? "Deactivate" : "Activate"} Vendor
            </h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {vendorToToggle?.status === "Active" ? "deactivate" : "activate"}{" "}
              "{vendorToToggle?.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmToggleStatus}>
                {vendorToToggle?.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </>
      )}

      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Bulk Upload Vendors"
        requiredHeaders={VENDOR_BULK_HEADERS}
        onDownloadTemplate={() => {
          const t = generateVendorCsvTemplate()
          const blob = new Blob([t], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'vendor_template.csv'
          a.click()
          window.URL.revokeObjectURL(url)
        }}
        onParseCsv={parseBulkVendorsFromCsv}
        onUpload={async (rows) => {
          const res = await bulkCreateVendors(rows)
          await loadVendors(true)
          return res
        }}
      />
    </div>
  )
}

function VendorActionsMenu({
  vendor,
  onDelete,
  onToggleStatus,
  isOpen,
  onOpenChange,
}: {
  vendor: Vendor
  onDelete: (vendor: Vendor) => void
  onToggleStatus: (vendor: Vendor) => void
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
          <Link href={`/vendors/${vendor.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/vendors/${vendor.id}/edit`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(vendor)}>
          {vendor.status === "Active" ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(vendor)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateVendorButton({
  onCreate,
  onRefresh
}: {
  onCreate: (data: VendorFormSchema) => Promise<void>
  onRefresh?: () => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: VendorFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onCreate({
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        notes: data.notes || undefined,
      } as Omit<Vendor, "id" | "createdAt" | "updatedAt">)
      setOpen(false)
      // Immediately refresh the list to show the new vendor
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create vendor. Please try again.")
      console.error("Error creating vendor:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Vendor
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Vendor</h2>
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
            <VendorForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

