import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Building2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import { usePermission } from '@/lib/permissions'
import { useClient, useAddClientContactLog } from '../api'
import { useProjects } from '@/features/projects/api'
import { statusLabel } from '@/features/projects/config'

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id)
  const { data: allProjects = [] } = useProjects()
  const canEditClient = usePermission('clients', 'edit')
  const [note, setNote] = useState('')
  const addNoteMutation = useAddClientContactLog()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!client) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/clients')}>
          <ArrowLeft /> Back to clients
        </Button>
        <p className="mt-4 text-muted-foreground">Client not found.</p>
      </div>
    )
  }

  const linkedProjects = allProjects.filter((p) => p.clientId === client.id)

  const addNote = async () => {
    if (!note.trim() || addNoteMutation.isPending) return
    await addNoteMutation.mutateAsync({ clientId: client.id, note: note.trim() })
    setNote('')
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" onClick={() => navigate('/clients')}>
        <ArrowLeft /> Back to clients
      </Button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{client.name}</h1>
            <Badge variant="outline">{client.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Contact: {client.contactPerson}</p>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:items-end">
          <span className="flex items-center gap-1.5">
            <Phone className="size-4" /> {client.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" /> {client.email}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4" /> Linked Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {linkedProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-secondary/50"
              >
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_COLORS[project.status] ?? 'secondary'}>{statusLabel(project.status)}</Badge>
                  <span className="text-sm font-medium">{formatCurrency(project.budget)}</span>
                </div>
              </button>
            ))}
            {linkedProjects.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No projects linked to this client yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {client.address}
            </p>
            {client.gstin && <p className="text-muted-foreground">GSTIN: <span className="font-medium text-foreground">{client.gstin}</span></p>}
            <p className="text-muted-foreground">Client since {formatDate(client.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Contact History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...client.contactHistory].reverse().map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 text-sm">
              <p>{log.note}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDate(log.date)}</span>
            </div>
          ))}
          {client.contactHistory.length === 0 && (
            <p className="text-sm text-muted-foreground">No contact history recorded yet.</p>
          )}
          {canEditClient && (
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add a note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <Button size="icon" onClick={addNote} disabled={addNoteMutation.isPending || !note.trim()}>
                <Plus className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
