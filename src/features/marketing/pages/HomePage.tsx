import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  HardHat,
  Truck,
  Building2,
  Layers,
  Quote,
  Star,
  TrendingUp,
  Target,
  Wallet,
  Users,
  Briefcase,
  Settings,
  FileText,
  Hammer,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { INDUSTRY_CONFIGS } from '@/lib/industry'
import { cn } from '@/lib/utils'
import { DIFFERENTIATORS, FEATURES, PLANS } from '../content'
import { GlowOrbs, DOT_GRID, SectionHeading, StatBar, TrustStrip } from '../components/shared'
import { IsometricSite } from '../components/IsometricSite'
import { colorTheme } from '../palette'

const HERO_STATS = [
  { value: '21', label: 'Built-in modules' },
  { value: '6', label: 'Role-based teams' },
  { value: '100%', label: 'Cloud-based' },
  { value: '1', label: 'Unified workspace' },
]

const TESTIMONIALS = [
  {
    quote: 'We replaced five spreadsheets and two WhatsApp groups. Every site update now lives in one place.',
    name: 'Rajesh K.',
    role: 'Project Director, MetroBuild Contractors',
  },
  {
    quote: 'From lead to invoice — our sales and accounts teams finally work off the same data.',
    name: 'Priya M.',
    role: 'Operations Head, Studio Forma Interiors',
  },
]

function FloatingStat({
  className,
  icon: Icon,
  tone,
  label,
  value,
  delay,
}: {
  className?: string
  icon: typeof HardHat
  tone: string
  label: string
  value: string
  delay?: string
}) {
  return (
    <div
      className={cn(
        'absolute z-20 flex animate-float items-center gap-2.5 rounded-xl border border-white/60 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-primary/10 backdrop-blur-md',
        className,
      )}
      style={{ animationDelay: delay }}
    >
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-4.5" />
      </div>
      <div className="text-left leading-tight">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  )
}

