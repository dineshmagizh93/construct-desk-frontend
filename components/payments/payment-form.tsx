"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentFormSchema, PaymentFormSchema } from "@/lib/validations/payment"
import { Payment } from "@/types/payment"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface PaymentFormProps {
  payment?: Payment
  projectId?: string
  onSubmit: (data: PaymentFormSchema) => Promise<void>
  onCancel: () => void
}

export function PaymentForm({ payment, projectId, onSubmit, onCancel }: PaymentFormProps) {
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
  } = useForm<PaymentFormSchema>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment
      ? {
          projectId: payment.projectId,
          milestone: payment.milestone,
          amount: payment.amount,
          dueDate: payment.dueDate,
          status: payment.status,
          paidDate: payment.paidDate || "",
          notes: payment.notes || "",
        }
      : {
          projectId: projectId || "",
          milestone: "",
          amount: 0,
          dueDate: "",
          status: "Pending",
          paidDate: "",
          notes: "",
        },
  })

  const selectedStatus = watch("status")
  const selectedProjectId = watch("projectId")

  const onFormSubmit = async (data: PaymentFormSchema) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

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
        <Label htmlFor="milestone">
          Milestone Name <span className="text-destructive">*</span>
        </Label>
        <Input id="milestone" {...register("milestone")} placeholder="Enter milestone name" required />
        {errors.milestone && <p className="text-sm text-destructive">{errors.milestone.message}</p>}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">
            Due Date <span className="text-destructive">*</span>
          </Label>
          <Input id="dueDate" type="date" {...register("dueDate")} required />
          {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            id="status"
            {...register("status")}
            onChange={(e) => setValue("status", e.target.value as Payment["status"])}
            value={selectedStatus}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      {selectedStatus === "Paid" && (
        <div className="space-y-2">
          <Label htmlFor="paidDate">
            Paid Date <span className="text-destructive">*</span>
          </Label>
          <Input id="paidDate" type="date" {...register("paidDate")} />
          {errors.paidDate && <p className="text-sm text-destructive">{errors.paidDate.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes" rows={4} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : payment ? "Update Payment" : "Create Payment"}
        </Button>
      </DialogFooter>
    </form>
  )
}

