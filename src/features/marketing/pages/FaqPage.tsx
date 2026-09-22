import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQS, type Faq } from '../content'
import { PageCta, PageHero } from '../components/shared'

const CATEGORIES: Faq['category'][] = ['General', 'Billing', 'Data & Security']

function FaqGroup({ category }: { category: Faq['category'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const groupId = useId()
  const items = FAQS.filter((f) => f.category === category)

  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">{category}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((faq, i) => {
          const open = openIndex === i
          return (
            <div key={faq.question}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${groupId}-${i}`}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
              >
                {faq.question}
                <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
              </button>
              <p id={`${groupId}-${i}`} hidden={!open} className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FaqPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="FAQ"
        title="Questions teams ask before they switch"
        description="Straightforward answers about getting started, choosing a plan, and keeping your business data secure."
      />

      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        {CATEGORIES.map((category) => (
          <FaqGroup key={category} category={category} />
        ))}
      </section>

      <PageCta
        title="Didn’t find it?"
        description="Email sales@constructdesk.in or request a demo and we’ll answer on the call."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
        secondary={{ label: 'View pricing', to: '/pricing' }}
      />
    </>
  )
}
