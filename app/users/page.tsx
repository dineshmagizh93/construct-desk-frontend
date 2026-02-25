"use client"

import { UserList } from "@/components/users/user-list"
import { UserFormSchema } from "@/lib/validations/user"
import { CreateUserDto } from "@/lib/api/users"
import { useUsers } from "@/lib/hooks/use-users"

export default function UsersPage() {
  const { createUser, loadUsers } = useUsers()

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
      // Re-throw with a more user-friendly message
      const errorMessage = Array.isArray(error?.message) 
        ? error.message.join(', ')
        : error?.message || "Failed to create user. Please check all fields and try again."
      throw new Error(errorMessage)
    }
  }

  return <UserList onCreateUser={handleCreateUser} />
}

