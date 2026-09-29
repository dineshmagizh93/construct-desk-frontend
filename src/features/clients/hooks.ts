import { useMemo } from 'react'
import { useClients } from './api'
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
