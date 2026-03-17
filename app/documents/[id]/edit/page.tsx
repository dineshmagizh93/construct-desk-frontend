"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { documentsApi } from "@/lib/api/documents"
import { Document } from "@/types/document"
import { DocumentFormSchema } from "@/lib/validations/document"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentForm } from "@/components/documents/document-form"
import { useDocuments } from "@/lib/hooks/use-documents"
import { projectsApi } from "@/lib/api/projects"

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { updateDocument } = useDocuments()
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
        } finally {
          setLoading(false)
        }
      }
    }
    loadDocument()
  }, [params.id])

  const handleSubmit = async (data: DocumentFormSchema) => {
    if (!document) return

    const project = await projectsApi.getById(data.projectId)
    if (!project) return

    await updateDocument(document.id, {
      projectId: data.projectId,
      name: data.name,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName || data.fileUrl.split("/").pop() || "document",
      fileSize: data.fileSize || document.fileSize,
      notes: data.notes || undefined,
    })

    router.push(`/documents/${document.id}`)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/documents")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Document</h1>
          <p className="text-muted-foreground text-xs mt-0">Update document information</p>
        </div>
      </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            document={document}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/documents")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
