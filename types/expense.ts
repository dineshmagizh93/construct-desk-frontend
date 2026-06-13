export type ExpenseCategory = "Material" | "Labour" | "Transport" | "Equipment" | "Other"

export interface Expense {
  id: string
  projectId: string
  projectName: string
  category: ExpenseCategory
  amount: number
  date: string
  paidTo: string
  notes?: string
  attachment?: string // Mock attachment URL
  approvalStatus?: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseFormData {
  projectId: string
  category: ExpenseCategory
  amount: number
  date: string
  paidTo: string
  notes?: string
  attachment?: string
}

