import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FEATURES } from '../content'
import { PageHero } from '../components/shared'
import { colorTheme } from '../palette'

function FeatureSpotlight({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const reversed = index % 2 === 1
  const theme = colorTheme(index)
  return (
    <motion.div
      initial={{ opacity: 0, x: reversed ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('flex flex-col items-center gap-8 lg:flex-row', reversed && 'lg:flex-row-reverse')}
    >
      <div className="flex-1 space-y-4">
        <div className={cn('flex size-12 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3', theme.iconBg, theme.icon)}>
          <feature.icon className="size-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>
        <p className="text-sm text-muted-foreground/80">{feature.detail}</p>
      </div>
      <div className="flex-1">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-8 shadow-lg', theme.chipBg, 'to-secondary/10')}
        >
          <div className={cn('absolute -right-8 -top-8 size-32 rounded-full blur-2xl', theme.iconBg)} />
          <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
            <feature.icon className={cn('size-16', theme.icon, 'opacity-30')} strokeWidth={1.2} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything your business needs, in one place"
        description="No more juggling spreadsheets, WhatsApp groups, and paper site diaries — every workflow, connected."
      />

      <section className="mx-auto max-w-5xl space-y-14 px-6 pb-16">
        {FEATURES.map((feature, i) => (
          <FeatureSpotlight key={feature.title} feature={feature} index={i} />
        ))}
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Every plan includes the essentials</h2>
        <div className="mx-auto mt-5 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {['Role-based access', 'Excel import', 'Cloud file storage', 'Multi-project tracking', 'Real-time dashboards', 'Mobile-friendly'].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm shadow-sm">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary">See it in your plan</Badge>
          </div>
          <div className="mt-5">
            <Button size="lg" variant="accent" className="shadow-lg shadow-accent/30" asChild>
              <Link to="/pricing">
                View pricing <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