function HeroScene() {
  return (
    <div className="relative w-full max-w-xl animate-fade-up-delay-2">
      <div className="absolute inset-6 -z-10 rounded-full bg-gradient-to-br from-blue-400/25 via-violet-400/20 to-amber-300/25 blur-3xl" />
      <IsometricSite className="w-full drop-shadow-2xl" />
      <FloatingStat
        className="left-0 top-6 -rotate-2"
        icon={HardHat}
        tone="bg-emerald-500/15 text-emerald-600"
        label="Safety compliance"
        value="100% · 0 incidents"
      />
      <FloatingStat
        className="right-0 top-1/3 rotate-2"
        icon={TrendingUp}
        tone="bg-blue-500/15 text-blue-600"
        label="This week"
        value="+18% progress"
        delay="1.2s"
      />
      <FloatingStat
        className="bottom-10 left-2 rotate-1"
        icon={Truck}
        tone="bg-amber-500/15 text-amber-600"
        label="Live now"
        value="3 active sites"
        delay="2.1s"
      />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="marketing-hero-vivid relative overflow-hidden">
      <div className="blueprint-grid absolute inset-0 -z-20 opacity-60 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]" />
      <GlowOrbs />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-14 pt-14 text-center lg:flex-row lg:gap-8 lg:pb-18 lg:pt-20 lg:text-left">
        <div className="flex-1 space-y-7">
          <Badge
            variant="secondary"
            className="animate-fade-up gap-1.5 border border-primary/15 bg-white/70 py-1.5 pl-2.5 pr-3 shadow-sm backdrop-blur-sm"
          >
            <HardHat className="size-3.5 text-amber-500" /> Built for construction &amp; interior teams
          </Badge>
          <h1 className="animate-fade-up-delay-1 font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
            Build faster with <span className="marketing-gradient-text-vivid">every site</span> in one command center.
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
            Leads, projects, labour, materials, and finance — the complete CRM built for construction businesses that
            need clarity, not chaos.
          </p>
          <div className="animate-fade-up-delay-3 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Button size="lg" variant="accent" className="h-11 px-7 shadow-lg shadow-accent/30" asChild>
              <Link to="/request-demo">
                Request Demo <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 border-primary/20 bg-white/60 px-7 backdrop-blur-sm" asChild>
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground lg:justify-start">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" /> Setup in minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-success" /> Multi-tenant ready
            </span>
          </div>
        </div>
        <div className="flex flex-1 justify-center lg:justify-end">
          <HeroScene />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-14">
        <StatBar stats={HERO_STATS} />
      </div>
    </section>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

function FeaturesTeaser() {
  return (
    <section className="marketing-section-alt border-y border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Features" title="Everything your business needs, in one place" description="A taste of what's inside — every module is production-ready, not a placeholder." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.slice(0, 3).map((feature, i) => {
          const theme = colorTheme(i)
          return (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5',
                theme.ring,
              )}
            >
              <div
                className={cn(
                  'absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-100',
                  theme.bar,
                )}
              />
              <span className="text-xs font-bold text-muted-foreground/50">0{i + 1}</span>
              <div className={cn('mt-3 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', theme.iconBg, theme.icon)}>
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              <Link
                to="/features"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
              >
                Learn more <ArrowRight className="size-3.5" />
              </Link>
            </motion.div>
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 text-center"
      >
        <Button variant="outline" size="lg" asChild>
          <Link to="/features">
            Explore all features <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
      </div>
    </section>
  )
}

function ModulesTeaser() {
  const modules: { label: string; count: string; icon: LucideIcon }[] = [
    { label: 'CRM & Sales', count: '3', icon: Target },
    { label: 'Project Delivery', count: '5', icon: Building2 },
    { label: 'Pre-Construction', count: '2', icon: Hammer },
    { label: 'Resources', count: '4', icon: Users },
    { label: 'Finance', count: '3', icon: Wallet },
    { label: 'Operations', count: '2', icon: Briefcase },
    { label: 'Documents', count: '1', icon: FileText },
    { label: 'Settings', count: '1', icon: Settings },
  ]
  return (
    <section className="relative border-y border-border/60 bg-gradient-to-b from-primary/[0.04] via-secondary/40 to-secondary/20">
      <div className={cn('pointer-events-none absolute inset-0 opacity-30', DOT_GRID)} />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <SectionHeading
          eyebrow="Modules"
          title="21 modules, already built"
          description="Nothing here is a mockup. Every module ships with list views, forms, and role-based access."
          align="center"
        />
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4">
          {modules.map((mod, i) => {
            const theme = colorTheme(i)
            const Icon = mod.icon
            return (
              <motion.div
                key={mod.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={scaleIn}
                whileHover={{ y: -4, scale: 1.03 }}
                className={cn(
                  'group cursor-default rounded-xl border border-border/60 px-4 py-3.5 text-left shadow-sm transition-colors',
                  theme.chipBg,
                )}
              >
                <div className={cn('mb-2 flex size-9 items-center justify-center rounded-lg', theme.iconBg)}>
                  <Icon className={cn('size-4', theme.chipText)} />
                </div>
                <p className={cn('text-[10px] font-bold uppercase tracking-wider', theme.chipText)}>{mod.count} modules</p>
                <p className={cn('mt-1 text-sm font-semibold', theme.chipText)}>{mod.label}</p>
              </motion.div>
            )
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/modules">
              See every module <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function IndustriesTeaser() {
  const construction = INDUSTRY_CONFIGS.construction
  const interiorDesign = INDUSTRY_CONFIGS.interior_design
  return (
    <section className="marketing-section-tint">
      <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Industries" title="One platform, tailored to your industry" />
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-primary/85 p-7 text-primary-foreground shadow-xl shadow-primary/20">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <Badge variant="accent" className="w-fit">
            Primary focus
          </Badge>
          <div className="mt-4 flex size-12 items-center justify-center rounded-xl bg-white/15">
            <Building2 className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">{construction.label}</h3>
          <p className="mt-2 leading-relaxed text-primary-foreground/85">{construction.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" /> Site progress &amp; labour tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" /> BOQ, estimates &amp; contracts
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
          <Badge variant="secondary" className="w-fit">
            Also supported
          </Badge>
          <div className="mt-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">{interiorDesign.label}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{interiorDesign.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-success" /> Client approvals &amp; revisions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-success" /> Material &amp; vendor management
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" asChild>
          <Link to="/industries">
            Learn more <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="border-y border-border/60 bg-gradient-to-b from-card/60 to-primary/[0.03]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="Testimonials" title="Teams that switched to one workspace" />
        <div className="grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <div key={item.name} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Quote className="absolute right-6 top-6 size-8 text-primary/10" />
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingTeaser() {
  const growth = PLANS.find((p) => p.highlighted)!
  return (
    <section className="bg-gradient-to-b from-secondary/50 via-primary/[0.03] to-secondary/30">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free. Upgrade whenever your team grows."
        />
        <div className="relative mx-auto max-w-sm rounded-2xl border border-primary/20 bg-gradient-to-b from-primary to-primary/90 p-7 text-left text-primary-foreground shadow-2xl shadow-primary/25">
          <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
            Most Popular
          </Badge>
          <p className="font-display text-lg font-semibold">{growth.name}</p>
          <p className="mt-1 text-sm text-primary-foreground/80">{growth.description}</p>
          <p className="mt-4 font-display text-4xl font-bold">
            {growth.price.monthly}
            <span className="text-sm font-normal text-primary-foreground/70">{growth.period.monthly}</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-primary-foreground/85">
            {growth.features.slice(0, 4).map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="accent" className="mt-6 w-full shadow-md shadow-black/10" asChild>
            <Link to="/request-demo">Request Demo</Link>
          </Button>
        </div>
        <div className="mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/pricing">
              See full pricing &amp; plans <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function WhyUsSection() {
  return (
    <section className="marketing-section-alt border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading eyebrow="Why ConstructDesk" title="Built different, on purpose" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DIFFERENTIATORS.map((item, i) => {
          const theme = colorTheme(i + 3)
          return (
            <div
              key={item.title}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', theme.iconBg, theme.icon)}>
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="font-display font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[oklch(0.26_0.06_255)]">
      <div className="absolute left-1/4 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 size-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-16 text-center text-primary-foreground">
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ready to run your business from one place?
        </h2>
        <p className="max-w-md text-base leading-relaxed text-primary-foreground/80">
          Set up your workspace in minutes — no credit card required to get started.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button size="lg" variant="accent" className="h-11 px-7 shadow-lg shadow-black/20" asChild>
            <Link to="/request-demo">
              Request Demo <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 border-primary-foreground/30 bg-transparent px-7 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            asChild
          >
            <Link to="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <HeroSection />
      <TrustStrip />
      <FeaturesTeaser />
      <ModulesTeaser />
      <IndustriesTeaser />
      <TestimonialsSection />
      <PricingTeaser />
      <WhyUsSection />
      <FinalCta />
    </>
  )
}
