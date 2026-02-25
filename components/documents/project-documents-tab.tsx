"use client"

import * as React from "react"
import { Plus, File, Download } from "lucide-react"
import { useDocuments } from "@/lib/hooks/use-documents"
import { Document } from "@/types/document"
import { DocumentFormSchema } from "@/lib/validations/document"
import { projectsApi } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentForm } from "./document-form"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DocumentType } from "@/types/document"

interface ProjectDocumentsTabProps {
  projectId: string
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const { createDocument, loadDocumentsByProject } = useDocuments()
  const [projectDocuments, setProjectDocuments] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await loadDocumentsByProject(projectId)
      setProjectDocuments(data)
      setLoading(false)
    }
    load()
  }, [projectId, loadDocumentsByProject])

  const handleCreateDocument = async (data: DocumentFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await createDocument({
      projectId: data.projectId || projectId,
      projectName: project.name,
      name: data.name,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName || data.fileUrl.split("/").pop() || "document",
      fileSize: data.fileSize || 0,
      notes: data.notes || undefined,
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
    } as Omit<Document, "id" | "createdAt" | "updatedAt">)

    // Reload documents
    const updated = await loadDocumentsByProject(projectId)
    setProjectDocuments(updated)
  }

  const handleDownload = (document: Document) => {
    if (typeof window !== 'undefined') {
      window.open(document.fileUrl, "_blank")
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

  // Group documents by type
  const documentsByType = React.useMemo(() => {
    const grouped: Record<DocumentType, Document[]> = {
      Agreement: [],
      Drawing: [],
      Bill: [],
      Invoice: [],
      Approval: [],
      Permit: [],
      Receipt: [],
      Other: [],
    }

    projectDocuments.forEach((doc) => {
      if (grouped[doc.type]) {
        grouped[doc.type].push(doc)
      }
    })

    return grouped
  }, [projectDocuments])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading documents...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Documents</h3>
          <p className="text-sm text-muted-foreground">Manage all documents for this project</p>
        </div>
        <CreateDocumentButton onCreate={handleCreateDocument} projectId={projectId} />
      </div>

      {/* Documents grouped by type */}
      {projectDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <File className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">No documents found</p>
            <p className="text-muted-foreground">Get started by uploading a document</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentsByType).map(([type, docs]) => {
            if (docs.length === 0) return null

            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{type}</span>
                    <Badge variant={getTypeBadgeVariant(type as DocumentType)}>{docs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/documents/${doc.id}`}
                              className="font-medium hover:underline block truncate"
                            >
                              {doc.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(doc.fileSize)} •{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="View">
                            <Link href={`/documents/${doc.id}`}>
                              <File className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreateDocumentButton({
  onCreate,
  projectId,
}: {
  onCreate: (data: Omit<Document, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: DocumentFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await onCreate({
      projectId: data.projectId || projectId,
      projectName: project.name,
      name: data.name,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName || data.fileUrl.split("/").pop() || "document",
      fileSize: data.fileSize || 0,
      notes: data.notes || undefined,
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
    } as Omit<Document, "id" | "createdAt" | "updatedAt">)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Document</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DocumentForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

