"use client"

import * as React from "react"
import Image from "next/image"
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
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const features = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description:
        "Connect your sites and office seamlessly. Track progress, manage assigned tasks, and keep stakeholders instantly aligned with real-time updates.",
      iconWrapClass: "bg-blue-50 ring-blue-100",
      iconClass: "text-blue-600",
      accentClass: "from-blue-500/90 via-blue-400/70 to-cyan-300/60",
    },
    {
      icon: Package,
      title: "Material & Inventory",
      description:
        "Never lose track of materials again. Efficiently track incoming shipments, distribute supplies across sites, and control your material budget.",
      iconWrapClass: "bg-orange-50 ring-orange-100",
      iconClass: "text-orange-600",
      accentClass: "from-orange-500/90 via-amber-400/70 to-yellow-300/60",
    },
    {
      icon: Users,
      title: "Labour Management",
      description:
        "Replace paper registers with accurate workforce tracking. Monitor daily attendance, manage labour costs, and maintain perfect payroll records.",
      iconWrapClass: "bg-purple-50 ring-purple-100",
      iconClass: "text-purple-600",
      accentClass: "from-violet-500/90 via-purple-400/70 to-fuchsia-300/60",
    },
    {
      icon: CreditCard,
      title: "Billing & Expenses",
      description:
        "Gain full visibility over your project finances. Categorize expenses, monitor payments, track budgets, and optimize cash flow in real-time.",
      iconWrapClass: "bg-emerald-50 ring-emerald-100",
      iconClass: "text-emerald-600",
      accentClass: "from-emerald-500/90 via-green-400/70 to-teal-300/60",
    },
    {
      icon: Briefcase,
      title: "Vendor Management",
      description:
        "Manage construction contractors, suppliers, and vendors without the chaos. Monitor progress against work orders and manage vendor payments.",
      iconWrapClass: "bg-rose-50 ring-rose-100",
      iconClass: "text-rose-600",
      accentClass: "from-rose-500/90 via-pink-400/70 to-orange-300/60",
    },
    {
      icon: ClipboardList,
      title: "Site Progress",
      description:
        "Keep an unshakeable record of daily operations. Log site conditions, upload verifications, and let owners know exactly what is happening today.",
      iconWrapClass: "bg-sky-50 ring-sky-100",
      iconClass: "text-sky-600",
      accentClass: "from-sky-500/90 via-cyan-400/70 to-blue-300/60",
    },
  ]

  const [visitorStats] = React.useState({ today: 0, overall: 0, loaded: true });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_22%),linear-gradient(180deg,#f7fbff_0%,#f2f6fc_42%,#ffffff_100%)] text-slate-900 selection:bg-primary/20">
      <PublicHeader />

      <section className="relative overflow-hidden px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pb-16 lg:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute left-[8%] top-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-16 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[88%] -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.5),transparent_82%)]" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            <div className="animate-in flex flex-col items-center text-center duration-1000 ease-out fill-mode-forwards slide-in-from-bottom-8 lg:items-start lg:text-left">
              <div className="relative rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))] p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-9">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent" />
                <h1 className="mb-5 max-w-[100%] text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-[3.6rem]">
                  Construction ERP, <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-orange-500 bg-clip-text text-transparent">Built to Save Money.</span>
                </h1>

                <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                  The complete platform for every type of construction business. Replace disconnected tools with one unified app to manage projects, materials, labour, and finances.
                </p>

                <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Button size="lg" className="h-14 w-full rounded-full px-8 text-base shadow-[0_18px_35px_rgba(37,99,235,0.22)] transition-transform duration-300 hover:-translate-y-1 sm:w-auto" onClick={() => router.push("/register")}>
                    Start your free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 w-full rounded-full border-slate-200 bg-white/90 px-8 text-base text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-white sm:w-auto" onClick={() => router.push("/pricing")}>
                    Explore Pricing
                  </Button>
                </div>

                <p className="mt-4 text-center text-sm font-medium text-slate-500 lg:text-left">
                  3-day free trial. No credit card required.
                </p>

                <div className={`mt-8 grid gap-4 transition-opacity duration-1000 sm:grid-cols-2 ${visitorStats.loaded ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 text-center shadow-sm lg:text-left">
                    <span className="block text-3xl font-black tracking-tight text-slate-800">{visitorStats.today.toLocaleString()}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Today's Visits</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 text-center shadow-sm lg:text-left">
                    <span className="block text-3xl font-black tracking-tight text-slate-800">{visitorStats.overall.toLocaleString()}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Overall Visits</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-in relative z-0 mt-6 duration-1000 delay-200 ease-out fill-mode-forwards slide-in-from-right-8 lg:mt-10">
              <div className="absolute -left-10 top-14 hidden h-24 w-24 rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_50px_rgba(15,23,42,0.1)] backdrop-blur xl:block" />
              <div className="absolute left-6 top-8 hidden rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm lg:block">
                Live Dashboard
              </div>
              <div className="absolute -right-6 top-8 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="absolute -bottom-8 left-12 right-12 h-12 rounded-full bg-slate-900/10 blur-2xl" />
              <div className="absolute inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-white to-orange-100" />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.92))] p-3 shadow-[0_32px_90px_rgba(15,23,42,0.18)] backdrop-blur">
                <div className="absolute inset-x-6 top-5 hidden items-center gap-2 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>

                <div className="relative overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-black/5">
                  <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(248,250,252,0))]" />
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

      <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 rounded-[2.25rem] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.9))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Everything you need in one platform.
              </h2>
              <p className="text-lg text-slate-600">
                Stop juggling between chaotic tools. Our most comprehensive ERP unifies every aspect of your operations, from planning and procurement to execution and accounting.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-8 shadow-[0_20px_45px_rgba(15,23,42,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_65px_rgba(15,23,42,0.12)]"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${feature.accentClass}`} />
                  <div className="absolute -right-12 top-10 h-28 w-28 rounded-full bg-slate-100/70 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconWrapClass} ring-1 transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${feature.iconClass}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[620px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.35))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        
        <div className="container relative z-10 mx-auto max-w-4xl">
          <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-10 text-center shadow-[0_24px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:px-10">
            <h2 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to streamline your sites?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl font-light text-slate-300">
              Join the modern era of construction management. Get started in less than two minutes.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-1" onClick={() => router.push("/register")}>
                Start 3-Day Free Trial
              </Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full border-none bg-white px-8 text-lg text-slate-900 transition-all hover:bg-slate-100 hover:text-slate-900" onClick={() => router.push("/pricing")}>
                View Pricing Details
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-10 text-slate-600 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm">
                  C
                </div>
                <span className="font-bold text-slate-900 text-lg tracking-tight">ConstructDesk</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Software engineered for construction professionals who demand clarity, speed, and precision.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => window.scrollTo(0,0)} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => router.push("/pricing")} className="hover:text-primary transition-colors">Pricing</button></li>
                <li><button className="hover:text-primary transition-colors">Integrations</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><button className="hover:text-primary transition-colors">About Us</button></li>
                <li><button className="hover:text-primary transition-colors">Contact Support</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 tracking-tight">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => router.push("/privacy-policy")} className="hover:text-primary transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/terms-of-service")} className="hover:text-primary transition-colors">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-6 text-sm md:flex-row">
            <p className="text-slate-500">&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1.5 font-medium text-slate-500 shadow-sm md:mt-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
