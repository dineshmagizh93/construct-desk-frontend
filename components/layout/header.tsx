"use client"

import * as React from "react"
import { Menu, User, Settings, LogOut, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
        "fixed top-0 z-20 flex h-12 sm:h-14 items-center gap-2 sm:gap-3 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4 lg:px-6 shadow-sm transition-all duration-300",
        "left-0 right-0", // Full width on mobile
        sidebarCollapsed ? "lg:left-14" : "lg:left-[200px]"
      )}
    >
      {/* Mobile Menu Button */}
      <MobileSidebar>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </MobileSidebar>

      {/* Company Name */}
      <div className="flex-1 min-w-0">
        {user?.company?.name ? (
          <h1 className="text-sm sm:text-base font-medium text-foreground truncate">
            {user.company.name}
          </h1>
        ) : (
          <h1 className="text-sm sm:text-base font-medium text-foreground truncate">
            ConstructDesk
          </h1>
        )}
      </div>

      {/* Upgrade Button - Show for non-Enterprise plans */}
      {user?.company?.subscriptionPlan && user.company.subscriptionPlan !== 'ENTERPRISE' && (
        <Button
          variant="default"
          size="sm"
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full shadow-sm"
          onClick={() => router.push('/pricing')}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span className="font-semibold">Upgrade</span>
        </Button>
      )}

      {/* User Avatar & Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 rounded-full hover:bg-accent p-1 transition-colors">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.firstName && user?.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                  : <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {user && (
            <div className="px-2 py-1.5 text-xs">
              <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <div className="my-1 h-px bg-border" />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center text-sm">
              <User className="mr-2 h-3.5 w-3.5" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center text-sm">
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <div className="my-1 h-px bg-border" />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive text-sm">
            <LogOut className="mr-2 h-3.5 w-3.5" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
})

