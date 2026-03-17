"use client"

import * as React from "react"
import Link from "next/link"
import { Shield, Search, User } from "lucide-react"
import { useUsers } from "@/lib/hooks/use-users"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function UserPermissionsList() {
  const { users, loading } = useUsers()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "admin"
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter users (only show non-admin users for permissions)
  const filteredUsers = React.useMemo(() => {
    if (!users) return []
    let filtered = users.filter(u => u.role !== "admin")
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [users, searchQuery])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Only admins can manage permissions</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* Search */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users available for permissions management"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <span className="truncate block" title={user.name || `${user.firstName} ${user.lastName}`.trim()}>
                        {user.name || `${user.firstName} ${user.lastName}`.trim()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="truncate block" title={user.email}>
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/users/${user.id}/permissions`}>
                          <Shield className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions Management
          </CardTitle>
          <CardDescription>
            Manage module access and permissions for each user. Click "Manage Permissions" to configure what modules and actions each user can access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Admin users have full access to all modules and cannot have permissions modified</p>
            <p>• For regular users, you can enable/disable modules and configure View, Edit, and Delete permissions</p>
            <p>• Changes take effect immediately after saving</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
