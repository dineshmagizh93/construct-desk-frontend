import { Outlet, Link } from 'react-router-dom'
import { Logo } from '@/features/marketing/components/Logo'

function AuthScene() {
  return (
    <svg viewBox="0 0 640 360" className="w-full max-w-lg" aria-hidden>
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="auth-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#auth-sky)" />
      <line x1="24" y1="312" x2="616" y2="312" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

      <g fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
        <rect x="56" y="168" width="88" height="144" rx="4" />
        <rect x="168" y="96" width="72" height="216" rx="4" />
        <rect x="256" y="140" width="110" height="172" rx="4" />
        <rect x="384" y="188" width="64" height="124" rx="4" />
      </g>

      <g fill="#fde68a" opacity="0.55">
        {[[68, 184], [88, 184], [108, 184], [68, 208], [88, 208], [108, 208], [68, 232], [88, 232]].map(([x, y], i) => (
          <rect key={`a${i}`} x={x} y={y} width="10" height="12" rx="1" />
        ))}
        {[[180, 112], [200, 112], [180, 136], [200, 136], [180, 160], [200, 160], [180, 184], [200, 184]].map(([x, y], i) => (
          <rect key={`b${i}`} x={x} y={y} width="10" height="12" rx="1" />
        ))}
        {[[272, 156], [296, 156], [320, 156], [272, 180], [296, 180], [320, 180], [272, 204], [296, 204]].map(([x, y], i) => (
          <rect key={`c${i}`} x={x} y={y} width="12" height="14" rx="1" />
        ))}
      </g>

      <g stroke="url(#auth-gold)" strokeWidth="5" fill="none" strokeLinecap="round">
        <line x1="500" y1="312" x2="500" y2="64" />
        <line x1="500" y1="72" x2="428" y2="72" />
        <line x1="500" y1="72" x2="560" y2="72" />
        <line x1="444" y1="72" x2="444" y2="148" />
      </g>
      <rect x="430" y="148" width="28" height="18" rx="2" fill="#fbbf24" />
      <polygon points="500,48 500,64 528,56" fill="#fbbf24" />
    </svg>
  )
}

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f6f7f9] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="relative hidden overflow-hidden bg-primary lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 40% 40%, black, transparent)',
          }}
        />
        <div className="pointer-events-none absolute -right-16 bottom-0 size-[32rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute left-[-6rem] top-[-4rem] size-[22rem] rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex w-full flex-col justify-between p-12 xl:p-14">
          <Logo light />

          <div className="max-w-lg">
            <div className="mb-6 h-1 w-12 rounded-full bg-accent" />
            <h2 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-[2.75rem]">
              One workspace for the whole job.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
              From first enquiry to final invoice — sales, site, and accounts finally work off the same record.
            </p>
          </div>

          <div className="-mb-4 -ml-4 w-[min(100%,36rem)]">
            <AuthScene />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, oklch(0.32 0.07 255 / 0.12) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="pointer-events-none absolute right-[-4rem] top-16 size-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-[-3rem] size-52 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[26rem]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]">
            <div className="h-1 bg-accent" />
            <div className="p-7 sm:p-8">
              <Outlet />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need a workspace?{' '}
            <Link to="/request-demo" className="font-medium text-foreground underline-offset-4 hover:underline">
              Request a demo
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
