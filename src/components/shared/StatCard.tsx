import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' }
  iconClassName?: string
}

export function StatCard({ label, value, icon: Icon, trend, iconClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1.5 flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-success' : 'text-destructive',
              )}
            >
              {trend.direction === 'up' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary', iconClassName)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
