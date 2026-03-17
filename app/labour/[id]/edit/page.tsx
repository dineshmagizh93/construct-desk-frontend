"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { labourApi } from "@/lib/api/labour"
import { Labour } from "@/types/labour"
import { LabourFormSchema } from "@/lib/validations/labour"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LabourForm } from "@/components/labour/labour-form"
import { useLabour } from "@/lib/hooks/use-labour"
import { projectsApi } from "@/lib/api/projects"

export default function EditLabourPage() {
  const params = useParams()
  const router = useRouter()
  const { updateLabour } = useLabour()
  const [labour, setLabour] = React.useState<Labour | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadLabour = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await labourApi.getById(params.id)
          setLabour(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadLabour()
  }, [params.id])

  const handleSubmit = async (data: LabourFormSchema) => {
    if (!labour) return

    const project = await projectsApi.getById(data.projectId)
    if (!project) return

    await updateLabour(labour.id, {
      projectId: data.projectId,
      category: data.category,
      headcount: data.headcount,
      costPerDay: data.costPerDay,
      date: data.date,
      notes: data.notes || undefined,
    })

    router.push(`/labour/${labour.id}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading labour entry...</div>
  }

  if (!labour) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/labour")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Labour
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Labour entry not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/labour")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Labour Entry</h1>
          <p className="text-muted-foreground text-xs mt-0">Update labour entry information</p>
        </div>
      </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Labour Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <LabourForm
            labour={labour}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/labour")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
