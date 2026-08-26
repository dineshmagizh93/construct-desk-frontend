import { motion } from 'framer-motion'
import { NAV_GROUPS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PageHero } from '../components/shared'

const GROUP_ACCENTS = [
  { header: 'from-blue-500/20 to-blue-500/5 text-blue-700', chip: 'bg-blue-500/10 text-blue-600' },
  { header: 'from-violet-500/20 to-violet-500/5 text-violet-700', chip: 'bg-violet-500/10 text-violet-600' },
  { header: 'from-emerald-500/20 to-emerald-500/5 text-emerald-700', chip: 'bg-emerald-500/10 text-emerald-600' },
  { header: 'from-amber-500/20 to-amber-500/5 text-amber-700', chip: 'bg-amber-500/10 text-amber-600' },
  { header: 'from-rose-500/20 to-rose-500/5 text-rose-700', chip: 'bg-rose-500/10 text-rose-600' },
  { header: 'from-cyan-500/20 to-cyan-500/5 text-cyan-700', chip: 'bg-cyan-500/10 text-cyan-600' },
  { header: 'from-indigo-500/20 to-indigo-500/5 text-indigo-700', chip: 'bg-indigo-500/10 text-indigo-600' },
  { header: 'from-teal-500/20 to-teal-500/5 text-teal-700', chip: 'bg-teal-500/10 text-teal-600' },
]

export function ModulesPage() {
  const totalModules = NAV_GROUPS.reduce((sum, group) => sum + group.items.length, 0)
  return (
    <>
      <PageHero
        eyebrow="Modules"
        title={`${totalModules} modules, already built`}
        description="Nothing here is a mockup — this is the actual module list running inside the app today."
      />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_GROUPS.map((group, gi) => {
            const accent = GROUP_ACCENTS[gi % GROUP_ACCENTS.length]
            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: gi * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className={cn('bg-gradient-to-br px-5 py-4', accent.header)}>
                  <p className="text-xs font-bold uppercase tracking-widest">{group.label}</p>
                  <p className="text-2xl font-bold">{group.items.length}</p>
                  <p className="text-xs opacity-70">module{group.items.length > 1 ? 's' : ''}</p>
                </div>
                <div className="space-y-1 p-3">
                  {group.items.map((item) => (
                    <div key={item.to} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary">
                      <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-md transition-transform duration-200 hover:scale-110', accent.chip)}>
                        <item.icon className="size-3.5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>
    </>
  )
}
