export type DocumentType = "Agreement" | "Drawing" | "Bill" | "Invoice" | "Approval" | "Other"

export interface Document {
  id: string
  projectId: string
  projectName: string
  name: string
  type: DocumentType
  fileUrl: string
  fileName: string
  fileSize: number
  notes?: string
  uploadedBy: string
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

export interface DocumentFormData {
  projectId: string
  name: string
  type: DocumentType
  fileUrl: string
  fileName?: string
  fileSize?: number
  notes?: string
}

