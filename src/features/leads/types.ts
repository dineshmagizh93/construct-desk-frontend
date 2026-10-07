export type LeadStatus = 'new' | 'contacted' | 'site_visit' | 'quoted' | 'won' | 'lost'
export type LeadSource = 'Website' | 'Referral' | 'Walk-in' | 'Social Media' | 'Advertisement'

export interface LeadFollowUp {
  id: string
  note: string
  date: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  projectType: string
  estimatedBudget: number
  source: LeadSource
  status: LeadStatus
  assignedTo: string
  location: string
  createdAt: string
  followUps: LeadFollowUp[]
  /** Set by the server when the lead is converted: the client and project it became. */
  convertedClientId?: string | null
  convertedProjectId?: string | null
}
