import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CheckCircle2, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FAQS, PLANS, PRICING_COMPARISON_GROUPS, type BillingPeriod } from '../content'
import { PageCta, PageHero, SectionHeading } from '../components/shared'

function BillingToggle({ period, onChange }: { period: BillingPeriod; onChange: (p: BillingPeriod) => void }) {
  return (
    <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1">
      {(['monthly', 'yearly'] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {p === 'monthly' ? 'Monthly' : 'Yearly'}
          {p === 'yearly' && (
            <Badge variant={period === 'yearly' ? 'accent' : 'secondary'} className="px-1.5 py-0 text-[10px]">
              2 months free
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
}

function PricingCards({ period }: { period: BillingPeriod }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            'relative flex flex-col rounded-2xl border bg-card p-7',
            plan.highlighted ? 'border-accent/50 ring-1 ring-accent/25' : 'border-border',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg font-semibold">{plan.name}</p>
            {plan.highlighted && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                Popular
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
          <p className="mt-5 font-display text-3xl font-semibold tracking-tight">
            {plan.price[period]}
            <span className="text-sm font-normal text-muted-foreground">{plan.period[period]}</span>
          </p>
          {period === 'yearly' && plan.yearlyNote && <p className="mt-1 text-xs text-muted-foreground">{plan.yearlyNote}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{plan.maxUsers}</p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted-foreground">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant={plan.highlighted ? 'accent' : 'outline'} className="mt-6 w-full" asChild>
            {plan.cta.to ? <Link to={plan.cta.to}>{plan.cta.label}</Link> : <a href={plan.cta.href}>{plan.cta.label}</a>}
          </Button>
        </div>
      ))}
    </div>
  )
}

function ComparisonCell({ value }: { value: boolean }) {
  return value ? <Check className="mx-auto size-4 text-foreground" /> : <Minus className="mx-auto size-4 text-muted-foreground/40" />
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            <th className="px-5 py-4 text-left font-semibold">Feature</th>
            {PLANS.map((plan) => (
              <th key={plan.name} className="px-5 py-4 text-center font-semibold">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-5 py-3.5 font-medium">Users included</td>
            {PLANS.map((plan) => (
              <td key={plan.name} className="px-5 py-3.5 text-center">
                {plan.maxUsers.replace(/ users?$/, '')}
              </td>
            ))}
          </tr>
          {PRICING_COMPARISON_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <tr className="border-b border-border bg-background">
                <td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 pl-7">{row.label}</td>
                  <td className="px-5 py-3">
                    <ComparisonCell value={row.starter} />
                  </td>
                  <td className="px-5 py-3">
                    <ComparisonCell value={row.growth} />
                  </td>
                  <td className="px-5 py-3">
                    <ComparisonCell value={row.enterprise} />
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const billingFaqs = FAQS.filter((f) => f.category === 'Billing')

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear plans. Exact module access."
        description="Start on a trial. Upgrade when the crew grows. Yearly billing includes two months free."
      >
        <div className="mt-6">
          <BillingToggle period={period} onChange={setPeriod} />
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <PricingCards period={period} />
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Compare"
            title="Every module, side by side"
            description="This table matches what the product actually unlocks — the same list used for plan gating."
            align="left"
          />
          <ComparisonTable />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading eyebrow="Billing" title="Questions about pricing" align="left" />
        <div className="space-y-3">
          {billingFaqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-border bg-card p-5">
              <p className="font-display font-semibold">{faq.question}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/faq">See all FAQs</Link>
          </Button>
        </div>
      </section>

      <PageCta
        title="We’ll recommend a plan on the demo"
        description="Bring your team size and the modules you need. No card required to start a trial."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
      />
    </>
  )
}
