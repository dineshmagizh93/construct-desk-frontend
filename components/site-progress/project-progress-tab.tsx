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
import { useRole } from "@/lib/hooks/use-role"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { parseCsv, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"
import toast from "react-hot-toast"
import { CreateSiteProgressDto } from "@/lib/api/site-progress"

interface ProjectProgressTabProps {
  projectId: string
}

export function ProjectProgressTab({ projectId }: ProjectProgressTabProps) {
  const { progress, loading, createProgress, loadProgressByProject } = useSiteProgress()
  const { isAdmin } = useRole()
  const [projectProgress, setProjectProgress] = React.useState<SiteProgress[]>([])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkRows, setBulkRows] = useState<CreateSiteProgressDto[]>([])

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
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Progress
          </Button>
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkOpen(true)
                setBulkError(null)
                setBulkRows([])
              }}
            >
              Bulk Upload
            </Button>
          )}
        </div>
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

      {/* Bulk Upload Dialog */}
      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open)
          if (!open) {
            setBulkError(null)
            setBulkRows([])
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[calc(100vh-1rem)] p-3 hide-scrollbar gap-2">
          <DialogHeader>
            <DialogTitle>Bulk Upload Site Progress</DialogTitle>
            <DialogDescription className="text-xs">
              Upload CSV for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const headers = ["projectId", "date", "notes", "photos"]
                  const sample = [projectId || "YOUR_PROJECT_ID", "2024-01-15", "Optional notes", "https://example.com/a.jpg;https://example.com/b.jpg"]
                  const escapeCell = (v: string) => {
                    const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r")
                    const escaped = v.replace(/"/g, '""')
                    return needsQuotes ? `"${escaped}"` : escaped
                  }
                  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map((c) => escapeCell(String(c))).join(",")}\n`
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "site-progress-bulk-upload-template.csv"
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                }}
              >
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Headers: date,notes,photos</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-site-progress">Choose CSV file</Label>
              <Input
                id="bulk-site-progress"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const parsed = parseCsv(text)
                    if (parsed.length === 0) throw new Error("Empty CSV.")

                    const [headerRow, ...dataRows] = parsed
                    const headerMap = new Map<string, number>()
                    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

                    const required = ["date"]
                    const missing = required.filter((h) => !headerMap.has(h))
                    if (missing.length > 0) throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)

                    const get = (row: string[], key: string) => {
                      const idx = headerMap.get(key)
                      if (idx === undefined) return ""
                      return (row[idx] ?? "").trim()
                    }

                    const rows: CreateSiteProgressDto[] = []
                    const mismatch: string[] = []

                    for (const row of dataRows) {
                      const rowProjectIdRaw = get(row, "projectid")
                      if (rowProjectIdRaw && rowProjectIdRaw !== projectId) mismatch.push(rowProjectIdRaw)
                      const finalProjectId = rowProjectIdRaw || projectId

                      const date = normalizeDateToYmd(get(row, "date"))
                      if (!finalProjectId || !date) continue

                      const notes = get(row, "notes") || undefined
                      const photosRaw = get(row, "photos")
                      const photos =
                        photosRaw
                          ? photosRaw
                              .split(";")
                              .map((p) => p.trim())
                              .filter(Boolean)
                          : []

                      rows.push({ projectId: finalProjectId, date, notes, photos })
                    }

                    if (mismatch.length > 0) {
                      throw new Error(`CSV projectId mismatch. All rows must match current project (${projectId}).`)
                    }

                    if (rows.length === 0) throw new Error("No valid rows found. Check CSV values.")
                    setBulkRows(rows)
                  } catch (err: any) {
                    setBulkError(err?.message || "Failed to parse CSV.")
                  }
                }}
              />
            </div>

            {bulkError && <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{bulkError}</div>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={bulkRows.length === 0}
                onClick={async () => {
                  try {
                    setBulkError(null)
                    for (const row of bulkRows) {
                      await createProgress(row)
                    }
                    const updated = await loadProgressByProject(projectId)
                    setProjectProgress(updated)
                    toast.success("Bulk site progress uploaded successfully")
                    setBulkOpen(false)
                    setBulkRows([])
                  } catch (err: any) {
                    const raw = err?.message as string
                    const cleaned = raw?.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
                    setBulkError(cleaned || "Bulk upload failed")
                  }
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

