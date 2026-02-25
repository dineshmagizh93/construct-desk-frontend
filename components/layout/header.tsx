"use client"

import * as React from "react"
import { Menu, User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MobileSidebar } from "./mobile-sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"

interface HeaderProps {
  sidebarCollapsed: boolean
}

// Memoize header to prevent re-renders
export const Header = React.memo(function Header({ sidebarCollapsed }: HeaderProps) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = React.useCallback(() => {
    logout()
    router.refresh()
  }, [logout, router])

  return (
    <header
      className={cn(
        "fixed top-0 z-20 flex h-20 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 px-6 lg:px-8 shadow-lg shadow-black/5 transition-all duration-300",
        sidebarCollapsed ? "lg:left-16 right-0" : "lg:left-64 right-0"
      )}
    >
      {/* Mobile Menu Button */}
      <MobileSidebar>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </MobileSidebar>

      {/* Company Name */}
      <div className="flex-1">
        {user?.company?.name ? (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {user.company.name}
          </h1>
        ) : (
          <h1 className="text-xl font-semibold text-foreground">
            Construction CRM
          </h1>
        )}
      </div>

      {/* User Avatar & Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-3 rounded-full hover:bg-accent p-1.5 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName && user?.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                  : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {user && (
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <div className="my-1 h-px bg-border" />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <div className="my-1 h-px bg-border" />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
})

