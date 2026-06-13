"use client"

import { useState, useEffect, useCallback } from "react"
import { projectTemplatesApi } from "@/lib/api/project-templates"
import type { ProjectTemplate } from "@/lib/api/project-templates"
import { toast } from "react-hot-toast"

export function useProjectTemplates() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await projectTemplatesApi.getAll()
      setTemplates(data)
    } catch {
      toast.error("Failed to load project templates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async (payload: Partial<ProjectTemplate>) => {
    const created = await projectTemplatesApi.create(payload)
    setTemplates((prev) => [created, ...prev])
    return created
  }

  const updateTemplate = async (id: string, payload: Partial<ProjectTemplate>) => {
    const updated = await projectTemplatesApi.update(id, payload)
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const deleteTemplate = async (id: string) => {
    await projectTemplatesApi.delete(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const applyTemplate = async (templateId: string, projectId: string, startDate?: string) => {
    return projectTemplatesApi.applyToProject(templateId, projectId, startDate)
  }

  return { templates, loading, createTemplate, updateTemplate, deleteTemplate, applyTemplate, refetch: fetchTemplates }
}

