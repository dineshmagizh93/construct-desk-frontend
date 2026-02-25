export type LabourCategory = "Mason" | "Helper" | "Carpenter" | "Electrician" | "Plumber" | "Painter" | "Other"

export interface Labour {
  id: string
  projectId: string
  projectName: string
  category: LabourCategory
  headcount: number
  costPerDay: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LabourFormData {
  projectId: string
  category: LabourCategory
  headcount: number
  costPerDay: number
  date: string
  notes?: string
}

