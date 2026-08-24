import type { PermissionMap } from '@/lib/modules'

export interface CompanyRole {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  createdAt: string
  userCount: number
  permissions: PermissionMap
}
