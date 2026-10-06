import { useState } from 'react'
import { Check, X, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FilesCell } from '@/features/documents/components/FilesCell'
import { useAuthStore } from '@/features/auth/store'
import { useUserNameMap } from '@/features/users/hooks'
import { STATUS_COLORS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDecideExpense } from '../approval-api'
import type { Expense } from '../types'

interface ExpenseApprovalDialogProps {
  expense: (Expense & { projectName?: string }) | null
  onOpenChange: (open: boolean) => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}

export function ExpenseApprovalDialog({ expense, onOpenChange }: ExpenseApprovalDialogProps) {
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')

  const me = useAuthStore((s) => s.user)
  const canEdit = usePermission('expenses', 'edit')
  const userNames = useUserNameMap()
  const decide = useDecideExpense(expense?.id ?? '')

  if (!expense) return null

  const isAdmin = me?.role === 'admin' || me?.role === 'super_admin'
  const isOwn = !!me && expense.createdById === me.id
  const canDecide = canEdit && expense.status === 'pending' && (isAdmin || !isOwn)
  const canPay = canEdit && expense.status === 'approved'

  const close = (open: boolean) => {
    if (!open) {
      setRejecting(false)
      setNote('')
    }
    onOpenChange(open)
  }

  const run = async (decision: 'approve' | 'reject' | 'mark-paid') => {
    await decide.mutateAsync({ decision, note: note.trim() || undefined })
    close(false)
  }

  const decider = expense.decidedById ? (userNames[expense.decidedById] ?? 'a team member') : null
  const creator = expense.createdById ? (userNames[expense.createdById] ?? 'a team member') : null

  return (
    <Dialog open={!!expense} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{expense.category}</DialogTitle>
            <Badge variant={STATUS_COLORS[expense.status] ?? 'secondary'}>{expense.status}</Badge>
          </div>
          <DialogDescription>Review and approve this expense before it counts as paid.</DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-border rounded-md border border-border px-3">
          <Row label="Amount">{formatCurrency(expense.amount)}</Row>
          <Row label="Project">{expense.projectName ?? '—'}</Row>
          <Row label="Paid to">{expense.paidTo || '—'}</Row>
          <Row label="Date">{expense.date ? formatDate(expense.date) : '—'}</Row>
          <Row label="Recorded by">{creator ?? '—'}</Row>
          <Row label="Receipts">
            <FilesCell files={expense.receipts ?? []} title={expense.category} />
          </Row>
          {decider && expense.decidedAt && (
            <Row label={expense.status === 'rejected' ? 'Rejected by' : 'Approved by'}>
              {decider} · {formatDate(expense.decidedAt)}
            </Row>
          )}
          {expense.decisionNote && <Row label="Note">{expense.decisionNote}</Row>}
        </div>

        {expense.status === 'pending' && canEdit && !canDecide && (
          <p className="text-xs text-muted-foreground">You recorded this expense, so someone else needs to approve it.</p>
        )}
        {expense.status === 'rejected' && (
          <p className="text-xs text-muted-foreground">Edit the expense to fix it and it goes back for approval.</p>
        )}

        {rejecting && (
          <div className="space-y-2">
            <Textarea
              autoFocus
              placeholder="Why is this being rejected? (required)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button variant="destructive" size="sm" disabled={!note.trim() || decide.isPending} onClick={() => run('reject')}>
                <X className="size-4" /> Confirm reject
              </Button>
            </div>
          </div>
        )}

        {!rejecting && (canDecide || canPay) && (
          <div className="flex justify-end gap-2">
            {canDecide && (
              <>
                <Button variant="outline" onClick={() => setRejecting(true)} disabled={decide.isPending}>
                  <X className="size-4" /> Reject
                </Button>
                <Button onClick={() => run('approve')} disabled={decide.isPending}>
                  <Check className="size-4" /> Approve
                </Button>
              </>
            )}
            {canPay && (
              <Button onClick={() => run('mark-paid')} disabled={decide.isPending}>
                <Wallet className="size-4" /> Mark as paid
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
