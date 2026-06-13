"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/landing/public-header"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  CreditCard,
  FolderKanban,
  Package,
  Users,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Track progress, manage tasks, and keep stakeholders aligned with real-time updates across all your sites.",
    iconWrapClass: "bg-blue-50 ring-blue-100",
    iconClass: "text-blue-600",
    accentClass: "from-blue-500/90 via-blue-400/70 to-cyan-300/60",
  },
  {
    icon: Package,
    title: "Material & Inventory",
    description:
      "Never lose track of materials. Track shipments, distribute supplies across sites, and control your material budget.",
    iconWrapClass: "bg-orange-50 ring-orange-100",
    iconClass: "text-orange-600",
    accentClass: "from-orange-500/90 via-amber-400/70 to-yellow-300/60",
  },
  {
    icon: Users,
    title: "Labour Management",
    description:
      "Replace paper registers with accurate workforce tracking. Monitor attendance, manage costs, and maintain payroll records.",
    iconWrapClass: "bg-purple-50 ring-purple-100",
    iconClass: "text-purple-600",
    accentClass: "from-violet-500/90 via-purple-400/70 to-fuchsia-300/60",
  },
  {
    icon: CreditCard,
    title: "Billing & Expenses",
    description:
      "Full visibility over project finances. Categorize expenses, monitor payments, track budgets, and optimize cash flow.",
    iconWrapClass: "bg-emerald-50 ring-emerald-100",
    iconClass: "text-emerald-600",
    accentClass: "from-emerald-500/90 via-green-400/70 to-teal-300/60",
  },
  {
    icon: Briefcase,
    title: "Vendor Management",
    description:
      "Manage contractors, suppliers, and vendors without the chaos. Monitor work orders and vendor payments in one place.",
    iconWrapClass: "bg-rose-50 ring-rose-100",
    iconClass: "text-rose-600",
    accentClass: "from-rose-500/90 via-pink-400/70 to-orange-300/60",
  },
  {
    icon: ClipboardList,
    title: "Site Progress",
    description:
      "Log daily site conditions, upload photo verifications, and let owners know exactly what is happening on the ground.",
    iconWrapClass: "bg-sky-50 ring-sky-100",
    iconClass: "text-sky-600",
    accentClass: "from-sky-500/90 via-cyan-400/70 to-blue-300/60",
  },
]

const stats = [
  { value: "10+", label: "Modules Included" },
  { value: "100%", label: "Cloud-Based" },
  { value: "3-Day", label: "Free Trial" },
  { value: "24/7", label: "Data Access" },
]

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up in under two minutes. No credit card needed — your 3-day trial starts immediately.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    number: "02",
    title: "Set up your projects",
    description: "Add your projects, invite your team, and configure modules relevant to your business.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    number: "03",
    title: "Run your business",
    description: "Track everything from materials to payments in one unified dashboard. Make data-driven decisions daily.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
]

