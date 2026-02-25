"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, Users, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { Labour, LabourCategory } from "@/types/labour"
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
import { LabourForm } from "./labour-form"
import { useLabour } from "@/lib/hooks/use-labour"
import { useProjects } from "@/lib/hooks/use-projects"
import { LabourFormSchema } from "@/lib/validations/labour"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { projectsApi } from "@/lib/api/projects"
import toast from "react-hot-toast"

interface LabourListProps {
  projectId?: string
  onCreateLabour: () => void
}

export function LabourList({ projectId, onCreateLabour }: LabourListProps) {
  const { labour, loading, deleteLabour, loadLabour, createLabour, updateLabour } = useLabour()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<LabourCategory | "all">("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [labourToDelete, setLabourToDelete] = React.useState<Labour | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [labourToEdit, setLabourToEdit] = React.useState<Labour | null>(null)

  // Filter labour
  const filteredLabour = React.useMemo(() => {
    return labour.filter((entry) => {
      // Project filter
      const matchesProject = projectId
        ? entry.projectId === projectId
        : projectFilter === "all" || entry.projectId === projectFilter

      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter

      // Date range filter
      const matchesDateRange =
        (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate)

      return matchesProject && matchesSearch && matchesCategory && matchesDateRange
    })
  }, [labour, projectId, projectFilter, searchQuery, categoryFilter, startDate, endDate])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLabour.length / itemsPerPage))
  const paginatedLabour = filteredLabour.slice(
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

  const handleDelete = async () => {
    if (!labourToDelete) return
    
    try {
      await deleteLabour(labourToDelete.id)
      await loadLabour() // Force refresh
      toast.success("Labour entry deleted successfully")
      setDeleteDialogOpen(false)
      setLabourToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredLabour.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete labour entry:", error)
      const errorMessage = error?.message || "Failed to delete labour entry. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleCreate = async (data: LabourFormSchema) => {
    try {
      const project = await projectsApi.getById(data.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Create labour - this updates the hook state immediately
      await createLabour({
        projectId: data.projectId,
        category: data.category,
        headcount: data.headcount,
        costPerDay: data.costPerDay,
        date: data.date,
        notes: data.notes,
      })
      setCreateDialogOpen(false)
      // Immediately refresh to ensure the list updates
      await loadLabour()
    } catch (error: any) {
      console.error("Error creating labour entry:", error)
      toast.error(error?.message || "Failed to create labour entry. Please try again.")
    }
  }

  const handleEdit = async (data: LabourFormSchema) => {
    if (!labourToEdit) return
    try {
      const project = await projectsApi.getById(data.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Update labour - this updates the hook state immediately
      await updateLabour(labourToEdit.id, {
        projectId: data.projectId,
        category: data.category,
        headcount: data.headcount,
        costPerDay: data.costPerDay,
        date: data.date,
        notes: data.notes,
      })
      setEditDialogOpen(false)
      setLabourToEdit(null)
      // Immediately refresh to ensure the list updates
      await loadLabour()
    } catch (error: any) {
      console.error("Error updating labour entry:", error)
      alert(error?.message || "Failed to update labour entry. Please try again.")
    }
  }

  const totalHeadcount = filteredLabour.reduce((sum, entry) => sum + entry.headcount, 0)
  const totalCost = filteredLabour.reduce((sum, entry) => sum + entry.headcount * entry.costPerDay, 0)

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Labour Entries</h2>
          <p className="text-muted-foreground">Manage labour entries and track costs</p>
        </div>
        {!projectId && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Labour Entry
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {filteredLabour.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 flex-shrink-0">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
                <p className="text-2xl font-bold">{totalHeadcount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Labour Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 flex-shrink-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {!projectId && (
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
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
            onChange={(e) => setCategoryFilter(e.target.value as LabourCategory | "all")}
          >
            <option value="all">All Categories</option>
            <option value="Mason">Mason</option>
            <option value="Helper">Helper</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Painter">Painter</option>
            <option value="Other">Other</option>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        {filteredLabour.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">No labour entries found</p>
              <p className="text-muted-foreground">Get started by adding a new labour entry</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Labour Category</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Cost Per Day</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLabour.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.projectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell>{entry.headcount}</TableCell>
                    <TableCell>{formatCurrency(entry.costPerDay)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(entry.headcount * entry.costPerDay)}
                    </TableCell>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/labour/${entry.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setLabourToEdit(entry)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setLabourToDelete(entry)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {/* Pagination - Always at bottom */}
            <div className="flex-shrink-0 border-t bg-card">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredLabour.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Labour Entry</DialogTitle>
            <DialogDescription>Add a new labour entry to track workforce and costs</DialogDescription>
          </DialogHeader>
          <LabourForm
            projectId={projectId}
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Labour Entry</DialogTitle>
            <DialogDescription>Update labour entry details</DialogDescription>
          </DialogHeader>
          {labourToEdit && (
            <LabourForm
              labour={labourToEdit}
              onSubmit={handleEdit}
              onCancel={() => {
                setEditDialogOpen(false)
                setLabourToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Labour Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this labour entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
                if (labourToDelete) {
                  handleDelete()
                }
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

