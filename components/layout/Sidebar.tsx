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
  ScrollText,
  ClipboardList,
  LayoutTemplate,
  GanttChartSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  module: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", module: "dashboard" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: FolderKanban, label: "Projects", href: "/projects", module: "projects" },
      { icon: KanbanSquare, label: "Tasks", href: "/tasks", module: "tasks" },
      { icon: GanttChartSquare, label: "Gantt", href: "/gantt", module: "tasks" },
      { icon: TrendingUp, label: "Site Progress", href: "/site-progress", module: "site-progress" },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: CreditCard, label: "Payments", href: "/payments", module: "payments" },
      { icon: Receipt, label: "Expenses", href: "/expenses", module: "expenses" },
    ],
  },
  {
    label: "Resources",
    items: [
      { icon: Package, label: "Inventory", href: "/inventory", module: "inventory" },
      { icon: Truck, label: "Vendors", href: "/vendors", module: "vendors" },
      { icon: HardHat, label: "Labour", href: "/labour", module: "labour" },
      { icon: FileText, label: "Documents", href: "/documents", module: "documents" },
    ],
  },
  {
    label: "CRM",
    items: [
      { icon: Users, label: "Leads & Clients", href: "/leads", module: "leads" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: BarChart3, label: "Reports", href: "/reports", module: "reports" },
      { icon: ScrollText, label: "Audit Log", href: "/audit-log", module: "dashboard" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: UserPlus, label: "Users", href: "/users", module: "users" },
      { icon: Gauge, label: "Usage", href: "/usage", module: "dashboard" },
      { icon: Settings, label: "Settings", href: "/settings", module: "settings" },
    ],
  },
]

export const Sidebar = React.memo(function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { canAccess, loading: permissionsLoading } = usePermissions()
  const { isSuperAdmin } = useSuperAdmin()
  const expandedWidthClass = "w-[210px]"
  const collapsedWidthClass = "w-16"

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
              <h2 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-primary">Super Admin</h2>
            )}
            <Button variant="ghost" size="icon" onClick={onToggle}
              className={cn("h-8 w-8 rounded-full border border-slate-200 bg-white/90 transition-colors hover:bg-primary/10", isCollapsed ? "mx-auto" : "ml-auto shrink-0")}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <nav className="px-2 py-2 space-y-1">
              {[
                { href: "/admin", label: "Dashboard", icon: Shield, exact: true },
                { href: "/admin/companies", label: "Companies", icon: Building2, exact: false },
                { href: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
              ].map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname?.startsWith(href)
                return (
                  <Link key={href} href={href} prefetch
                    className={cn(
                      "group relative flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
                      isActive ? "bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(59,130,246,0.08))] text-primary shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-900",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? label : undefined}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />}
                    <Icon className={cn("h-[15px] w-[15px] flex-shrink-0", isCollapsed && "mx-auto", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-900")} />
                    {!isCollapsed && <span className="truncate flex-1">{label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    )
  }

  React.useEffect(() => {
    navGroups.flatMap(g => g.items).forEach(item => {
      if (item.href !== pathname) router.prefetch(item.href)
    })
  }, [pathname, router])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 hidden h-screen border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 lg:flex flex-col",
        isCollapsed ? collapsedWidthClass : expandedWidthClass
      )}
    >
      {/* Logo */}
      <div className="relative z-10 flex h-16 flex-shrink-0 items-center gap-2 border-b border-slate-200/80 px-3">
        {!isCollapsed && (
          <h2 className="min-w-0 flex-1 truncate text-[17px] font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            <span className="text-blue-700">Construct</span>
            <span className="text-orange-500">Desk</span>
          </h2>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle}
          className={cn("h-8 w-8 rounded-full border border-slate-200 bg-white/90 transition-colors hover:bg-primary/10", isCollapsed ? "mx-auto" : "ml-auto shrink-0")}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide py-2">
        <nav className="px-2">
          {isSuperAdmin && (
            <>
              <Link href="/admin" prefetch
                className={cn(
                  "group relative mb-1 flex h-[38px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
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
                <Shield className={cn("h-[15px] w-[15px] flex-shrink-0", isCollapsed && "mx-auto", pathname?.startsWith("/admin/") ? "text-primary" : "text-slate-500 group-hover:text-slate-900")} />
                {!isCollapsed && <span className="truncate flex-1">Super Admin</span>}
              </Link>
              <div className="mx-2 mb-2 h-px bg-slate-200/80" />
            </>
          )}

          {navGroups.map((group, groupIdx) => {
            const visibleItems = permissionsLoading ? [] : group.items.filter(item => canAccess(item.module))
            if (visibleItems.length === 0) return null

            return (
              <div key={group.label} className={cn(groupIdx > 0 && "mt-1")}>
                {!isCollapsed && (
                  <p className="mb-0.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400">
                    {group.label}
                  </p>
                )}
                {isCollapsed && groupIdx > 0 && <div className="mx-2 my-1 h-px bg-slate-200/60" />}

                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={cn(
                        "group relative mb-0.5 flex h-[36px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 text-[12.5px] font-medium transition-all duration-200",
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
                      {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
})
