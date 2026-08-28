import { Building2, Layers } from 'lucide-react'
import { INDUSTRY_CONFIGS } from '@/lib/industry'
import { PageCta, PageHero } from '../components/shared'

export function IndustriesPage() {
  const construction = INDUSTRY_CONFIGS.construction
  const interiors = INDUSTRY_CONFIGS.interior_design
  const pairs = [
    { key: 'projects', left: construction.moduleText.projects.title, right: interiors.moduleText.projects.title },
    { key: 'estimates', left: construction.moduleText.estimates.title, right: interiors.moduleText.estimates.title },
    { key: 'site', left: construction.moduleText.siteProgress.title, right: interiors.moduleText.siteProgress.title },
    { key: 'labour', left: construction.moduleText.labour.title, right: interiors.moduleText.labour.title },
    { key: 'equipment', left: construction.moduleText.equipment.title, right: interiors.moduleText.equipment.title },
    { key: 'inventory', left: construction.moduleText.inventory.title, right: interiors.moduleText.inventory.title },
  ]

  return (
    <>
      <PageHero
        align="left"
        eyebrow="Industries"
        title="One product. Two industry vocabularies."
        description="Switch workspace terminology between construction and interior design without changing software — or running two tools."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { config: construction, icon: Building2, kicker: 'Primary focus' },
            { config: interiors, icon: Layers, kicker: 'Also supported' },
          ].map(({ config, icon: Icon, kicker }) => (
            <article key={config.key} className="rounded-2xl border border-border bg-card p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{kicker}</p>
              <div className="mt-4 flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">{config.label}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{config.tagline}</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Project types
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {config.projectTypeOptions.map((opt) => (
                  <span key={opt.value} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                    {opt.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">What it is called in each workspace</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Same modules underneath. The labels your team sees match how they already talk.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3.5 font-semibold">Construction</th>
                  <th className="px-5 py-3.5 font-semibold">Interior design</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((row) => (
                  <tr key={row.key} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 text-muted-foreground">{row.left}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <PageCta
        title="Not sure which mode to start in?"
        description="Every plan supports both. You can switch terminology later without migrating data."
        primary={{ label: 'Request a demo', to: '/request-demo' }}
        secondary={{ label: 'View pricing', to: '/pricing' }}
      />
    </>
  )
}
