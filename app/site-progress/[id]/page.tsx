"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, X } from "lucide-react"
import { siteProgressApi } from "@/lib/api/site-progress"
import { SiteProgress } from "@/types/site-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { formatDateDMY } from "@/lib/utils/date"

export default function SiteProgressDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [progress, setProgress] = React.useState<SiteProgress | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  React.useEffect(() => {
    const loadProgress = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await siteProgressApi.getById(params.id)
          setProgress(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadProgress()
  }, [params.id])

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
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/site-progress")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">Site Progress</h1>
            <p className="text-muted-foreground text-xs mt-1">
              <Link href={`/projects/${progress.projectId}`} className="hover:underline">
                {progress.projectName}
              </Link>
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push(`/site-progress/${progress.id}/edit`)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Date
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-base font-semibold">{formatDateDMY(progress.date)}</p>
          </CardContent>
        </Card>

        {progress.notes && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {progress.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {progress.photos.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4" />
              Photos ({progress.photos.length})
            </CardTitle>
            <CardDescription className="text-xs">Click on any photo to view in full size</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {progress.photos.map((photo, index) => (
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
          </CardContent>
        </Card>
      )}

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
