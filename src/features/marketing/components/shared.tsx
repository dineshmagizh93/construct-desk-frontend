import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const DOT_GRID = 'bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px]'

export function GlowOrbs() {
  return (
    <>
      <div className="absolute left-1/2 top-[-10rem] -z-10 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/15 to-transparent blur-3xl" />
      <div className="absolute -right-24 top-24 -z-10 size-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -left-16 top-40 -z-10 size-56 rounded-full bg-violet-400/15 blur-3xl" />
      <div className="absolute right-1/3 top-4 -z-10 size-40 rounded-full bg-emerald-400/15 blur-3xl" />
    </>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={cn('mx-auto mb-10 max-w-2xl', align === 'center' ? 'text-center' : 'mx-0 max-w-xl text-left')}>
      {eyebrow && (
        <div className={cn('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
          <span className="h-px w-8 bg-primary/40" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
          <span className="h-px w-8 bg-primary/40" />
        </div>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  )
}

export function TrustStrip() {
  const labels = ['General Contractors', 'Interior Studios', 'Civil Engineers', 'Project Developers', 'Renovation Firms']
  return (
    <section className="border-y border-primary/10 bg-gradient-to-r from-primary/[0.06] via-card/80 to-accent/[0.06] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted by growing teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {labels.map((label) => (
            <span key={label} className="text-sm font-semibold text-foreground/40 transition-colors hover:text-foreground/60">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatBar({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-primary/10 bg-card/70 px-4 py-5 text-center shadow-sm backdrop-blur-sm lg:text-left"
        >
          <p className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">{stat.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

/** Prose wrapper for legal pages (Terms, Privacy, Refund Policy) — consistent heading/spacing rhythm. */
export function LegalDocument({
  effectiveDate,
  intro,
  children,
}: {
  effectiveDate: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <p className="mb-8 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
      {intro && <div className="mb-8 text-sm leading-relaxed text-muted-foreground">{intro}</div>}
      <div className="space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_p]:mt-2.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

/** Shared hero banner used at the top of every inner marketing page (Features, Pricing, FAQ, etc). */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: ReactNode
  description: string
  children?: ReactNode
}) {
  return (
    <section className="marketing-hero-bg relative overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 -z-20 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]',
          DOT_GRID,
        )}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04]" />
      <GlowOrbs />
      <div className="mx-auto max-w-4xl px-6 pb-14 pt-16 text-center lg:pb-16 lg:pt-20">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-primary/40" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
          <span className="h-px w-8 bg-primary/40" />
        </div>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  )
}
