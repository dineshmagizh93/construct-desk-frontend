"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X } from "lucide-react"
import toast from "react-hot-toast"
import { Project, ProjectStatus } from "@/types/project"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { ProjectForm } from "./project-form"
import { useProjects } from "@/lib/hooks/use-projects"
import { ProjectFormSchema } from "@/lib/validations/project"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import { useRole } from "@/lib/hooks/use-role"

interface ProjectListProps {
  onCreateProject: (data: ProjectFormSchema) => Promise<any>
}

export function ProjectList({ onCreateProject }: ProjectListProps) {
  const { projects, loading, error, createProject, updateProject, deleteProject, loadProjects } = useProjects()
  const { isAdmin } = useRole()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)



  // Filter projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage))
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

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

  const handleDelete = async (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = React.useCallback(async () => {
    if (!projectToDelete) return

    try {
      await deleteProject(projectToDelete.id)
      await loadProjects(true) // Force refresh
      toast.success("Project deleted successfully")
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredProjects.length - 1) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete project. Please try again."
      toast.error(errorMessage)
      // Keep dialog open on error so user can retry
    }
  }, [projectToDelete, deleteProject, loadProjects, filteredProjects.length, itemsPerPage, currentPage, setCurrentPage])

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case "Completed":
        return "success"
      case "In Progress":
        return "default"
      case "Planning":
        return "secondary"
      case "On Hold":
        return "warning"
      default:
        return "outline"
    }
  }

  // Only show loading if we have no projects at all (initial load)
  if (loading && projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-xs">Manage your construction projects</p>
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-xs">Manage your construction projects</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <p className="text-destructive font-medium mb-2">Error loading projects</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => loadProjects()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0">
      {/* Header */}
      <PageHeader
        title="Projects"
        subtitle="Manage your construction projects"
        action={
          isAdmin
            ? {
                label: "New Project",
                icon: Plus,
                onClick: () => setCreateDialogOpen(true),
              }
            : undefined
        }
      />

      {/* Filters */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by project name or client..."
        filters={
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProjectStatus | "all")
              setCurrentPage(1)
            }}
            className="h-[40px] w-[160px] text-[13px]"
          >
            <option value="all">All Status</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
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
            <Table className="border-0 rounded-none min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-center px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {projects.length === 0
                        ? "No projects found. Create your first project to get started."
                        : "No projects match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell title={project.clientName || "-"}>
                        {project.clientName || "-"}
                      </TableCell>
                      <TableCell title={project.location || "-"}>
                        {project.location || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-secondary rounded-full h-1.5 flex-shrink-0">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(project.startDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(project.endDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="relative text-center px-2" style={{ zIndex: openDropdownId === project.id ? 9999 : 1 }}>
                        <ProjectActionsMenu
                          project={project}
                          onDelete={handleDelete}
                          isOpen={openDropdownId === project.id}
                          onOpenChange={(open) => setOpenDropdownId(open ? project.id : null)}
                          isAdmin={isAdmin}
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
            totalItems={filteredProjects.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new construction project to your system</DialogDescription>
          </DialogHeader>
          <CreateProjectForm
            onSubmit={async (data) => {
              try {
                await onCreateProject(data)
                setCreateDialogOpen(false)
                await loadProjects()
              } catch (error: any) {
                // Error is handled by the form
                throw error
              }
            }}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{projectToDelete?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => confirmDelete()}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateProjectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: ProjectFormSchema) => Promise<void>
  onCancel: () => void
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: ProjectFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(data)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create project. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <ProjectForm onSubmit={handleSubmit} onCancel={onCancel} />
    </>
  )
}

function ProjectActionsMenu({
  project,
  onDelete,
  isOpen,
  onOpenChange,
  isAdmin
}: {
  project: Project
  onDelete: (project: Project) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isAdmin: boolean
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
          <Link href={`/projects/${project.id}`} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/edit`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                if (e) {
                  e.preventDefault()
                  e.stopPropagation()
                }
                onDelete(project)
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateProjectButton({
  onCreate,
  onRefresh
}: {
  onCreate: (data: ProjectFormSchema) => Promise<any>
  onRefresh?: () => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: ProjectFormSchema) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onCreate(data)
      setOpen(false)
      // Immediately refresh the list to show the new project
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create project. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) setError(null) // Clear error when dialog closes
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new construction project to your system</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <ProjectForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

