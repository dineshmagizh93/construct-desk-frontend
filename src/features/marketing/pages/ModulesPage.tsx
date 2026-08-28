import { useState } from 'react'
import { NAV_GROUPS, type NavGroup } from '@/lib/constants'
import { STARTER_MODULE_KEYS, type ModuleKey } from '@/lib/modules'
import { cn } from '@/lib/utils'
import { PageCta, PageHero } from '../components/shared'

const GROUP_COPY: Record<string, { intro: string; audience: string }> = {
  Overview: {
    intro: 'The morning screen. Projects, pipeline, and cash in one place — not five WhatsApp forwards.',
    audience: 'Owners & directors',
  },
  'CRM & Sales': {
    intro: 'Enquiries become clients without a parallel spreadsheet. Sales sees their pipeline; admins see all of it.',
    audience: 'Sales',
  },
  'Project Delivery': {
    intro: 'The live job: tasks, daily progress with photos, and dates — hung off one project ID.',
    audience: 'PMs & site engineers',
  },
  'Pre-Construction': {
    intro: 'Price the work and lock the paper before mobilisation. BOQ, quotation, contract, PO.',
    audience: 'Estimators',
  },
  Resources: {
    intro: 'Who is on site, what is in the store, which machine is allocated — by project, not by memory.',
    audience: 'Stores & site',
  },
  Finance: {
    intro: 'Costs as they land. Invoices as they go out. Budget vs spend without a month-end reconstruction.',
    audience: 'Accounts',
  },
  Operations: {
    intro: 'Drawings and contracts in the cloud. Alerts when work or money slips. Reports for leadership.',
    audience: 'Every role',
  },
  System: {
    intro: 'Six roles, not a generic admin toggle. Each person only sees the modules they need.',
    audience: 'Admins',
  },
}

const MODULE_BLURB: Record<ModuleKey, string> = {
  dashboard: 'KPIs, revenue vs expense, and recent activity.',
  leads: 'Capture enquiries, follow up, convert to a project.',
  clients: 'The company record every invoice and job hangs off.',
  projects: 'Planned, live, and complete jobs — one ID for everything.',
  tasks: 'Work assigned to the crew, with what’s still open.',
  'site-progress': 'Daily reports, workforce, and photos from the field.',
  calendar: 'Visits, milestones, and deadlines in one calendar.',
  estimates: 'BOQ and quotations before a brick is laid.',
  contracts: 'Work orders, POs, and signed agreements.',
  vendors: 'Suppliers for materials, subcontract, and services.',
  labour: 'Roster — trades, contractors, wages by site.',
  inventory: 'Material stock across sites, with low-stock flags.',
  equipment: 'Which machine is where, and when it is due service.',
  expenses: 'Project costs logged as they happen.',
  payments: 'Invoices out, collections in, outstanding clear.',
  'finance-reports': 'Budget vs spend per project and company-wide.',
  documents: 'Drawings, permits, contracts on cloud storage.',
  notifications: 'Overdue tasks, payments, and site updates.',
  reports: 'Cross-module view for owners and directors.',
  settings: 'Company profile, industry mode, billing.',
  users: 'Invite the team and control who is in.',
  roles: 'Permissions down to view, create, edit, delete.',
}

const FLOW = [
  { n: '01', title: 'Win the work', modules: 'Leads · Clients' },
  { n: '02', title: 'Price it', modules: 'Estimates · Contracts' },
  { n: '03', title: 'Run the site', modules: 'Projects · Tasks · Progress · Labour' },
  { n: '04', title: 'Collect', modules: 'Expenses · Invoices · Reports' },
]

function inStarter(key: ModuleKey) {
  return (STARTER_MODULE_KEYS as readonly string[]).includes(key)
}

