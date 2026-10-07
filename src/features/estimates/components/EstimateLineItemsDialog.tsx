import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileSignature, Plus, Printer, Trash2 } from 'lucide-react'
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
import { toast } from '@/hooks/use-toast'
import { usePermission } from '@/lib/permissions'
import { openPrintWindow } from '@/lib/printDocument'
import { usePrintCompany } from '@/lib/usePrintCompany'
import { formatCurrency, formatRate } from '@/lib/utils'
import { useCreateContractFromEstimate } from '../contract-api'
import { estimateBodyHtml } from '../estimateDocument'
import { useCreateEstimateLineItem, useDeleteEstimateLineItem } from '../line-items-api'
import type { Estimate } from '../types'

interface EstimateLineItemsDialogProps {
  estimate: Estimate | null
  onOpenChange: (open: boolean) => void
}

function lineTotal(item: { quantity: number; unitPrice: number; taxPercent: number }) {
  return item.quantity * item.unitPrice * (1 + item.taxPercent / 100)
}

export function EstimateLineItemsDialog({ estimate, onOpenChange }: EstimateLineItemsDialogProps) {
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [taxPercent, setTaxPercent] = useState('18')

  const createMutation = useCreateEstimateLineItem(estimate?.id ?? '')
  const deleteMutation = useDeleteEstimateLineItem(estimate?.id ?? '')
  const contractMutation = useCreateContractFromEstimate(estimate?.id ?? '')
  const navigate = useNavigate()
  const printCompany = usePrintCompany()
  // Both hooks run on every render (never short-circuited), as React requires.
  const canEditEstimates = usePermission('estimates', 'edit')
  const canCreateContracts = usePermission('contracts', 'create')
  const canCreateContract = canEditEstimates && canCreateContracts

  if (!estimate) return null

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

  const subtotal = estimate.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0)
  const tax = estimate.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice * (li.taxPercent / 100), 0)

  return (
    <Dialog open={!!estimate} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{estimate.title}</DialogTitle>
            {estimate.clientName && <Badge variant="outline">{estimate.clientName}</Badge>}
          </div>
          <DialogDescription>
            Bill of Quantities for this estimate. The estimate total stays in sync with these lines automatically.
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
            {estimate.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatRate(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{item.taxPercent}%</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(lineTotal(item))}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {estimate.lineItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  No BOQ line items yet — this estimate uses a flat amount ({formatCurrency(estimate.totalAmount)}).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="grid grid-cols-[1fr_5rem_7rem_5rem_auto] items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Excavation — foundation trench" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Qty</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rate (₹)</Label>
            <Input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">GST %</Label>
            <Input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
          <Button size="icon" onClick={addItem} disabled={createMutation.isPending || !description.trim() || !unitPrice}>
            <Plus className="size-4" />
          </Button>
        </div>

        {estimate.lineItems.length > 0 && (
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

        {estimate.contractId && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-success/40 bg-success/5 p-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-4 text-success" /> Contract created from this estimate
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/contracts')}>
              Open Contracts &amp; POs <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {estimate.status === 'approved' && !estimate.contractId && canCreateContract && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Approved. Raise a draft contract for {formatCurrency(estimate.totalAmount)}
              {estimate.projectId ? '.' : ' — a project will be created from this estimate too.'}
            </p>
            <Button size="sm" onClick={() => contractMutation.mutate()} disabled={contractMutation.isPending || !(estimate.totalAmount > 0)}>
              <FileSignature className="size-4" /> Create contract
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ok = openPrintWindow(`Estimate — ${estimate.title}`, estimateBodyHtml(estimate, printCompany))
              if (!ok) toast({ title: 'Allow pop-ups to print', description: 'Your browser blocked the print window.', variant: 'destructive' })
            }}
          >
            <Printer className="size-4" /> Print / PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
