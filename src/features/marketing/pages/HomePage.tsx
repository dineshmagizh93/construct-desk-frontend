import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  FolderOpen,
  Hammer,
  Layers,
  Quote,
  ShieldCheck,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { INDUSTRY_CONFIGS } from '@/lib/industry'
import { cn } from '@/lib/utils'
import { MODULE_GROUPS, MODULE_KEYS } from '@/lib/modules'
import { DIFFERENTIATORS, FEATURES, PLANS, STEPS } from '../content'
import { ProductPreview } from '../components/ProductPreview'
import { SectionHeading, TrustStrip } from '../components/shared'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="marketing-hero-grid-light pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-14">
        <div className="max-w-2xl">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Construction CRM
          </p>
          <h1 className="animate-fade-up-delay-1 mt-4 font-display text-[2.2rem] font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-[3.15rem]">
            Every site, crew, and rupee — in one workspace.
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ConstructDesk replaces spreadsheets and WhatsApp threads with a single system for leads, projects,
            labour, materials, and finance.
          </p>
          <div className="animate-fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="accent" className="h-12 rounded-lg px-7 text-[15px]" asChild>
              <Link to="/request-demo">
                Request a demo <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-lg px-7 text-[15px]" asChild>
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground" /> Setup in minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-foreground" /> Role-based access
            </span>
          </div>
        </div>
        <div className="animate-fade-up-delay-3 mt-10">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}

