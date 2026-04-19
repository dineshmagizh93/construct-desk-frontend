"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { labourFormSchema, LabourFormSchema } from "@/lib/validations/labour"
import { Labour } from "@/types/labour"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface LabourFormProps {
  labour?: Labour
  projectId?: string
  onSubmit: (data: LabourFormSchema) => Promise<void>
  onCancel: () => void
}

export function LabourForm({ labour, projectId, onSubmit, onCancel }: LabourFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [projects, setProjects] = React.useState<Project[]>([])

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
  } = useForm<LabourFormSchema>({
    resolver: zodResolver(labourFormSchema),
    defaultValues: labour
      ? {
          projectId: labour.projectId,
          category: labour.category,
          headcount: labour.headcount,
          costPerDay: labour.costPerDay,
          date: labour.date,
          notes: labour.notes || "",
        }
      : {
          projectId: projectId || "",
          category: "Mason",
          headcount: 1,
          costPerDay: 0,
          date: new Date().toISOString().split("T")[0],
          notes: "",
        },
  })

  const selectedCategory = watch("category")
  const selectedProjectId = watch("projectId")

  const onFormSubmit = async (data: LabourFormSchema) => {
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
          <Label htmlFor="category">
            Labour Category <span className="text-destructive">*</span>
          </Label>
          <Select
            id="category"
            {...register("category")}
            onChange={(e) => setValue("category", e.target.value as Labour["category"])}
            value={selectedCategory}
          >
            <option value="Mason">Mason</option>
            <option value="Helper">Helper</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Painter">Painter</option>
            <option value="Other">Other</option>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="headcount">
            Headcount <span className="text-destructive">*</span>
          </Label>
          <Input
            id="headcount"
            type="number"
            min="1"
            step="1"
            {...register("headcount", { valueAsNumber: true })}
            placeholder="Enter number of workers"
          />
          {errors.headcount && <p className="text-sm text-destructive">{errors.headcount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPerDay">
            Cost Per Day <span className="text-destructive">*</span>
          </Label>
          <Input
            id="costPerDay"
            type="number"
            step="0.01"
            {...register("costPerDay", { valueAsNumber: true })}
            placeholder="Enter cost per day"
          />
          {errors.costPerDay && <p className="text-sm text-destructive">{errors.costPerDay.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes" rows={3} maxLength={250} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : labour ? "Update Labour Entry" : "Add Labour Entry"}
        </Button>
      </DialogFooter>
    </form>
  )
}

