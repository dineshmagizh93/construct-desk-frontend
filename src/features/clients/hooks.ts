import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '@/lib/permissions'
import { useProjects } from '@/features/projects/api'
import { clientsApi, useClients } from './api'
import type { SelectOption } from '@/components/shared/types'

// The picker's value is the client's real id (UUID) — that's what Project.clientId stores.
export function useClientOptions(): SelectOption[] {
  const { data: clients = [] } = useClients()
  return useMemo(() => clients.map((c) => ({ label: c.name, value: c.id })), [clients])
}

// Keyed by client id so a stored clientId resolves to its name for denormalization on submit.
export function useClientNameMap(): Record<string, string> {
  const { data: clients = [] } = useClients()
  return useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c.name])), [clients])
}

/**
 * Looks up the GSTIN of the client a project belongs to (for tax invoices). Reads the clients list only for
 * people who may view Clients — everyone else simply gets no GSTIN, and the invoice prints one GST line.
 */
export function useClientGstinForProject(): (projectId: string) => string | undefined {
  const canViewClients = usePermission('clients', 'view')
  const { data: projects = [] } = useProjects()
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientsApi.list, enabled: canViewClients })
  return useMemo(() => {
    const gstinByClient = new Map(clients.map((c) => [c.id, c.gstin]))
    const clientByProject = new Map(projects.map((p) => [p.id, p.clientId]))
    return (projectId: string) => {
      const clientId = clientByProject.get(projectId)
      return clientId ? gstinByClient.get(clientId) : undefined
    }
  }, [clients, projects])
}
