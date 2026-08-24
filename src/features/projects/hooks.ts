import { useMemo } from 'react'
import { useProjects } from './api'
import type { SelectOption } from '@/components/shared/types'

// The picker's value is the project's real id (UUID) — that's what the backend stores as the
// projectId foreign key. The human-friendly code is shown in the label only.
export function useProjectOptions(): SelectOption[] {
  const { data: projects = [] } = useProjects()
  return useMemo(
    () => projects.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })),
    [projects],
  )
}

// Keyed by project id (UUID) so a stored projectId resolves to its name in list columns.
export function useProjectNameMap(): Record<string, string> {
  const { data: projects = [] } = useProjects()
  return useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects])
}

export function useProjectCodes(): string[] {
  const { data: projects = [] } = useProjects()
  return useMemo(() => projects.map((p) => p.code), [projects])
}
