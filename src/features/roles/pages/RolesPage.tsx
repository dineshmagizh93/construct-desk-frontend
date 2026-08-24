import { useState } from 'react'
import { Shield, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Column } from '@/components/shared/types'
import { emptyPermissions, type PermissionMap } from '@/lib/modules'
import { usePermission } from '@/lib/permissions'
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from '../api'
import { PermissionMatrix } from '../components/PermissionMatrix'
import type { CompanyRole } from '../types'

const roleColumns: Column<CompanyRole>[] = [
  {
    key: 'name',
    header: 'Role',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Shield className="size-4 shrink-0 text-primary" />
        <span className="font-medium">{row.name}</span>
        {row.isSystem && <Badge variant="secondary">System</Badge>}
      </div>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    render: (row) => <span className="text-muted-foreground">{row.description || '—'}</span>,
  },
  {
    key: 'userCount',
    header: 'Users',
    render: (row) => (
      <span>
        {row.userCount} user{row.userCount === 1 ? '' : 's'}
      </span>
    ),
  },
]

export function RolesPage() {
  const { data: roles = [], isLoading } = useRoles()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()

  const canCreate = usePermission('roles', 'create')
  const canEdit = usePermission('roles', 'edit')
  const canDelete = usePermission('roles', 'delete')

  const [creating, setCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPermissions, setCreatePermissions] = useState<PermissionMap>(emptyPermissions())
  const [editing, setEditing] = useState<CompanyRole | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<PermissionMap>(emptyPermissions())
  const [deleteTarget, setDeleteTarget] = useState<CompanyRole | null>(null)

  const openEdit = (role: CompanyRole) => {
    setCreating(false)
    setEditing(role)
    setDraftPermissions(role.permissions)
  }

  const startCreate = () => {
    setEditing(null)
    setCreateName('')
    setCreateDescription('')
    setCreatePermissions(emptyPermissions())
    setCreating(true)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <PageHeader
          title="Roles & Permissions"
          description="Define what each role can view, create, edit, and delete across every module."
          actions={
            canCreate ? (
              <Button onClick={startCreate}>
                <Plus /> Add Role
              </Button>
            ) : null
          }
        />
      </div>

      {creating && (
        <div className="mb-4 shrink-0 space-y-4 rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">New role</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Estimator"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Optional"
                rows={2}
              />
            </div>
          </div>
          <PermissionMatrix value={createPermissions} onChange={setCreatePermissions} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              disabled={!createName.trim() || createMutation.isPending}
              onClick={async () => {
                await createMutation.mutateAsync({
                  name: createName.trim(),
                  description: createDescription.trim() || undefined,
                  permissions: createPermissions,
                })
                setCreating(false)
              }}
            >
              Create role
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <div className="mb-4 shrink-0 space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{editing.name}</h2>
              <p className="text-sm text-muted-foreground">
                {editing.isSystem ? 'System role — full access (read-only)' : 'Configure module permissions'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Close
              </Button>
              {canEdit && !editing.isSystem && (
                <Button
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation
                      .mutateAsync({ id: editing.id, values: { permissions: draftPermissions } })
                      .then(() => setEditing(null))
                  }
                >
                  Save permissions
                </Button>
              )}
            </div>
          </div>
          <PermissionMatrix
            value={draftPermissions}
            onChange={setDraftPermissions}
            readOnly={editing.isSystem || !canEdit}
          />
        </div>
      )}

      <div className="min-h-0 flex-1">
        <DataTable
          data={roles}
          columns={roleColumns}
          keyField="id"
          loading={isLoading}
          emptyTitle="No roles yet"
          emptyDescription="Add a role to define permissions for your team."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              {canEdit && (
                <Button variant="ghost" size="icon-sm" title="Permissions" onClick={() => openEdit(row)}>
                  <Pencil className="size-3.5" />
                </Button>
              )}
              {canDelete && !row.isSystem && row.userCount === 0 && (
                <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete role"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) return deleteMutation.mutateAsync(deleteTarget.id)
        }}
      />
    </div>
  )
}
