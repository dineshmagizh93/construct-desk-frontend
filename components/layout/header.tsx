"use client"

import * as React from "react"
import { Menu, User, Settings, LogOut, ArrowUp, Sparkles } from "lucide-react"
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
        "fixed top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200/80 bg-white/78 px-3 shadow-[0_10px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 sm:gap-3 sm:px-4 lg:px-6",
        "left-0 right-0",
        sidebarCollapsed ? "lg:left-16" : "lg:left-[200px]"
      )}
    >
      <MobileSidebar>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white shadow-sm lg:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </MobileSidebar>

      <div className="min-w-0 flex-1 lg:pl-4">
        {user?.company?.name ? (
          <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {user.company.name}
          </h1>
        ) : (
          <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            ConstructDesk
          </h1>
        )}
      </div>

      {user?.company?.subscriptionPlan && user.company.subscriptionPlan !== 'ENTERPRISE' && (
        <Button
          variant="default"
          size="sm"
          className="hidden h-9 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] px-4 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] sm:flex"
          onClick={() => router.push('/pricing')}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <ArrowUp className="h-3.5 w-3.5" />
          <span className="font-semibold">Upgrade</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 p-1 shadow-sm transition-colors hover:bg-slate-50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[linear-gradient(135deg,#2563eb,#4f46e5)] text-xs text-white">
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
