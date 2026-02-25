"use client"

import * as React from "react"
import { Calendar, FileText, Image as ImageIcon, Plus } from "lucide-react"
import { useSiteProgress } from "@/lib/hooks/use-site-progress"
import { SiteProgress } from "@/types/site-progress"
import { SiteProgressFormSchema } from "@/lib/validations/site-progress"
import { projectsApi } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteProgressForm } from "./site-progress-form"
import { X } from "lucide-react"
import { useState } from "react"

interface ProjectProgressTabProps {
  projectId: string
}

export function ProjectProgressTab({ projectId }: ProjectProgressTabProps) {
  const { progress, loading, createProgress, loadProgressByProject } = useSiteProgress()
  const [projectProgress, setProjectProgress] = React.useState<SiteProgress[]>([])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      const data = await loadProgressByProject(projectId)
      setProjectProgress(data)
    }
    load()
  }, [projectId, loadProgressByProject])

  const handleCreateProgress = async (data: SiteProgressFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    await createProgress({
      ...data,
      projectId: data.projectId || projectId,
      projectName: project?.name || "",
      notes: data.notes || undefined,
    } as Omit<SiteProgress, "id" | "createdAt" | "updatedAt">)
    
    // Reload progress
    const updated = await loadProgressByProject(projectId)
    setProjectProgress(updated)
    setCreateDialogOpen(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading site progress...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Site Progress Timeline</h3>
          <p className="text-sm text-muted-foreground">Latest updates first</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Progress
        </Button>
      </div>

      {projectProgress.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No site progress entries yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Progress Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projectProgress.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Notes</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}

                {item.photos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Photos ({item.photos.length})</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {item.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative aspect-video cursor-pointer group"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <img
                            src={photo}
                            alt={`Progress photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found"
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {createDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setCreateDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Site Progress</h2>
              <Button variant="ghost" size="icon" onClick={() => setCreateDialogOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SiteProgressForm
              onSubmit={handleCreateProgress}
              onCancel={() => setCreateDialogOpen(false)}
              projectId={projectId}
            />
          </div>
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

