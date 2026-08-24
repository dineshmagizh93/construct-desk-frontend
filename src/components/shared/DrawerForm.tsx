import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUploadField } from './FileUploadField'
import type { FieldConfig, UploadedFile } from './types'
import { cn } from '@/lib/utils'

interface DrawerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FieldConfig[]
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => Promise<unknown> | void
  submitLabel?: string
}

// Sensible per-type character caps so every text field is bounded (prevents runaway input and
// keeps table cells sane). A field can override via FieldConfig.maxLength.
const DEFAULT_MAX_LENGTH: Partial<Record<FieldConfig['type'], number>> = {
  text: 120,
  email: 254,
  textarea: 2000,
}

export function DrawerForm({
  open,
  onOpenChange,
  title,
  description,
  fields,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: DrawerFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  useEffect(() => {
    if (open) reset(defaultValues ?? {})
  }, [open, defaultValues, reset])

  const submit = async (raw: Record<string, unknown>) => {
    // Normalise empty optional inputs so the API/Prisma don't choke: empty date → null (and any
    // date → full ISO), empty/NaN number → omitted so the column default applies.
    const values: Record<string, unknown> = { ...raw }
    for (const field of fields) {
      const v = values[field.name]
      if (field.type === 'date') {
        values[field.name] = v ? new Date(v as string).toISOString() : null
      } else if (field.type === 'number') {
        if (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))) {
          delete values[field.name]
        } else if (typeof v === 'string') {
          const num = Number(v)
          if (Number.isNaN(num)) delete values[field.name]
          else values[field.name] = num
        }
      }
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch {
      // Validation/mutation failed — keep the dialog open so the user can correct it.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Don't close the form on outside interaction — it prevents accidental data loss and, more
          importantly, avoids a Radix quirk where closing a Select routes a spurious pointer-down to
          the overlay and closes the whole dialog. The dialog still closes via Cancel, the X, or Escape. */}
      <DialogContent
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          id="drawer-form"
          className="grid grid-cols-1 gap-x-4 gap-y-3.5 overflow-y-auto px-6 py-5 sm:grid-cols-2"
          onSubmit={handleSubmit(submit)}
        >
          {fields.map((field) => {
            const maxLen = field.maxLength ?? DEFAULT_MAX_LENGTH[field.type]
            const showCounter = maxLen != null && (field.type === 'text' || field.type === 'email' || field.type === 'textarea')
            const currentLen = showCounter ? String(watch(field.name) ?? '').length : 0
            return (
              <div key={field.name} className={cn('space-y-1.5', field.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2')}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>

                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    maxLength={maxLen}
                    rows={3}
                    {...register(field.name, { required: field.required })}
                  />
                )}

                {field.type === 'checkbox' && (
                  <div className="flex h-9 items-center">
                    <Checkbox id={field.name} {...register(field.name)} />
                  </div>
                )}

                {field.type === 'select' && (
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{ required: field.required }}
                    render={({ field: ctrlField }) => (
                      <Select value={(ctrlField.value as string) ?? ''} onValueChange={ctrlField.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}

                {(field.type === 'text' || field.type === 'email' || field.type === 'date') && (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    maxLength={maxLen}
                    {...register(field.name, { required: field.required })}
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    id={field.name}
                    type="number"
                    step={field.step ?? '1'}
                    placeholder={field.placeholder}
                    {...register(field.name, { required: field.required, valueAsNumber: true })}
                  />
                )}

                {errors[field.name] && <p className="text-xs text-destructive">{field.label} is required.</p>}

                {showCounter && (
                  <p className={cn('text-right text-[10px] tabular-nums', currentLen >= (maxLen ?? 0) ? 'text-destructive' : 'text-muted-foreground')}>
                    {currentLen}/{maxLen}
                  </p>
                )}

                {field.type === 'file' && (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: ctrlField }) => (
                      <FileUploadField
                        value={ctrlField.value as UploadedFile[] | undefined}
                        onChange={ctrlField.onChange}
                        accept={field.accept}
                        multiple={field.multiple}
                        folder={field.uploadFolder ?? 'documents'}
                      />
                    )}
                  />
                )}
              </div>
            )
          })}
        </form>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="drawer-form" disabled={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
