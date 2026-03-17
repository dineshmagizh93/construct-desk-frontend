"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { vendorFormSchema, VendorFormSchema } from "@/lib/validations/vendor"
import { Vendor } from "@/types/vendor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { CountrySelector, StateSelector } from "@/components/ui/country-state-selector"

interface VendorFormProps {
  vendor?: Vendor
  onSubmit: (data: VendorFormSchema) => Promise<void>
  onCancel: () => void
}

export function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VendorFormSchema>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: vendor
      ? {
          name: vendor.name,
          type: vendor.type,
          phone: vendor.phone,
          email: vendor.email || "",
          address: vendor.address || "",
          city: vendor.city || "",
          state: vendor.state || "",
          country: vendor.country || "",
          notes: vendor.notes || "",
          status: vendor.status,
        }
      : {
          name: "",
          type: "Material Supplier",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          country: "",
          notes: "",
          status: "Active",
        },
  })

  const selectedType = watch("type")
  const selectedStatus = watch("status")
  const selectedCountry = watch("country")

  const onFormSubmit = async (data: VendorFormSchema) => {
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
        <Label htmlFor="name">
          Vendor Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register("name")} placeholder="Enter vendor name" required />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Vendor Type <span className="text-destructive">*</span>
          </Label>
          <Select
            id="type"
            {...register("type")}
            onChange={(e) => setValue("type", e.target.value as Vendor["type"])}
            value={selectedType}
          >
            <option value="Material Supplier">Material Supplier</option>
            <option value="Contractor">Contractor</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Transport">Transport</option>
            <option value="Equipment Rental">Equipment Rental</option>
            <option value="Other">Other</option>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            id="status"
            {...register("status")}
            onChange={(e) => setValue("status", e.target.value as Vendor["status"])}
            value={selectedStatus}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-destructive">*</span>
          </Label>
          <Input id="phone" {...register("phone")} placeholder="Enter phone number" required />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address (optional)"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input id="address" {...register("address")} placeholder="Enter street address (optional)" />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="City (optional)" />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <StateSelector
                countryName={selectedCountry}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <CountrySelector
                value={field.value}
                onChange={(val) => {
                  field.onChange(val)
                  setValue('state', '') // Reset state when country changes
                }}
              />
            )}
          />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>
      </div>

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
          {isSubmitting ? "Saving..." : vendor ? "Update Vendor" : "Create Vendor"}
        </Button>
      </DialogFooter>
    </form>
  )
}

