"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown, LogIn, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5rem] items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-1 sm:gap-2">
            <div className="relative mr-1 flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden mix-blend-multiply sm:h-20 sm:w-28">
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

          <nav className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
                <ChevronDown className="h-3 w-3" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              className="h-11 rounded-full border border-slate-200/80 bg-white/90 px-5 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => router.push("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button
              className="group h-11 rounded-full bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] px-5 text-white shadow-[0_16px_34px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.34)]"
              onClick={() => router.push("/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-slate-200 bg-white shadow-sm md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200/70 py-4 md:hidden">
            <nav className="flex flex-col gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white p-3 shadow-[0_16px_35px_rgba(15,23,42,0.08)]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 border-t border-slate-200/70 pt-4">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  className="h-11 rounded-full bg-[linear-gradient(135deg,#2563eb,#1d4ed8_48%,#f97316)] text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)]"
                  onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
