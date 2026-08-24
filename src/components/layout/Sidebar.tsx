import { NavLink } from 'react-router-dom'
import { HardHat, ChevronLeft, ChevronRight } from 'lucide-react'
import { NAV_GROUPS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { canPerform } from '@/lib/permissions'
import { planIncludesModule } from '@/lib/planAccess'
import { useUiStore } from '@/lib/ui-store'
import { useIndustryConfig } from '@/lib/industry-store'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user, company } = useAuth()
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggle = useUiStore((state) => state.toggleSidebar)
  const industryConfig = useIndustryConfig()

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <HardHat className="size-4.5" />
        </div>
        {!collapsed && <span className="truncate text-sm font-semibold">ConstructDesk</span>}
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter(
            (item) =>
              (!user || canPerform(user.permissions, item.module, 'view')) &&
              planIncludesModule(company, item.module),
          )
          if (items.length === 0) return null
          return (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? (industryConfig.navLabels[item.to] ?? item.label) : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-white'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{industryConfig.navLabels[item.to] ?? item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <button
        onClick={toggle}
        className="flex h-11 items-center justify-center gap-2 border-t border-sidebar-border text-sidebar-foreground/60 hover:text-white"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>
    </aside>
  )
}
