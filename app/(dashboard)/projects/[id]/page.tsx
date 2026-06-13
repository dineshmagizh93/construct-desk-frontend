"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, DollarSign, Link2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { ApiError } from "@/lib/api/client"
import { formatCurrency } from "@/lib/utils/currency"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectProgressTab } from "@/components/site-progress/project-progress-tab"
import { ProjectExpensesTab } from "@/components/expenses/project-expenses-tab"
import { ProjectPaymentsTab } from "@/components/payments/project-payments-tab"
import { ProjectLabourTab } from "@/components/labour/project-labour-tab"
import { ProjectDocumentsTab } from "@/components/documents/project-documents-tab"
import { ProjectInventoryTab } from "@/components/inventory/project-inventory-tab"
import { getProjectDateHistory, ProjectDateHistoryEntry } from "@/lib/utils/project-date-history"
import { formatDateDMY, formatDateTimeDMY } from "@/lib/utils/date"

const formatProjectDate = (dateValue?: string) => {
  if (!dateValue) return "N/A"

  const dateOnly = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    const year = Number(dateOnly[1])
    const month = Number(dateOnly[2]) - 1
    const day = Number(dateOnly[3])
    return formatDateDMY(new Date(year, month, day)) || "N/A"
  }

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return "N/A"
  return formatDateDMY(parsed) || "N/A"
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = React.useState<Project | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dateHistory, setDateHistory] = React.useState<ProjectDateHistoryEntry[]>([])

  React.useEffect(() => {
    const loadProject = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          setError(null)
          const data = await projectsApi.getById(params.id)
          setProject(data)
        } catch (err) {
          const apiError = err as ApiError
          setError(apiError.message as string || "Failed to load project")
        } finally {
          setLoading(false)
        }
      }
    }
    loadProject()
  }, [params.id])

  React.useEffect(() => {
    if (!project?.id) {
      setDateHistory([])
      return
    }

    setDateHistory(getProjectDateHistory(project.id))
  }, [project?.id, project?.updatedAt])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="text-center py-8">
          <p className="text-destructive mb-2">{error || "Project not found"}</p>
          <Button variant="outline" onClick={() => router.push("/projects")}>
            Go to Projects
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadgeVariant = (status: Project["status"]) => {
    switch (status) {
      case "Completed":
        return "success"
      case "In Progress":
        return "default"
      case "Planning":
        return "secondary"
      case "On Hold":
        return "warning"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight break-words">{project.name}</h1>
            <p className="text-muted-foreground text-xs mt-0 break-words">{project.clientName}</p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(project.status)} className="text-sm px-3 py-1">
          {project.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Progress</CardTitle>
            <span className="text-xl font-bold">{project.progress}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="progress">Site Progress</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="labour">Labour</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <div className="mb-2 mt-1 flex items-center gap-2">
          <Link href={`/projects/${params.id}/budget`} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <TrendingUp className="h-3 w-3" />
            Budget Forecast
          </Link>
          <Link href={`/projects/${params.id}/portal`} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <Link2 className="h-3 w-3" />
            Client Portal
          </Link>
        </div>

        <TabsContent value="overview" className="space-y-2">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground break-words">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="text-sm text-muted-foreground">
                      {formatProjectDate(project.startDate)} - {formatProjectDate(project.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">
                      {project.estimatedBudget ? formatCurrency(project.estimatedBudget) : "N/A"}
                      {project.actualBudget && ` / ${formatCurrency(project.actualBudget)}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {project.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Project milestones and key dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-px h-full bg-border min-h-[40px]" />
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium">Project Started</p>
                    <p className="text-sm text-muted-foreground">
                      {formatProjectDate(project.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <div className="w-px h-full bg-border min-h-[40px]" />
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium">Expected Completion</p>
                    <p className="text-sm text-muted-foreground">
                      {formatProjectDate(project.endDate)}
                    </p>
                  </div>
                </div>
                {project.status === "Completed" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Project Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateDMY(project.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {dateHistory.map((change) => (
                  <div className="flex gap-4" key={change.id}>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {change.field === "startDate" ? "Start date changed" : "End date changed"}
                      </p>
                      <p className="text-sm text-muted-foreground break-words">
                        {change.from} to {change.to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTimeDMY(change.changedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <ProjectPaymentsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="progress">
          <ProjectProgressTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="expenses">
          <ProjectExpensesTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="inventory">
          <ProjectInventoryTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="labour">
          <ProjectLabourTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocumentsTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
