import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAddReceipt, useDeleteReceipt } from '../receipts-api'
import { netDue, outstandingAmount } from '../retention'
import type { Payment } from '../types'

const today = () => new Date().toISOString().slice(0, 10)

/** Money received against one invoice in instalments: what has come in, what is still owed, and a form to record the next one. */
export function PaymentReceiptsSection({ payment }: { payment: Payment }) {
  const canEdit = usePermission('payments', 'edit')
  const canDelete = usePermission('payments', 'delete')
  const addMutation = useAddReceipt(payment.id)
  const deleteMutation = useDeleteReceipt(payment.id)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')

  const receipts = payment.receipts ?? []
  const received = payment.receivedAmount ?? 0
  const balance = outstandingAmount(payment)
  const settled = payment.status === 'paid'
  // Nothing to show on an untouched invoice that nobody here may record against.
  if (receipts.length === 0 && !canEdit) return null

  const record = async () => {
    const value = Number(amount)
    if (!value || value <= 0 || addMutation.isPending) return
    await addMutation.mutateAsync({ amount: value, date, method: method.trim() || undefined, reference: reference.trim() || undefined })
    setAmount('')
    setReference('')
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">Payments received</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(received)} of {formatCurrency(netDue(payment))} received
          {!settled && balance > 0 ? <span className="font-medium text-foreground"> · {formatCurrency(balance)} due</span> : null}
        </p>
      </div>

      {receipts.length > 0 && (
        <ul className="space-y-1">
          {receipts.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2">
              <span>
                {formatDate(r.date)} — <span className="font-medium">{formatCurrency(r.amount)}</span>
                {r.method ? <span className="text-muted-foreground"> · {r.method}</span> : null}
                {r.reference ? <span className="text-muted-foreground"> · {r.reference}</span> : null}
              </span>
              {canDelete && (
                <Button variant="ghost" size="icon-sm" title="Remove this payment" onClick={() => deleteMutation.mutate(r.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {settled && receipts.length === 0 && <p className="text-xs text-muted-foreground">This invoice is marked paid in full.</p>}

      {canEdit && !settled && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
            <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={balance > 0 ? String(balance) : ''} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Method</Label>
            <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank / UPI / Cheque" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Reference</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UTR / cheque no." />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={record} disabled={!amount || addMutation.isPending}>
              <Plus className="size-4" /> Record
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
