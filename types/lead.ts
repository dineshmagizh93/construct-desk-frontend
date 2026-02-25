export type LeadType = "LEAD" | "CLIENT"

export type LeadSource = "Broker" | "Portal" | "Referral" | "Direct"

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost"

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  type: LeadType
  source: LeadSource
  status: LeadStatus
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LeadFormData {
  name: string
  phone: string
  email?: string
  source: LeadSource
  status: LeadStatus
  assignedTo?: string
  notes?: string
}

