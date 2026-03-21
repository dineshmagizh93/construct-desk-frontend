"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const router = useRouter()

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Solutions", href: "/solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact Us", href: "/contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[5rem] py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2">
            <div className="relative w-20 h-16 sm:w-28 sm:h-20 shrink-0 flex items-center justify-center mr-1 overflow-hidden mix-blend-multiply">
              <img 
                src="/mylogo.png" 
                alt="CD Logo" 
                className="absolute inset-0 top-0.5 w-full h-full object-contain scale-[1.8] sm:scale-[2]" 
              />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              <span className="text-blue-700">Construct</span>
              <span className="text-orange-500">Desk</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {item.label}
                <ChevronDown className="h-3 w-3" />
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/register")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                <Button variant="outline" onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}>
                  Sign In
                </Button>
                <Button onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}>
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
