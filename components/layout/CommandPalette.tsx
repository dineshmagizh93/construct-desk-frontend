"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard, FolderKanban, KanbanSquare, Users, TrendingUp,
  CreditCard, Receipt, Package, Truck, HardHat, FileText,
  BarChart3, Settings, UserPlus, Gauge, ScrollText, LayoutTemplate,
  Plus, Search,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
  { label: "Projects", href: "/projects", icon: FolderKanban, group: "Navigation" },
  { label: "Tasks", href: "/tasks", icon: KanbanSquare, group: "Navigation" },
  { label: "Leads & Clients", href: "/leads", icon: Users, group: "Navigation" },
  { label: "Site Progress", href: "/site-progress", icon: TrendingUp, group: "Navigation" },
  { label: "Payments", href: "/payments", icon: CreditCard, group: "Navigation" },
  { label: "Expenses", href: "/expenses", icon: Receipt, group: "Navigation" },
  { label: "Inventory", href: "/inventory", icon: Package, group: "Navigation" },
  { label: "Vendors", href: "/vendors", icon: Truck, group: "Navigation" },
  { label: "Labour", href: "/labour", icon: HardHat, group: "Navigation" },
  { label: "Documents", href: "/documents", icon: FileText, group: "Navigation" },
  { label: "Reports", href: "/reports", icon: BarChart3, group: "Navigation" },
  { label: "Users", href: "/users", icon: UserPlus, group: "Navigation" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Navigation" },
  { label: "Usage Tracker", href: "/usage", icon: Gauge, group: "Navigation" },
  { label: "Audit Log", href: "/audit-log", icon: ScrollText, group: "Navigation" },
  { label: "Project Templates", href: "/project-templates", icon: LayoutTemplate, group: "Navigation" },
]

const quickActions = [
  { label: "New Project", href: "/projects?new=1", icon: Plus, group: "Quick Actions" },
  { label: "New Task", href: "/tasks?new=1", icon: Plus, group: "Quick Actions" },
  { label: "New Lead", href: "/leads?new=1", icon: Plus, group: "Quick Actions" },
  { label: "New Payment", href: "/payments?new=1", icon: Plus, group: "Quick Actions" },
  { label: "New Expense", href: "/expenses?new=1", icon: Plus, group: "Quick Actions" },
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem key={item.label} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 h-4 w-4 text-primary" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 h-4 w-4 text-slate-500" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
