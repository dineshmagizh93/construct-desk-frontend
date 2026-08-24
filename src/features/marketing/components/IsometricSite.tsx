/**
 * A colorful isometric "construction site" illustration for the marketing hero — hand-built
 * from a small 2:1 isometric projection helper so every box shades consistently (light top,
 * mid front, dark right face) for a real sense of depth.
 */

const ISO_X = 30
const ISO_Y = 15
const ISO_Z = 24
const OX = 250
const OY = 250

function proj(x: number, y: number, z: number): [number, number] {
  return [OX + (x - y) * ISO_X, OY + (x + y) * ISO_Y - z * ISO_Z]
}
const toPts = (arr: [number, number][]) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

interface Shades {
  top: string
  left: string
  right: string
}

function IsoBox({ x, y, z, w, d, h, c, opacity = 1 }: { x: number; y: number; z: number; w: number; d: number; h: number; c: Shades; opacity?: number }) {
  const top: [number, number][] = [proj(x, y, z + h), proj(x + w, y, z + h), proj(x + w, y + d, z + h), proj(x, y + d, z + h)]
  const right: [number, number][] = [proj(x + w, y, z + h), proj(x + w, y + d, z + h), proj(x + w, y + d, z), proj(x + w, y, z)]
  const front: [number, number][] = [proj(x, y + d, z + h), proj(x + w, y + d, z + h), proj(x + w, y + d, z), proj(x, y + d, z)]
  return (
    <g opacity={opacity}>
      <polygon points={toPts(front)} fill={c.left} />
      <polygon points={toPts(right)} fill={c.right} />
      <polygon points={toPts(top)} fill={c.top} />
    </g>
  )
}

// A window pane on the front face (plane y = yFace), spanning east [x0,x1] and up [z0,z1].
function FrontWin({ yFace, x0, x1, z0, z1, fill }: { yFace: number; x0: number; x1: number; z0: number; z1: number; fill: string }) {
  const p: [number, number][] = [proj(x0, yFace, z1), proj(x1, yFace, z1), proj(x1, yFace, z0), proj(x0, yFace, z0)]
  return <polygon points={toPts(p)} fill={fill} />
}
// A window pane on the right face (plane x = xFace), spanning depth [y0,y1] and up [z0,z1].
function RightWin({ xFace, y0, y1, z0, z1, fill }: { xFace: number; y0: number; y1: number; z0: number; z1: number; fill: string }) {
  const p: [number, number][] = [proj(xFace, y0, z1), proj(xFace, y1, z1), proj(xFace, y1, z0), proj(xFace, y0, z0)]
  return <polygon points={toPts(p)} fill={fill} />
}

const BLUE: Shades = { top: '#60a5fa', left: '#3b82f6', right: '#2563eb' }
const INDIGO: Shades = { top: '#818cf8', left: '#6366f1', right: '#4f46e5' }
const TEAL: Shades = { top: '#5eead4', left: '#2dd4bf', right: '#14b8a6' }
const AMBER: Shades = { top: '#fcd34d', left: '#fbbf24', right: '#f59e0b' }
const ORANGE: Shades = { top: '#fdba74', left: '#fb923c', right: '#f97316' }
const PINK: Shades = { top: '#f9a8d4', left: '#f472b6', right: '#ec4899' }
const GREEN: Shades = { top: '#6ee7b7', left: '#34d399', right: '#10b981' }

// Rows of window panes for a floor: front + right faces.
function Windows({ x, y, w, d, zBase, floors, litSeed = 0 }: { x: number; y: number; w: number; d: number; zBase: number; floors: number; litSeed?: number }) {
  const panes: React.ReactNode[] = []
  let k = litSeed
  for (let f = 0; f < floors; f++) {
    const z0 = zBase + 0.35 + f * 1.4
    const z1 = z0 + 0.75
    for (let i = 0; i < Math.round(w / 0.75); i++) {
      const wx0 = x + 0.28 + i * 0.75
      const lit = (k++ % 3 === 0)
      panes.push(<FrontWin key={`f${f}i${i}`} yFace={y + d} x0={wx0} x1={wx0 + 0.42} z0={z0} z1={z1} fill={lit ? '#fde68a' : '#cffafe'} />)
    }
    for (let i = 0; i < Math.round(d / 0.75); i++) {
      const wy0 = y + 0.28 + i * 0.75
      const lit = (k++ % 3 === 1)
      panes.push(<RightWin key={`r${f}i${i}`} xFace={x + w} y0={wy0} y1={wy0 + 0.42} z0={z0} z1={z1} fill={lit ? '#fde68a' : '#a5f3fc'} />)
    }
  }
  return <>{panes}</>
}

