import { useMemo, useState } from 'react'
import { Pencil, Plus, Ruler, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExpenses } from '@/features/expenses/api'
import { STATUS_COLORS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate, formatRate } from '@/lib/utils'
import { useMeasurements, useUpdateWorkOrder, useWorkOrderItems, useWorkOrderPayments } from '../api'
import { WORK_ORDER_STATUS_OPTIONS, WORK_ORDER_STATUS_VARIANT, type WorkOrderRow } from '../config'
import { formatQuantity, measuredQuantity, workOrderFigures } from '../math'
import { useReleaseWorkOrderRetention } from '../retention-api'

const today = () => new Date().toISOString().slice(0, 10)

interface WorkOrderDialogProps {
  order: WorkOrderRow | null
  onOpenChange: (open: boolean) => void
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'warning' }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold ${tone === 'warning' ? 'text-warning' : ''}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function WorkOrderDialog({ order, onOpenChange }: WorkOrderDialogProps) {
  // New item
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [rate, setRate] = useState('')
  // Item being amended
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('')
  const [editRate, setEditRate] = useState('')
  // Measuring
  const [measureItemId, setMeasureItemId] = useState<string | null>(null)
  const [mDate, setMDate] = useState(today)
  const [mQty, setMQty] = useState('')
  const [mNotes, setMNotes] = useState('')
  // Payment
  const [pDate, setPDate] = useState(today)
  const [pAmount, setPAmount] = useState('')
  const [pRef, setPRef] = useState('')
  const [pNotes, setPNotes] = useState('')

  const canEdit = usePermission('contracts', 'edit')
  const canDelete = usePermission('contracts', 'delete')
  const { data: expenses = [] } = useExpenses()
  const expenseStatus = useMemo(() => Object.fromEntries(expenses.map((e) => [e.id, e.status])), [expenses])

  const orderId = order?.id ?? ''
  const items = useWorkOrderItems(orderId)
  const measurements = useMeasurements(orderId)
  const payments = useWorkOrderPayments(orderId)
  const updateOrder = useUpdateWorkOrder()
  const releaseRetention = useReleaseWorkOrderRetention(orderId)

  if (!order) return null

  const figures = workOrderFigures(order)
  const scopeEditable = canEdit && order.status === 'active'
  const paymentsEditable = canEdit && order.status !== 'cancelled'
  const measuring = order.items.find((i) => i.id === measureItemId) ?? null

  const addItem = async () => {
    if (!description.trim() || !quantity || !rate || items.add.isPending) return
    await items.add.mutateAsync({ description: description.trim(), unit: unit.trim() || undefined, quantity: Number(quantity), rate: Number(rate) })
    setDescription('')
    setUnit('')
    setQuantity('')
    setRate('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    await items.update.mutateAsync({ id: editingId, quantity: Number(editQty), rate: Number(editRate) })
    setEditingId(null)
  }

  const recordMeasurement = async () => {
    if (!measuring || !mQty || measurements.add.isPending) return
    await measurements.add.mutateAsync({ itemId: measuring.id, date: mDate, quantity: Number(mQty), notes: mNotes.trim() || undefined })
    setMQty('')
    setMNotes('')
  }

  const recordPayment = async () => {
    if (!pAmount || payments.add.isPending) return
    await payments.add.mutateAsync({ date: pDate, amount: Number(pAmount), reference: pRef.trim() || undefined, notes: pNotes.trim() || undefined })
    setPAmount('')
    setPRef('')
    setPNotes('')
  }

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{order.title}</DialogTitle>
            <Badge variant={WORK_ORDER_STATUS_VARIANT[order.status] ?? 'secondary'}>{order.status}</Badge>
          </div>
          <DialogDescription>
            {order.vendorName ?? order.vendor?.name} · {order.projectName}
            {order.scope ? ` — ${order.scope}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 rounded-md bg-secondary p-3 text-sm sm:grid-cols-4">
          <Stat label="Order value" value={formatCurrency(figures.contractValue)} />
          <Stat label="Work done" value={formatCurrency(figures.executedValue)} hint={`${figures.percentComplete}% of the order`} />
          <Stat
            label="Net payable"
            value={formatCurrency(figures.netPayable)}
            hint={
              order.retentionPercent > 0
                ? order.retentionReleasedAt
                  ? `${order.retentionPercent}% retention released ${formatDate(order.retentionReleasedAt)}`
                  : `after ${order.retentionPercent}% retention (${formatCurrency(figures.retention)})`
                : undefined
            }
          />
          <Stat
            label={figures.balance < 0 ? 'Paid ahead' : 'Balance due'}
            value={formatCurrency(Math.abs(figures.balance))}
            hint={`${formatCurrency(figures.paid)} paid so far`}
            tone={figures.balance < 0 ? 'warning' : undefined}
          />
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Status</span>
            <Select value={order.status} onValueChange={(status) => updateOrder.mutate({ id: order.id, values: { status } as never })}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {order.status === 'completed' && <span>Set back to Active to change the scope or measurements.</span>}
            {order.status === 'completed' && order.retentionPercent > 0 && !order.retentionReleasedAt && (
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => releaseRetention.mutate()} disabled={releaseRetention.isPending}>
                Release retention ({formatCurrency(figures.retention)})
              </Button>
            )}
          </div>
        )}

        <Tabs defaultValue="scope">
          <TabsList>
            <TabsTrigger value="scope">Scope &amp; progress</TabsTrigger>
            <TabsTrigger value="payments">Payments ({order.payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="scope" className="space-y-3">
            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Done</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Value done</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => {
                    const done = measuredQuantity(item)
                    const editing = editingId === item.id
                    return (
                      <TableRow key={item.id} className={measureItemId === item.id ? 'bg-secondary/60' : undefined}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {editing ? (
                            <Input className="ml-auto h-7 w-20" type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
                          ) : (
                            `${formatQuantity(item.quantity)} ${item.unit ?? ''}`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatQuantity(done)} <span className="text-xs text-muted-foreground">({Math.round((done / item.quantity) * 100)}%)</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {editing ? (
                            <Input className="ml-auto h-7 w-24" type="number" step="0.01" value={editRate} onChange={(e) => setEditRate(e.target.value)} />
                          ) : (
                            formatRate(item.rate)
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(Math.round(done * item.rate))}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-0.5">
                            {editing ? (
                              <Button size="sm" className="h-7" onClick={saveEdit} disabled={items.update.isPending}>
                                Save
                              </Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon-sm" title="Measurements" onClick={() => setMeasureItemId(measureItemId === item.id ? null : item.id)}>
                                  <Ruler className="size-3.5" />
                                </Button>
                                {scopeEditable && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Amend quantity / rate"
                                    onClick={() => {
                                      setEditingId(item.id)
                                      setEditQty(String(item.quantity))
                                      setEditRate(String(item.rate))
                                    }}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                )}
                                {scopeEditable && canDelete && (
                                  <Button variant="ghost" size="icon-sm" title="Remove item" onClick={() => items.remove.mutate(item.id)}>
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {order.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        No items yet — add the work and agreed rates below.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {measuring && (
              <div className="space-y-2 rounded-md border border-border p-3">
                <p className="text-sm font-medium">
                  Measurements — {measuring.description}{' '}
                  <span className="font-normal text-muted-foreground">
                    ({formatQuantity(Math.max(0, measuring.quantity - measuredQuantity(measuring)))} {measuring.unit ?? ''} left to measure)
                  </span>
                </p>
                {measuring.measurements.length > 0 ? (
                  <ul className="max-h-28 space-y-1 overflow-y-auto text-sm">
                    {measuring.measurements.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2">
                        <span>
                          {formatDate(m.date)} — <span className="font-medium">{formatQuantity(m.quantity)} {measuring.unit ?? ''}</span>
                          {m.notes ? <span className="text-muted-foreground"> · {m.notes}</span> : null}
                        </span>
                        {scopeEditable && canDelete && (
                          <Button variant="ghost" size="icon-sm" onClick={() => measurements.remove.mutate({ itemId: measuring.id, id: m.id })}>
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Nothing measured yet.</p>
                )}
                {scopeEditable && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Quantity done ({measuring.unit ?? 'units'})</Label>
                      <Input type="number" value={mQty} onChange={(e) => setMQty(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <Input value={mNotes} onChange={(e) => setMNotes(e.target.value)} placeholder="Block / floor / bill ref" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={recordMeasurement} disabled={!mQty || measurements.add.isPending}>
                        <Plus className="size-4" /> Record
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {scopeEditable && (
              <div className="space-y-2 rounded-md border border-border p-3">
                <p className="text-sm font-medium">Add an item</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Brickwork in CM 1:6" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cu.m, sq.m…" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Rate (₹)</Label>
                    <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={addItem} disabled={!description.trim() || !quantity || !rate || items.add.isPending}>
                    <Plus className="size-4" /> Add item
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-3">
            <div className="max-h-52 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Expense</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.payments.map((p) => {
                    const status = p.expenseId ? expenseStatus[p.expenseId] : undefined
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.date)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{[p.reference, p.notes].filter(Boolean).join(' · ') || '—'}</TableCell>
                        <TableCell>{status ? <Badge variant={STATUS_COLORS[status] ?? 'secondary'}>{status}</Badge> : '—'}</TableCell>
                        <TableCell>
                          {paymentsEditable && canDelete && (
                            <Button variant="ghost" size="icon-sm" onClick={() => payments.remove.mutate(p.id)}>
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {order.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                        No payments yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {paymentsEditable && (
              <div className="space-y-2 rounded-md border border-border p-3">
                <p className="text-sm font-medium">Record a payment</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
                    <Input type="number" value={pAmount} onChange={(e) => setPAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bill / cheque no.</Label>
                    <Input value={pRef} onChange={(e) => setPRef(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Input value={pNotes} onChange={(e) => setPNotes(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Each payment raises an expense on the project — it goes for approval first unless an administrator records it.
                    {figures.balance > 0 && Number(pAmount) > figures.balance ? ' This is more than the balance due, so it counts as an advance.' : ''}
                  </p>
                  <Button onClick={recordPayment} disabled={!pAmount || payments.add.isPending}>
                    <Plus className="size-4" /> Record payment
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
