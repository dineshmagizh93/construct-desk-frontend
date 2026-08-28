import {
  Bell,
  Building2,
  CheckSquare,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Target,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Leads', icon: Target, active: false },
  { label: 'Projects', icon: Building2, active: false },
  { label: 'Site Progress', icon: ClipboardList, active: false },
  { label: 'Tasks', icon: CheckSquare, active: false },
  { label: 'Finance', icon: Wallet, active: false },
]

const KPIS = [
  { label: 'Active projects', value: '11', delta: '+2 this month', up: true },
  { label: 'Revenue MTD', value: '₹4.02 Cr', delta: '+6.9%', up: true },
  { label: 'Pending payments', value: '₹68.5 L', delta: '−3.2%', up: false },
  { label: 'Open tasks', value: '47', delta: '+5 this week', up: true },
]

const PROJECTS = [
  { name: 'Lakeview Towers', client: 'MetroBuild', progress: 72, status: 'In progress', tone: 'text-amber-800 bg-amber-100' },
  { name: 'Prestige Business Park', client: 'Greenfield Dev.', progress: 28, status: 'Planning', tone: 'text-slate-700 bg-slate-100' },
  { name: 'Whitefield Residency', client: 'Studio Forma', progress: 100, status: 'Completed', tone: 'text-emerald-800 bg-emerald-100' },
  { name: 'Riverside Block C', client: 'Apex Civil', progress: 64, status: 'In progress', tone: 'text-amber-800 bg-amber-100' },
]

const ACTIVITY = [
  { title: 'Payment received', detail: '₹4,50,000 · Greenfield', time: '2h' },
  { title: 'Site update logged', detail: 'Riverside Towers · 68%', time: '4h' },
  { title: 'Lead converted', detail: '3BHK Villa · Vikram S.', time: '1d' },
  { title: 'Contract signed', detail: 'PO-2091 · steel rebar', time: '1d' },
]

function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 56" className={className} aria-hidden>
      <defs>
        <linearGradient id="lp-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 44 L30 40 L60 42 L90 28 L120 32 L150 18 L180 22 L210 12 L240 14 V56 H0 Z" fill="url(#lp-spark)" />
      <path
        d="M0 44 L30 40 L60 42 L90 28 L120 32 L150 18 L180 22 L210 12 L240 14"
        fill="none"
        stroke="#b45309"
        strokeWidth="2"
      />
    </svg>
  )
}

export function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)]',
        className,
      )}
      aria-hidden
    >
      <div className="flex h-11 items-center gap-3 border-b border-border bg-[#f4f5f7] px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-md items-center rounded-md border border-border/80 bg-white px-3 text-xs text-muted-foreground">
          app.constructdesk.in/dashboard
        </div>
      </div>

      <div className="flex min-h-[28rem] bg-background md:min-h-[32rem]">
        <aside className="hidden w-52 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
          <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
            <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <HardHat className="size-4" />
            </div>
            <span className="text-sm font-semibold">ConstructDesk</span>
          </div>
          <nav className="space-y-0.5 p-3">
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Overview
            </p>
            {NAV.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium',
                  item.active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/70',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Dashboard</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Every project, deal, and rupee — right now.</p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
              <Bell className="size-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-border bg-card px-4 py-3.5">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 font-display text-xl font-semibold tracking-tight">{kpi.value}</p>
                <p className={cn('mt-1 text-xs', kpi.up ? 'text-emerald-600' : 'text-muted-foreground')}>{kpi.delta}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,1fr)]">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Live projects</p>
                <span className="text-xs text-muted-foreground">4 of 11</span>
              </div>
              <div className="divide-y divide-border">
                {PROJECTS.map((project) => (
                  <div key={project.name} className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                    <span className={cn('justify-self-end rounded-full px-2 py-0.5 text-[11px] font-medium', project.tone)}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Revenue vs expense</p>
              </div>
              <div className="px-4 pt-3">
                <Sparkline className="h-14 w-full" />
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-sm font-semibold">Recent activity</p>
                <ul className="space-y-2.5">
                  {ACTIVITY.map((item) => (
                    <li key={item.title} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-tight">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
