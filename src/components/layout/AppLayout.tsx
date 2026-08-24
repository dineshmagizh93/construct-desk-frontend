import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { RouteAccessGuard } from './RouteAccessGuard'
import { ImpersonationBanner } from './ImpersonationBanner'

export function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <ImpersonationBanner />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <MobileNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <RouteAccessGuard>
              <Outlet />
            </RouteAccessGuard>
          </main>
        </div>
      </div>
    </div>
  )
}
