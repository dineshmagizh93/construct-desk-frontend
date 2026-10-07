import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePayments } from '@/features/payments/api'
import { STATUS_COLORS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRaiseInvoice } from '../billing-api'
import type { Contract } from '../types'

type Row = Contract & { projectName?: string }

interface ContractBillingDialogProps {
  contract: Row | null
  onOpenChange: (open: boolean) => void
}

// The wrapper only mounts the body (and so only fetches invoices) while a contract is open.
export function ContractBillingDialog({ contract, onOpenChange }: ContractBillingDialogProps) {
  if (!contract) return null
  return <BillingBody contract={contract} onOpenChange={onOpenChange} />
}

function BillingBody({ contract, onOpenChange }: { contract: Row; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<'percent' | 'amount'>('percent')
  const [value, setValue] = useState('')
  const [retention, setRetention] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  const canView = usePermission('payments', 'view')
  const canRaise = usePermission('payments', 'create')
  const { data: payments = [] } = usePayments()
  const raise = useRaiseInvoice(contract.id)

  const invoices = useMemo(() => payments.filter((p) => p.contractId === contract.id), [payments, contract.id])
  const billed = invoices.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, contract.amount - billed)
  const isClientContract = contract.type !== 'Purchase Order'
  const billable = isClientContract && contract.status === 'approved' && contract.amount > 0

  const preview = value ? (mode === 'percent' ? Math.round((contract.amount * Number(value)) / 100) : Math.round(Number(value))) : 0
  const overBilling = preview > remaining

  const submit = async () => {
    if (!value || raise.isPending) return
    await raise.mutateAsync({
      ...(mode === 'percent' ? { percent: Number(value) } : { amount: Number(value) }),
      retentionPercent: retention ? Number(retention) : undefined,
      dueDate: dueDate || undefined,
      description: description.trim() || undefined,
    })
    setValue('')
    setDescription('')
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{contract.title}</DialogTitle>
            <Badge variant="outline">{contract.type}</Badge>
            <Badge variant={STATUS_COLORS[contract.status] ?? 'secondary'}>{contract.status}</Badge>
          </div>
          <DialogDescription>
            {contract.party || '—'} · {contract.projectName}
          </DialogDescription>
        </DialogHeader>

        {!isClientContract ? (
          <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
            This is a purchase order — the vendor bills you for it, so there is nothing to invoice. Client invoices are raised from client contracts.
          </p>
        ) : !canView ? (
          <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">You do not have access to invoices, so billing is not shown.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 rounded-md bg-secondary p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Contract value</p>
                <p className="font-semibold">{formatCurrency(contract.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Billed so far</p>
                <p className="font-semibold">{formatCurrency(billed)}</p>
                <p className="text-xs text-muted-foreground">
                  {contract.amount > 0 ? Math.round((billed / contract.amount) * 100) : 0}% in {invoices.length} invoice{invoices.length === 1 ? '' : 's'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Left to bill</p>
                <p className="font-semibold">{formatCurrency(remaining)}</p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.invoiceNumber}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(p.amount)}
                        {p.retentionPercent > 0 && <span className="ml-1 text-xs text-muted-foreground">({p.retentionPercent}% retention)</span>}
                      </TableCell>
                      <TableCell>{formatDate(p.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[p.status] ?? 'secondary'}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        No invoices raised against this contract yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {contract.status !== 'approved' && <p className="text-xs text-muted-foreground">Approve this contract to start billing against it.</p>}

            {billable && canRaise && remaining > 0 && (
              <div className="space-y-2 rounded-md border border-border p-3">
                <p className="text-sm font-medium">Raise an invoice</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bill by</Label>
                    <Select value={mode} onValueChange={(v) => setMode(v as 'percent' | 'amount')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% of contract</SelectItem>
                        <SelectItem value="amount">Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{mode === 'percent' ? 'Percentage' : 'Amount (₹)'}</Label>
                    <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Retention held (%)</Label>
                    <Input type="number" step="0.5" value={retention} onChange={(e) => setRetention(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Due date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-1 sm:col-span-4">
                    <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Slab completion — Block A" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-xs ${overBilling ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {preview > 0
                      ? overBilling
                        ? `${formatCurrency(preview)} is more than the ${formatCurrency(remaining)} left to bill.`
                        : `This bills ${formatCurrency(preview)}. Due in 30 days if no date is set.`
                      : 'Bills against the contract value; you can never bill more than it is worth.'}
                  </p>
                  <Button onClick={submit} disabled={!value || preview <= 0 || overBilling || raise.isPending}>
                    <Receipt className="size-4" /> Raise invoice
                  </Button>
                </div>
              </div>
            )}
            {billable && canRaise && remaining === 0 && <p className="text-xs text-muted-foreground">This contract is fully billed.</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
