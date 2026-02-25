"use client"

import { SiteProgressList } from "@/components/site-progress/site-progress-list"
import { useSiteProgress } from "@/lib/hooks/use-site-progress"
import { SiteProgressFormSchema } from "@/lib/validations/site-progress"
import { SiteProgress } from "@/types/site-progress"
import { projectsApi } from "@/lib/api/projects"

export default function SiteProgressPage() {
  const { createProgress } = useSiteProgress()

  const handleCreateProgress = async (data: SiteProgressFormSchema) => {
    try {
      const project = await projectsApi.getById(data.projectId)
      await createProgress({
        ...data,
        projectName: project?.name || "",
        notes: data.notes || undefined,
      } as Omit<SiteProgress, "id" | "createdAt" | "updatedAt">)
    } catch (error) {
      console.error("Error fetching project:", error)
      // Still create progress even if project fetch fails
      await createProgress({
        ...data,
        projectName: "",
        notes: data.notes || undefined,
      } as Omit<SiteProgress, "id" | "createdAt" | "updatedAt">)
    }
  }

  return <SiteProgressList onCreateProgress={() => {}} />
}

