"use client"

import { ProjectList } from "@/components/projects/project-list"
import { useProjects } from "@/lib/hooks/use-projects"
import { ProjectFormSchema } from "@/lib/validations/project"
import { CreateProjectDto } from "@/lib/api/projects"

export default function ProjectsPage() {
  const { createProject, loadProjects } = useProjects()

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
      // Re-throw with a more user-friendly message
      const errorMessage = Array.isArray(error?.message) 
        ? error.message.join(', ')
        : error?.message || "Failed to create project. Please check all fields and try again."
      throw new Error(errorMessage)
    }
  }

  return <ProjectList onCreateProject={handleCreateProject} />
}

