import { useState } from 'react'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import { useAddLeadFollowUp } from '../api'
import { leadStatusLabel } from '../config'
import type { Lead } from '../types'
import { Phone, Mail, MapPin, Plus } from 'lucide-react'

interface LeadDetailDialogProps {
  lead: Lead | null
  onOpenChange: (open: boolean) => void
}

export function LeadDetailDialog({ lead, onOpenChange }: LeadDetailDialogProps) {
  const [note, setNote] = useState('')
  const addFollowUpMutation = useAddLeadFollowUp()

  if (!lead) return null

  const addFollowUp = async () => {
    if (!note.trim() || addFollowUpMutation.isPending) return
    await addFollowUpMutation.mutateAsync({ leadId: lead.id, note: note.trim() })
    setNote('')
  }

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{lead.name}</DialogTitle>
            <Badge variant={STATUS_COLORS[lead.status] ?? 'secondary'}>{leadStatusLabel(lead.status)}</Badge>
          </div>
          <DialogDescription>{lead.projectType}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3.5" /> {lead.phone || '—'}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="size-3.5" /> {lead.email || '—'}
          </span>
          <span className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5" /> {lead.location || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-md bg-secondary p-3 text-sm">
          <span className="text-muted-foreground">Estimated Budget</span>
          <span className="font-semibold">{formatCurrency(lead.estimatedBudget)}</span>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Follow-ups</p>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {(lead.followUps?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No follow-ups logged yet.</p>}
            {[...(lead.followUps ?? [])].reverse().map((f) => (
              <div key={f.id} className="rounded-md border border-border p-2.5 text-sm">
                <p>{f.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(f.date)}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Add a follow-up note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFollowUp()}
            />
            <Button size="icon" onClick={addFollowUp} disabled={addFollowUpMutation.isPending || !note.trim()}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