export function IsometricSite({ className }: { className?: string }) {
  // Ground/blueprint slab grid lines (drawn on the slab top face, z = 0.4).
  const gridLines: React.ReactNode[] = []
  for (let g = 0; g <= 8; g++) {
    gridLines.push(<line key={`gx${g}`} {...lineProps(proj(g, 0, 0.41), proj(g, 8, 0.41))} />)
    gridLines.push(<line key={`gy${g}`} {...lineProps(proj(0, g, 0.41), proj(8, g, 0.41))} />)
  }

  // Crane geometry.
  const mastX = 5.7
  const mastY = 3.3
  const mastTopZ = 0.4 + 6.4
  const jibZ = mastTopZ - 0.5
  const hookX = 1.9
  const hookTop = proj(hookX, mastY + 0.15, jibZ + 0.15)
  const hookBottom = proj(hookX, mastY + 0.15, 2.5)

  return (
    <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Isometric illustration of a building under construction with a tower crane">
      <defs>
        <linearGradient id="slabGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft contact shadow */}
      <ellipse cx={OX} cy={OY + 96} rx="210" ry="70" fill="url(#groundShadow)" />

      {/* blueprint slab */}
      <IsoBox x={0} y={0} z={0} w={8} d={8} h={0.4} c={{ top: '#2563eb', left: '#1e40af', right: '#172554' }} />
      <polygon points={toPts([proj(0, 0, 0.4), proj(8, 0, 0.4), proj(8, 8, 0.4), proj(0, 8, 0.4)])} fill="url(#slabGrad)" opacity="0.55" />
      <g stroke="#dbeafe" strokeWidth="1" opacity="0.5">{gridLines}</g>

      {/* material stacks (foreground color pops) */}
      <IsoBox x={0.6} y={5.6} z={0.4} w={1.3} d={1.3} h={0.5} c={ORANGE} />
      <IsoBox x={0.6} y={5.6} z={0.9} w={1.1} d={1.1} h={0.45} c={ORANGE} />
      <IsoBox x={2.4} y={6.1} z={0.4} w={1.1} d={1.0} h={0.7} c={PINK} />
      <IsoBox x={6.2} y={5.9} z={0.4} w={1.2} d={1.2} h={0.55} c={GREEN} />

      {/* building — three stacked floors, top one "in progress" */}
      <IsoBox x={1.7} y={1.4} z={0.4} w={3} d={3} h={1.4} c={INDIGO} />
      <IsoBox x={1.7} y={1.4} z={1.8} w={3} d={3} h={1.4} c={BLUE} />
      <Windows x={1.7} y={1.4} w={3} d={3} zBase={0.4} floors={2} />
      {/* in-progress top floor: lighter, slightly inset, with exposed frame columns */}
      <IsoBox x={2.0} y={1.7} z={3.2} w={2.4} d={2.4} h={1.1} c={TEAL} opacity={0.92} />
      <g stroke="#0f766e" strokeWidth="2" opacity="0.5">
        <line {...lineProps(proj(2.0, 1.7, 3.2), proj(2.0, 1.7, 4.6))} />
        <line {...lineProps(proj(4.4, 1.7, 3.2), proj(4.4, 1.7, 4.6))} />
        <line {...lineProps(proj(4.4, 4.1, 3.2), proj(4.4, 4.1, 4.6))} />
      </g>

      {/* tower crane */}
      <g className="animate-crane" style={{ transformOrigin: `${proj(mastX, mastY, mastTopZ)[0]}px ${proj(mastX, mastY, mastTopZ)[1]}px` }}>
        {/* mast */}
        <IsoBox x={mastX} y={mastY} z={0.4} w={0.42} d={0.42} h={6.4} c={AMBER} />
        {/* operator cab */}
        <IsoBox x={mastX - 0.15} y={mastY - 0.15} z={mastTopZ - 0.9} w={0.72} d={0.72} h={0.7} c={{ top: '#fef3c7', left: '#fde68a', right: '#fcd34d' }} />
        {/* jib (long arm, reaching over the building) */}
        <IsoBox x={hookX} y={mastY + 0.02} z={jibZ} w={mastX - hookX + 0.42} d={0.34} h={0.34} c={AMBER} />
        {/* counter-jib + counterweight */}
        <IsoBox x={mastX + 0.42} y={mastY + 0.05} z={jibZ} w={1.1} d={0.28} h={0.28} c={AMBER} />
        <IsoBox x={mastX + 1.35} y={mastY - 0.02} z={jibZ - 0.25} w={0.5} d={0.45} h={0.6} c={{ top: '#94a3b8', left: '#64748b', right: '#475569' }} />
        {/* cable + hook + hanging load */}
        <line x1={hookTop[0]} y1={hookTop[1]} x2={hookBottom[0]} y2={hookBottom[1]} stroke="#334155" strokeWidth="1.5" />
        <IsoBox x={hookX - 0.35} y={mastY - 0.2} z={2.0} w={0.7} d={0.55} h={0.4} c={GREEN} />
      </g>

      {/* little safety flag on top of mast */}
      <g transform={`translate(${proj(mastX + 0.2, mastY + 0.2, mastTopZ)[0]}, ${proj(mastX + 0.2, mastY + 0.2, mastTopZ)[1]})`}>
        <line x1="0" y1="0" x2="0" y2="-22" stroke="#334155" strokeWidth="1.5" />
        <polygon points="0,-22 16,-17 0,-12" fill="#ef4444" />
      </g>
    </svg>
  )
}

function lineProps(a: [number, number], b: [number, number]) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }
}
