"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leadFormSchema, LeadFormSchema } from "@/lib/validations/lead"
import { Lead } from "@/types/lead"
import { usersApi, User } from "@/lib/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface LeadFormProps {
  lead?: Lead
  onSubmit: (data: LeadFormSchema) => Promise<void>
  onCancel: () => void
}

export function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(true)

  // Fetch users from backend
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const data = await usersApi.getAll()
        setUsers(data)
      } catch (error) {
        console.error("Failed to load users:", error)
        // If API fails, keep empty array (users will just be empty)
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead
      ? {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || "",
          source: lead.source,
          status: lead.status,
          assignedTo: lead.assignedTo || "",
          notes: lead.notes || "",
        }
      : {
          name: "",
          phone: "",
          email: "",
          source: "Direct",
          status: "New",
          assignedTo: "",
          notes: "",
        },
  })

  const source = watch("source")
  const status = watch("status")
  const assignedTo = watch("assignedTo")

  const onFormSubmit = async (data: LeadFormSchema) => {
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
          Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register("name")} placeholder="Enter full name" required />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">
            Source <span className="text-destructive">*</span>
          </Label>
          <Select
            id="source"
            {...register("source")}
            onChange={(e) => setValue("source", e.target.value as Lead["source"])}
            value={source}
          >
            <option value="Broker">Broker</option>
            <option value="Portal">Portal</option>
            <option value="Referral">Referral</option>
            <option value="Direct">Direct</option>
          </Select>
          {errors.source && <p className="text-sm text-destructive">{errors.source.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            id="status"
            {...register("status")}
            onChange={(e) => setValue("status", e.target.value as Lead["status"])}
            value={status}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Select
          id="assignedTo"
          {...register("assignedTo")}
          onChange={(e) => setValue("assignedTo", e.target.value || undefined)}
          value={assignedTo || ""}
          disabled={loadingUsers}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.name}>
              {user.name}
            </option>
          ))}
        </Select>
        {loadingUsers && (
          <p className="text-xs text-muted-foreground">Loading users...</p>
        )}
        {!loadingUsers && users.length === 0 && (
          <p className="text-xs text-muted-foreground">No users available. Only the company admin can assign leads.</p>
        )}
        {errors.assignedTo && <p className="text-sm text-destructive">{errors.assignedTo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Enter any additional notes"
          rows={4}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
      </DialogFooter>
    </form>
  )
}

