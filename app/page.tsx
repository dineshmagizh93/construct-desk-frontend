"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/landing/public-header"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Package,
  Shield,
  Star,
  Zap,
} from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/20 font-sans overflow-x-hidden text-slate-900">
      <PublicHeader />

      {/* Hero Section - Ultra Clean Minimalist */}
      <section className="relative pt-32 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
        {/* Soft floating background orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900 mb-6 drop-shadow-sm">
            Construction Management, 
            <span className="block text-primary mt-1">Perfectly Refined.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            A remarkably clean, blazingly fast platform to manage projects, financials, and teams. Experience the clarity your construction business deserves.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/20 rounded-full hover:-translate-y-1 transition-transform duration-300 w-full sm:w-auto" onClick={() => router.push("/register")}>
              Start your free trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto" onClick={() => router.push("/pricing")}>
              Explore Pricing
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-5 font-medium">
            3-day free trial. No credit card required.
          </p>

          {/* Hero Image Showcase */}
          <div className="mt-20 mx-auto max-w-[1100px] relative perspective-[1000px]">
            {/* Soft shadow underneath */}
            <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/10 blur-2xl rounded-full"></div>
            
            <div className="relative rounded-[24px] overflow-hidden border border-slate-200/50 bg-white/50 p-2 shadow-2xl shadow-slate-300/50 backdrop-blur-sm transform transition-all hover:scale-[1.01] duration-700 ease-out z-20">
              <div className="rounded-[16px] overflow-hidden border border-slate-100 bg-white shadow-sm ring-1 ring-black/5 relative aspect-[16/9]">
                <Image
                  src="/screenshots/dashboard.png"
                  alt="ConstructDesk Premium Dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Clean Cards */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-[#fafafa]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Everything in its proper place.
            </h2>
            <p className="text-lg text-slate-600">
              A thoughtfully designed suite of tools that work exactly how you expect them to. 
              No clutter, no confusion—just pure productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Crystal Clear Dashboard</h3>
              <p className="text-slate-600 leading-relaxed">
                Track revenue, expenses, and active projects in a beautifully summarized centralized view. Know exactly where your business stands in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                <FolderKanban className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Organize every site perfectly. Tag phases, log daily progress, manage documents securely, and keep stakeholders instantly aligned.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Flawless Financials</h3>
              <p className="text-slate-600 leading-relaxed">
                Say goodbye to scattered receipts. Categorize expenses, monitor payments, and export ledger-ready reports with a single click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Inventory Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Never lose track of materials again. Log incoming shipments, distribute to sites, and monitor available stock with perfect accuracy.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out px-8 lg:col-span-2 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
              <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="flex-1 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise-Grade Security</h3>
                <p className="text-slate-600 leading-relaxed max-w-md">
                  Your data is fortified. Assign granular role-based permissions, configure company settings, and let our system automatically block unauthorized access across all modules.
                </p>
              </div>
              <div className="hidden sm:flex flex-1 justify-end opacity-50 relative z-10 w-full">
                <div className="w-full max-w-[200px] space-y-3">
                  <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-10 w-4/5 bg-slate-100 rounded-lg animate-pulse" style={{animationDelay: "150ms"}} />
                  <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" style={{animationDelay: "300ms"}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Call To Action */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
        {/* Subtle glow in dark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to streamline your sites?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
            Join the modern era of construction management. Get started in less than two minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all" onClick={() => router.push("/register")}>
              Start 3-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full text-slate-900 bg-white hover:bg-slate-100 hover:text-slate-900 border-none transition-all" onClick={() => router.push("/pricing")}>
              View Pricing Details
            </Button>
          </div>
        </div>
      </section>

      {/* Clean White Footer */}
      <footer className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 text-slate-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 font-bold bg-primary text-white rounded-lg flex items-center justify-center text-sm shadow-sm">
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
                <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
            <p className="text-slate-500">&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0 text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
