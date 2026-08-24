import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQS, type Faq } from '../content'
import { PageHero } from '../components/shared'

const CATEGORIES: Faq['category'][] = ['General', 'Billing', 'Data & Security']

function FaqGroup({ category }: { category: Faq['category'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const items = FAQS.filter((f) => f.category === category)

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{category}</p>
      <div className="space-y-2">
        {items.map((faq, i) => {
          const open = openIndex === i
          return (
            <div
              key={faq.question}
              className={cn('rounded-xl border transition-colors', open ? 'border-primary/30 bg-primary/5' : 'border-border bg-card')}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-4.5 py-3.5 text-left text-sm font-semibold"
              >
                {faq.question}
                <ChevronDown className={cn('size-4 shrink-0 text-primary transition-transform', open && 'rotate-180')} />
              </button>
              {open && <p className="px-4.5 pb-3.5 text-sm text-muted-foreground">{faq.answer}</p>}
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
      <PageHero eyebrow="FAQ" title="Frequently asked questions" description="Everything you need to know before getting started." />

      <section className="mx-auto max-w-3xl space-y-8 px-6 pb-16">
        {CATEGORIES.map((category) => (
          <FaqGroup key={category} category={category} />
        ))}
      </section>
    </>
  )
}
