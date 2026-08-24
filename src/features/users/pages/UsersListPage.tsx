import { EntityListPage } from '@/components/shared/EntityListPage'
import { useCreateUser, useDeleteUser, useRoleOptions, useUpdateUser, useUsers } from '../api'
import { buildUserFields, userColumns } from '../config'
import type { CompanyUser } from '../types'

export function UsersListPage() {
  const { data = [], isLoading } = useUsers()
  const { data: roleOptions = [] } = useRoleOptions()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  return (
    <EntityListPage<CompanyUser>
      title="Users"
      description="Invite teammates and assign org roles."
      data={data}
      columns={userColumns}
      fields={buildUserFields(roleOptions, false)}
      keyField="id"
      isLoading={isLoading}
      searchKeys={['firstName', 'lastName', 'email', 'companyRoleName']}
      entityLabel="user"
      moduleKey="users"
      getFields={(row) => buildUserFields(roleOptions, !!row)}
      getFormDefaults={(row) => ({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        companyRoleId: row.companyRoleId ?? '',
        disabled: row.disabled,
      })}
      onCreate={(values) => createMutation.mutateAsync(values)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  )
}
