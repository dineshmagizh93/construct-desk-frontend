"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { Plus, Users, DollarSign } from "lucide-react"
import { useLabour } from "@/lib/hooks/use-labour"
import { Labour } from "@/types/labour"
import { LabourFormSchema } from "@/lib/validations/labour"
import { projectsApi } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LabourForm } from "./labour-form"
import { X } from "lucide-react"
import { LabourList } from "./labour-list"

interface ProjectLabourTabProps {
  projectId: string
}

export function ProjectLabourTab({ projectId }: ProjectLabourTabProps) {
  const { createLabour, loadLabourByProject } = useLabour()
  const [projectLabour, setProjectLabour] = React.useState<Labour[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await loadLabourByProject(projectId)
      setProjectLabour(data)
      setLoading(false)
    }
    load()
  }, [projectId, loadLabourByProject])

  const handleCreateLabour = async (data: LabourFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await createLabour({
      projectId: data.projectId || projectId,
      projectName: project.name,
      category: data.category,
      headcount: data.headcount,
      costPerDay: data.costPerDay,
      date: data.date,
      notes: data.notes || undefined,
    } as Omit<Labour, "id" | "createdAt" | "updatedAt">)

    // Reload labour
    const updated = await loadLabourByProject(projectId)
    setProjectLabour(updated)
  }

  const totalHeadcount = projectLabour.reduce((sum, l) => sum + l.headcount, 0)
  const totalCost = projectLabour.reduce((sum, l) => sum + l.headcount * l.costPerDay, 0)

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading labour entries...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Labour</h3>
          <p className="text-sm text-muted-foreground">Track labour entries and costs for this project</p>
        </div>
        <CreateLabourButton onCreate={handleCreateLabour} projectId={projectId} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{totalHeadcount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {projectLabour.length} labour entr{projectLabour.length !== 1 ? "ies" : "y"} recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Labour Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total cost across all entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Labour List */}
      <LabourList projectId={projectId} onCreateLabour={() => {}} />
    </div>
  )
}

function CreateLabourButton({
  onCreate,
  projectId,
}: {
  onCreate: (data: Omit<Labour, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: LabourFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await onCreate({
      projectId: data.projectId || projectId,
      projectName: project.name,
      category: data.category,
      headcount: data.headcount,
      costPerDay: data.costPerDay,
      date: data.date,
      notes: data.notes || undefined,
    } as Omit<Labour, "id" | "createdAt" | "updatedAt">)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Labour Entry
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Labour Entry</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <LabourForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

