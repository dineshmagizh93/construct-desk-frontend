import { useState } from 'react'
import { Check, PackageCheck, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/features/auth/store'
import { useInventory } from '@/features/inventory/api'
import { useUserNameMap } from '@/features/users/hooks'
import { useVendorOptions } from '@/features/vendors/hooks'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate, formatRate } from '@/lib/utils'
import { useAddRequestItem, useDeleteRequestItem, useRequestAction } from '../api'
import { REQUEST_STATUS_VARIANT, type PurchaseRequestRow } from '../config'

const NO_STOCK_ITEM = '__none'

interface PurchaseRequestDialogProps {
  request: PurchaseRequestRow | null
  onOpenChange: (open: boolean) => void
}

export function PurchaseRequestDialog({ request, onOpenChange }: PurchaseRequestDialogProps) {
  const [stockItemId, setStockItemId] = useState(NO_STOCK_ITEM)
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [rate, setRate] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [poVendorId, setPoVendorId] = useState('')

  const me = useAuthStore((s) => s.user)
  const canEdit = usePermission('inventory', 'edit')
  const canCreatePo = usePermission('contracts', 'create')
  const { data: stockItems = [] } = useInventory()
  const userNames = useUserNameMap()
  const vendorOptions = useVendorOptions()

  const addItem = useAddRequestItem(request?.id ?? '')
  const deleteItem = useDeleteRequestItem(request?.id ?? '')
  const act = useRequestAction(request?.id ?? '')

  if (!request) return null

  const isAdmin = me?.role === 'admin' || me?.role === 'super_admin'
  const isOwn = !!me && request.createdById === me.id
  const editable = canEdit && (request.status === 'pending' || request.status === 'rejected')
  const canDecide = canEdit && request.status === 'pending' && (isAdmin || !isOwn)
  const unitFor = (inventoryItemId?: string | null) => stockItems.find((s) => s.id === inventoryItemId)

  const pickStockItem = (id: string) => {
    setStockItemId(id)
    const item = stockItems.find((s) => s.id === id)
    if (item) {
      setDescription(item.name)
      setUnit(item.unit ?? '')
      setRate(String(item.unitCost ?? ''))
    }
  }

  const resetItemForm = () => {
    setStockItemId(NO_STOCK_ITEM)
    setDescription('')
    setQuantity('')
    setUnit('')
    setRate('')
  }

  const submitItem = async () => {
    if (!description.trim() || !quantity || addItem.isPending) return
    await addItem.mutateAsync({
      inventoryItemId: stockItemId === NO_STOCK_ITEM ? undefined : stockItemId,
      description: description.trim(),
      quantity: Number(quantity),
      unit: unit.trim() || undefined,
      estimatedRate: rate ? Number(rate) : 0,
    })
    resetItemForm()
  }

  const close = (open: boolean) => {
    if (!open) {
      setRejecting(false)
      setNote('')
      setPoVendorId('')
      resetItemForm()
    }
    onOpenChange(open)
  }

  const run = async (action: 'approve' | 'reject' | 'create-po' | 'receive') => {
    await act.mutateAsync({ action, note: note.trim() || undefined, vendorId: poVendorId || undefined })
    close(false)
  }

  const creator = request.createdById ? (userNames[request.createdById] ?? 'a team member') : null
  const decider = request.decidedById ? (userNames[request.decidedById] ?? 'a team member') : null
  const needsVendor = request.status === 'approved' && !request.vendorId

  return (
    <Dialog open={!!request} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{request.title}</DialogTitle>
            <Badge variant={REQUEST_STATUS_VARIANT[request.status] ?? 'secondary'}>{request.status}</Badge>
          </div>
          <DialogDescription>
            {request.projectName}
            {creator ? ` · raised by ${creator}` : ''}
            {request.neededBy ? ` · needed by ${formatDate(request.neededBy)}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-56 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Est. Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.description}
                    {item.inventoryItemId && unitFor(item.inventoryItemId) && (
                      <span className="ml-1.5 text-xs text-muted-foreground">· stock item</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit ?? ''}
                  </TableCell>
                  <TableCell className="text-right">{formatRate(item.estimatedRate)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.estimatedRate)}</TableCell>
                  <TableCell>
                    {editable && (
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteItem.mutate(item.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {request.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    No items yet — add what the site needs below.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between rounded-md bg-secondary p-3 text-sm">
          <span className="text-muted-foreground">Estimated value</span>
          <span className="font-semibold">{formatCurrency(request.total)}</span>
        </div>

        {editable && (
          <div className="space-y-2 rounded-md border border-border p-3">
            <p className="text-sm font-medium">Add an item</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="space-y-1 sm:col-span-4">
                <Label className="text-xs text-muted-foreground">From stock (optional — receiving adds to this item's stock)</Label>
                <Select value={stockItemId} onValueChange={pickStockItem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_STOCK_ITEM}>Not a stock item / type below</SelectItem>
                    {stockItems.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.quantity} {s.unit} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Quantity</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="bags, tons…" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Est. rate (₹)</Label>
                <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
              <div className="flex items-end sm:col-start-4">
                <Button className="w-full" onClick={submitItem} disabled={!description.trim() || !quantity || addItem.isPending}>
                  <Plus className="size-4" /> Add
                </Button>
              </div>
            </div>
            {request.status === 'rejected' && (
              <p className="text-xs text-muted-foreground">Changing a rejected request sends it back for approval.</p>
            )}
          </div>
        )}

        {(decider || request.contract || request.receivedAt) && (
          <div className="space-y-1 rounded-md border border-border p-3 text-sm">
            {decider && request.decidedAt && (
              <p>
                <span className="text-muted-foreground">{request.status === 'rejected' ? 'Rejected' : 'Approved'} by </span>
                <span className="font-medium">{decider}</span> · {formatDate(request.decidedAt)}
                {request.decisionNote ? <span className="text-muted-foreground"> — {request.decisionNote}</span> : null}
              </p>
            )}
            {request.contract && (
              <p>
                <span className="text-muted-foreground">Purchase order: </span>
                <span className="font-medium">{request.contract.title}</span>
                <span className="text-muted-foreground"> (see Contracts &amp; POs)</span>
              </p>
            )}
            {request.receivedAt && (
              <p>
                <span className="text-muted-foreground">Received </span>
                {formatDate(request.receivedAt)}
              </p>
            )}
          </div>
        )}

        {request.status === 'pending' && canEdit && !canDecide && (
          <p className="text-xs text-muted-foreground">You raised this request, so someone else needs to approve it.</p>
        )}

        {rejecting && (
          <div className="space-y-2">
            <Textarea autoFocus placeholder="Why is this being rejected? (required)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button variant="destructive" size="sm" disabled={!note.trim() || act.isPending} onClick={() => run('reject')}>
                <X className="size-4" /> Confirm reject
              </Button>
            </div>
          </div>
        )}

        {!rejecting && canDecide && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejecting(true)} disabled={act.isPending}>
              <X className="size-4" /> Reject
            </Button>
            <Button onClick={() => run('approve')} disabled={act.isPending || request.items.length === 0}>
              <Check className="size-4" /> Approve
            </Button>
          </div>
        )}

        {request.status === 'approved' && canEdit && canCreatePo && (
          <div className="space-y-2">
            {needsVendor && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Order from (vendor)</Label>
                <Select value={poVendorId} onValueChange={setPoVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorOptions.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => run('create-po')} disabled={act.isPending || (needsVendor && !poVendorId)}>
                <ShoppingCart className="size-4" /> Create purchase order
              </Button>
            </div>
          </div>
        )}
        {request.status === 'approved' && canEdit && !canCreatePo && (
          <p className="text-xs text-muted-foreground">Approved — someone with contracts access needs to raise the purchase order.</p>
        )}

        {request.status === 'ordered' && canEdit && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">When the goods arrive, mark them received to add stock-linked items to inventory.</p>
            <Button onClick={() => run('receive')} disabled={act.isPending}>
              <PackageCheck className="size-4" /> Mark as received
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
