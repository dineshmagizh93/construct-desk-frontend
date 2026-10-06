export type IncidentType = 'Near Miss' | 'First Aid' | 'Injury' | 'Property Damage' | 'Unsafe Condition' | 'Toolbox Talk'
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type IncidentStatus = 'open' | 'closed'

export interface SafetyIncident {
  id: string
  projectId: string
  date: string
  type: IncidentType
  severity: IncidentSeverity
  description: string
  personInvolved?: string | null
  actionTaken?: string | null
  status: IncidentStatus
  /** Server-owned: Profile id of whoever logged it. */
  reportedById?: string | null
  closedAt?: string | null
}
