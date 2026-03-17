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
  UserPlus,
  Package,
  KanbanSquare,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, useSheet } from "@/components/ui/sheet"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import { Shield, Building2 } from "lucide-react"

interface MobileSidebarProps {
  children: React.ReactNode
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Gauge, label: "Usage Tracker", href: "/usage" },
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

function MobileSidebarContent() {
  const pathname = usePathname()
  const { setOpen } = useSheet()
  const router = useRouter()
  const { isSuperAdmin } = useSuperAdmin()

  const handleLinkClick = React.useCallback((href: string) => {
    // Use startTransition for instant navigation feel
    React.startTransition(() => {
      router.prefetch(href)
      setOpen(false)
    })
  }, [router, setOpen])
  
  // For super admin, only show admin link
  if (isSuperAdmin) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-lg font-semibold text-foreground">Super Admin</h2>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link
            href="/admin"
            prefetch={true}
            onClick={() => handleLinkClick("/admin")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              pathname === "/admin" && !pathname?.startsWith("/admin/companies")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/companies"
            prefetch={true}
            onClick={() => handleLinkClick("/admin/companies")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              pathname?.startsWith("/admin/companies")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Building2 className="h-5 w-5 flex-shrink-0" />
            <span>Companies</span>
          </Link>
          <Link
            href="/admin/analytics"
            prefetch={true}
            onClick={() => handleLinkClick("/admin/analytics")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              pathname?.startsWith("/admin/analytics")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <BarChart3 className="h-5 w-5 flex-shrink-0" />
            <span>Analytics</span>
          </Link>
        </nav>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h2 className="text-lg font-semibold text-foreground">ConstructDesk</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => handleLinkClick(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <MobileSidebarContent />
      </SheetContent>
    </Sheet>
  )
}

