import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className={cn('mb-12 max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'mx-0 text-left')}>
      {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h2 className={cn('font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl', eyebrow && 'mt-3')}>
        {title}
      </h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  )
}

export function TrustStrip() {
  const labels = ['General Contractors', 'Interior Studios', 'Civil Engineers', 'Project Developers', 'Renovation Firms']
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-8 sm:flex-row sm:justify-between">
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Built for</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {labels.map((label) => (
            <span key={label} className="font-display text-sm font-semibold tracking-tight text-foreground/40">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  align = 'center',
}: {
  eyebrow: string
  title: ReactNode
  description: string
  children?: ReactNode
  align?: 'center' | 'left'
}) {
  return (
    <section className="relative border-b border-border bg-card">
      <div className="marketing-hero-grid-light pointer-events-none absolute inset-0" />
      <div
        className={cn(
          'relative mx-auto px-6 py-8 lg:py-10',
          align === 'center' ? 'max-w-3xl text-center' : 'max-w-6xl text-left',
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="mt-2.5 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p
          className={cn(
            'mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
        {children}
      </div>
    </section>
  )
}

export function PageCta({
  title,
  description,
  primary,
  secondary,
}: {
  title: string
  description: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
}) {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="accent" className="h-11 px-6" asChild>
            <Link to={primary.to}>
              {primary.label} <ArrowRight className="size-4" />
            </Link>
          </Button>
          {secondary && (
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <Link to={secondary.to}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

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
      <div className="space-y-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-2.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}
