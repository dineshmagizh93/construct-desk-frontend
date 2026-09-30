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
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useMarkAttendance, useDeleteAttendance } from '../attendance-api'
import type { LabourRecord } from '../types'

interface AttendanceDialogProps {
  worker: LabourRecord | null
  onOpenChange: (open: boolean) => void
}

export function AttendanceDialog({ worker, onOpenChange }: AttendanceDialogProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [present, setPresent] = useState(true)
  const [wageAmount, setWageAmount] = useState('')

  const markMutation = useMarkAttendance(worker?.id ?? '')
  const deleteMutation = useDeleteAttendance(worker?.id ?? '')

  if (!worker) return null

  const addEntry = async () => {
    if (!date || markMutation.isPending) return
    await markMutation.mutateAsync({
      date,
      present,
      wageAmount: wageAmount ? Number(wageAmount) : undefined,
    })
    setWageAmount('')
  }

  const sorted = [...worker.attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const daysPresent = worker.attendance.filter((a) => a.present).length
  const totalWageCost = worker.attendance.reduce((sum, a) => sum + a.wageAmount, 0)

  return (
    <Dialog open={!!worker} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{worker.name}</DialogTitle>
            {worker.role && <Badge variant="outline">{worker.role}</Badge>}
          </div>
          <DialogDescription>Daily attendance and wage record for this worker.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 rounded-md bg-secondary p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Days present</p>
            <p className="font-semibold">{daysPresent}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Days recorded</p>
            <p className="font-semibold">{worker.attendance.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total wage cost</p>
            <p className="font-semibold">{formatCurrency(totalWageCost)}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Wage</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>
                  <Badge variant={entry.present ? 'success' : 'secondary'}>{entry.present ? 'Present' : 'Absent'}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(entry.wageAmount)}</TableCell>
                <TableCell className="text-muted-foreground">{entry.notes || '—'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(entry.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  No attendance recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="grid grid-cols-[8rem_auto_8rem_auto] items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={present ? 'default' : 'outline'}
              className={cn(present && 'bg-success text-success-foreground hover:bg-success/90')}
              onClick={() => setPresent(true)}
            >
              Present
            </Button>
            <Button type="button" size="sm" variant={!present ? 'default' : 'outline'} onClick={() => setPresent(false)}>
              Absent
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Wage (₹)</Label>
            <Input
              type="number"
              value={wageAmount}
              onChange={(e) => setWageAmount(e.target.value)}
              placeholder={String(present ? worker.dailyWage : 0)}
            />
          </div>
          <Button size="icon" onClick={addEntry} disabled={markMutation.isPending || !date}>
            <Plus className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
