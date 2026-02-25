"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, File, Calendar, FileText, Download, ExternalLink, User } from "lucide-react"
import { documentsApi } from "@/lib/api/documents"
import { Document } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DocumentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = React.useState<Document | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadDocument = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await documentsApi.getById(params.id)
          setDocument(data)
        } catch (error) {
          console.error("Failed to load document:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadDocument()
  }, [params.id])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/documents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
            <p className="text-muted-foreground">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Basic document details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {new Date(document.uploadedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
          <CardContent className="space-y-4">
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
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {new Date(document.updatedAt).toLocaleDateString()}
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
