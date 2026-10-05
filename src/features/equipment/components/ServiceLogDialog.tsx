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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLogService, useDeleteServiceLog } from '../service-log-api'
import type { Equipment } from '../types'

const SERVICE_TYPES = ['Routine', 'Repair', 'Inspection', 'Breakdown']

interface ServiceLogDialogProps {
  equipment: Equipment | null
  onOpenChange: (open: boolean) => void
}

export function ServiceLogDialog({ equipment, onOpenChange }: ServiceLogDialogProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [type, setType] = useState('Routine')
  const [cost, setCost] = useState('')
  const [performedBy, setPerformedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')

  const logMutation = useLogService(equipment?.id ?? '')
  const deleteMutation = useDeleteServiceLog(equipment?.id ?? '')

  if (!equipment) return null

  const addLog = async () => {
    if (!date || logMutation.isPending) return
    await logMutation.mutateAsync({
      date,
      type,
      cost: cost ? Number(cost) : undefined,
      performedBy: performedBy.trim() || undefined,
      notes: notes.trim() || undefined,
      nextServiceDate: nextServiceDate || undefined,
    })
    setCost('')
    setPerformedBy('')
    setNotes('')
    setNextServiceDate('')
  }

  const sorted = [...equipment.serviceLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const totalCost = equipment.serviceLogs.reduce((sum, l) => sum + l.cost, 0)

  return (
    <Dialog open={!!equipment} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{equipment.name}</DialogTitle>
            {equipment.type && <Badge variant="outline">{equipment.type}</Badge>}
          </div>
          <DialogDescription>
            Service and maintenance history. Logging a service updates the last service date
            {equipment.nextServiceDate ? ' (and the next one, if you set it)' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-md bg-secondary p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Services logged</p>
            <p className="font-semibold">{equipment.serviceLogs.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total cost</p>
            <p className="font-semibold">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next service</p>
            <p className="font-semibold">{equipment.nextServiceDate ? formatDate(equipment.nextServiceDate) : '—'}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.date)}</TableCell>
                <TableCell>
                  <Badge variant={log.type === 'Repair' || log.type === 'Breakdown' ? 'warning' : 'secondary'}>{log.type}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(log.cost)}</TableCell>
                <TableCell className="text-muted-foreground">{log.performedBy || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{log.notes || '—'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(log.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  No service history yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Service date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cost (₹)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Next service due</Label>
            <Input type="date" value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Performed by</Label>
            <Input value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} placeholder="Technician or workshop" />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={addLog} disabled={logMutation.isPending || !date}>
              <Plus className="size-4" /> Log service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
