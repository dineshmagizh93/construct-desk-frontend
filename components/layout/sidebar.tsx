"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  TrendingUp,
  CreditCard,
  Receipt,
  Truck,
  HardHat,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Package,
  KanbanSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: KanbanSquare, label: "Tasks", href: "/tasks" },
  { icon: Users, label: "Leads & Clients", href: "/leads" },
  { icon: TrendingUp, label: "Site Progress", href: "/site-progress" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Receipt, label: "Expenses", href: "/expenses" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: Truck, label: "Vendors", href: "/vendors" },
  { icon: HardHat, label: "Labour", href: "/labour" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: UserPlus, label: "Users", href: "/users" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

// Memoize sidebar to prevent re-renders
export const Sidebar = React.memo(function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLinkClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Use startTransition for instant navigation feel
    if (href !== pathname) {
      React.startTransition(() => {
        router.prefetch(href)
      })
    }
  }, [pathname, router])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-border/40 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4 bg-gradient-to-r from-primary/5 to-transparent">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Construction CRM
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto hover:bg-primary/10 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
                )}
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isCollapsed && "mx-auto",
                  isActive && "text-primary-foreground"
                )} />
                {!isCollapsed && (
                  <span className={cn(
                    "transition-all",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
})

