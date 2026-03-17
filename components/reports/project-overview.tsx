"use client"

import * as React from "react"
import { formatCurrencyCustom } from "@/lib/utils/currency"
import Link from "next/link"
import { FolderKanban, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function ProjectOverview() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getAll()
        setProjects(data)
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const formatCurrency = (amount: number) => {
    return formatCurrencyCustom(amount, { maximumFractionDigits: 0 })
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

  const summary = React.useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter((p) => p.status === "In Progress").length
    const completed = projects.filter((p) => p.status === "Completed").length
    const totalBudget = projects.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0)
    const totalActual = projects.reduce((sum, p) => sum + (p.actualBudget || 0), 0)
    const avgProgress =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
        : 0

    return {
      total,
      inProgress,
      completed,
      totalBudget,
      totalActual,
      avgProgress,
    }
  }, [projects])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading project overview...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Project Overview
        </CardTitle>
        <CardDescription>Summary of all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              </div>
              <p className="text-xl font-bold">{summary.total}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              </div>
              <p className="text-xl font-bold">{summary.inProgress}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
              </div>
              <p className="text-xl font-bold">{summary.completed}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(summary.totalBudget)}</p>
            </div>
          </div>

          {/* Projects Table */}
          <div className="rounded-lg border bg-card">
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Project Name</TableHead>
                    <TableHead className="w-[14%]">Client</TableHead>
                    <TableHead className="w-[11%]">Status</TableHead>
                    <TableHead className="w-[14%]">Progress</TableHead>
                    <TableHead className="w-[14%]">Budget</TableHead>
                    <TableHead className="w-[29%]">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/projects/${project.id}`}
                            className="hover:underline truncate block"
                            title={project.name}
                          >
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell className="truncate" title={project.clientName}>
                          {project.clientName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2 flex-shrink-0">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            <p className="font-medium">{formatCurrency(project.estimatedBudget)}</p>
                            {project.actualBudget && (
                              <p className="text-muted-foreground text-xs">
                                Actual: {formatCurrency(project.actualBudget)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate" title={project.location || "-"}>
                          {project.location || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

