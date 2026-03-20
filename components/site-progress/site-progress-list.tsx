"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, Image as ImageIcon, Upload } from "lucide-react"
import toast from "react-hot-toast"
import { SiteProgress } from "@/types/site-progress"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { SiteProgressForm } from "./site-progress-form"
import { useSiteProgress } from "@/lib/hooks/use-site-progress"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { downloadSiteProgressBulkTemplate, parseBulkSiteProgressFromCsv } from "./site-progress-bulk-utils"
import { useProjects } from "@/lib/hooks/use-projects"
import { projectsApi } from "@/lib/api/projects"
import { SiteProgressFormSchema } from "@/lib/validations/site-progress"

interface SiteProgressListProps {
  projectId?: string
}

export function SiteProgressList({ projectId }: SiteProgressListProps) {
  const { progress, loading, deleteProgress, loadProgress, createProgress, bulkCreateProgress } = useSiteProgress()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [progressToDelete, setProgressToDelete] = React.useState<SiteProgress | null>(null)

  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)

  // Filter progress
  const filteredProgress = React.useMemo(() => {
    return progress.filter((item) => {
      // Project filter
      const matchesProject = projectId
        ? item.projectId === projectId
        : projectFilter === "all" || item.projectId === projectFilter

      // Search filter
      const matchesSearch =
        item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false

      // Date range filter
      const itemDate = new Date(item.date)
      const matchesStartDate = !startDate || itemDate >= new Date(startDate)
      const matchesEndDate = !endDate || itemDate <= new Date(endDate)

      return matchesProject && matchesSearch && matchesStartDate && matchesEndDate
    })
  }, [progress, projectId, projectFilter, searchQuery, startDate, endDate])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProgress.length / itemsPerPage))
  const paginatedProgress = filteredProgress.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, startDate, endDate])

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

  const handleDelete = async (item: SiteProgress) => {
    setProgressToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!progressToDelete) return

    try {
      await deleteProgress(progressToDelete.id)
      await loadProgress(projectId, true) // Force refresh
      toast.success("Site progress deleted successfully")
      setDeleteDialogOpen(false)
      setProgressToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredProgress.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete progress:", error)
      const errorMessage = error?.message || "Failed to delete site progress. Please try again."
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading site progress...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0 gap-1">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 flex-shrink-0 pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Site Progress</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {projectId ? "Project site progress" : "Track construction site progress"}
          </p>
        </div>
        <div className="flex gap-2">
          {!projectId && (
            <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          )}
          <CreateProgressButton
            projectId={projectId}
            onCreated={async () => {
              await loadProgress(projectId, true)
            }}
            createProgress={createProgress}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row flex-shrink-0 my-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by project or notes..."
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
                <TableHead>Project Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Photo Count</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProgress.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No site progress entries found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProgress.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <span
                        className="truncate block"
                        title={item.projectName}
                      >
                        {item.projectName}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell className="align-top">
                      <p
                        className="text-xs text-muted-foreground whitespace-normal break-words max-w-3xl"
                        title={item.notes || "No notes"}
                      >
                        {item.notes || "No notes"}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.photos.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="relative text-center">
                      <ProgressActionsMenu item={item} onDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination - Always at bottom, outside scroll container */}
        <div className="flex-shrink-0 border-t border-border bg-background">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProgress.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Bulk Upload Site Progress"
        description="Upload a CSV file containing site progress entries. Note that Project ID and Date are required."
        requiredHeaders={["Project ID", "Date"]}
        onDownloadTemplate={downloadSiteProgressBulkTemplate}
        onParseCsv={parseBulkSiteProgressFromCsv}
        onUpload={async (rows) => {
          const res = await bulkCreateProgress(rows)
          await loadProgress(projectId, true)
          return res
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDeleteDialogOpen(false)} />
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete Site Progress</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this site progress entry from{" "}
              {new Date(progressToDelete?.date || "").toLocaleDateString()}? This action cannot be
              undone.
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

function ProgressActionsMenu({
  item,
  onDelete,
}: {
  item: SiteProgress
  onDelete: (item: SiteProgress) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/site-progress/${item.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/site-progress/${item.id}/edit`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateProgressButton({
  createProgress,
  onCreated,
  projectId,
}: {
  createProgress: (data: { projectId: string; date: string; notes?: string; photos?: string[] }) => Promise<any>
  onCreated: () => Promise<void>
  projectId?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: SiteProgressFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const finalProjectId = data.projectId || projectId || ""

      if (!finalProjectId) {
        setError("Please select a project")
        return
      }

      await createProgress({
        projectId: finalProjectId,
        date: data.date,
        notes: data.notes || undefined,
        photos: data.photos || [],
      })

      await onCreated()

      setOpen(false)
      toast.success("Site progress added successfully")
    } catch (err: any) {
      setError(err?.message || "Failed to create site progress. Please try again.")
      console.error("Error creating site progress:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {projectId ? "Add Progress" : "New Progress"}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Site Progress</h2>
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
            <SiteProgressForm onSubmit={handleSubmit} onCancel={() => !isSubmitting && setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