function GroupVisual({ label }: { label: string }) {
  if (label === 'Overview') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          ['11', 'Projects'],
          ['₹4.0 Cr', 'MTD'],
          ['47', 'Tasks'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="font-display text-lg font-semibold tracking-tight">{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
    )
  }
  if (label === 'CRM & Sales') {
    return (
      <div className="space-y-2.5">
        {[
          ['New', '8', '22%'],
          ['Quoted', '5', '48%'],
          ['Won', '4', '72%'],
        ].map(([name, n, w]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-[12px]">
              <span className="font-medium">{name}</span>
              <span className="text-muted-foreground">{n}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: w }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (label === 'Project Delivery') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Lakeview Towers · Block B</span>
          <span className="font-semibold">72%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[72%] rounded-full bg-accent" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['18 on site', '12 photos', '9 open tasks'].map((x) => (
            <div key={x} className="rounded-lg border border-border bg-card px-2 py-2 text-center text-[11px] text-muted-foreground">
              {x}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (label === 'Pre-Construction') {
    return (
      <div className="space-y-2 text-sm">
        {[
          ['RCC M25', '142 m³'],
          ['TMT Fe500', '18.4 T'],
          ['Formwork', '920 m²'],
        ].map(([a, b]) => (
          <div key={a} className="flex justify-between rounded-lg border border-border bg-card px-3 py-2">
            <span>{a}</span>
            <span className="font-medium">{b}</span>
          </div>
        ))}
      </div>
    )
  }
  if (label === 'Resources') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Vendors', '36'],
          ['Labour', '84'],
          ['SKUs', '190'],
          ['Assets', '22'],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="font-display text-lg font-semibold">{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
    )
  }
  if (label === 'Finance') {
    return (
      <div>
        <p className="font-display text-2xl font-semibold tracking-tight">₹68.5 L</p>
        <p className="text-xs text-muted-foreground">Outstanding · 7 invoices</p>
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Greenfield RA 04</span>
            <span className="font-medium">₹18.2 L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MetroBuild mobilisation</span>
            <span className="font-medium">₹12.0 L</span>
          </div>
        </div>
      </div>
    )
  }
  if (label === 'Operations') {
    return (
      <div className="space-y-2">
        {['Architectural set.pdf', 'Structural.dwg', 'Steel PO-2091.pdf'].map((f) => (
          <div key={f} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {f}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {['Project Manager', 'Site Engineer', 'Accountant', 'Sales'].map((r) => (
        <span key={r} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
          {r}
        </span>
      ))}
    </div>
  )
}

function GroupStage({ group }: { group: NavGroup }) {
  const copy = GROUP_COPY[group.label]
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid lg:grid-cols-[1fr_20rem]">
        <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{copy?.audience}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">{group.label}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{copy?.intro}</p>
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
            {group.items.map((item) => (
              <li key={item.to} className="flex items-start gap-3 px-4 py-3.5">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <item.icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display text-sm font-semibold">{item.label}</p>
                    <p className="shrink-0 text-[11px] text-muted-foreground">
                      {inStarter(item.module) ? 'Starter' : 'Growth'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{MODULE_BLURB[item.module]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center bg-background p-6 sm:p-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">In the product</p>
          <GroupVisual label={group.label} />
        </div>
      </div>
    </div>
  )
}

export function ModulesPage() {
  const [activeLabel, setActiveLabel] = useState(NAV_GROUPS[2]?.label ?? NAV_GROUPS[0].label)
  const active = NAV_GROUPS.find((g) => g.label === activeLabel) ?? NAV_GROUPS[0]

  return (
    <>
      <PageHero
        align="left"
        eyebrow="Modules"
        title="The same tools the site, sales, and accounts already use — in one product."
        description="Twenty-two modules. List views, forms, Excel import, and role-based access on every one. This is the live catalog, not a brochure."
      />

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">How a job moves</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">One record, four stages</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((stage) => (
              <div key={stage.n} className="bg-card px-5 py-6">
                <p className="font-display text-xs font-semibold tracking-[0.16em] text-accent">{stage.n}</p>
                <p className="mt-3 font-display text-lg font-semibold tracking-tight">{stage.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.modules}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">The catalog</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Open a group</h2>
          </div>
          <p className="text-sm text-muted-foreground">Starter vs Growth is on each module. Same list as plan gating.</p>
        </div>

        <div
          role="tablist"
          aria-label="Module groups"
          className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
        >
          {NAV_GROUPS.map((group) => {
            const selected = group.label === active.label
            return (
              <button
                key={group.label}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveLabel(group.label)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {group.label}
              </button>
            )
          })}
        </div>

        <GroupStage group={active} />
      </section>

      <PageCta
        title="We’ll walk the modules your roles actually open"
        description="Sales, site, and accounts each get a different picture of the same project. That’s the demo — not a slide of 22 icons."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
        secondary={{ label: 'Compare plans', to: '/pricing' }}
      />
    </>
  )
}
