import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { CommentsPanel } from '@/features/comments/CommentsPanel'
import { usePermission } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import { useAddLeadFollowUp, useConvertLead } from '../api'
import { leadStatusLabel } from '../config'
import type { Lead } from '../types'
import { ArrowRight, CheckCircle2, Phone, Mail, MapPin, Plus } from 'lucide-react'

interface LeadDetailDialogProps {
  lead: Lead | null
  onOpenChange: (open: boolean) => void
}

export function LeadDetailDialog({ lead, onOpenChange }: LeadDetailDialogProps) {
  const [note, setNote] = useState('')
  const addFollowUpMutation = useAddLeadFollowUp()
  const convertMutation = useConvertLead()
  const navigate = useNavigate()
  // Both hooks run on every render (never short-circuited), as React requires.
  const canEditLeads = usePermission('leads', 'edit')
  const canCreateClients = usePermission('clients', 'create')
  const canConvert = canEditLeads && canCreateClients
  const canCreateProject = usePermission('projects', 'create')
  const [createProject, setCreateProject] = useState(true)
  const [projectName, setProjectName] = useState('')

  if (!lead) return null

  const addFollowUp = async () => {
    if (!note.trim() || addFollowUpMutation.isPending) return
    await addFollowUpMutation.mutateAsync({ leadId: lead.id, note: note.trim() })
    setNote('')
  }

  const converted = !!lead.convertedClientId
  const showConvert = !converted && canConvert && lead.status !== 'lost'
  const makeProject = createProject && canCreateProject
  const defaultName = lead.projectType ? `${lead.name} — ${lead.projectType}` : lead.name

  const convert = async () => {
    await convertMutation.mutateAsync({ leadId: lead.id, createProject: makeProject, projectName: projectName.trim() || undefined })
    setProjectName('')
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

        {converted && (
          <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-4 text-success" /> Converted
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${lead.convertedClientId}`)}>
                Open client <ArrowRight className="size-3.5" />
              </Button>
              {lead.convertedProjectId && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${lead.convertedProjectId}`)}>
                  Open project <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {showConvert && (
          <div className="space-y-2 rounded-md border border-border p-3 text-sm">
            <p className="font-medium">Convert to client{canCreateProject ? ' & project' : ''}</p>
            <p className="text-xs text-muted-foreground">
              Creates a client from this lead's details (or links to an existing client with the same email) and marks the lead won.
            </p>
            {canCreateProject && (
              <>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={createProject} onChange={(e) => setCreateProject(e.target.checked)} />
                  Also create a project{lead.estimatedBudget ? ` (budget ${formatCurrency(lead.estimatedBudget)})` : ''}
                </label>
                {createProject && (
                  <Input placeholder={defaultName} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                )}
              </>
            )}
            <Button size="sm" onClick={convert} disabled={convertMutation.isPending}>
              Convert lead
            </Button>
          </div>
        )}

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

        <div className="border-t border-border pt-3">
          <CommentsPanel entity="Lead" entityId={lead.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
