import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { ProjectFinancials } from '../types'

function Figure({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good' | 'bad' }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${tone === 'bad' ? 'text-destructive' : tone === 'good' ? 'text-success' : ''}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Billing, cash and cost for one project — only sent by the server to people who may see invoices. */
export function ProjectFinancialsCard({ financials: f }: { financials: ProjectFinancials }) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Financial position</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {f.contractValue !== null && <Figure label="Contract value" value={formatCurrency(f.contractValue)} hint="Approved client contracts" />}
          <Figure label="Invoiced" value={formatCurrency(f.invoiced)} hint="Billed to the client" />
          <Figure label="Collected" value={formatCurrency(f.collected)} hint={`${formatCurrency(f.outstanding)} still to collect`} />
          <Figure label="Spent" value={formatCurrency(f.spent)} hint="Expenses, excluding rejected" />
          <Figure
            label="Billed margin"
            value={formatCurrency(f.billedMargin)}
            hint={f.marginPercent === null ? 'Nothing invoiced yet' : `${f.marginPercent}% of invoiced`}
            tone={f.billedMargin < 0 ? 'bad' : f.billedMargin > 0 ? 'good' : undefined}
          />
          <Figure
            label="Cash position"
            value={formatCurrency(f.cashPosition)}
            hint={f.cashPosition < 0 ? 'Spent more than collected' : 'Collected less spent'}
            tone={f.cashPosition < 0 ? 'bad' : f.cashPosition > 0 ? 'good' : undefined}
          />
        </div>
      </CardContent>
    </Card>
  )
}
