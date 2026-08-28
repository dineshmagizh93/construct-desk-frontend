import { Link } from 'react-router-dom'
import { HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-[1.03]',
          light ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        <HardHat className="size-5" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-display text-lg font-bold tracking-tight', light && 'text-white')}>
          ConstructDesk
        </span>
        <span className={cn('text-[10px] font-medium uppercase tracking-wider text-muted-foreground', light && 'text-white/55')}>
          Construction CRM
        </span>
      </div>
    </Link>
  )
}
