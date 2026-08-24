import type { UploadedFile } from '@/components/shared/types'

export type DocumentCategory = 'Drawing' | 'Permit' | 'Contract' | 'License' | 'Certificate' | 'Other'

export interface DocumentItem {
  id: string
  name: string
  category: DocumentCategory
  projectId: string
  uploadedBy: string
  uploadedAt: string
  file: UploadedFile[]
}
