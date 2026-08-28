import { CheckCircle2 } from 'lucide-react'
import { STEPS } from '../content'
import { PageCta, PageHero } from '../components/shared'

const AFTER = [
  { title: 'Sales', body: 'Owns leads and follow-ups. Does not see payroll or every site photo.' },
  { title: 'Site engineer', body: 'Logs progress, labour, and materials from the field.' },
  { title: 'Accounts', body: 'Raises invoices and watches budget vs spend as costs land.' },
  { title: 'Leadership', body: 'Reads one dashboard instead of chasing five WhatsApp groups.' },
]

export function HowItWorksPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="How it works"
        title="Live in four steps — not a six-week rollout"
        description="Workspaces are set up after a demo. From there, your team can log real work the same week."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <ol className="grid gap-4 lg:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-card p-7">
              <p className="font-display text-xs font-semibold tracking-[0.16em] text-accent">0{i + 1}</p>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">{step.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
              <ul className="mt-5 space-y-2">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Who uses it day to day</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Role-based access is built in. The same project record looks different depending on who opens it.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AFTER.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        title="We’ll set the workspace up with you"
        description="No self-serve maze. After the demo, you get an admin login and we help you invite the first team."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
        secondary={{ label: 'View pricing', to: '/pricing' }}
      />
    </>
  )
}
