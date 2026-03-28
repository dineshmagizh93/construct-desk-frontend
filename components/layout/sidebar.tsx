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
  const expandedWidthClass = "w-[200px]"
  const collapsedWidthClass = "w-16"
  
  // For super admin, only show admin link, hide all normal CRM modules
  if (isSuperAdmin) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 lg:flex",
          isCollapsed ? collapsedWidthClass : expandedWidthClass
        )}
      >
        <div className="flex h-full flex-col">
          <div className="relative z-10 flex h-16 flex-shrink-0 items-center gap-2 border-b border-slate-200/80 px-3">
            {!isCollapsed && (
              <h2 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-primary">
                Super Admin
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "h-8 w-8 rounded-full border border-slate-200 bg-white/90 transition-colors hover:bg-primary/10",
                isCollapsed ? "mx-auto" : "ml-auto shrink-0"
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <nav className="px-2 py-2">
              <Link
                href="/admin"
                prefetch={true}
                className={cn(
                  "group relative mb-1 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                  pathname === "/admin" && !pathname?.startsWith("/admin/companies")
                    ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Super Admin Dashboard" : undefined}
              >
                {pathname === "/admin" && !pathname?.startsWith("/admin/companies") && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Shield
                  className={cn(
                    "h-[15px] w-[15px] flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname === "/admin" && !pathname?.startsWith("/admin/companies")
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-slate-900"
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
                  "group relative mb-1 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                  pathname?.startsWith("/admin/companies")
                    ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Companies" : undefined}
              >
                {pathname?.startsWith("/admin/companies") && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Building2
                  className={cn(
                    "h-[15px] w-[15px] flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname?.startsWith("/admin/companies") ? "text-primary" : "text-slate-500 group-hover:text-slate-900"
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
                  "group relative mb-1 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                  pathname?.startsWith("/admin/analytics")
                    ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Analytics" : undefined}
              >
                {pathname?.startsWith("/admin/analytics") && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <BarChart3
                  className={cn(
                    "h-[15px] w-[15px] flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname?.startsWith("/admin/analytics") ? "text-primary" : "text-slate-500 group-hover:text-slate-900"
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
        "fixed left-0 top-0 z-30 hidden h-screen border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 lg:flex",
        isCollapsed ? collapsedWidthClass : expandedWidthClass
      )}
    >
      <div className="flex h-full flex-col">
        <div className="relative z-10 flex h-16 flex-shrink-0 items-center gap-2 border-b border-slate-200/80 px-3">
          {!isCollapsed && (
            <h2 className="min-w-0 flex-1 truncate text-[17px] font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              <span className="text-blue-700">Construct</span>
              <span className="text-orange-500">Desk</span>
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 rounded-full border border-slate-200 bg-white/90 transition-colors hover:bg-primary/10",
              isCollapsed ? "mx-auto" : "ml-auto shrink-0"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <nav className="px-2 py-2">
            {isSuperAdmin && (
              <Link
                href="/admin"
                prefetch={true}
                className={cn(
                  "group relative mb-2 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                  pathname === "/admin" || pathname?.startsWith("/admin/")
                    ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Super Admin" : undefined}
              >
                {(pathname === "/admin" || pathname?.startsWith("/admin/")) && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Shield
                  className={cn(
                    "h-[15px] w-[15px] flex-shrink-0 transition-all",
                    isCollapsed && "mx-auto",
                    pathname === "/admin" || pathname?.startsWith("/admin/")
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-slate-900"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">
                    Super Admin
                  </span>
                )}
              </Link>
            )}
            
            {isSuperAdmin && (
              <div className="mx-2 mb-2 h-px bg-slate-200/80" />
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
                  "group relative mb-1 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-[15px] w-[15px] flex-shrink-0 transition-all",
                  isCollapsed && "mx-auto",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-900"
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
