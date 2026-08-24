import { Link } from 'react-router-dom'
import { HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
        <HardHat className="size-5" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-display text-lg font-bold tracking-tight', light && 'text-primary-foreground')}>
          ConstructDesk
        </span>
        <span className={cn('text-[10px] font-medium uppercase tracking-wider text-muted-foreground', light && 'text-primary-foreground/60')}>
          Construction CRM
        </span>
      </div>
    </Link>
  )
}
