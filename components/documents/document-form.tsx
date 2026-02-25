"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { documentFormSchema, DocumentFormSchema } from "@/lib/validations/document"
import { Document } from "@/types/document"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Upload, File, Loader2 } from "lucide-react"
import { uploadApi } from "@/lib/api/upload"
import toast from "react-hot-toast"
import { API_BASE_URL } from "@/lib/config"

interface DocumentFormProps {
  document?: Document
  projectId?: string
  onSubmit: (data: DocumentFormSchema) => Promise<void>
  onCancel: () => void
}

export function DocumentForm({ document, projectId, onSubmit, onCancel }: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [fileInput, setFileInput] = React.useState<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

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
  } = useForm<DocumentFormSchema>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: document
      ? {
          projectId: document.projectId,
          name: document.name,
          type: document.type,
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          fileSize: document.fileSize,
          notes: document.notes || "",
        }
      : {
          projectId: projectId || "",
          name: "",
          type: "Agreement",
          fileUrl: "",
          fileName: "",
          fileSize: 0,
          notes: "",
        },
  })

  const selectedType = watch("type")
  const selectedProjectId = watch("projectId")
  const fileUrl = watch("fileUrl")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsUploading(true)
      setUploadProgress(0)
      
      // Retry mechanism for file upload
      const maxRetries = 3
      let retryCount = 0
      let uploadResult = null
      
      while (retryCount < maxRetries && !uploadResult) {
        try {
          // Upload file to server
          uploadResult = await uploadApi.uploadDocument(file)
          // Convert relative URL to absolute URL if needed
          // Backend returns /uploads/... but we need full URL for validation
          const baseUrl = API_BASE_URL.replace('/api', '') // Remove /api to get base URL
          const fullUrl = uploadResult.url.startsWith('http') 
            ? uploadResult.url 
            : `${baseUrl}${uploadResult.url}`
          setValue("fileUrl", fullUrl)
          setValue("fileName", uploadResult.fileName)
          setValue("fileSize", uploadResult.fileSize)
          setUploadProgress(100)
          toast.success("File uploaded successfully")
          break
        } catch (error: any) {
          retryCount++
          if (retryCount >= maxRetries) {
            console.error("File upload error after retries:", error)
            toast.error(error.message || `Failed to upload file after ${maxRetries} attempts. Please try again.`)
            if (fileInput) fileInput.value = ""
            setSelectedFile(null)
            setUploadProgress(0)
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            toast.loading(`Retrying upload (${retryCount}/${maxRetries})...`)
          }
        }
      }
      
      setIsUploading(false)
    }
  }

  const onFormSubmit = async (data: DocumentFormSchema) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Document Name <span className="text-destructive">*</span>
          </Label>
          <Input id="name" {...register("name")} placeholder="Enter document name" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">
            Document Type <span className="text-destructive">*</span>
          </Label>
          <Select
            id="type"
            {...register("type")}
            onChange={(e) => setValue("type", e.target.value as Document["type"])}
            value={selectedType}
          >
            <option value="Agreement">Agreement</option>
            <option value="Drawing">Drawing</option>
            <option value="Bill">Bill</option>
            <option value="Invoice">Invoice</option>
            <option value="Approval">Approval</option>
            <option value="Permit">Permit</option>
            <option value="Receipt">Receipt</option>
            <option value="Other">Other</option>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">
          File Upload <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="flex-1"
              disabled={isUploading || isSubmitting}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              ref={(el) => {
                if (el) setFileInput(el)
              }}
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
          {fileUrl && !isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded">
              <File className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{watch("fileName") || "File selected"}</span>
              <span className="text-xs">({watch("fileSize") ? ((watch("fileSize")! / 1024).toFixed(2)) : "0.00"} KB)</span>
            </div>
          )}
          {isUploading && (
            <div className="text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </div>
          )}
        </div>
        {fileUrl && (
          <Input
            id="fileUrl"
            type="hidden"
            {...register("fileUrl")}
            value={fileUrl}
          />
        )}
        {errors.fileUrl && <p className="text-sm text-destructive">{errors.fileUrl.message}</p>}
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes" rows={3} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : document ? "Update Document" : "Upload Document"}
        </Button>
      </DialogFooter>
    </form>
  )
}

