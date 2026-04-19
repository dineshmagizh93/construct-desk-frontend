"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Upload, Download } from "lucide-react"
import toast from "react-hot-toast"
import { Project, ProjectStatus } from "@/types/project"
import { CreateProjectDto, ProjectListParams } from "@/lib/api/projects"
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
import { Label } from "@/components/ui/label"
import { formatDateDMY } from "@/lib/utils/date"

interface ProjectListProps {
  onCreateProject: (data: ProjectFormSchema) => Promise<any>
}

export function ProjectList({ onCreateProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "all">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const listParams = React.useMemo<ProjectListParams>(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  }), [currentPage, itemsPerPage, searchQuery, statusFilter])
  const { projects, total, loading, error, createProject, updateProject, deleteProject, loadProjects, bulkCreateProjects } = useProjects(listParams)
  const { isAdmin } = useRole()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

  // Bulk upload state
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)
  const [bulkUploadError, setBulkUploadError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreateProjectDto[]>([])
  const [bulkSummary, setBulkSummary] = React.useState<{ requested: number; unique: number } | null>(null)

  const computeProgressFromStatus = (status: ProjectStatus) => {
    return status === "Completed" ? 100 : status === "Planning" ? 0 : 25
  }

  const downloadBulkTemplate = () => {
    const headers = [
      "projectId",
      "name",
      "clientName",
      "location",
      "status",
      "startDate",
      "endDate",
      "progress",
    ]

    // Dates use YYYY-MM-DD so the backend `@IsDateString` accepts them.
    const sample = [
      "PRJ-1001",
      "Quess Shopping Center Renovation",
      "Quess Shopping Center",
      "Manhattan Retail District",
      "Planning",
      "2024-01-01",
      "2024-12-31",
      "0",
    ]

    const escapeCell = (v: string) => {
      const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r")
      const escaped = v.replace(/"/g, '""')
      return needsQuotes ? `"${escaped}"` : escaped
    }

    const csv = `${headers.map(escapeCell).join(",")}\n${sample.map((c) => escapeCell(String(c))).join(",")}\n`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseCsv = (text: string): string[][] => {
    const rows: string[][] = []
    let row: string[] = []
    let cur = ""
    let inQuotes = false

    const pushField = () => {
      row.push(cur.trim())
      cur = ""
    }

    const pushRow = () => {
      // Ignore empty trailing rows
      const isAllEmpty = row.every((c) => c === "")
      if (!isAllEmpty) rows.push(row)
      row = []
    }

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]

      if (ch === '"') {
        // Handle escaped quotes
        if (inQuotes && text[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
        continue
      }

      if (!inQuotes && ch === ",") {
        pushField()
        continue
      }

      if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && text[i + 1] === "\n") i++
        pushField()
        pushRow()
        continue
      }

      cur += ch
    }

    // Last field/row
    pushField()
    pushRow()
    return rows
  }

  const parseBulkProjectsFromCsv = (csvText: string): CreateProjectDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const normalizeHeaderKey = (h: string) =>
      h
        .trim()
        .toLowerCase()
        // keep letters/numbers only so "Project ID" == "projectId"
        .replace(/[^a-z0-9]/g, "")

    const normalizeDateStr = (val: string) => {
      const v = val.trim()
      if (!v) return ""
      // already in YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
      const d = new Date(v)
      if (Number.isNaN(d.getTime())) return ""
      return d.toISOString().split("T")[0]
    }

    const normalizeStatus = (raw: string): ProjectStatus | "" => {
      const s = raw.trim().toLowerCase()
      const compact = s.replace(/[^a-z]/g, "")

      if (compact === "planning") return "Planning"
      if (compact === "inprogress") return "In Progress"
      if (compact === "onhold") return "On Hold"
      if (compact === "completed") return "Completed"
      return ""
    }

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["projectid", "name", "clientname", "location", "status", "startdate", "enddate"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) {
      throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
    }

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const toNumber = (v: string) => {
      if (!v) return undefined
      const n = parseFloat(v)
      return Number.isNaN(n) ? undefined : n
    }

    const toInt = (v: string) => {
      if (!v) return undefined
      const n = parseInt(v, 10)
      return Number.isNaN(n) ? undefined : n
    }

    const projects: CreateProjectDto[] = []

    for (const row of dataRows) {
      const projectId = get(row, "projectid")
      const name = get(row, "name")
      const clientName = get(row, "clientname")
      const location = get(row, "location")
      const status = normalizeStatus(get(row, "status"))
      const startDate = normalizeDateStr(get(row, "startdate"))
      const endDate = normalizeDateStr(get(row, "enddate"))

      if (!projectId || !name || !clientName || !location || !status || !startDate || !endDate) {
        // Skip invalid/empty rows silently; user will see an error if nothing parses.
        continue
      }

      if (new Date(endDate) < new Date(startDate)) {
        throw new Error("End date must be greater than the start date")
      }

      const progress = (() => {
        const progressRaw = get(row, "progress")
        const p = toInt(progressRaw)
        if (p !== undefined) return p
        return computeProgressFromStatus(status)
      })()

      // Optional columns: support only when present
      const description = headerMap.has("description") ? get(row, "description") : ""
      const estimatedBudget = headerMap.has("estimatedbudget") ? toNumber(get(row, "estimatedbudget")) : undefined
      const actualBudget = headerMap.has("actualbudget") ? toNumber(get(row, "actualbudget")) : undefined

      projects.push({
        projectId,
        name,
        clientName,
        location,
        description: description || undefined,
        startDate,
        endDate,
        status,
        estimatedBudget,
        actualBudget,
        progress,
      })
    }

    return projects
  }



  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

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
      const newTotalPages = Math.max(1, Math.ceil(Math.max(total - 1, 0) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete project. Please try again."
      toast.error(errorMessage)
      // Keep dialog open on error so user can retry
    }
  }, [projectToDelete, deleteProject, loadProjects, total, itemsPerPage, currentPage, setCurrentPage])

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
  if (loading && projects.length === 0 && total === 0) {
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
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

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by project name or client..."
        actionButton={
          isAdmin
            ? {
                label: "Bulk Upload",
                icon: <Upload className="h-4 w-4" />,
                onClick: () => {
                  setBulkUploadOpen(true)
                  setBulkUploadError(null)
                  setBulkRows([])
                  setBulkSummary(null)
                },
              }
            : undefined
        }
        filters={
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProjectStatus | "all")
              setCurrentPage(1)
            }}
            className="h-[42px] w-[170px] text-[13px]"
          >
            <option value="all">All Status</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </Select>
        }
      />

      <div className="panel-surface mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem]">
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
                  <TableHead>Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-center px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {total === 0
                        ? "No projects found. Create your first project to get started."
                        : "No projects match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline"
                          title={project.projectId}
                        >
                          {project.projectId}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium break-words hover:underline"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] break-words" title={project.clientName || "-"}>
                        <span className="break-words">{project.clientName || "-"}</span>
                      </TableCell>
                      <TableCell className="max-w-[220px] break-words" title={project.location || "-"}>
                        <span className="break-words">{project.location || "-"}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateDMY(project.startDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateDMY(project.endDate)}
                      </TableCell>
                      <TableCell className="relative px-2 text-center" style={{ zIndex: openDropdownId === project.id ? 9999 : 1 }}>
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

        <div className="flex-shrink-0 border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={total}
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

      {/* Bulk Upload Dialog */}
      <Dialog
        open={bulkUploadOpen}
        onOpenChange={(open) => {
          setBulkUploadOpen(open)
          if (!open) {
            setBulkUploadError(null)
            setBulkRows([])
            setBulkSummary(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Projects</DialogTitle>
            <DialogDescription>
              Upload a CSV file with the same columns shown in your Projects table.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm">
              <div>
                <span className="font-semibold text-foreground">Required headers:</span>
                <p className="text-muted-foreground mt-1 text-xs break-all">
                  <code className="rounded border bg-background px-1 py-0.5">projectId</code>, <code className="rounded border bg-background px-1 py-0.5">name</code>, <code className="rounded border bg-background px-1 py-0.5">clientName</code>, <code className="rounded border bg-background px-1 py-0.5">location</code>, <code className="rounded border bg-background px-1 py-0.5">status</code>, <code className="rounded border bg-background px-1 py-0.5">startDate</code>, <code className="rounded border bg-background px-1 py-0.5">endDate</code>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={downloadBulkTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk-upload">Choose CSV file</Label>
              <Input
                id="bulk-upload"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkUploadError(null)
                  setBulkRows([])
                  setBulkSummary(null)
                  try {
                    const text = await file.text()
                    const rows = parseBulkProjectsFromCsv(text)
                    if (rows.length === 0) {
                      throw new Error("No valid rows found. Check your CSV headers and values.")
                    }

                    // Dedupe preview by projectId
                    const unique = new Map(rows.map((r) => [r.projectId, r]))
                    setBulkRows(Array.from(unique.values()))
                    setBulkSummary({ requested: rows.length, unique: unique.size })
                  } catch (err: any) {
                    setBulkUploadError(err?.message || "Failed to parse CSV.")
                  }
                }}
              />
            </div>

            {bulkUploadError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {bulkUploadError}
              </div>
            )}

            {bulkSummary && (
              <div className="rounded-2xl border border-slate-200/80 p-3 text-sm">
                <div className="font-medium">Parsed CSV summary</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Requested rows: <span className="font-semibold text-foreground">{bulkSummary.requested}</span> &bull; Unique projects: <span className="font-semibold text-foreground">{bulkSummary.unique}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={bulkRows.length === 0}
              onClick={async () => {
                try {
                  setBulkUploadError(null)
                  const res = await bulkCreateProjects(bulkRows)
                  toast.success(`Bulk upload complete. Created: ${res.created}, Skipped: ${res.skipped}`)
                  setBulkUploadOpen(false)
                  await loadProjects(true)
                } catch (err: any) {
                    const raw = (err?.message as string) || "Bulk upload failed."
                    // Remove any technical prefix like "PROJECT_LIMIT_EXCEEDED: ..."
                    const cleaned =
                      raw.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
                    setBulkUploadError(cleaned)
                }
              }}
            >
              Upload
            </Button>
          </div>
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
