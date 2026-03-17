"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPermission } from "@/lib/api/users"
import { cn } from "@/lib/utils"

// Define all available modules
export const MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Projects" },
  { id: "tasks", label: "Tasks" },
  { id: "leads", label: "Leads & Clients" },
  { id: "site-progress", label: "Site Progress" },
  { id: "payments", label: "Payments" },
  { id: "expenses", label: "Expenses" },
  { id: "inventory", label: "Inventory" },
  { id: "vendors", label: "Vendors" },
  { id: "labour", label: "Labour" },
  { id: "documents", label: "Documents" },
  { id: "reports", label: "Reports" },
  { id: "users", label: "Users" },
  { id: "settings", label: "Settings" },
] as const

interface UserPermissionsManagerProps {
  permissions: UserPermission[]
  onPermissionsChange: (permissions: UserPermission[]) => void
  userRole: "admin" | "user"
  className?: string
}

export function UserPermissionsManager({
  permissions,
  onPermissionsChange,
  userRole,
  className,
}: UserPermissionsManagerProps) {
  // Admins have all permissions by default
  const isAdmin = userRole === "admin"

  // Initialize permissions map
  const getPermissionMap = React.useMemo(() => {
    const map = new Map<string, UserPermission>()
    permissions.forEach(p => {
      map.set(p.module, p)
    })
    return map
  }, [permissions])

  const handlePermissionChange = (
    module: string,
    permissionType: "canAccess" | "canView" | "canEdit" | "canDelete",
    checked: boolean
  ) => {
    const existing = getPermissionMap.get(module) || {
      module,
      canAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
    }

    const updated: UserPermission = { ...existing }

    if (permissionType === "canAccess") {
      updated.canAccess = checked
      // If disabling access, disable all other permissions
      if (!checked) {
        updated.canView = false
        updated.canEdit = false
        updated.canDelete = false
      }
    } else if (permissionType === "canView") {
      updated.canView = checked
      // If disabling view, disable edit and delete
      if (!checked) {
        updated.canEdit = false
        updated.canDelete = false
      }
      // If enabling view, ensure canAccess is also enabled
      if (checked) {
        updated.canAccess = true
      }
    } else if (permissionType === "canEdit") {
      updated.canEdit = checked
      // If enabling edit, ensure canAccess and canView are enabled
      if (checked) {
        updated.canAccess = true
        updated.canView = true
      }
      // If disabling edit, disable delete
      if (!checked) {
        updated.canDelete = false
      }
    } else if (permissionType === "canDelete") {
      updated.canDelete = checked
      // If enabling delete, ensure all others are enabled
      if (checked) {
        updated.canAccess = true
        updated.canView = true
        updated.canEdit = true
      }
    }

    // Update permissions array
    const newPermissions = [...permissions.filter(p => p.module !== module), updated]
    onPermissionsChange(newPermissions)
  }

  const getPermission = (module: string): UserPermission => {
    return getPermissionMap.get(module) || {
      module,
      canAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
    }
  }

  if (isAdmin) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm text-muted-foreground">
          Admin users have full access to all modules and actions.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <table className="w-full border-collapse h-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-2 py-1 font-semibold text-[10px] text-foreground">MODULE</th>
            <th className="text-center px-1 py-1 font-semibold text-[10px] text-foreground w-14">ACCESS</th>
            <th className="text-center px-1 py-1 font-semibold text-[10px] text-foreground w-14">VIEW</th>
            <th className="text-center px-1 py-1 font-semibold text-[10px] text-foreground w-14">EDIT</th>
            <th className="text-center px-1 py-1 font-semibold text-[10px] text-foreground w-14">DELETE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {MODULES.map((module, index) => {
            const perm = getPermission(module.id)
            return (
              <tr 
                key={module.id} 
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? "bg-background hover:bg-muted/30" : "bg-muted/10 hover:bg-muted/40"
                )}
              >
                <td className="px-2 py-0.5 font-medium text-[11px] text-foreground leading-tight">{module.label}</td>
                <td className="px-1 py-0.5 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={`${module.id}-access`}
                      checked={perm.canAccess}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module.id, "canAccess", checked === true)
                      }
                      className="h-3.5 w-3.5"
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={`${module.id}-view`}
                      checked={perm.canView}
                      disabled={!perm.canAccess}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module.id, "canView", checked === true)
                      }
                      className="h-3.5 w-3.5"
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={`${module.id}-edit`}
                      checked={perm.canEdit}
                      disabled={!perm.canView}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module.id, "canEdit", checked === true)
                      }
                      className="h-3.5 w-3.5"
                    />
                  </div>
                </td>
                <td className="px-1 py-0.5 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id={`${module.id}-delete`}
                      checked={perm.canDelete}
                      disabled={!perm.canEdit}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module.id, "canDelete", checked === true)
                      }
                      className="h-3.5 w-3.5"
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
