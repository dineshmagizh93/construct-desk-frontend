"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userFormSchema, UserFormSchema } from "@/lib/validations/user"
import { User } from "@/lib/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface UserFormProps {
  user?: User
  onSubmit: (data: UserFormSchema & { permissions?: UserPermission[] }) => Promise<void>
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          role: user.role,
          phone: "",
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          role: "user",
          phone: "",
        },
  })

  const role = watch("role")

  const onFormSubmit = async (data: UserFormSchema) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
      throw error // Re-throw to show error in form
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} placeholder="Enter first name" />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} placeholder="Enter last name" />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input id="email" type="email" {...register("email")} placeholder="Enter email address" required />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        {!user && (
          <p className="text-xs text-muted-foreground">
            Email will be used as login ID. Default password: welcome@123
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-destructive">*</span>
        </Label>
        <Select
          id="role"
          {...register("role")}
          onChange={(e) => setValue("role", e.target.value as User["role"])}
          value={role}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} placeholder="Enter phone number (optional)" />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>


      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  )
}

