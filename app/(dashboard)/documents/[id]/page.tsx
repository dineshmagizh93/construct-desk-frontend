"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, File, Calendar, FileText, Download, ExternalLink, User, History, Plus, Upload } from "lucide-react"
import { documentsApi } from "@/lib/api/documents"
import { Document } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDateDMY } from "@/lib/utils/date"
import { apiClient } from "@/lib/api/client"

interface DocumentVersion {
  id: string
  versionNumber: number
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedBy: string
  notes?: string
  createdAt: string
}

export default function DocumentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = React.useState<Document | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [versions, setVersions] = React.useState<DocumentVersion[]>([])
  const [versionsLoading, setVersionsLoading] = React.useState(false)
  const [addVersionOpen, setAddVersionOpen] = React.useState(false)
  const [newVersionNotes, setNewVersionNotes] = React.useState("")
  const [newVersionUrl, setNewVersionUrl] = React.useState("")
  const [savingVersion, setSavingVersion] = React.useState(false)

  React.useEffect(() => {
    const loadDocument = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await documentsApi.getById(params.id)
          setDocument(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadDocument()
  }, [params.id])

  React.useEffect(() => {
    if (!params.id || typeof params.id !== "string") return
    setVersionsLoading(true)
    apiClient
      .get<DocumentVersion[]>(`/documents/${params.id}/versions`)
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setVersionsLoading(false))
  }, [params.id])

  const handleAddVersion = async () => {
    if (!newVersionUrl.trim()) return
    setSavingVersion(true)
    try {
      await apiClient.post(`/documents/${params.id}/versions`, {
        fileUrl: newVersionUrl,
        notes: newVersionNotes,
      })
      const updated = await apiClient.get<DocumentVersion[]>(`/documents/${params.id}/versions`)
      setVersions(updated)
      setAddVersionOpen(false)
      setNewVersionUrl("")
      setNewVersionNotes("")
    } catch {
    } finally {
      setSavingVersion(false)
    }
  }

  const handleDownload = () => {
    if (typeof window !== 'undefined' && document) {
      window.open(document.fileUrl, "_blank")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading document...</div>
  }

  if (!document) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/documents")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Document not found</p>
        </div>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getTypeBadgeVariant = (type: Document["type"]) => {
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
      case "Receipt":
        return "success"
      case "Permit":
        return "secondary"
      case "Other":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/documents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{document.name}</h1>
            <p className="text-muted-foreground text-xs mt-0">
              <Link href={`/projects/${document.projectId}`} className="hover:underline">
                {document.projectName}
              </Link>
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/documents/${document.id}/edit`)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Basic document details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <Badge variant={getTypeBadgeVariant(document.type)}>{document.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">File Name</span>
              <span className="text-sm">{document.fileName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">File Size</span>
              <span className="text-sm text-muted-foreground">{formatFileSize(document.fileSize)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Uploaded</span>
              <span className="text-sm text-muted-foreground">
                {formatDateDMY(document.uploadedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Uploaded By</span>
              <span className="text-sm text-muted-foreground">{document.uploadedBy}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Related project details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">Project</p>
              <Link
                href={`/projects/${document.projectId}`}
                className="text-sm text-primary hover:underline"
              >
                {document.projectName}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Type</p>
              <Badge variant={getTypeBadgeVariant(document.type)}>{document.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(document.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(document.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {document.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription className="mt-1">Upload new versions to track document changes over time</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddVersionOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Version
          </Button>
        </CardHeader>
        <CardContent>
          {addVersionOpen && (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <p className="text-[13px] font-medium text-slate-700">Add New Version</p>
              <div className="space-y-1.5">
                <label className="text-[12px] text-slate-500">File URL or Path</label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-[13px]"
                  placeholder="https://... or /path/to/file"
                  value={newVersionUrl}
                  onChange={(e) => setNewVersionUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] text-slate-500">Change Notes</label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-[13px]"
                  placeholder="What changed in this version?"
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddVersion} disabled={savingVersion}>
                  {savingVersion ? "Saving..." : "Save Version"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAddVersionOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {versionsLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : versions.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-slate-400">No versions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <div key={v.id} className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-[11px] font-semibold text-blue-700">
                      v{v.versionNumber}
                    </span>
                    <div>
                      <p className="text-[12px] font-medium text-slate-700">{v.fileName || `Version ${v.versionNumber}`}</p>
                      {v.notes && <p className="text-[11px] text-slate-500">{v.notes}</p>}
                      <p className="text-[11px] text-slate-400">{formatDateDMY(v.createdAt)} · by {v.uploadedBy}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => window.open(v.fileUrl, "_blank")}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Document
        </Button>
        <Button variant="outline" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    </div>
  )
}
