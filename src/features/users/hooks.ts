import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { SelectOption } from '@/components/shared/types'

interface AssignableUser {
  id: string
  firstName: string
  lastName: string
}

// Deliberately not gated by the 'users' module permission on the backend — any active company
// member can see everyone's name for assignment purposes (see backend/src/modules/users/routes.ts).
export function useAssignableUsers() {
  return useQuery({ queryKey: ['users', 'assignable'], queryFn: () => http<AssignableUser[]>('/users/assignable') })
}

// The picker's value is the user's real Profile id — that's what Task.assignee/Lead.assignedTo
// store. The human-friendly name is shown in the label only.
export function useUserOptions(): SelectOption[] {
  const { data: users = [] } = useAssignableUsers()
  return useMemo(() => users.map((u) => ({ label: `${u.firstName} ${u.lastName}`.trim(), value: u.id })), [users])
}

// Keyed by user id so a stored assignee resolves to a display name in list/detail views.
export function useUserNameMap(): Record<string, string> {
  const { data: users = [] } = useAssignableUsers()
  return useMemo(() => Object.fromEntries(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])), [users])
}
