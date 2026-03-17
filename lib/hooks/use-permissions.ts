"use client"

import { useAuth } from "./use-auth"
import { UserPermission } from "@/lib/api/users"

export type ModuleId = 
  | "projects"
  | "tasks"
  | "leads"
  | "site-progress"
  | "payments"
  | "expenses"
  | "inventory"
  | "vendors"
  | "labour"
  | "documents"
  | "reports"
  | "users"
  | "settings"

export function usePermissions() {
  const { user, loading } = useAuth()
  
  // Admins have all permissions
  const isAdmin = user?.role === "admin"
  const permissions: UserPermission[] = user?.permissions || []

  const getPermission = (module: string): UserPermission | null => {
    if (loading || !user) {
      return null
    }
    if (isAdmin) {
      // Admins have full access to all modules
      return {
        module,
        canAccess: true,
        canView: true,
        canEdit: true,
        canDelete: true,
      }
    }
    
    return permissions.find(p => p.module === module) || null
  }

  const canAccess = (module: string): boolean => {
    if (isAdmin) return true
    const perm = getPermission(module)
    return perm?.canAccess ?? false
  }

  const canView = (module: string): boolean => {
    if (isAdmin) return true
    const perm = getPermission(module)
    return perm?.canView ?? false
  }

  const canEdit = (module: string): boolean => {
    if (isAdmin) return true
    const perm = getPermission(module)
    return perm?.canEdit ?? false
  }

  const canDelete = (module: string): boolean => {
    if (isAdmin) return true
    const perm = getPermission(module)
    return perm?.canDelete ?? false
  }

  return {
    isAdmin,
    permissions,
    getPermission,
    canAccess,
    canView,
    canEdit,
    canDelete,
    loading,
  }
}
