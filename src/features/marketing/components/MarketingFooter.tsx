import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MARKETING_NAV_LINKS } from '../content'
import { Logo } from './Logo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-primary/10 bg-gradient-to-b from-sidebar/5 to-primary/[0.08]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div className="col-span-2 space-y-4 lg:col-span-1 lg:space-y-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              The complete CRM for construction and interior design businesses — from first lead to final invoice, in one
              professional workspace.
            </p>
            <Button variant="accent" size="sm" className="shadow-md shadow-accent/20" asChild>
              <Link to="/request-demo">
                Book a demo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/70 lg:mb-4">Product</p>
            <ul className="space-y-2.5 text-sm lg:space-y-3">
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
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/70 lg:mb-4">Account</p>
            <ul className="space-y-2.5 text-sm lg:space-y-3">
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
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/70 lg:mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground lg:space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>sales@constructdesk.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Built for construction teams across India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-5 text-sm text-muted-foreground sm:flex-row lg:mt-10 lg:pt-6">
          <p>© {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs">22 modules</span>
            <span className="text-xs">Multi-tenant</span>
            <span className="text-xs">Role-based access</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
