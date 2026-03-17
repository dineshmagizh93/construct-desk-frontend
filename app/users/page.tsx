"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserList, CreateUserButton } from "@/components/users/user-list"
import { UserPermissionsList } from "@/components/users/user-permissions-list"
import { UserFormSchema } from "@/lib/validations/user"
import { CreateUserDto } from "@/lib/api/users"
import { useUsers } from "@/lib/hooks/use-users"
import { usePlanLimits } from "@/lib/hooks/use-plan-limits"
import { useAuth } from "@/lib/hooks/use-auth"

export default function UsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") || "users"
  const { createUser, loadUsers } = useUsers()
  const { handleError, UpgradeModalComponent } = usePlanLimits()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "admin"

  const handleCreateUser = async (data: UserFormSchema) => {
    // No password required - backend will set default password "welcome@123"
    const userData: CreateUserDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      phone: data.phone,
    }
    
    try {
      await createUser(userData)
      // Force refresh the user list immediately to show new user
      await loadUsers(false, true)
    } catch (error: any) {
      // Handle plan limit errors
      if (handleError(error)) {
        return // Upgrade modal will be shown
      }
      // Re-throw with a more user-friendly message
      const errorMessage = Array.isArray(error?.message) 
        ? error.message.join(', ')
        : error?.message || "Failed to create user. Please check all fields and try again."
      throw new Error(errorMessage)
    }
  }

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "users") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }
    router.push(`/users?${params.toString()}`)
  }

  return (
    <>
      <UpgradeModalComponent />
      <div className="flex flex-col h-full min-h-0">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex-shrink-0 pt-4 sm:pt-6 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Users
              </h1>
              <p className="text-muted-foreground mt-0 text-xs">Manage your company users and permissions</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <TabsList className="h-9">
              <TabsTrigger value="users" className="text-[13px]">Users</TabsTrigger>
              <TabsTrigger value="permissions" className="text-[13px]">Permissions</TabsTrigger>
            </TabsList>
            {isAdmin && activeTab === "users" && <CreateUserButton onCreate={handleCreateUser} />}
          </div>
        </div>
        
        <TabsContent value="users" className="flex-1 min-h-0 mt-0">
          <UserList />
        </TabsContent>
        
        <TabsContent value="permissions" className="flex-1 min-h-0 mt-0">
          <UserPermissionsList />
        </TabsContent>
      </Tabs>
    </div>
    </>
  )
}

