import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { useStockTransactions, useRecordStockMovement } from '../stock-api'
import type { InventoryItem, StockTransactionType } from '../types'

const MOVEMENT_TYPES = [
  { label: 'Received (GRN)', value: 'received' },
  { label: 'Issued to site', value: 'issued' },
  { label: 'Returned', value: 'returned' },
  { label: 'Adjustment (+/−)', value: 'adjustment' },
] as const

const TYPE_LABEL: Record<StockTransactionType, string> = {
  opening: 'Opening',
  received: 'Received',
  issued: 'Issued',
  returned: 'Returned',
  adjustment: 'Adjustment',
}

interface StockLedgerDialogProps {
  item: InventoryItem | null
  onOpenChange: (open: boolean) => void
}

export function StockLedgerDialog({ item, onOpenChange }: StockLedgerDialogProps) {
  const [type, setType] = useState<(typeof MOVEMENT_TYPES)[number]['value']>('received')
  const [quantity, setQuantity] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const { data: transactions = [], isLoading } = useStockTransactions(item?.id)
  const recordMutation = useRecordStockMovement(item?.id ?? '')

  if (!item) return null

  const received = transactions.filter((t) => t.quantity > 0 && t.type !== 'opening').reduce((sum, t) => sum + t.quantity, 0)
  const issued = transactions.filter((t) => t.quantity < 0).reduce((sum, t) => sum - t.quantity, 0)
  const unit = item.unit || 'units'
  const canSubmit = !!quantity && Number(quantity) !== 0 && !recordMutation.isPending

  const record = async () => {
    if (!canSubmit) return
    await recordMutation.mutateAsync({
      type,
      quantity: Number(quantity),
      date: date || undefined,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    setQuantity('')
    setReference('')
    setNotes('')
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{item.name}</DialogTitle>
            {item.category && <Badge variant="outline">{item.category}</Badge>}
          </div>
          <DialogDescription>Stock ledger — every receipt, issue and adjustment, with the running balance.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-md bg-secondary p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">In stock</p>
            <p className="font-semibold">
              {item.quantity} {unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received (excl. opening)</p>
            <p className="font-semibold">
              {received} {unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Issued / written off</p>
            <p className="font-semibold">
              {issued} {unit}
            </p>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell>
                    <Badge variant={t.quantity < 0 ? 'warning' : 'secondary'}>{TYPE_LABEL[t.type] ?? t.type}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${t.quantity < 0 ? 'text-destructive' : 'text-success'}`}>
                    {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                  </TableCell>
                  <TableCell className="text-right">{t.balanceAfter}</TableCell>
                  <TableCell className="text-muted-foreground">{t.reference || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{t.notes || '—'}</TableCell>
                </TableRow>
              ))}
              {!isLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    No stock movements yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Movement</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Quantity ({unit})</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Challan / PO no.</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Supplier, issued to whom, reason…" />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={record} disabled={!canSubmit}>
              <Plus className="size-4" /> Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
