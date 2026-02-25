"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Eye, Edit, Trash2, Search, Plus, X, UserPlus } from "lucide-react"
import { User as UserIcon } from "lucide-react"
import toast from "react-hot-toast"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { UserForm } from "./user-form"
import { useUsers } from "@/lib/hooks/use-users"
import { UserFormSchema } from "@/lib/validations/user"
import { CreateUserDto, UpdateUserDto } from "@/lib/api/users"
import { useAuth } from "@/lib/hooks/use-auth"

interface UserListProps {
  onCreateUser?: (data: UserFormSchema) => Promise<any>
}

export function UserList({ onCreateUser }: UserListProps) {
  const { users, loading, error, createUser, updateUser, deleteUser, loadUsers } = useUsers()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "admin"
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"all" | "admin" | "user">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null)

  const handleCreateUser = async (data: UserFormSchema) => {
    try {
      if (onCreateUser) {
        await onCreateUser(data)
      } else {
        const userData: CreateUserDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          phone: data.phone,
        }
        await createUser(userData)
        // Force refresh the user list immediately to show new user
        await loadUsers(false, true)
      }
      setCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating user:", error)
      // Error is handled by the hook
    }
  }

  const handleEditUser = async (data: UserFormSchema) => {
    if (!userToEdit) return

    const updateData: UpdateUserDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      phone: data.phone,
    }

    // Only include password if provided
    if ('password' in data && data.password && typeof data.password === 'string' && data.password.trim()) {
      updateData.password = data.password
    }

    await updateUser(userToEdit.id, updateData)
    setEditDialogOpen(false)
    setUserToEdit(null)
    // Refresh the list to show updated role
    await loadUsers(false, true)
  }

  const handleRoleChange = async (user: User, newRole: "admin" | "user") => {
    try {
      const updateData: UpdateUserDto = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: newRole,
      }
      
      // Add phone if it exists
      if ('phone' in user && user.phone) {
        updateData.phone = user.phone as string
      }
      await updateUser(user.id, updateData)
      // Refresh the list to show updated role
      await loadUsers(false, true)
    } catch (error) {
      console.error("Error changing role:", error)
      throw error // Re-throw to show error message
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser(userToDelete.id)
      await loadUsers(false, true) // Force refresh
      toast.success("User deleted successfully")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      const errorMessage = error?.message || "Failed to delete user. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleEdit = (user: User) => {
    setUserToEdit(user)
    setEditDialogOpen(true)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Filter users
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage your company users</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <p className="text-destructive font-medium mb-2">Error loading users</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => loadUsers()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-muted-foreground mt-1.5">Manage your company users</p>
        </div>
        {isAdmin && <CreateUserButton onCreate={handleCreateUser} />}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
          className="w-[180px]"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </Select>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-md border overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-table-scroll-container>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || `${user.firstName} ${user.lastName}`.trim()}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="relative" style={{ zIndex: 'auto' }}>
                    <UserActionsMenu 
                      user={user} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete}
                      onRoleChange={handleRoleChange}
                      isAdmin={isAdmin}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
        
        {/* Pagination - Always at bottom */}
        <div className="flex-shrink-0 border-t bg-card">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Add a new user to your company</DialogDescription>
          </DialogHeader>
          <UserForm onSubmit={handleCreateUser} onCancel={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) setUserToEdit(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <UserForm
              user={userToEdit}
              onSubmit={handleEditUser}
              onCancel={() => {
                setEditDialogOpen(false)
                setUserToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{userToDelete?.name || userToDelete?.email}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive" 
              onClick={(e) => {
                e.stopPropagation()
                confirmDelete()
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserActionsMenu({
  user,
  onEdit,
  onDelete,
  onRoleChange,
  isAdmin,
}: {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onRoleChange: (user: User, newRole: "admin" | "user") => void
  isAdmin: boolean
}) {
  if (!isAdmin) {
    return null // Users can't see action menu
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onRoleChange(user, user.role === "admin" ? "user" : "admin")}
        >
          {user.role === "admin" ? (
            <>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Change to User</span>
            </>
          ) : (
            <>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Change to Admin</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateUserButton({ onCreate }: { onCreate: (data: UserFormSchema) => Promise<any> }) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: UserFormSchema) => {
    try {
      setError(null)
      await onCreate(data)
      setOpen(false)
    } catch (error: any) {
      console.error("Error creating user:", error)
      const errorMessage = Array.isArray(error?.message) 
        ? error.message.join(', ')
        : error?.message || "Failed to create user. Please check all fields and try again."
      setError(errorMessage)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add User
      </Button>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) setError(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Add a new user to your company</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <UserForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}


