"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPermissionsManager } from "@/components/users/user-permissions-manager"
import { useUsers } from "@/lib/hooks/use-users"
import { UserPermission } from "@/lib/api/users"
import toast from "react-hot-toast"

export default function UserPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { loadUsers } = useUsers()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [permissions, setPermissions] = React.useState<UserPermission[]>([])

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        // Fetch user directly instead of loading all users
        const { usersApi } = await import("@/lib/api/users")
        const userData = await usersApi.getById(userId)
        setUser(userData)
        setPermissions(userData.permissions || [])
      } catch (error: any) {
        toast.error(error.message || "Failed to load user")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]) // Only depend on userId to prevent infinite loops

  const handleSave = async () => {
    try {
      setSaving(true)
      const { usersApi } = await import("@/lib/api/users")
      await usersApi.updatePermissions(userId, permissions)
      toast.success("User permissions updated successfully")
      router.push("/users")
    } catch (error: any) {
      toast.error(error.message || "Failed to update permissions")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading user permissions...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  // Don't allow editing permissions for admin users
  if (user.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pt-4 sm:pt-6 pb-4 border-b border-border/40">
          <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User Permissions
            </h1>
            <p className="text-muted-foreground mt-0 text-xs">
              Manage module access and permissions for {user.firstName} {user.lastName}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin User</CardTitle>
            <CardDescription>
              Admin users have full access to all modules and actions. Permissions cannot be modified.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 pt-4 sm:pt-6 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              User Permissions
            </h1>
            <p className="text-muted-foreground mt-0 text-[10px] leading-tight">
              Manage module access and permissions for {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
        <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSave} disabled={saving}>
          <Save className="mr-1.5 h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Permissions Manager */}
      <div className="flex-1 min-h-0 flex flex-col pt-2">
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
          <div className="flex-shrink-0 px-2.5 py-1.5 border-b bg-muted/30">
            <div className="flex items-center gap-1 mb-0">
              <Shield className="h-3 w-3" />
              <h2 className="text-xs font-semibold">Module Permissions</h2>
            </div>
            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
              Configure module access and permissions. Access must be enabled before View, Edit, or Delete permissions can be set.
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <UserPermissionsManager
              permissions={permissions}
              onPermissionsChange={setPermissions}
              userRole={user.role}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
