import { useAuthStore } from '@/features/auth/store'
import { canPerform, type PermissionAction } from './modules'

export function usePermission(module: string, action: PermissionAction) {
  const permissions = useAuthStore((s) => s.user?.permissions)
  return canPerform(permissions, module, action)
}

export function useCanView(module: string) {
  return usePermission(module, 'view')
}

export { canPerform }
