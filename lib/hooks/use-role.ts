"use client"

import { useAuth } from "./use-auth"

export function useRole() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const isUser = user?.role === "user"
  
  return {
    isAdmin,
    isUser,
    role: user?.role,
  }
}


