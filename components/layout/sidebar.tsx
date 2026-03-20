"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
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
  Gauge,
  Shield,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", module: "dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects", module: "projects" },
  { icon: KanbanSquare, label: "Tasks", href: "/tasks", module: "tasks" },
  { icon: Users, label: "Leads & Clients", href: "/leads", module: "leads" },
  { icon: TrendingUp, label: "Site Progress", href: "/site-progress", module: "site-progress" },
  { icon: CreditCard, label: "Payments", href: "/payments", module: "payments" },
  { icon: Receipt, label: "Expenses", href: "/expenses", module: "expenses" },
  { icon: Package, label: "Inventory", href: "/inventory", module: "inventory" },
  { icon: Truck, label: "Vendors", href: "/vendors", module: "vendors" },
  { icon: HardHat, label: "Labour", href: "/labour", module: "labour" },
  { icon: FileText, label: "Documents", href: "/documents", module: "documents" },
  { icon: BarChart3, label: "Reports", href: "/reports", module: "reports" },
  { icon: UserPlus, label: "Users", href: "/users", module: "users" },
  { icon: Gauge, label: "Usage Tracker", href: "/usage", module: "dashboard" }, // always visible like dashboard
  { icon: Settings, label: "Settings", href: "/settings", module: "settings" },
]

// Memoize sidebar to prevent re-renders
export const Sidebar = React.memo(function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { canAccess, loading: permissionsLoading } = usePermissions()
  const { isSuperAdmin } = useSuperAdmin()
  
  // For super admin, only show admin link, hide all normal CRM modules
  if (isSuperAdmin) {
    return (
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-30 h-screen border-r border-border/40 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-300",
          isCollapsed ? "w-14" : "w-[200px]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Toggle Button */}
          <div className="flex h-14 items-center justify-between border-b border-border/40 px-3 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm flex-shrink-0 relative z-10">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-primary tracking-tight">
                Super Admin
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="ml-auto h-7 w-7 hover:bg-primary/10 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Navigation Menu - Only Super Admin */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <nav className="px-2 py-2">
              <Link
                href="/admin"
                prefetch={true}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[8px] px-3 h-[40px] text-[13px] font-medium transition-all duration-200 group flex-shrink-0 mb-0.5",
                  pathname === "/admin" && !pathname?.startsWith("/admin/companies")
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Super Admin Dashboard" : undefined}
              >
                {pathname === "/admin" && !pathname?.startsWith("/admin/companies") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <Shield
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname === "/admin" && !pathname?.startsWith("/admin/companies")
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    Dashboard
                  </span>
                )}
              </Link>
              <Link
                href="/admin/companies"
                prefetch={true}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[8px] px-3 h-[40px] text-[13px] font-medium transition-all duration-200 group flex-shrink-0 mb-0.5",
                  pathname?.startsWith("/admin/companies")
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Companies" : undefined}
              >
                {pathname?.startsWith("/admin/companies") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <Building2
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname?.startsWith("/admin/companies") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    Companies
                  </span>
                )}
              </Link>
              <Link
                href="/admin/analytics"
                prefetch={true}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[8px] px-3 h-[40px] text-[13px] font-medium transition-all duration-200 group flex-shrink-0 mb-0.5",
                  pathname?.startsWith("/admin/analytics")
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Analytics" : undefined}
              >
                {pathname?.startsWith("/admin/analytics") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <BarChart3
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname?.startsWith("/admin/analytics") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    Analytics
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </aside>
    )
  }

  // Prefetch all routes on mount for instant navigation
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.href !== pathname) {
        // Prefetch in background without blocking
        router.prefetch(item.href)
      }
    })
  }, [pathname, router])

  const handleLinkClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Use startTransition for instant navigation feel
    if (href !== pathname) {
      React.startTransition(() => {
        // Navigation is already prefetched, so it should be instant
      })
    }
  }, [pathname])

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-0 top-0 z-30 h-screen border-r border-border/40 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-300",
        isCollapsed ? "w-14" : "w-[200px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-3 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm flex-shrink-0 relative z-10">
          {!isCollapsed && (
            <h2 className="text-[17px] font-extrabold text-primary tracking-tight">
              ConstructDesk
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto h-7 w-7 hover:bg-primary/10 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <nav className="px-2 py-2">
            {/* Super Admin Link */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                prefetch={true}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[8px] px-3 h-[40px] text-[13px] font-medium transition-all duration-200 group flex-shrink-0 mb-2",
                  pathname === "/admin" || pathname?.startsWith("/admin/")
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Super Admin" : undefined}
              >
                {(pathname === "/admin" || pathname?.startsWith("/admin/")) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <Shield
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname === "/admin" || pathname?.startsWith("/admin/")
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    Super Admin
                  </span>
                )}
              </Link>
            )}
            
            {/* Divider for super admin section */}
            {isSuperAdmin && (
              <div className="h-px bg-border/40 mx-2 mb-2" />
            )}
            
            {menuItems.filter((item) => {
            // Always show dashboard, users, and settings
            if (item.module === "dashboard" || item.module === "users" || item.module === "settings") {
              return true
            }
            // For other modules, check canAccess permission
            if (permissionsLoading) {
              return true // Show all while loading
            }
            return canAccess(item.module)
          }).map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[8px] px-3 h-[40px] text-[13px] font-medium transition-all duration-200 group flex-shrink-0 mb-0.5",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-all",
                  isCollapsed && "mx-auto",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!isCollapsed && (
                <span className="truncate flex-1">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
          </nav>
        </div>
      </div>
    </aside>
  )
})

