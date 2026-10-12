import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface RowMenuItem {
  key: string
  label: string
  icon?: LucideIcon
  /** Runs when the item is chosen. Use `href` instead for a link or a file download. */
  onSelect?: () => void
  href?: string
  /** With `href`: the file name to save as. */
  download?: string
  destructive?: boolean
  disabled?: boolean
  /** Draws a divider above the item, to set a group apart (e.g. Delete). */
  separatorBefore?: boolean
  /** Turns the item into a submenu (e.g. one entry per attached file). */
  children?: RowMenuItem[]
}

function MenuItem({ item }: { item: RowMenuItem }) {
  const Icon = item.icon
  const content = (
    <>
      {Icon && <Icon className={cn('shrink-0', item.destructive && 'text-destructive')} />}
      <span>{item.label}</span>
    </>
  )
  const destructive = item.destructive ? 'text-destructive focus:text-destructive' : undefined

  if (item.children && item.children.length > 0) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="gap-2 [&_svg]:size-4">{content}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children.map((child) => (
            <MenuItem key={child.key} item={child} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }
  if (item.href) {
    return (
      <DropdownMenuItem asChild disabled={item.disabled} className={destructive}>
        <a href={item.href} download={item.download}>
          {content}
        </a>
      </DropdownMenuItem>
    )
  }
  return (
    <DropdownMenuItem disabled={item.disabled} className={destructive} onSelect={() => item.onSelect?.()}>
      {content}
    </DropdownMenuItem>
  )
}

/**
 * The three-dots menu at the end of a table row: every action for that record in one place, so rows stay uncluttered
 * and the same pattern works whether a module has one action or six. Renders nothing when there are none.
 * Clicks never reach the row, so choosing an action does not also open the record.
 */
export function RowActionsMenu({ items, label }: { items: RowMenuItem[]; label: string }) {
  if (items.length === 0) return null
  return (
    // Non-modal: actions open dialogs, and a modal menu closing under a dialog can leave the page unclickable.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`} title="Actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {items.map((item) => (
          <div key={item.key}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            <MenuItem item={item} />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
