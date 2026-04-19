"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectFormSchema, ProjectFormSchema } from "@/lib/validations/project"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: ProjectFormSchema) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const PROJECT_NAME_MAX = 45
  const PROJECT_DESCRIPTION_MAX = 250
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          projectId: project.projectId,
          name: project.name,
          clientName: project.clientName,
          location: project.location,
          description: project.description || "",
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          estimatedBudget: project.estimatedBudget,
        }
      : {
          projectId: "",
          name: "",
          clientName: "",
          location: "",
          description: "",
          startDate: "",
          endDate: "",
          status: "Planning",
          estimatedBudget: 0,
        },
  })

  const status = watch("status")
  const startDate = watch("startDate")
  const projectName = watch("name") || ""
  const description = watch("description") || ""
  const projectNameRemaining = PROJECT_NAME_MAX - projectName.length
  const descriptionRemaining = PROJECT_DESCRIPTION_MAX - description.length
  const todayDateString = React.useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])
  const isFutureStartDate = Boolean(startDate) && startDate > todayDateString

  React.useEffect(() => {
    if (isFutureStartDate && status !== "Planning") {
      setValue("status", "Planning")
    }
  }, [isFutureStartDate, setValue, status])

  const onFormSubmit = async (data: ProjectFormSchema) => {
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
          Project ID <span className="text-destructive">*</span>
        </Label>
        <Input
          id="projectId"
          {...register("projectId")}
          placeholder="e.g. PRJ-1001"
          required
        />
        {errors.projectId && (
          <p className="text-sm text-destructive">{errors.projectId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="name">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <p className={`text-xs ${projectNameRemaining < 10 ? "text-destructive" : "text-muted-foreground"}`}>
            {projectNameRemaining} characters left
          </p>
        </div>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter project name"
          maxLength={PROJECT_NAME_MAX}
          required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">
          Client Name <span className="text-destructive">*</span>
        </Label>
        <Input id="clientName" {...register("clientName")} placeholder="Enter client name" required maxLength={100} />
        {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Location <span className="text-destructive">*</span>
        </Label>
        <Input id="location" {...register("location")} placeholder="Enter location" required maxLength={150} />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="description">Description</Label>
          <p className={`text-xs ${descriptionRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`}>
            {descriptionRemaining} characters left
          </p>
        </div>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter project description"
          rows={4}
          maxLength={PROJECT_DESCRIPTION_MAX}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <Input id="startDate" type="date" {...register("startDate")} required />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date <span className="text-destructive">*</span>
          </Label>
          <Input id="endDate" type="date" {...register("endDate")} required />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select
          id="status"
          {...register("status")}
          onChange={(e) => setValue("status", e.target.value as Project["status"])}
          value={status}
          disabled={isFutureStartDate}
        >
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </Select>
        {isFutureStartDate && (
          <p className="text-xs text-muted-foreground">
            Status is locked to Planning until the start date reaches today or past.
          </p>
        )}
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedBudget">
          Estimated Budget <span className="text-destructive">*</span>
        </Label>
          <Input
          id="estimatedBudget"
          type="number"
          step="0.01"
          {...register("estimatedBudget", { valueAsNumber: true })}
          placeholder="Enter estimated budget"
          required
          min="0.01"
        />
        {errors.estimatedBudget && (
          <p className="text-sm text-destructive">{errors.estimatedBudget.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  )
}
