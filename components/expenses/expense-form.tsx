"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { expenseFormSchema, ExpenseFormSchema } from "@/lib/validations/expense"
import { Expense } from "@/types/expense"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Paperclip } from "lucide-react"

interface ExpenseFormProps {
  expense?: Expense
  projectId?: string
  onSubmit: (data: ExpenseFormSchema) => Promise<void>
  onCancel: () => void
}

export function ExpenseForm({ expense, projectId, onSubmit, onCancel }: ExpenseFormProps) {
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
  } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? {
          projectId: expense.projectId,
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          paidTo: expense.paidTo,
          notes: expense.notes || "",
          attachment: expense.attachment || "",
        }
      : {
          projectId: projectId || "",
          category: "Material",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          paidTo: "",
          notes: "",
          attachment: "",
        },
  })

  const selectedCategory = watch("category")
  const selectedProjectId = watch("projectId")

  const onFormSubmit = async (data: ExpenseFormSchema) => {
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
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            id="category"
            {...register("category")}
            onChange={(e) => setValue("category", e.target.value as Expense["category"])}
            value={selectedCategory}
          >
            <option value="Material">Material</option>
            <option value="Labour">Labour</option>
            <option value="Transport">Transport</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            placeholder="Enter amount"
            required
            min="0.01"
          />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input id="date" type="date" {...register("date")} required />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidTo">
            Paid To <span className="text-destructive">*</span>
          </Label>
          <Input id="paidTo" {...register("paidTo")} placeholder="Enter recipient name" required />
          {errors.paidTo && <p className="text-sm text-destructive">{errors.paidTo.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes" rows={3} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment" className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachment URL (optional)
        </Label>
        <Input
          id="attachment"
          type="url"
          {...register("attachment")}
          placeholder="Enter attachment URL (e.g., invoice link)"
        />
        {errors.attachment && <p className="text-sm text-destructive">{errors.attachment.message}</p>}
        <p className="text-xs text-muted-foreground">Enter a URL to an invoice or receipt document</p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
        </Button>
      </DialogFooter>
    </form>
  )
}

