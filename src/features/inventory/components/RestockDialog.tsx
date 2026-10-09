import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSubmitRestock } from '../restock-api'
import { countLines, restockTitle, type RestockGroup } from '../restock'

interface RestockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: RestockGroup[]
  projectNames: Record<string, string>
}

/** Shows what a restock request would order (low items only, topped up to twice the reorder level) and raises it. */
export function RestockDialog({ open, onOpenChange, plan, projectNames }: RestockDialogProps) {
  const submit = useSubmitRestock()
  const titleFor = (projectId: string) => restockTitle(projectNames[projectId] ?? 'Project', new Date())
  const lines = countLines(plan)

  const raise = async () => {
    await submit.mutateAsync({ plan, titleFor })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request restock</DialogTitle>
          <DialogDescription>
            {lines} low item{lines === 1 ? '' : 's'} not yet on an open request. One purchase request is raised per project, for approval, topping each item up to twice its reorder level.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-4 overflow-y-auto">
          {plan.map((group) => (
            <div key={group.projectId}>
              <p className="text-sm font-medium">{projectNames[group.projectId] ?? 'Project'}</p>
              <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                {group.lines.map((line) => (
                  <li key={line.inventoryItemId} className="flex justify-between gap-3">
                    <span className="truncate">{line.name}</span>
                    <span className="shrink-0 font-medium text-foreground">
                      {line.quantity} {line.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submit.isPending}>
            Cancel
          </Button>
          <Button onClick={raise} disabled={submit.isPending || lines === 0}>
            {submit.isPending ? 'Raising…' : `Raise ${plan.length} request${plan.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
