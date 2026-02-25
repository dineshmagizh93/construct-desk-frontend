"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { siteProgressApi } from "@/lib/api/site-progress"
import { SiteProgress } from "@/types/site-progress"
import { SiteProgressFormSchema } from "@/lib/validations/site-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteProgressForm } from "@/components/site-progress/site-progress-form"
import { useSiteProgress } from "@/lib/hooks/use-site-progress"
import { projectsApi } from "@/lib/api/projects"

export default function EditSiteProgressPage() {
  const params = useParams()
  const router = useRouter()
  const { updateProgress } = useSiteProgress()
  const [progress, setProgress] = React.useState<SiteProgress | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadProgress = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await siteProgressApi.getById(params.id)
          setProgress(data)
        } catch (error) {
          console.error("Failed to load site progress:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadProgress()
  }, [params.id])

  const handleSubmit = async (data: SiteProgressFormSchema) => {
    if (!progress) return

    const project = await projectsApi.getById(data.projectId)

    await updateProgress(progress.id, {
      ...data,
      notes: data.notes || undefined,
    })

    router.push(`/site-progress/${progress.id}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading site progress...</div>
  }

  if (!progress) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/site-progress")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Site Progress
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Site progress entry not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/site-progress")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Site Progress</h1>
          <p className="text-muted-foreground">Update site progress information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Progress Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteProgressForm
            siteProgress={progress}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/site-progress")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
