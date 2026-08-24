import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CheckCircle2, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FAQS, PLANS, PRICING_COMPARISON_GROUPS, type BillingPeriod } from '../content'
import { PageHero, SectionHeading } from '../components/shared'

function BillingToggle({ period, onChange }: { period: BillingPeriod; onChange: (p: BillingPeriod) => void }) {
  return (
    <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      {(['monthly', 'yearly'] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            period === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            'relative flex flex-col rounded-2xl border p-6',
            plan.highlighted
              ? 'border-transparent bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 lg:-translate-y-3 lg:scale-105'
              : 'border-border bg-card shadow-sm',
          )}
        >
          {plan.highlighted && (
            <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
              Most Popular
            </Badge>
          )}
          <p className="font-semibold">{plan.name}</p>
          <p className={cn('mt-1 text-sm', plan.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
            {plan.description}
          </p>
          <p className="mt-3 text-3xl font-bold">
            {plan.price[period]}
            <span className={cn('text-sm font-normal', plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              {plan.period[period]}
            </span>
          </p>
          {period === 'yearly' && plan.yearlyNote && (
            <p className={cn('mt-0.5 text-xs', plan.highlighted ? 'text-primary-foreground/70' : 'text-success')}>
              {plan.yearlyNote}
            </p>
          )}
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', plan.highlighted ? 'text-accent' : 'text-success')} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            variant={plan.highlighted ? 'accent' : 'outline'}
            className={cn('mt-6 w-full', plan.highlighted && 'shadow-md shadow-black/10')}
            asChild
          >
            {plan.cta.to ? <Link to={plan.cta.to}>{plan.cta.label}</Link> : <a href={plan.cta.href}>{plan.cta.label}</a>}
          </Button>
        </div>
      ))}
    </div>
  )
}

function ComparisonCell({ value }: { value: boolean }) {
  return value ? <Check className="mx-auto size-4 text-success" /> : <Minus className="mx-auto size-4 text-muted-foreground/40" />
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="px-5 py-4 text-left font-semibold">Feature</th>
            {PLANS.map((plan) => (
              <th key={plan.name} className={cn('px-5 py-4 text-center font-semibold', plan.highlighted && 'text-primary')}>
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 bg-secondary/10">
            <td className="px-5 py-3.5 font-medium">Users included</td>
            {PLANS.map((plan) => (
              <td key={plan.name} className="px-5 py-3.5 text-center font-medium">
                {plan.maxUsers.replace(/ users?$/, '')}
              </td>
            ))}
          </tr>
          {PRICING_COMPARISON_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <tr className="border-b border-border/60 bg-secondary/30">
                <td colSpan={4} className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </td>
              </tr>
              {group.rows.map((row, i) => (
                <tr key={row.label} className={cn(i % 2 === 1 && 'bg-secondary/10')}>
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
      <PageHero eyebrow="Pricing" title="Simple, transparent pricing" description="Start free. Upgrade whenever your team grows." />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <BillingToggle period={period} onChange={setPeriod} />
        <PricingCards period={period} />
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHeading eyebrow="Compare" title="Every module, side by side" description="This is the exact module access each plan unlocks in the product — not a simplified summary." />
          <ComparisonTable />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading eyebrow="Billing FAQ" title="Questions about pricing" />
        <div className="space-y-2.5">
          {billingFaqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-border bg-card p-4.5 shadow-sm">
              <p className="font-semibold">{faq.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/faq">See all FAQs</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
