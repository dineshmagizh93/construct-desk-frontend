import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useCreateLineItem, useDeleteLineItem } from '../line-items-api'
import { netDue, retentionAmount, useReleaseRetention } from '../retention'
import type { Payment } from '../types'

interface PaymentLineItemsDialogProps {
  payment: Payment | null
  onOpenChange: (open: boolean) => void
}

function lineTotal(item: { quantity: number; unitPrice: number; taxPercent: number }) {
  return item.quantity * item.unitPrice * (1 + item.taxPercent / 100)
}

export function PaymentLineItemsDialog({ payment, onOpenChange }: PaymentLineItemsDialogProps) {
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [taxPercent, setTaxPercent] = useState('18')

  const createMutation = useCreateLineItem(payment?.id ?? '')
  const deleteMutation = useDeleteLineItem(payment?.id ?? '')
  const releaseMutation = useReleaseRetention(payment?.id ?? '')
  const canEdit = usePermission('payments', 'edit')

  if (!payment) return null

  const addItem = async () => {
    if (!description.trim() || !unitPrice || createMutation.isPending) return
    await createMutation.mutateAsync({
      description: description.trim(),
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      taxPercent: Number(taxPercent) || 0,
    })
    setDescription('')
    setQuantity('1')
    setUnitPrice('')
  }

  const subtotal = payment.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0)
  const tax = payment.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice * (li.taxPercent / 100), 0)

  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{payment.invoiceNumber}</DialogTitle>
            {payment.clientName && <Badge variant="outline">{payment.clientName}</Badge>}
          </div>
          <DialogDescription>
            Itemized GST breakdown for this invoice. The invoice amount stays in sync with these lines automatically.
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">GST %</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payment.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{item.taxPercent}%</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(lineTotal(item))}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {payment.lineItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  No line items yet — this invoice uses a flat amount ({formatCurrency(payment.amount)}).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="grid grid-cols-[1fr_5rem_7rem_5rem_auto] items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. RCC slab work — 3rd floor" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Qty</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rate (₹)</Label>
            <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">GST %</Label>
            <Input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
          <Button size="icon" onClick={addItem} disabled={createMutation.isPending || !description.trim() || !unitPrice}>
            <Plus className="size-4" />
          </Button>
        </div>

        {payment.lineItems.length > 0 && (
          <div className="ml-auto w-56 space-y-1 rounded-md bg-secondary p-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal + tax)}</span>
            </div>
          </div>
        )}

        {payment.retentionPercent > 0 && (
          <div className="space-y-2 rounded-md border border-border p-3 text-sm">
            <p className="font-medium">Retention ({payment.retentionPercent}%)</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Bill amount (gross)</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Less retention held by client</span>
              <span>− {formatCurrency(retentionAmount(payment))}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold">
              <span>Net payable now</span>
              <span>{formatCurrency(netDue(payment))}</span>
            </div>

            {payment.retentionReleasedAt ? (
              <p className="text-xs text-muted-foreground">
                Retention of {formatCurrency(retentionAmount(payment))} was released on {formatDate(payment.retentionReleasedAt)}.
              </p>
            ) : payment.status === 'paid' ? (
              canEdit && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(retentionAmount(payment))} is still held. Release it once the defects liability period is over and the client has paid it.
                  </p>
                  <Button size="sm" onClick={() => releaseMutation.mutate()} disabled={releaseMutation.isPending}>
                    Release retention
                  </Button>
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground">Mark the invoice as paid before the retention can be released.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
