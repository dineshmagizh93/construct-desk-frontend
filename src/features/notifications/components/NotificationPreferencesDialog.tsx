import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationPreferences, useSaveNotificationPreferences, withCategory } from '../preferences'

/** One switch per kind of notification. Each change is saved straight away; switching one off hides those notifications for you only. */
export function NotificationPreferencesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data, isLoading } = useNotificationPreferences()
  const save = useSaveNotificationPreferences()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification preferences</DialogTitle>
          <DialogDescription>Choose what appears in your notifications. Switching one off only hides it for you, and nothing is lost: switch it back on to see it again.</DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {data.categories.map((category) => {
              const receiving = !data.muted.includes(category.key)
              return (
                <li key={category.key}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      checked={receiving}
                      disabled={save.isPending}
                      onChange={(e) => save.mutate(withCategory(data.muted, category.key, e.target.checked))}
                    />
                    <span className="text-sm">
                      <span className="block font-medium">{category.label}</span>
                      <span className="block text-muted-foreground">{category.description}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
