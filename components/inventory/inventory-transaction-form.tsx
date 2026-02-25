"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { InventoryItem, TransactionType, inventoryApi } from "@/lib/api/inventory"
import { projectsApi } from "@/lib/api/projects"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface InventoryTransactionFormProps {
  itemId?: string
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function InventoryTransactionForm({ itemId, onSubmit, onCancel }: InventoryTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])

  React.useEffect(() => {
    const loadData = async () => {
      const [itemsData, projectsData] = await Promise.all([
        inventoryApi.getAllItems(),
        projectsApi.getAll(),
      ])
      setItems(itemsData)
      setProjects(projectsData)
    }
    loadData()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      itemId: itemId || "",
      type: TransactionType.IN,
      quantity: 0,
      projectId: "",
      reference: "",
      notes: "",
      transactionDate: new Date().toISOString().split("T")[0],
    },
  })

  const selectedItemId = watch("itemId")
  const selectedType = watch("type")

  const onFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      const submitData = {
        ...data,
        quantity: parseFloat(data.quantity),
        projectId: data.projectId || undefined,
        reference: data.reference || undefined,
        notes: data.notes || undefined,
        transactionDate: data.transactionDate || undefined,
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error("Form submission error:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="itemId">
          Item <span className="text-destructive">*</span>
        </Label>
        <Select
          id="itemId"
          {...register("itemId", { required: "Item is required" })}
          onChange={(e) => setValue("itemId", e.target.value)}
          value={selectedItemId}
          disabled={!!itemId}
        >
          <option value="">Select an item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.currentStock} {item.unit})
            </option>
          ))}
        </Select>
        {errors.itemId && <p className="text-sm text-destructive">{errors.itemId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Type <span className="text-destructive">*</span>
          </Label>
          <Select
            id="type"
            {...register("type", { required: "Type is required" })}
            onChange={(e) => setValue("type", e.target.value as TransactionType)}
            value={selectedType}
          >
            <option value={TransactionType.IN}>Stock In</option>
            <option value={TransactionType.OUT}>Stock Out</option>
            <option value={TransactionType.ADJUSTMENT}>Adjustment</option>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            {...register("quantity", { required: "Quantity is required", valueAsNumber: true })}
            placeholder="0"
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transactionDate">Transaction Date</Label>
          <Input
            id="transactionDate"
            type="date"
            {...register("transactionDate")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectId">Project</Label>
          <Select
            id="projectId"
            {...register("projectId")}
            onChange={(e) => setValue("projectId", e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference</Label>
        <Input
          id="reference"
          {...register("reference")}
          placeholder="PO Number, Invoice, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Create Transaction"}
        </Button>
      </DialogFooter>
    </form>
  )
}

