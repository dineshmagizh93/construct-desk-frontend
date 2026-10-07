import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { SummaryStrip } from '@/components/shared/SummaryStrip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { paymentsApi } from '@/features/payments/api'
import { netDue } from '@/features/payments/retention'
import { STATUS_COLORS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { clientBilling } from '../billing'

/** A client's account across the projects linked to them. Hidden from anyone who cannot open Payments. */
export function ClientBillingCard({ projectIds }: { projectIds: string[] }) {
  const canViewPayments = usePermission('payments', 'view')
  // Same query key as the Payments list, so the two share one cached fetch.
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.list, enabled: canViewPayments })
  const { invoices, summary } = useMemo(() => clientBilling(payments, projectIds), [payments, projectIds])

  if (!canViewPayments) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-4" /> Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices raised on this client&apos;s projects yet.</p>
        ) : (
          <>
            <SummaryStrip
              items={[
                { label: 'Outstanding', value: formatCurrency(summary.outstanding), hint: 'Net of retention' },
                { label: 'Overdue', value: formatCurrency(summary.overdueAmount), hint: `${summary.overdueCount} invoice${summary.overdueCount === 1 ? '' : 's'}`, tone: summary.overdueCount > 0 ? 'destructive' : undefined },
                { label: 'Collected', value: formatCurrency(summary.collected), tone: 'success' },
                { label: 'Retention held', value: formatCurrency(summary.retentionHeld) },
              ]}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Net due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(p.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[p.status] ?? 'secondary'}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(netDue(p))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
