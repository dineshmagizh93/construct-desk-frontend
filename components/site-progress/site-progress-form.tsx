"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { siteProgressFormSchema, SiteProgressFormSchema } from "@/lib/validations/site-progress"
import { SiteProgress } from "@/types/site-progress"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { X, Image as ImageIcon, Loader2, Upload } from "lucide-react"
import { uploadApi } from "@/lib/api/upload"
import toast from "react-hot-toast"

interface SiteProgressFormProps {
  siteProgress?: SiteProgress
  projectId?: string
  onSubmit: (data: SiteProgressFormSchema) => Promise<void>
  onCancel: () => void
}

export function SiteProgressForm({
  siteProgress,
  projectId,
  onSubmit,
  onCancel,
}: SiteProgressFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [photoUrls, setPhotoUrls] = React.useState<string[]>(siteProgress?.photos || [])
  const [newPhotoUrl, setNewPhotoUrl] = React.useState("")
  const [photoFiles, setPhotoFiles] = React.useState<File[]>([])

  React.useEffect(() => {
    const loadProjects = async () => {
      const data = await projectsApi.getAll()
      setProjects(data)
    }
    loadProjects()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SiteProgressFormSchema>({
    resolver: zodResolver(siteProgressFormSchema),
    defaultValues: siteProgress
      ? {
          projectId: siteProgress.projectId,
          date: siteProgress.date,
          notes: siteProgress.notes || "",
          photos: siteProgress.photos || [],
        }
      : {
          projectId: projectId || "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          photos: [],
        },
  })

  const selectedProjectId = watch("projectId")

  React.useEffect(() => {
    setValue("photos", photoUrls)
  }, [photoUrls, setValue])

  const addPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotoUrls([...photoUrls, newPhotoUrl.trim()])
      setNewPhotoUrl("")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploadResults = await uploadApi.uploadPhotos(files)
      const urls = uploadResults.map(result => result.url)
      setPhotoUrls([...photoUrls, ...urls])
    } catch (error: any) {
      console.error("Photo upload error:", error)
      toast.error(error.message || "Failed to upload photos. Please try again.")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index))
  }

  const onFormSubmit = async (data: SiteProgressFormSchema) => {
    try {
      setIsSubmitting(true)
      await onSubmit({ ...data, photos: photoUrls })
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">
          Project <span className="text-destructive">*</span>
        </Label>
        <Select
          id="projectId"
          {...register("projectId")}
          onChange={(e) => setValue("projectId", e.target.value)}
          value={selectedProjectId}
          disabled={!!projectId}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        {errors.projectId && <p className="text-sm text-destructive">{errors.projectId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">
          Date <span className="text-destructive">*</span>
        </Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Enter progress notes"
          rows={4}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={isUploading || isSubmitting}
              className="flex-1"
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Or enter photo URL"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addPhoto()
                }
              }}
              disabled={isUploading || isSubmitting}
            />
            <Button type="button" onClick={addPhoto} variant="outline" disabled={isUploading || isSubmitting}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Add URL
            </Button>
          </div>
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : siteProgress ? "Update Progress" : "Add Progress"}
        </Button>
      </DialogFooter>
    </form>
  )
}

