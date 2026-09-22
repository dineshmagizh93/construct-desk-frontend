import { Outlet, Link } from 'react-router-dom'
import { Logo } from '@/features/marketing/components/Logo'
import { ConstructionScene } from '@/features/marketing/components/ConstructionScene'

export function AuthLayout() {
  return (
    <div className="auth-shell grid min-h-screen grid-cols-1 bg-[#f6f7f9] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="auth-brand-panel relative hidden overflow-hidden bg-primary lg:flex">
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

          <div className="auth-model -mb-4 -ml-4 w-[min(100%,36rem)]">
            <ConstructionScene compact />
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
