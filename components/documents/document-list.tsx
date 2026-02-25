"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, Calendar, Download, File } from "lucide-react"
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
import { Pagination } from "@/components/ui/pagination"
import { DocumentForm } from "./document-form"
import { useDocuments } from "@/lib/hooks/use-documents"
import { useProjects } from "@/lib/hooks/use-projects"
import { DocumentFormSchema } from "@/lib/validations/document"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { projectsApi } from "@/lib/api/projects"
import toast from "react-hot-toast"

interface DocumentListProps {
  projectId?: string
  onCreateDocument: () => void
}

export function DocumentList({ projectId, onCreateDocument }: DocumentListProps) {
  const { documents, loading, deleteDocument, createDocument, updateDocument, loadDocuments } = useDocuments()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [projectFilter, setProjectFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<DocumentType | "all">("all")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<Document | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [documentToEdit, setDocumentToEdit] = React.useState<Document | null>(null)

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      // Project filter
      const matchesProject = projectId
        ? doc.projectId === projectId
        : projectFilter === "all" || doc.projectId === projectFilter

      // Search filter
      const matchesSearch =
        searchQuery === "" || doc.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = typeFilter === "all" || doc.type === typeFilter

      // Date range filter
      const docDate = new Date(doc.uploadedAt)
      const matchesStartDate = !startDate || docDate >= new Date(startDate)
      const matchesEndDate = !endDate || docDate <= new Date(endDate)

      return matchesProject && matchesSearch && matchesType && matchesStartDate && matchesEndDate
    })
  }, [documents, projectId, projectFilter, searchQuery, typeFilter, startDate, endDate])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage))
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [projectFilter, searchQuery, typeFilter, startDate, endDate])

  // Adjust current page if it's out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handleDelete = async () => {
    if (!documentToDelete) return
    
    try {
      await deleteDocument(documentToDelete.id)
      await loadDocuments(projectId, true) // Force refresh
      toast.success("Document deleted successfully")
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
      // Recalculate total pages after deletion
      const newTotalPages = Math.max(1, Math.ceil((filteredDocuments.length - 1) / itemsPerPage))
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
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-muted-foreground">Manage project documents and files</p>
        </div>
        {!projectId && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 flex-shrink-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        {filteredDocuments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">No documents found</p>
              <p className="text-muted-foreground">Get started by uploading a new document</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Uploaded Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.projectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(doc.type)}>{doc.type}</Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
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
                totalItems={filteredDocuments.length}
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
    </div>
  )
}

