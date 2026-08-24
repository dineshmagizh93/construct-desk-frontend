import { Outlet } from 'react-router-dom'
import { HardHat } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="size-5" />
            </div>
            <span className="text-lg font-semibold">ConstructDesk</span>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div />
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              Run every site, every deal, and every rupee from one place.
            </h2>
            <p className="max-w-md text-primary-foreground/80">
              Leads, projects, labour, materials, and finance — the complete CRM built for construction
              businesses.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} ConstructDesk. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
