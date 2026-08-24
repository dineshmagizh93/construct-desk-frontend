import type { Role } from '@/types'

export interface DemoAccount {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}

export interface LoginPayload {
  email: string
  password: string
}
