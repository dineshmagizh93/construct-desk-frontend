"use client"

import { useAuth } from "./use-auth"

/**
 * Check if current user is super admin
 * Super admin is identified by email matching SUPER_ADMIN_EMAIL or ending with @constructdesk.com
 */
export function useSuperAdmin() {
  const { user } = useAuth()
  
  if (!user?.email) {
    return { isSuperAdmin: false }
  }

  // Check if email matches super admin emails
  const superAdminEmails = [
    'dineshemur@gmail.com',
    'admin@constructdesk.in',
  ]
  
  const isSuperAdmin = 
    superAdminEmails.includes(user.email) ||
    user.email.endsWith('@constructdesk.in')

  return {
    isSuperAdmin,
    email: user.email,
  }
}
