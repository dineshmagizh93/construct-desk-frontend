"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
      <CardContent className="pt-0 pb-6 px-6">
        <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border/50 bg-gradient-to-b from-muted/50 to-transparent text-center">
          <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
            <AvatarFallback className="text-2xl font-semibold">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h4 className="text-xl font-semibold tracking-tight">{getFullName()}</h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{user?.email || "No email"}</span>
              <span className="hidden sm:inline">•</span>
              <Badge variant="secondary" className="capitalize font-medium">{getRoleDisplay()}</Badge>
            </div>
          </div>
          <Button variant="default" className="mt-2 w-full sm:w-auto shadow-sm" onClick={handleManageProfile}>
            Manage Profile Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

