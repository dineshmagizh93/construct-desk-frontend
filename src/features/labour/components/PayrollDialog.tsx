import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { downloadCsv } from '@/lib/csv'
import { formatCurrency } from '@/lib/utils'
import { buildPayroll, monthRange } from '../payroll'
import type { LabourRecord } from '../types'

interface PayrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workers: LabourRecord[]
  projectNames: Record<string, string>
}

export function PayrollDialog({ open, onOpenChange, workers, projectNames }: PayrollDialogProps) {
  const [range, setRange] = useState(() => monthRange(new Date()))
  const payroll = useMemo(() => buildPayroll(workers, range.from, range.to), [workers, range])
  const validRange = range.from !== '' && range.to !== '' && range.from <= range.to

  const exportCsv = () =>
    downloadCsv(
      `payroll-${range.from}-to-${range.to}.csv`,
      ['Worker', 'Role', 'Contractor', 'Project', 'Days present', 'Days absent', 'Wages (INR)'],
      payroll.rows.map((r) => [r.name, r.role, r.contractor, projectNames[r.projectId] ?? r.projectId, r.daysPresent, r.daysAbsent, r.wages]),
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payroll</DialogTitle>
          <DialogDescription>Wages owed for the days marked present in the period, per worker and per contractor.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
          <Button variant="outline" onClick={() => setRange(monthRange(new Date()))}>
            This month
          </Button>
          <Button className="ml-auto" onClick={exportCsv} disabled={!validRange || payroll.rows.length === 0}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>

        {!validRange ? (
          <p className="py-6 text-center text-sm text-destructive">Choose a start date that is on or before the end date.</p>
        ) : payroll.rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No attendance recorded in this period.</p>
        ) : (
          <div className="max-h-[50vh] space-y-4 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead className="text-right">Workers</TableHead>
                  <TableHead className="text-right">Days present</TableHead>
                  <TableHead className="text-right">Wages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.byContractor.map((c) => (
                  <TableRow key={c.contractor}>
                    <TableCell className="font-medium">{c.contractor}</TableCell>
                    <TableCell className="text-right">{c.workers}</TableCell>
                    <TableCell className="text-right">{c.daysPresent}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(c.wages)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">{payroll.rows.length}</TableCell>
                  <TableCell className="text-right font-semibold">{payroll.totalDaysPresent}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(payroll.totalWages)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Wages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.rows.map((r) => (
                  <TableRow key={r.workerId}>
                    <TableCell>
                      <span className="font-medium">{r.name}</span>
                      {r.role ? <span className="text-muted-foreground"> · {r.role}</span> : null}
                    </TableCell>
                    <TableCell>{r.contractor}</TableCell>
                    <TableCell className="text-right">{r.daysPresent}</TableCell>
                    <TableCell className="text-right">{r.daysAbsent}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.wages)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
