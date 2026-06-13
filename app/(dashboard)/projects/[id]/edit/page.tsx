"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { ApiError } from "@/lib/api/client"
import { ProjectFormSchema } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/projects/project-form"
import { useProjects } from "@/lib/hooks/use-projects"
import { recordProjectDateHistory } from "@/lib/utils/project-date-history"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { updateProject } = useProjects()
  const [project, setProject] = React.useState<Project | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

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

  const handleSubmit = async (data: ProjectFormSchema) => {
    if (!project) return

    const progress = data.status === "Completed" ? 100 : data.status === "Planning" ? 0 : project.progress || 25

    await updateProject(project.id, {
      ...data,
      estimatedBudget: typeof data.estimatedBudget === "string" ? parseFloat(data.estimatedBudget) : data.estimatedBudget,
      progress,
    })

    recordProjectDateHistory(
      project.id,
      {
        startDate: project.startDate,
        endDate: project.endDate,
      },
      {
        startDate: data.startDate,
        endDate: data.endDate,
      }
    )

    router.push("/projects")
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground text-sm mt-1">Update project information</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} onSubmit={handleSubmit} onCancel={() => router.push("/projects")} />
        </CardContent>
      </Card>
    </div>
  )
}
