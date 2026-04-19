"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, Download, File, Upload } from "lucide-react"
import { Document, DocumentType } from "@/types/document"
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
import { Pagination } from "@/components/ui/pagination"
import { DocumentForm } from "./document-form"
import { BulkUploadModal } from "@/components/shared/bulk-upload-modal"
import { downloadDocumentBulkTemplate, parseBulkDocumentsFromCsv } from "./document-bulk-utils"
import { useDocuments } from "@/lib/hooks/use-documents"
import { useProjects } from "@/lib/hooks/use-projects"
import { DocumentListParams } from "@/lib/api/documents"
import { DocumentFormSchema } from "@/lib/validations/document"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { projectsApi } from "@/lib/api/projects"
import toast from "react-hot-toast"
import { usePlanLimits } from "@/lib/hooks/use-plan-limits"
import { ApiError } from "@/lib/api/client"
import { formatDateDMY } from "@/lib/utils/date"

interface DocumentListProps {
  projectId?: string
  onCreateDocument: () => void
}

export function DocumentList({ projectId, onCreateDocument }: DocumentListProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const { projects } = useProjects()
  const { handleError, UpgradeModalComponent } = usePlanLimits()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<DocumentType | "all">("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const listParams = React.useMemo<DocumentListParams>(() => ({
    page: currentPage,
    limit: itemsPerPage,
    projectId: projectId || (projectFilter !== "all" ? projectFilter : undefined),
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchQuery || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [currentPage, endDate, itemsPerPage, projectFilter, projectId, searchQuery, startDate, typeFilter])
  const { documents, total, loading, deleteDocument, createDocument, updateDocument, loadDocuments, bulkCreateDocuments } = useDocuments(listParams)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<Document | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [documentToEdit, setDocumentToEdit] = React.useState<Document | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, typeFilter, startDate, endDate])

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

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      await deleteDocument(documentToDelete.id)
      await loadDocuments(projectId, true) // Force refresh
      toast.success("Document deleted successfully")
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil(Math.max(total - 1, 0) / itemsPerPage))
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Failed to delete document:", error)
      const errorMessage = error?.message || "Failed to delete document. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleDownload = (document: Document) => {
    // Mock download - in production, this would download the actual file
    if (typeof window !== 'undefined') {
      window.open(document.fileUrl, "_blank")
    }
  }

  const handleCreate = async (data: DocumentFormSchema) => {
    try {
      // Create document - only send fields that backend expects
      await createDocument({
        projectId: data.projectId,
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        notes: data.notes,
      })
      setCreateDialogOpen(false)
      // Immediately refresh to ensure the list updates
      await loadDocuments()
    } catch (error: any) {
      // Handle plan limit errors
      if (handleError(error)) {
        return // Upgrade modal will be shown
      }
      console.error("Error creating document:", error)
      toast.error(error?.message || "Failed to create document. Please try again.")
    }
  }

  const handleEdit = async (data: DocumentFormSchema) => {
    if (!documentToEdit) return
    try {
      const project = await projectsApi.getById(data.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Update document - only send fields that backend expects
      await updateDocument(documentToEdit.id, {
        projectId: data.projectId,
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        notes: data.notes,
      })
      setEditDialogOpen(false)
      setDocumentToEdit(null)
      // Immediately refresh to ensure the list updates
      await loadDocuments()
    } catch (error: any) {
      console.error("Error updating document:", error)
      toast.error(error?.message || "Failed to update document. Please try again.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getTypeBadgeVariant = (type: DocumentType) => {
    switch (type) {
      case "Agreement":
        return "default"
      case "Drawing":
        return "secondary"
      case "Bill":
        return "outline"
      case "Invoice":
        return "success"
      case "Approval":
        return "warning"
      case "Permit":
        return "secondary"
      case "Receipt":
        return "success"
      case "Other":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }


  return (
    <div className="flex flex-col h-full min-h-0 gap-1">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between flex-shrink-0 pt-4 sm:pt-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage project documents and files</p>
        </div>
        {!projectId && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-transparent sm:border-border sm:bg-card sm:p-2 flex-shrink-0 my-2">
        <div className="grid gap-4 sm:gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as DocumentType | "all")}
          >
            <option value="all">All Types</option>
            <option value="Agreement">Agreement</option>
            <option value="Drawing">Drawing</option>
            <option value="Bill">Bill</option>
            <option value="Invoice">Invoice</option>
            <option value="Approval">Approval</option>
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
        <div
          className={cn(
            "flex-1 min-h-0 overflow-x-auto", // Horizontal scroll on mobile
            "overflow-y-auto" // Always allow vertical scroll for table content
          )}
          data-table-scroll-container
        >
          <Table className="border-0 rounded-none min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center py-4">
                      <File className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-semibold text-foreground">No documents found</p>
                      <p className="text-muted-foreground">Get started by uploading a new document</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <span className="truncate block" title={doc.projectName}>
                        {doc.projectName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate block flex-1 min-w-0" title={doc.name}>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getTypeBadgeVariant(doc.type)}>{doc.type}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateDMY(doc.uploadedAt)}</TableCell>
                    <TableCell className="relative text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.location.href = `/documents/${doc.id}`
                            }
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDocumentToEdit(doc)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDocumentToDelete(doc)
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
            totalItems={total}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a new document to the project</DialogDescription>
          </DialogHeader>
          <DocumentForm
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
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update document information</DialogDescription>
          </DialogHeader>
          {documentToEdit && (
            <DocumentForm
              document={documentToEdit}
              onSubmit={handleEdit}
              onCancel={() => {
                setEditDialogOpen(false)
                setDocumentToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
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
                handleDelete()
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        title="Bulk Upload Documents"
        description="Upload a CSV file containing documents. Make sure to provide Project ID and File URL. Invalid projects or those over quota will fail."
        requiredHeaders={["Project ID", "Name", "File URL"]}
        onDownloadTemplate={downloadDocumentBulkTemplate}
        onParseCsv={parseBulkDocumentsFromCsv}
        onUpload={async (rows) => {
          const res = await bulkCreateDocuments(rows)
          await loadDocuments(projectId, true)
          return res
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModalComponent />
    </div>
  )
}

