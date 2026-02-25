"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/use-auth"

export function UserProfileSection() {
  const { user } = useAuth()
  const router = useRouter()

  const handleManageProfile = () => {
    router.push("/profile")
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email || "User"
  }

  const getRoleDisplay = () => {
    if (user?.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1)
    }
    return "User"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>Manage your personal account settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium">{getFullName()}</h4>
            <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
            <p className="text-sm text-muted-foreground">{getRoleDisplay()}</p>
          </div>
          <Button variant="outline" onClick={handleManageProfile}>
            Manage Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

