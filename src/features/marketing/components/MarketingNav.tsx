import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { MARKETING_NAV_LINKS } from '../content'
import { Logo } from './Logo'

function NavLinkItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative py-1 text-sm font-medium transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={cn(
              'absolute -bottom-1 left-0 h-px rounded-full bg-foreground transition-all duration-300',
              isActive ? 'w-full opacity-100' : 'w-0 opacity-0',
            )}
          />
        </>
      )}
    </NavLink>
  )
}

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-card/90 shadow-sm backdrop-blur-xl'
          : 'border-b border-border/70 bg-card/80 backdrop-blur-lg',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {MARKETING_NAV_LINKS.map((link) => (
            <NavLinkItem key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="accent" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/request-demo">
              Request Demo <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader className="border-b border-border pb-4 text-left">
                <SheetTitle className="font-display text-lg">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 py-4">
                {MARKETING_NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-secondary text-foreground' : 'text-foreground hover:bg-secondary',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link to="/request-demo" onClick={() => setMobileOpen(false)}>
                    Request Demo <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
