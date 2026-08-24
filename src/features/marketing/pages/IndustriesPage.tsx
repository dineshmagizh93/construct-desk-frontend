import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { INDUSTRY_CONFIGS, type IndustryConfig } from '@/lib/industry'
import { cn } from '@/lib/utils'
import { PageHero } from '../components/shared'

function IndustryCard({ config, primary }: { config: IndustryConfig; primary: boolean }) {
  const moduleEntries = Object.values(config.moduleText)
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 shadow-lg',
        primary
          ? 'border-primary/30 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-primary/20'
          : 'border-border bg-card',
      )}
    >
      {primary && <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />}
      <Badge variant={primary ? 'accent' : 'secondary'} className="w-fit">
        {primary ? 'Primary focus' : 'Also supported'}
      </Badge>
      <div
        className={cn(
          'mt-4 flex size-12 items-center justify-center rounded-xl',
          primary ? 'bg-white/15' : 'bg-primary/10 text-primary',
        )}
      >
        {primary ? <Building2 className="size-6" /> : <Layers className="size-6 text-primary" />}
      </div>
      <h3 className="mt-4 text-2xl font-bold">{config.label}</h3>
      <p className={cn('mt-2', primary ? 'text-primary-foreground/85' : 'text-muted-foreground')}>{config.tagline}</p>

      <div className="mt-5 space-y-2.5">
        <p className={cn('text-xs font-bold uppercase tracking-widest', primary ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          Project types
        </p>
        <div className="flex flex-wrap gap-2">
          {config.projectTypeOptions.map((opt) => (
            <span
              key={opt.value}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                primary ? 'bg-white/15' : 'bg-secondary text-secondary-foreground',
              )}
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className={cn('text-xs font-bold uppercase tracking-widest', primary ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          What it's called in your workspace
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {moduleEntries.map((entry) => (
            <div
              key={entry.title}
              className={cn('rounded-lg px-3 py-2', primary ? 'bg-white/10' : 'bg-secondary/60')}
            >
              {entry.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="One platform, tailored to your industry"
        description="Switch your workspace's terminology, project types, and module labels to match how your business actually talks — without switching software."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <IndustryCard config={INDUSTRY_CONFIGS.construction} primary />
          <IndustryCard config={INDUSTRY_CONFIGS.interior_design} primary={false} />
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground">Not sure which fits? Every plan supports both — switch anytime.</p>
          <div className="mt-4">
            <Button size="lg" variant="accent" className="shadow-lg shadow-accent/30" asChild>
              <Link to="/request-demo">
                Request Demo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
