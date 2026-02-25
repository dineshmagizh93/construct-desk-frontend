export type UserRole = "admin" | "user"

export interface User {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  role: UserRole
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  role: UserRole
  phone?: string
}


