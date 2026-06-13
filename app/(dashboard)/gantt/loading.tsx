import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 p-6 animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "240px 1fr" }}>
          <div className="border-r border-slate-200 p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-7 rounded-md" style={{ width: `${40 + Math.random() * 40}%`, marginLeft: `${Math.random() * 20}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
