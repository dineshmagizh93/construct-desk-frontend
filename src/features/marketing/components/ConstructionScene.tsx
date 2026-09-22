import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { Building2, Check, Layers3, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type SceneVariant = 'overview' | 'features' | 'modules' | 'workflow' | 'pricing' | 'support' | 'security'

const SCENE_COPY: Record<SceneVariant, { label: string; title: string; detail: string; tag: string }> = {
  overview: { label: 'PROJECT OVERVIEW', title: 'Everything in place.', detail: 'Your team. Your sites. One workspace.', tag: 'Connected workspace' },
  features: { label: 'BUILT FOR THE WAY YOU WORK', title: 'Clarity at every level.', detail: 'From the first enquiry to the final handover.', tag: 'One source of truth' },
  modules: { label: 'ONE CONNECTED SYSTEM', title: 'Every detail, connected.', detail: 'Sales, site, resources and finance.', tag: 'Built to work together' },
  workflow: { label: 'FROM PLAN TO PROGRESS', title: 'Build your momentum.', detail: 'Set up. Invite. Organise. Get to work.', tag: 'A simpler start' },
  pricing: { label: 'ROOM TO GROW', title: 'A stronger foundation.', detail: 'Choose the workspace that fits your team.', tag: 'Scale with your business' },
  support: { label: 'LET’S BUILD BETTER', title: 'A clearer way forward.', detail: 'Real answers for your real projects.', tag: 'People behind the product' },
  security: { label: 'BUILT ON TRUST', title: 'Confidence, by design.', detail: 'Clear policies. A dependable foundation.', tag: 'Your business comes first' },
}

function Building({ className, floors = 5 }: { className: string; floors?: number }) {
  return (
    <div className={cn('scene-building', className)}>
      <div className="building-face building-front">
        {Array.from({ length: floors }, (_, i) => <span className="building-floor" key={i}><i /><i /><i /></span>)}
      </div>
      <div className="building-face building-side">
        {Array.from({ length: floors }, (_, i) => <span className="building-floor" key={i}><i /><i /></span>)}
      </div>
      <div className="building-face building-roof"><span /></div>
    </div>
  )
}

/** Lightweight CSS geometry: no canvas, network assets, or continuous JS render loop. */
export function ConstructionScene({ variant = 'overview', compact = false, className }: {
  variant?: SceneVariant
  compact?: boolean
  className?: string
}) {
  const stage = useRef<HTMLDivElement>(null)
  const copy = SCENE_COPY[variant]

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    stage.current?.style.setProperty('--scene-rx', `${(event.clientY - bounds.top - bounds.height / 2) / bounds.height * -5}deg`)
    stage.current?.style.setProperty('--scene-ry', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 7}deg`)
  }
  const reset = () => {
    stage.current?.style.setProperty('--scene-rx', '0deg')
    stage.current?.style.setProperty('--scene-ry', '0deg')
  }

  return (
    <div className={cn('construction-scene', compact && 'construction-scene-compact', className)}
      data-variant={variant} onPointerMove={onMove} onPointerLeave={reset} aria-hidden="true">
      <div className="scene-halo" />
      <div className="scene-orbit scene-orbit-one" /><div className="scene-orbit scene-orbit-two" />
      <div className="scene-corner-label"><span /> {copy.tag}</div>
      <div className="scene-stage" ref={stage}>
        <div className="scene-platform">
          <div className="platform-grid" />
          <div className="platform-road" />
          <div className="platform-garden garden-one" /><div className="platform-garden garden-two" />
        </div>
        <div className="scene-city">
          <Building className="building-back" floors={4} />
          <Building className="building-main" floors={7} />
          <Building className="building-low" floors={3} />
          <div className="scene-crane"><div className="crane-mast" /><div className="crane-boom" /><div className="crane-cable" /><div className="crane-load" /></div>
          <div className="scene-tree tree-one" /><div className="scene-tree tree-two" /><div className="scene-tree tree-three" />
        </div>
        <div className="scene-note scene-note-project">
          <span className="scene-note-icon"><Building2 size={17} /></span>
          <div><small>PROJECT PROGRESS · SAMPLE</small><strong>Lakeview Towers</strong><div className="scene-progress"><span /></div></div>
          <b>72<span>%</span></b>
        </div>
        <div className="scene-note scene-note-check"><span className="scene-check"><Check size={15} /></span><div><strong>Teams in sync</strong><small>Office to on-site</small></div></div>
        <div className="scene-note scene-note-finance"><TrendingUp size={18} /><div><small>BUDGET & ACTUALS</small><strong>See the full picture</strong></div></div>
        <div className="scene-layer" style={{ '--layer-i': 1 } as CSSProperties}><Layers3 size={15} /> Plan</div>
        <div className="scene-layer" style={{ '--layer-i': 2 } as CSSProperties}><Layers3 size={15} /> Build</div>
        <div className="scene-layer" style={{ '--layer-i': 3 } as CSSProperties}><Layers3 size={15} /> Deliver</div>
      </div>
      <div className="scene-caption"><small>{copy.label}</small><strong>{copy.title}</strong><p>{copy.detail}</p></div>
      <span className="scene-coordinate">CD / WORKSPACE SYSTEM</span>
    </div>
  )
}
