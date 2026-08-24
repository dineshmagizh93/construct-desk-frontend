import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, User, Calendar, CheckCircle2, Circle, FileText, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyableId } from '@/components/shared/CopyableId'
import { formatCurrency, formatDate } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'
import { useProject } from '../api'
import { statusLabel } from '../config'

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft /> Back to projects
        </Button>
        <p className="mt-4 text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const spentPct = Math.min(100, Math.round((project.spent / project.budget) * 100))

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" onClick={() => navigate('/projects')}>
        <ArrowLeft /> Back to projects
      </Button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <CopyableId value={project.code} />
            <Badge variant={STATUS_COLORS[project.status] ?? 'secondary'}>{statusLabel(project.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{project.clientName} · {project.type}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {project.location}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-4" /> {project.projectManager}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="size-4 text-muted-foreground" />
              {formatDate(project.startDate)} — {formatDate(project.endDate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Budget vs Spent</p>
            <p className="mt-1.5 text-sm font-medium">
              {formatCurrency(project.spent)} <span className="text-muted-foreground">of {formatCurrency(project.budget)}</span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${spentPct > 90 ? 'bg-destructive' : 'bg-accent'}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  {m.done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={m.done ? 'text-muted-foreground line-through' : ''}>{m.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(m.dueDate)}</span>
                </div>
              ))}
              {project.milestones.length === 0 && <p className="text-sm text-muted-foreground">No milestones added.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {project.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Assigned to {task.assignee}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'}>
                      {statusLabel(task.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
              {project.tasks.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No tasks linked to this project yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4" /> Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {project.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 text-sm">
                  <span>{expense.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{formatDate(expense.date)}</span>
                    <span className="font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                </div>
              ))}
              {project.expenses.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No expenses recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {project.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-4 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="flex-1">{doc.name}</span>
                  <Badge variant="outline">{doc.type}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</span>
                </div>
              ))}
              {project.documents.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No documents uploaded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
