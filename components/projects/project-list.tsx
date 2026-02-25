"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X } from "lucide-react"
import toast from "react-hot-toast"
import { Project, ProjectStatus } from "@/types/project"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
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
  
  // Debug: Track dialog state changes
  React.useEffect(() => {
    console.log("🔍 deleteDialogOpen changed to:", deleteDialogOpen)
    console.log("🔍 projectToDelete:", projectToDelete)
  }, [deleteDialogOpen, projectToDelete])

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

  // Adjust current page if it's out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handleDelete = async (project: Project) => {
    console.log("=== handleDelete CALLED ===", project)
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
    console.log("Dialog should be opening now, deleteDialogOpen:", true)
  }

  const confirmDelete = React.useCallback(async () => {
    console.log("=== confirmDelete CALLED ===")
    if (!projectToDelete) {
      console.error("projectToDelete is null in confirmDelete!")
      return
    }
    
    console.log("Delete button clicked, deleting project:", projectToDelete.id)
    
    try {
      console.log("Calling deleteProject API...")
      await deleteProject(projectToDelete.id)
      console.log("Delete API call successful, refreshing list...")
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
      console.error("Failed to delete project:", error)
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
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage your construction projects</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage your construction projects</p>
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
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1.5">Manage your construction projects</p>
        </div>
        {isAdmin && <CreateProjectButton onCreate={onCreateProject} onRefresh={loadProjects} />}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by project name or client..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ProjectStatus | "all")
            setCurrentPage(1)
          }}
          className="w-[180px]"
        >
          <option value="all">All Status</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </Select>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
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
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{project.clientName}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="relative" style={{ zIndex: openDropdownId === project.id ? 9999 : 1 }}>
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
        
        {/* Pagination - Always at bottom */}
        <div className="flex-shrink-0 border-t bg-card">
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              console.log("Overlay clicked, closing dialog")
              setDeleteDialogOpen(false)
            }}
          />
          <div 
            className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Dialog content clicked")
            }}
          >
            <h2 className="text-lg font-semibold mb-2">Delete Project</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete "{projectToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={(e) => {
                  console.log("Cancel button clicked")
                  e.preventDefault()
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
                  console.log("=== DELETE BUTTON CLICKED ===")
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("Delete button clicked in dialog, calling confirmDelete...")
                  console.log("projectToDelete:", projectToDelete)
                  confirmDelete()
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
                console.log("=== DELETE MENU ITEM CLICKED ===", project)
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
      console.error("Error creating project:", error)
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

