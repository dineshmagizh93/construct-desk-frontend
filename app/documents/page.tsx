"use client"

import { DocumentList } from "@/components/documents/document-list"
import { useDocuments } from "@/lib/hooks/use-documents"
import { DocumentFormSchema } from "@/lib/validations/document"
import { Document } from "@/types/document"
import { projectsApi } from "@/lib/api/projects"

export default function DocumentsPage() {
  const { createDocument } = useDocuments()

  const handleCreateDocument = async (data: DocumentFormSchema) => {
    try {
      const project = await projectsApi.getById(data.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      await createDocument({
        projectId: data.projectId,
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
    } catch (error) {
      console.error("Error fetching project:", error)
      throw error
    }
  }

  return <DocumentList onCreateDocument={() => {}} />
}

