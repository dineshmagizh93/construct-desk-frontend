import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MARKETING_NAV_LINKS } from '../content'
import { Logo } from './Logo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 space-y-4 lg:col-span-1">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              The complete CRM for construction and interior design businesses — from first lead to final invoice.
            </p>
            <Button variant="accent" size="sm" asChild>
              <Link to="/request-demo">
                Book a demo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Product</p>
            <ul className="space-y-2.5 text-sm">
              {MARKETING_NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Log in to workspace
                </Link>
              </li>
              <li>
                <Link to="/request-demo" className="text-muted-foreground transition-colors hover:text-foreground">
                  Request a demo
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  View pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>sales@constructdesk.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>Built for construction teams across India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs">
            <Link to="/terms-of-service" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/refund-policy" className="transition-colors hover:text-foreground">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
