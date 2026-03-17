"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import { Lead, LeadType, LeadStatus } from "@/types/lead"
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
import { LeadForm } from "./lead-form"
import { useLeads } from "@/lib/hooks/use-leads"
import { LeadFormSchema } from "@/lib/validations/lead"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeadListProps {
  onCreateLead: () => void
}

export function LeadList({ onCreateLead }: LeadListProps) {
  const { leads, loading, createLead, deleteLead, convertToClient, loadLeads } = useLeads()
  const [activeTab, setActiveTab] = React.useState<"all" | "leads" | "clients">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<LeadStatus | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = React.useState(false)
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null)
  const [leadToConvert, setLeadToConvert] = React.useState<Lead | null>(null)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Filter leads based on tab, search, and status
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      // Tab filter
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "leads" && lead.type === "LEAD") ||
        (activeTab === "clients" && lead.type === "CLIENT")

      // Search filter
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [leads, activeTab, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage))
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, statusFilter])

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

  const handleDelete = async (lead: Lead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!leadToDelete) return

    try {
      await deleteLead(leadToDelete.id)
      await loadLeads() // Force refresh
      toast.success("Lead/Client deleted successfully")
      setDeleteDialogOpen(false)
      setLeadToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredLeads.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete lead:", error)
      const errorMessage = error?.message || "Failed to delete lead/client. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleConvert = async (lead: Lead) => {
    setLeadToConvert(lead)
    setConvertDialogOpen(true)
  }

  const confirmConvert = async () => {
    if (leadToConvert) {
      await convertToClient(leadToConvert.id)
      setConvertDialogOpen(false)
      setLeadToConvert(null)
    }
  }

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case "Converted":
        return "success"
      case "Qualified":
        return "default"
      case "Contacted":
        return "secondary"
      case "New":
        return "outline"
      case "Lost":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSourceBadgeVariant = (source: Lead["source"]) => {
    switch (source) {
      case "Broker":
        return "default"
      case "Portal":
        return "secondary"
      case "Referral":
        return "success"
      case "Direct":
        return "outline"
      default:
        return "outline"
    }
  }

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading leads...</div>
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <PageHeader
        title="Leads & Clients"
        subtitle="Manage your leads and clients"
        action={{
          label: "New Lead",
          icon: UserPlus,
          onClick: () => setCreateDialogOpen(true),
        }}
      />

      {/* Tabs */}
      <div className="flex-shrink-0 mb-2">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-[13px]">All</TabsTrigger>
            <TabsTrigger value="leads" className="text-[13px]">Leads</TabsTrigger>
            <TabsTrigger value="clients" className="text-[13px]">Clients</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or phone..."
        filters={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="h-[40px] w-[160px] text-[13px]"
          >
            <option value="all">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
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
            <Table className="border-0 rounded-none min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No leads or clients found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="hover:underline truncate block flex-1 min-w-0"
                          title={lead.name}
                        >
                          {lead.name}
                        </Link>
                        {lead.type === "CLIENT" && (
                          <Badge variant="outline" className="text-xs flex-shrink-0 whitespace-nowrap">
                            Client
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{lead.phone}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getSourceBadgeVariant(lead.source)}>{lead.source}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="truncate block" title={lead.assignedTo || "Unassigned"}>
                        {lead.assignedTo || "Unassigned"}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell className="relative text-center">
                      <LeadActionsMenu
                        lead={lead}
                        onDelete={handleDelete}
                        onConvert={handleConvert}
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
            totalItems={filteredLeads.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Create Lead Dialog */}
      {createDialogOpen && (
        <CreateLeadDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={async (data) => {
            await createLead(data)
            await loadLeads()
          }}
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
            <h2 className="text-lg font-semibold">Delete Lead/Client</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{leadToDelete?.name}"? This action cannot be undone.
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

      {/* Create Lead Dialog */}
      {createDialogOpen && (
        <CreateLeadDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={async (data) => {
            await createLead(data)
            await loadLeads()
          }}
        />
      )}

      {/* Convert Confirmation Dialog */}
      {convertDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setConvertDialogOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <h2 className="text-lg font-semibold">Convert Lead to Client</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to convert "{leadToConvert?.name}" to a client? This will change
              their status to "Converted".
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmConvert}>
                <UserPlus className="mr-2 h-4 w-4" />
                Convert to Client
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CreateLeadDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: LeadFormSchema) => Promise<void>
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: LeadFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onCreate({
        ...data,
        type: "LEAD",
        email: data.email || undefined,
        assignedTo: data.assignedTo || undefined,
        notes: data.notes || undefined,
      } as Omit<Lead, "id" | "createdAt" | "updatedAt">)
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Failed to create lead. Please try again.")
      console.error("Error creating lead:", err)
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
          <h2 className="text-lg font-semibold">Create New Lead</h2>
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
        <LeadForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && onOpenChange(false)} />
      </div>
    </>
  )
}

function LeadActionsMenu({
  lead,
  onDelete,
  onConvert,
  isOpen,
  onOpenChange,
}: {
  lead: Lead
  onDelete: (lead: Lead) => void
  onConvert: (lead: Lead) => void
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
          <Link href={`/leads/${lead.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/leads/${lead.id}/edit`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        {lead.type === "LEAD" && (
          <DropdownMenuItem onClick={() => onConvert(lead)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convert to Client
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(lead)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateLeadButton({
  onCreate,
  onRefresh
}: {
  onCreate: (data: LeadFormSchema) => Promise<void>
  onRefresh?: () => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: LeadFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onCreate({
        ...data,
        type: "LEAD",
        email: data.email || undefined,
        assignedTo: data.assignedTo || undefined,
        notes: data.notes || undefined,
      } as Omit<Lead, "id" | "createdAt" | "updatedAt">)
      setOpen(false)
      // Immediately refresh the list to show the new lead
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create lead. Please try again.")
      console.error("Error creating lead:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Lead
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Lead</h2>
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
            <LeadForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && setOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

