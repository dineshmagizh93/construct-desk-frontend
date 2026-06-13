"use client"

import { LabourList } from "@/components/labour/labour-list"
import { useLabour } from "@/lib/hooks/use-labour"
import { LabourFormSchema } from "@/lib/validations/labour"
import { Labour } from "@/types/labour"
import { projectsApi } from "@/lib/api/projects"

export default function LabourPage() {
  const { createLabour } = useLabour()

  const handleCreateLabour = async (data: LabourFormSchema) => {
    try {
      const project = await projectsApi.getById(data.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      await createLabour({
        projectId: data.projectId,
        projectName: project.name,
        category: data.category,
        headcount: data.headcount,
        costPerDay: data.costPerDay,
        date: data.date,
        notes: data.notes || undefined,
      } as Omit<Labour, "id" | "createdAt" | "updatedAt">)
    } catch (error) {
      throw error
    }
  }

  return <LabourList onCreateLabour={() => {}} />
}

