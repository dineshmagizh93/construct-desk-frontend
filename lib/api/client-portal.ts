import { apiClient } from "./client"

export interface ClientPortalToken {
  id: string
  projectId: string
  token: string
  label?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface ClientPortalView {
  project: any
  tasks: any[]
  payments: any[]
  siteProgress: any[]
  documents: any[]
}

export const clientPortalApi = {
  generateToken: (projectId: string, label?: string, expiresInDays?: number) =>
    apiClient.post<ClientPortalToken>("/client-portal/tokens", { projectId, label, expiresInDays }),

  listTokens: (projectId: string) =>
    apiClient.get<ClientPortalToken[]>(`/client-portal/tokens/${projectId}`),

  revokeToken: (id: string) =>
    apiClient.patch(`/client-portal/tokens/${id}/revoke`, {}),

  getProjectView: (token: string) =>
    apiClient.get<ClientPortalView>(`/client-portal/view/${token}`),
}
