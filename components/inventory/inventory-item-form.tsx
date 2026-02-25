"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { InventoryItem, InventoryCategory, inventoryApi } from "@/lib/api/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface InventoryItemFormProps {
  item?: InventoryItem
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function InventoryItemForm({ item, onSubmit, onCancel }: InventoryItemFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || "",
          category: item.category,
          unit: item.unit,
          currentStock: item.currentStock,
          minStock: item.minStock,
          unitPrice: item.unitPrice || "",
          vendorId: item.vendorId || "",
          location: item.location || "",
          sku: item.sku || "",
          notes: item.notes || "",
        }
      : {
          name: "",
          description: "",
          category: InventoryCategory.MATERIAL,
          unit: "pcs",
          currentStock: 0,
          minStock: 0,
          unitPrice: "",
          vendorId: "",
          location: "",
          sku: "",
          notes: "",
        },
  })

  const selectedCategory = watch("category")

  const onFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      const submitData = {
        ...data,
        currentStock: data.currentStock ? parseFloat(data.currentStock) : 0,
        minStock: data.minStock ? parseFloat(data.minStock) : 0,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : undefined,
        vendorId: data.vendorId || undefined,
        location: data.location || undefined,
        sku: data.sku || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register("name", { required: "Item name is required" })}
          placeholder="Enter item name"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter item description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            id="category"
            {...register("category", { required: "Category is required" })}
            onChange={(e) => setValue("category", e.target.value as InventoryCategory)}
            value={selectedCategory}
          >
            <option value={InventoryCategory.MATERIAL}>Material</option>
            <option value={InventoryCategory.TOOL}>Tool</option>
            <option value={InventoryCategory.EQUIPMENT}>Equipment</option>
            <option value={InventoryCategory.OTHER}>Other</option>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">
            Unit <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unit"
            {...register("unit", { required: "Unit is required" })}
            placeholder="kg, pcs, m, etc."
          />
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentStock">Current Stock</Label>
          <Input
            id="currentStock"
            type="number"
            step="0.01"
            {...register("currentStock", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">Min Stock</Label>
          <Input
            id="minStock"
            type="number"
            step="0.01"
            {...register("minStock", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            {...register("unitPrice", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            {...register("sku")}
            placeholder="Stock Keeping Unit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Warehouse, Site, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendorId">Vendor ID</Label>
        <Input
          id="vendorId"
          {...register("vendorId")}
          placeholder="Vendor ID (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes"
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
        </Button>
      </DialogFooter>
    </form>
  )
}