const benefits = [
  "No spreadsheets or paper registers",
  "Real-time updates across all sites",
  "Role-based access for your team",
  "Export reports as CSV anytime",
  "Client portal for project sharing",
  "Mobile-friendly web interface",
]

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_22%),linear-gradient(180deg,#f7fbff_0%,#f2f6fc_42%,#ffffff_100%)] text-slate-900 selection:bg-primary/20">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute left-[8%] top-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-16 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.5),transparent_82%)]" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            {/* Left copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-[13px] font-semibold text-blue-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                Built for Indian construction businesses
              </div>

              <h1 className="mb-5 max-w-2xl text-4xl font-extrabold leading-[1.07] tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-[3.4rem]">
                Construction ERP{" "}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                  Built to Save Money.
                </span>
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600">
                The complete platform for every type of construction business. Replace disconnected tools with one unified app to manage projects, materials, labour, and finances.
              </p>

              <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  className="h-13 w-full rounded-full px-8 text-base shadow-[0_18px_35px_rgba(37,99,235,0.22)] transition-transform duration-300 hover:-translate-y-1 sm:w-auto"
                  onClick={() => router.push("/register")}
                >
                  Start your free trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 w-full rounded-full border-slate-200 bg-white/90 px-8 text-base text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-white sm:w-auto"
                  onClick={() => router.push("/pricing")}
                >
                  View Pricing
                </Button>
              </div>

              <p className="mt-3 text-center text-[13px] font-medium text-slate-400 lg:text-left">
                3-day free trial &middot; No credit card required
              </p>

              {/* Benefits checklist */}
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-[13px] text-slate-600">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard preview */}
            <div className="relative z-0 mt-4 lg:mt-0">
              <div className="absolute -right-6 top-8 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="absolute -bottom-8 left-12 right-12 h-12 rounded-full bg-slate-900/10 blur-2xl" />
              <div className="absolute inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-white to-orange-100" />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.92))] p-3 shadow-[0_32px_90px_rgba(15,23,42,0.18)] backdrop-blur">
                <div className="absolute inset-x-6 top-5 hidden items-center gap-2 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[11px] font-medium text-slate-400">ConstructDesk — Live Dashboard</span>
                </div>

                <div className="relative overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-black/5 mt-4 sm:mt-0">
                  <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] p-3 sm:p-4">
                    <div className="relative h-full overflow-hidden rounded-[1.3rem] border border-slate-200/80 bg-white shadow-sm">
                      <Image
                        src="/screenshots/dashboard.png"
                        alt="ConstructDesk dashboard preview"
                        fill
                        priority
                        className="object-cover object-top"
                        sizes="(min-width: 1024px) 42vw, 92vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-slate-200/80 bg-white/80 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black tracking-tight text-slate-900">{s.value}</p>
                <p className="mt-1 text-[13px] font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-blue-600">What&apos;s included</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need in one platform
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Stop juggling between disconnected tools. ConstructDesk unifies every aspect of your operations — from planning and procurement to execution and accounting.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-7 shadow-[0_20px_45px_rgba(15,23,42,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_65px_rgba(15,23,42,0.12)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accentClass}`} />
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-100/60 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconWrapClass} ring-1 transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${feature.iconClass}`} />
                  </div>
                  <h3 className="mb-2.5 text-[17px] font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-[14px] leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50/80 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-orange-500">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              No lengthy setup or IT department required. Three simple steps to get your construction business under control.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-1/2 translate-x-full border-t-2 border-dashed border-slate-200 md:block" />
                )}
                <div className={`rounded-2xl border ${step.border} ${step.bg} p-6`}>
                  <span className={`text-4xl font-black ${step.color} opacity-30`}>{step.number}</span>
                  <h3 className="mt-3 text-[16px] font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ConstructDesk */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-blue-600">Why ConstructDesk</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built specifically for construction
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Generic project management tools don&apos;t understand construction. ConstructDesk is purpose-built for contractors, builders, and site engineers.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Zap, title: "Real-time across sites", desc: "Every update — material delivery, labour attendance, payment — reflects instantly across your entire team." },
                  { icon: Shield, title: "Role-based access", desc: "Admins, managers, and site staff each see only what they need. Full audit log for accountability." },
                  { icon: BarChart3, title: "Actionable reports", desc: "Export custom reports for projects, expenses, payments, and tasks. Share with clients via secure portal links." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800">{title}</p>
                      <p className="mt-0.5 text-[13px] text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-blue-50 to-orange-50 blur-xl" />
              <div className="relative rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <p className="mb-5 text-[13px] font-semibold uppercase tracking-widest text-slate-400">Replaces these tools</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Excel spreadsheets",
                    "WhatsApp groups",
                    "Paper registers",
                    "Manual invoices",
                    "Multiple apps",
                    "Email chains",
                  ].map((tool) => (
                    <div key={tool} className="flex items-center gap-2 rounded-lg bg-red-50/60 px-3 py-2.5 text-[13px] text-slate-600">
                      <span className="text-red-400 font-bold">✕</span>
                      {tool}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-[13px] font-semibold text-emerald-700">
                  ✓ One platform replaces them all
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[620px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.2em] text-blue-400">Get started today</p>
          <h2 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to take control of your sites?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-light text-slate-300">
            Join the modern era of construction management. Get started in less than two minutes — no credit card required.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full px-10 text-base shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-1"
              onClick={() => router.push("/register")}
            >
              Start 3-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/20 bg-white/10 px-8 text-base text-white backdrop-blur transition-all hover:bg-white/20"
              onClick={() => router.push("/pricing")}
            >
              View Pricing
            </Button>
          </div>

          <p className="mt-5 text-[13px] text-slate-500">No setup fees &middot; Cancel anytime &middot; Data export included</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-12 text-slate-600 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                  <span className="text-blue-700">Construct</span>
                  <span className="text-orange-500">Desk</span>
                </span>
              </div>
              <p className="text-[13px] text-slate-500 max-w-xs leading-relaxed">
                Software engineered for construction professionals who demand clarity, speed, and precision.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-[14px]">Product</h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/solutions" className="hover:text-primary transition-colors">Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-[14px]">Company</h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-[14px]">Legal</h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-6 text-[13px] md:flex-row gap-4">
            <p className="text-slate-400">&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1.5 font-medium text-slate-500 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
