"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPermission } from "@/lib/api/users"
import { cn } from "@/lib/utils"

// Define all available modules
export const MODULES = [
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

export type ModuleId = typeof MODULES[number]["id"]

interface UserPermissionsProps {
  permissions: UserPermission[]
  onChange: (permissions: UserPermission[]) => void
  role: "admin" | "user"
  className?: string
}

export function UserPermissions({ permissions, onChange, role, className }: UserPermissionsProps) {
  // Admins have all permissions by default
  const isAdmin = role === "admin"

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
    action: "canView" | "canEdit" | "canDelete",
    checked: boolean
  ) => {
    const current = getPermissionMap.get(module) || {
      module,
      canAccess: false,
      canView: false,
      canEdit: false,
      canDelete: false,
    }

    const updated: UserPermission = {
      ...current,
      [action]: checked,
      // If canView is unchecked, uncheck edit and delete too
      canView: action === "canView" ? checked : current.canView,
      canEdit: action === "canEdit" ? (checked && current.canView) : current.canEdit,
      canDelete: action === "canDelete" ? (checked && current.canView) : current.canDelete,
      // Keep module visibility aligned with view permission
      canAccess: action === "canView" ? checked : current.canView,
    }

    // If canView is unchecked, uncheck edit and delete
    if (action === "canView" && !checked) {
      updated.canEdit = false
      updated.canDelete = false
    }

    // If canEdit is unchecked, uncheck delete too
    if (action === "canEdit" && !checked) {
      updated.canDelete = false
    }

    const newPermissions = [...permissions.filter(p => p.module !== module), updated]
    onChange(newPermissions)
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
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {MODULES.map((module) => {
          const perm = getPermission(module.id)
          return (
            <div key={module.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{module.label}</Label>
              </div>
              <div className="flex flex-wrap gap-4 pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${module.id}-view`}
                    checked={perm.canView}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(module.id, "canView", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${module.id}-view`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    View
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${module.id}-edit`}
                    checked={perm.canEdit}
                    disabled={!perm.canView}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(module.id, "canEdit", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${module.id}-edit`}
                    className={cn(
                      "text-sm font-normal",
                      !perm.canView && "text-muted-foreground cursor-not-allowed",
                      perm.canView && "cursor-pointer"
                    )}
                  >
                    Edit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${module.id}-delete`}
                    checked={perm.canDelete}
                    disabled={!perm.canView}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(module.id, "canDelete", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${module.id}-delete`}
                    className={cn(
                      "text-sm font-normal",
                      !perm.canView && "text-muted-foreground cursor-not-allowed",
                      perm.canView && "cursor-pointer"
                    )}
                  >
                    Delete
                  </Label>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
