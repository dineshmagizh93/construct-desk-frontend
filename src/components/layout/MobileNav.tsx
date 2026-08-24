import { NavLink } from 'react-router-dom'
import { HardHat } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { NAV_GROUPS } from '@/lib/constants'
import { canPerform } from '@/lib/permissions'
import { planIncludesModule } from '@/lib/planAccess'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/lib/ui-store'
import { useIndustryConfig } from '@/lib/industry-store'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen)
  const setOpen = useUiStore((state) => state.setMobileNavOpen)
  const { user, company } = useAuth()
  const industryConfig = useIndustryConfig()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 max-w-[80vw] bg-sidebar p-0 text-sidebar-foreground">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <HardHat className="size-4.5" />
          </div>
          <span className="text-sm font-semibold">ConstructDesk</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => {
          const items = group.items.filter(
            (item) =>
              (!user || canPerform(user.permissions, item.module, 'view')) &&
              planIncludesModule(company, item.module),
          )
            if (items.length === 0) return null
            return (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium',
                          isActive
                            ? 'bg-sidebar-accent text-white'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white',
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{industryConfig.navLabels[item.to] ?? item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
