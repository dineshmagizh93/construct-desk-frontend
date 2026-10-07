import { cn } from '@/lib/utils'

export interface SummaryItem {
  label: string
  value: string
  hint?: string
  tone?: 'warning' | 'destructive' | 'success'
}

const TONE = { warning: 'text-warning', destructive: 'text-destructive', success: 'text-success' } as const

/** A compact row of headline figures above a list: totals the table itself cannot show at a glance. */
export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{item.label}</p>
          <p className={cn('truncate text-base font-semibold', item.tone && TONE[item.tone])}>{item.value}</p>
          {item.hint && <p className="truncate text-xs text-muted-foreground">{item.hint}</p>}
        </div>
      ))}
    </div>
  )
}
