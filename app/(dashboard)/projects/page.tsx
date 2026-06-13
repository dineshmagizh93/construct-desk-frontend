"use client"

import * as React from "react"
import { useProjects } from "@/lib/hooks/use-projects"
import { ProjectFormSchema } from "@/lib/validations/project"
import { CreateProjectDto } from "@/lib/api/projects"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import { usePlanLimits } from "@/lib/hooks/use-plan-limits"

// Lazy load heavy component to speed up navigation
const ProjectList = React.lazy(() => 
  import("@/components/projects/project-list").then(module => ({ default: module.ProjectList }))
)

export default function ProjectsPage() {
  const { createProject, loadProjects } = useProjects()
  const { handleError, UpgradeModalComponent } = usePlanLimits()

  const handleCreateProject = async (data: ProjectFormSchema) => {
    // Helper to convert empty strings to undefined
    const toUndefined = (val: string | undefined) => {
      if (!val || !val.trim()) return undefined
      return val.trim()
    }
    
    const toNumber = (val: number | string | undefined) => {
      if (val === undefined || val === null || val === '') return undefined
      const num = typeof val === 'string' ? parseFloat(val) : val
      return isNaN(num) || num <= 0 ? undefined : num
    }

    const projectData: CreateProjectDto = {
      projectId: data.projectId.trim(),
      name: data.name.trim(),
      clientName: toUndefined(data.clientName),
      location: toUndefined(data.location),
      description: toUndefined(data.description),
      startDate: toUndefined(data.startDate),
      endDate: toUndefined(data.endDate),
      status: data.status,
      estimatedBudget: toNumber(data.estimatedBudget),
      progress: data.status === "Completed" ? 100 : data.status === "Planning" ? 0 : 25,
    }
    
    try {
      await createProject(projectData)
      // Refresh the projects list immediately after creation
      await loadProjects()
    } catch (error: any) {
      // Handle plan limit errors
      if (handleError(error)) {
        return // Upgrade modal will be shown
      }
      // Re-throw with a more user-friendly message
      const errorMessage = Array.isArray(error?.message) 
        ? error.message.join(', ')
        : error?.message || "Failed to create project. Please check all fields and try again."
      throw new Error(errorMessage)
    }
  }

  return (
    <>
      <UpgradeModalComponent />
      <React.Suspense fallback={<TableSkeleton />}>
        <ProjectList onCreateProject={handleCreateProject} />
      </React.Suspense>
    </>
  )
}

