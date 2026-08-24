import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STEPS } from '../content'
import { PageHero } from '../components/shared'
import { colorTheme } from '../palette'

export function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Up and running in four steps"
        description="From sign-up to your first invoice — no lengthy onboarding calls required."
      />

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="relative space-y-6">
          <div className="absolute bottom-0 left-6 top-6 hidden w-px bg-gradient-to-b from-primary via-border to-transparent sm:block" />
          {STEPS.map((step, i) => (
            <div key={step.title} className={cn('relative flex flex-col gap-4 sm:flex-row', i % 2 === 1 && '')}>
              <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-lg', colorTheme(i).bar)}>
                {i + 1}
              </div>
              <div className="flex-1 rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-lg font-bold">{step.title}</p>
                <p className="mt-1.5 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="accent" className="shadow-lg shadow-accent/30" asChild>
            <Link to="/request-demo">
              Request Demo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