function ProofBar() {
  const items = [
    { value: String(MODULE_KEYS.length), label: 'Production modules' },
    { value: '6', label: 'Built-in roles' },
    { value: '2', label: 'Industry modes' },
    { value: 'GST', label: 'India-ready billing' },
  ]
  return (
    <section className="border-b border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="bg-card px-6 py-7 text-center">
              <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  const stages = [
    { n: '01', title: 'Win the work', body: 'Capture leads, follow up, and convert them into signed projects.' },
    { n: '02', title: 'Price it right', body: 'Build estimates and BOQs, then lock the contract before a brick is laid.' },
    { n: '03', title: 'Run the site', body: 'Track labour, materials, tasks, and daily progress with photos from the field.' },
    { n: '04', title: 'Collect & close', body: 'Invoice against progress, watch budget vs spend, and keep documents in one vault.' },
  ]
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="The operating system"
          title="From first enquiry to final invoice"
          description="One record follows the job. Sales, site, and accounts stop working from different versions of the truth."
          align="left"
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.n}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              className="relative"
            >
              <p className="font-display text-sm font-semibold tracking-[0.18em] text-accent">{stage.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
              {i < stages.length - 1 && (
                <span className="pointer-events-none absolute right-[-1.1rem] top-8 hidden h-px w-8 bg-border lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PipelineTile() {
  const stages = [
    { label: 'New', count: 8, width: '18%' },
    { label: 'Site visit', count: 6, width: '28%' },
    { label: 'Quoted', count: 5, width: '46%' },
    { label: 'Won', count: 4, width: '72%' },
  ]
  return (
    <div className="mt-6 space-y-3">
      {stages.map((stage) => (
        <div key={stage.label}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="font-medium">{stage.label}</span>
            <span className="text-muted-foreground">{stage.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: stage.width }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SiteTile() {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Lakeview Towers · Block B</p>
        <span className="text-xs font-semibold text-foreground">72%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-[72%] rounded-full bg-accent" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['Crew on site', 'Materials', 'Photos'].map((label, i) => (
          <div key={label} className="rounded-lg border border-border bg-background px-2.5 py-2">
            <p className="font-display text-sm font-semibold">{['18', '4 low', '12'][i]}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinanceTile() {
  return (
    <div className="mt-5">
      <p className="font-display text-2xl font-semibold tracking-tight">₹68.5 L</p>
      <p className="text-xs text-muted-foreground">Outstanding across 7 invoices</p>
      <div className="mt-4 space-y-2">
        {[
          { name: 'Greenfield — RA 04', amount: '₹18.2 L' },
          { name: 'MetroBuild — Mobilisation', amount: '₹12.0 L' },
        ].map((row) => (
          <div key={row.name} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{row.name}</span>
            <span className="font-medium">{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AccessTile() {
  const roles = ['Project Manager', 'Site Engineer', 'Accountant', 'Sales']
  return (
    <div className="mt-5 flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <span key={role} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium">
          {role}
        </span>
      ))}
      <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">+2 more</span>
    </div>
  )
}

function ProductBento() {
  const tiles: {
    title: string
    description: string
    icon: LucideIcon
    span: string
    body: ReactNode
  }[] = [
    {
      title: FEATURES[0].title,
      description: FEATURES[0].description,
      icon: Target,
      span: 'lg:col-span-7',
      body: <PipelineTile />,
    },
    {
      title: FEATURES[1].title,
      description: FEATURES[1].description,
      icon: Building2,
      span: 'lg:col-span-5',
      body: <SiteTile />,
    },
    {
      title: FEATURES[2].title,
      description: FEATURES[2].description,
      icon: Wallet,
      span: 'lg:col-span-4',
      body: <FinanceTile />,
    },
    {
      title: FEATURES[4].title,
      description: FEATURES[4].description,
      icon: ShieldCheck,
      span: 'lg:col-span-4',
      body: <AccessTile />,
    },
    {
      title: FEATURES[3].title,
      description: FEATURES[3].description,
      icon: FolderOpen,
      span: 'lg:col-span-4',
      body: (
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Drawings, permits, and contracts live on Cloudflare R2 — not in someone&apos;s WhatsApp.
        </p>
      ),
    },
  ]

  return (
    <section className="marketing-section-alt border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Product"
          title="A workspace that looks like the job, not a generic CRM"
          description="Each surface below is a real module in ConstructDesk — lists, forms, and permissions included."
          align="left"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              className={cn(
                'rounded-2xl border border-border bg-card p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)]',
                tile.span,
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                <tile.icon className="size-4 text-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{tile.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tile.description}</p>
              {tile.body}
            </motion.div>
          ))}
        </div>
        <div className="mt-8">
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link to="/features">
              Explore all features <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const MODULE_GROUP_ICONS: Record<string, LucideIcon> = {
  Overview: Building2,
  'CRM & Sales': Target,
  'Project Delivery': Hammer,
  'Pre-Construction': FileText,
  Resources: Layers,
  Finance: Wallet,
  Operations: FolderOpen,
  System: ShieldCheck,
}

function ModulesSection() {
  const groups = MODULE_GROUPS.filter((g) => g.label !== 'System')
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Modules"
              title={`${MODULE_KEYS.length} modules. Already shipped.`}
              description="Nothing on this page is a mockup. Every group below is live in the product, with role-based access."
              align="left"
            />
            <Button variant="outline" size="lg" className="h-11 px-6" asChild>
              <Link to="/modules">
                See every module <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {groups.map((group) => {
              const Icon = MODULE_GROUP_ICONS[group.label] ?? FileText
              return (
                <div key={group.label} className="flex items-start gap-4 px-5 py-4">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display text-sm font-semibold">{group.label}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {group.modules.length} modules
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {group.modules.map((m) => m.label).join(' · ')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section className="marketing-section-alt border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Live in four steps"
          description="No lengthy onboarding programme. Create a workspace, invite the team, and start logging work."
        />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-card p-6">
              <span className="font-display text-xs font-semibold tracking-[0.16em] text-accent">0{i + 1}</span>
              <h3 className="mt-3 font-display text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link to="/how-it-works">
              Walk through the product <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function IndustriesSection() {
  const construction = INDUSTRY_CONFIGS.construction
  const interiorDesign = INDUSTRY_CONFIGS.interior_design
  const cards = [
    {
      label: construction.label,
      tagline: construction.tagline,
      kicker: 'Primary focus',
      points: ['Site progress & labour tracking', 'BOQ, estimates & contracts'],
      featured: true,
    },
    {
      label: interiorDesign.label,
      tagline: interiorDesign.tagline,
      kicker: 'Also supported',
      points: ['Client approvals & revisions', 'Material & vendor management'],
      featured: false,
    },
  ]
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Industries"
          title="One platform. Two ways of working."
          description="Switch terminology between construction and interior design without changing software."
          align="left"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.label}
              className={cn(
                'rounded-2xl border bg-card p-8',
                card.featured ? 'border-accent/50 ring-1 ring-accent/20' : 'border-border',
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{card.kicker}</p>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{card.label}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{card.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {card.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-foreground" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link to="/industries">
              Compare industries <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const TESTIMONIALS = [
  {
    quote: 'We replaced five spreadsheets and two WhatsApp groups. Every site update now lives in one place.',
    name: 'Rajesh K.',
    role: 'Project Director',
    company: 'MetroBuild Contractors',
    initials: 'RK',
  },
  {
    quote: 'From lead to invoice — our sales and accounts teams finally work off the same data.',
    name: 'Priya M.',
    role: 'Operations Head',
    company: 'Studio Forma Interiors',
    initials: 'PM',
  },
]

function TestimonialsSection() {
  return (
    <section className="marketing-section-alt border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="Teams" title="Built for the way Indian sites actually run" />
        <div className="grid gap-4 lg:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="rounded-2xl border border-border bg-card p-8">
              <Quote className="size-6 text-accent" strokeWidth={1.5} />
              <blockquote className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-balance">
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold">
                  {item.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {item.role}, {item.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Straightforward plans"
          description="Start free. Upgrade when the crew grows. Yearly billing includes two months free."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-7',
                plan.highlighted ? 'border-accent/50 ring-1 ring-accent/25' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">{plan.name}</p>
                {plan.highlighted && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
              <p className="mt-5 font-display text-3xl font-semibold tracking-tight">
                {plan.price.monthly}
                <span className="text-sm font-normal text-muted-foreground">{plan.period.monthly}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlighted ? 'accent' : 'outline'} className="mt-6 w-full" asChild>
                {plan.cta.to ? <Link to={plan.cta.to}>{plan.cta.label}</Link> : <a href={plan.cta.href}>{plan.cta.label}</a>}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link to="/pricing">
              Compare every module <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="Why ConstructDesk" title="Built for this industry, not adapted to it" align="left" />
        <div className="grid gap-10 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                <item.icon className="size-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Get started</p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Put every site on the same page.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Request a walkthrough. We&apos;ll map ConstructDesk to how your projects actually run — no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="accent" className="h-12 rounded-lg px-7 text-[15px]" asChild>
            <Link to="/request-demo">
              Request a demo <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 rounded-lg px-7 text-[15px]" asChild>
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
      <ProofBar />
      <TrustStrip />
      <WorkflowSection />
      <ProductBento />
      <ModulesSection />
      <StepsSection />
      <IndustriesSection />
      <TestimonialsSection />
      <PricingSection />
      <WhySection />
      <FinalCta />
    </>
  )
}
