"use client"

import * as React from "react"
import { Menu, User, Settings, LogOut, ArrowUp, Sparkles, Bell, Search, X, Check, Trash2, Keyboard, Zap } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { CommandPalette } from "./CommandPalette"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { ChangelogModal } from "@/components/ui/changelog-modal"
import { KeyboardShortcutsOverlay, useKeyboardShortcuts } from "@/components/ui/keyboard-shortcuts"

interface HeaderProps {
  sidebarCollapsed: boolean
}

function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id)
    if (notif.link) {
      router.push(notif.link)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full border border-slate-200 bg-white shadow-sm"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-[13px] font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[12px] text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-slate-200" />
                <p className="text-[13px] text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n: any) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50",
                    !n.isRead && "bg-blue-50/40"
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="mt-0.5 flex h-2 w-2 flex-shrink-0 items-center justify-center">
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold leading-snug text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-500 line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                    className="flex-shrink-0 text-slate-300 hover:text-slate-500"
                    aria-label="Delete notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 text-center">
              <button className="text-[12px] text-primary hover:underline">View all</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const Header = React.memo(function Header({ sidebarCollapsed }: HeaderProps) {
  const { logout, user } = useAuth()
  const router = useRouter()
  const [changelogOpen, setChangelogOpen] = React.useState(false)
  const { open: shortcutsOpen, setOpen: setShortcutsOpen } = useKeyboardShortcuts()

  const handleLogout = React.useCallback(() => {
    logout()
    router.refresh()
  }, [logout, router])

  return (
    <>
      <CommandPalette />
      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
      <KeyboardShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <header
        className={cn(
          "fixed top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200/80 bg-white/78 px-3 shadow-[0_10px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 sm:gap-3 sm:px-4 lg:px-6",
          "left-0 right-0",
          sidebarCollapsed ? "lg:left-16" : "lg:left-[210px]"
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
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">ConstructDesk</h1>
          )}
        </div>

        {/* Global search button */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
            document.dispatchEvent(event)
          }}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-[12px] text-slate-400 transition-colors hover:bg-white md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Search...
          <kbd className="rounded bg-slate-200 px-1 py-0.5 text-[10px] font-mono">Ctrl+K</kbd>
        </button>

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

        {/* Notification bell */}
        <NotificationPanel />

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
            <DropdownMenuItem asChild>
              <Link href="/settings/security" className="flex items-center text-sm">
                <Settings className="mr-2 h-3.5 w-3.5" />
                <span>Security</span>
              </Link>
            </DropdownMenuItem>
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem onClick={() => setChangelogOpen(true)} className="text-sm">
              <Zap className="mr-2 h-3.5 w-3.5 text-blue-500" />
              <span>What&apos;s New</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShortcutsOpen(true)} className="text-sm">
              <Keyboard className="mr-2 h-3.5 w-3.5" />
              <span>Keyboard Shortcuts</span>
              <span className="ml-auto text-[10px] text-slate-400 font-mono">?</span>
            </DropdownMenuItem>
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive text-sm">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  )
})
