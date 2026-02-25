export interface SiteProgress {
  id: string
  projectId: string
  projectName: string
  date: string
  notes?: string
  photos: string[] // Mock photo URLs
  createdAt: string
  updatedAt: string
}

export interface SiteProgressFormData {
  projectId: string
  date: string
  notes?: string
  photos: string[]
}

