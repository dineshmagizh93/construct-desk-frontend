export interface CompanyUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  disabled: boolean
  createdAt: string
  companyRoleId: string | null
  companyRoleName: string | null
  isSystemRole: boolean
}

export interface RoleOption {
  id: string
  name: string
  isSystem: boolean
}
