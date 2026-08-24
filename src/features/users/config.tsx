import { Badge } from '@/components/ui/badge'
import type { Column, FieldConfig } from '@/components/shared/types'
import type { CompanyUser } from './types'
import { formatDate } from '@/lib/utils'

export const userColumns: Column<CompanyUser>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => `${row.firstName} ${row.lastName}`.trim(),
  },
  { key: 'email', header: 'Email' },
  {
    key: 'companyRoleName',
    header: 'Role',
    render: (row) => (
      <Badge variant={row.isSystemRole ? 'default' : 'outline'}>{row.companyRoleName ?? '—'}</Badge>
    ),
  },
  {
    key: 'disabled',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.disabled ? 'destructive' : 'success'}>{row.disabled ? 'Inactive' : 'Active'}</Badge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Joined',
    render: (row) => formatDate(row.createdAt),
  },
]

export function buildUserFields(roleOptions: { id: string; name: string }[], editing: boolean): FieldConfig[] {
  const base: FieldConfig[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, colSpan: 1 },
    { name: 'lastName', label: 'Last Name', type: 'text', colSpan: 1 },
    { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 2 },
  ]
  if (!editing) {
    base.push({ name: 'password', label: 'Temporary Password', type: 'text', required: true, colSpan: 2 })
  }
  base.push({
    name: 'companyRoleId',
    label: 'Role',
    type: 'select',
    required: true,
    colSpan: 2,
    options: roleOptions.map((r) => ({ label: r.name, value: r.id })),
  })
  if (editing) {
    base.push({ name: 'disabled', label: 'Inactive', type: 'checkbox', colSpan: 2 })
  }
  return base
}
