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
import { useRole } from "@/lib/hooks/use-role"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { parseCsv, normalizeDateToYmd, normalizeHeaderKey } from "@/lib/utils/csv"
import { CreateDocumentDto } from "@/lib/api/documents"

interface ProjectDocumentsTabProps {
  projectId: string
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const { createDocument, loadDocumentsByProject } = useDocuments()
  const { isAdmin } = useRole()
  const [projectDocuments, setProjectDocuments] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(true)

  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkError, setBulkError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreateDocumentDto[]>([])

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

  const downloadBulkTemplate = () => {
    // Note: bulk upload supports adding multiple documents that already have `fileUrl`.
    // Uploading physical files via CSV isn't supported here.
    const headers = ["projectId", "name", "type", "fileUrl", "fileName", "fileSize", "notes"]
    const sample = [
      projectId || "YOUR_PROJECT_ID",
      "Agreement - Bulk Upload",
      "Agreement",
      "https://example.com/files/agreement.pdf",
      "",
      "",
      "Optional notes",
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
    a.download = "documents-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseBulkDocumentsFromCsv = (csvText: string): CreateDocumentDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["name", "type", "fileurl"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const normalizeType = (raw: string): DocumentType | "" => {
      const s = raw.trim().toLowerCase().replace(/[^a-z]/g, "")
      if (!s) return ""
      if (s === "agreement") return "Agreement"
      if (s === "drawing") return "Drawing"
      if (s === "bill") return "Bill"
      if (s === "invoice") return "Invoice"
      if (s === "approval") return "Approval"
      if (s === "permit") return "Permit"
      if (s === "receipt") return "Receipt"
      if (s === "other") return "Other"
      return ""
    }

    const rows: CreateDocumentDto[] = []
    const mismatch: string[] = []

    for (const row of dataRows) {
      const rowProjectIdRaw = get(row, "projectid")
      if (rowProjectIdRaw && rowProjectIdRaw !== projectId) mismatch.push(rowProjectIdRaw)
      const finalProjectId = rowProjectIdRaw || projectId

      const name = get(row, "name")
      const type = normalizeType(get(row, "type"))
      const fileUrl = get(row, "fileurl")
      const fileName = get(row, "filename") || undefined
      const fileSizeRaw = get(row, "filesize")
      const fileSize = fileSizeRaw ? parseInt(fileSizeRaw, 10) : undefined
      const notes = get(row, "notes")

      if (!name || !type || !fileUrl) continue

      rows.push({
        projectId: finalProjectId,
        name,
        type,
        fileUrl,
        fileName: fileName || fileUrl.split("/").pop() || "document",
        fileSize: fileSize !== undefined && !Number.isNaN(fileSize) ? fileSize : 0,
        notes: notes || undefined,
      })
    }

    if (mismatch.length > 0) {
      throw new Error(`CSV projectId mismatch. All rows must match current project (${projectId}).`)
    }

    return rows
  }

  const handleBulkUpload = async () => {
    setBulkError(null)
    try {
      if (bulkRows.length === 0) {
        setBulkError("No valid rows to upload.")
        return
      }

      for (const row of bulkRows) {
        await createDocument({
          projectId: row.projectId,
          name: row.name,
          type: row.type,
          fileUrl: row.fileUrl,
          fileName: row.fileName,
          fileSize: row.fileSize,
          notes: row.notes,
        })
      }

      const updated = await loadDocumentsByProject(projectId)
      setProjectDocuments(updated)
      toast.success("Bulk documents uploaded successfully")
      setBulkOpen(false)
      setBulkRows([])
    } catch (err: any) {
      const raw = err?.message as string
      const cleaned = raw?.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
      setBulkError(cleaned || "Bulk upload failed")
    }
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
        <div className="flex items-center gap-2">
          <CreateDocumentButton onCreate={handleCreateDocument} projectId={projectId} />
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkOpen(true)
                setBulkError(null)
                setBulkRows([])
              }}
            >
              Bulk Upload
            </Button>
          )}
        </div>
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

      {/* Bulk Upload Dialog */}
      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open)
          if (!open) {
            setBulkError(null)
            setBulkRows([])
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[calc(100vh-1rem)] p-3 hide-scrollbar gap-2">
          <DialogHeader>
            <DialogTitle>Bulk Upload Documents</DialogTitle>
            <DialogDescription className="text-xs">
              Upload multiple documents for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={downloadBulkTemplate}>
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Required: name,type,fileUrl</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-documents">Choose CSV file</Label>
              <Input
                id="bulk-documents"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const rows = parseBulkDocumentsFromCsv(text)
                    setBulkRows(rows)
                    if (rows.length === 0) setBulkError("No valid rows found. Check CSV values.")
                  } catch (err: any) {
                    setBulkError(err?.message || "Failed to parse CSV.")
                  }
                }}
              />
            </div>

            {bulkError && <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{bulkError}</div>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={bulkRows.length === 0} onClick={handleBulkUpload}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

