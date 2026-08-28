import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FEATURES } from '../content'
import { PageCta, PageHero } from '../components/shared'

function FeatureVisual({ index }: { index: number }) {
  if (index === 0) {
    const stages = [
      { label: 'New', n: 8 },
      { label: 'Quoted', n: 5 },
      { label: 'Won', n: 4 },
    ]
    return (
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
            <span className="text-sm font-medium">{stage.label}</span>
            <span className="text-sm text-muted-foreground">{stage.n} leads</span>
          </div>
        ))}
      </div>
    )
  }
  if (index === 1) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Lakeview Towers · Block B</span>
          <span className="font-semibold">72%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[72%] rounded-full bg-accent" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {['18 on site', '4 materials', '12 photos'].map((item) => (
            <div key={item} className="rounded-lg border border-border bg-background px-2 py-2 text-xs text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (index === 2) {
    return (
      <div className="space-y-3">
        <p className="font-display text-2xl font-semibold tracking-tight">₹68.5 L</p>
        <p className="text-sm text-muted-foreground">Outstanding across 7 invoices</p>
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Greenfield — RA 04</span>
            <span className="font-medium">₹18.2 L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MetroBuild — Mobilisation</span>
            <span className="font-medium">₹12.0 L</span>
          </div>
        </div>
      </div>
    )
  }
  if (index === 3) {
    return (
      <div className="space-y-2">
        {['Architectural set.pdf', 'Structural drawings.dwg', 'Work order — steel.pdf'].map((file) => (
          <div key={file} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
            {file}
          </div>
        ))}
      </div>
    )
  }
  if (index === 4) {
    return (
      <div className="flex flex-wrap gap-2">
        {['Project Manager', 'Site Engineer', 'Accountant', 'Sales'].map((role) => (
          <span key={role} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
            {role}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center">
      <p className="text-sm font-medium">Excel template ready</p>
      <p className="mt-1 text-xs text-muted-foreground">Download, fill, import — validated per module</p>
    </div>
  )
}

export function FeaturesPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="Features"
        title="The workflows your sites already run — connected"
        description="Not a generic CRM with construction labels. Each feature below is a live module with lists, forms, and permissions."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-6">
          {FEATURES.map((feature, i) => {
            const reversed = i % 2 === 1
            return (
              <article
                key={feature.title}
                className={cn(
                  'grid items-center gap-8 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2 lg:gap-12 lg:p-10',
                )}
              >
                <div className={cn(reversed && 'lg:order-2')}>
                  <p className="font-display text-xs font-semibold tracking-[0.16em] text-accent">0{i + 1}</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{feature.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.detail}</p>
                </div>
                <div className={cn('rounded-xl border border-border bg-background p-5', reversed && 'lg:order-1')}>
                  <FeatureVisual index={i} />
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">On every plan</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['Role-based access', 'Excel import', 'Cloud file storage', 'Multi-project tracking', 'Live dashboards', 'Works on site phones'].map(
              (item) => (
                <div key={item} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <CheckCircle2 className="size-4 shrink-0 text-foreground" />
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link to="/pricing">See what each plan includes</Link>
            </Button>
          </div>
        </div>
      </section>

      <PageCta
        title="See these modules in a live workspace"
        description="We’ll walk through the features that match how your projects actually run."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
        secondary={{ label: 'Browse modules', to: '/modules' }}
      />
    </>
  )
}
