"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/landing/public-header"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Package,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react"

export default function Home() {
  const router = useRouter()

  const [visitorStats, setVisitorStats] = React.useState({ today: 0, overall: 0, loaded: false });

  React.useEffect(() => {
    let mounted = true;
    const trackAndFetchVisits = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const hasVisited = sessionStorage.getItem('has_visited_today_crm');
        
        if (!hasVisited) {
          await fetch(`${apiUrl}/visits`, { method: 'POST' }).catch(() => {});
          sessionStorage.setItem('has_visited_today_crm', 'true');
        }

        const res = await fetch(`${apiUrl}/visits`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setVisitorStats({ today: data.today, overall: data.overall, loaded: true });
          }
        } else {
          if (mounted) setVisitorStats(prev => ({ ...prev, loaded: true }));
        }
      } catch (error) {
        if (mounted) setVisitorStats(prev => ({ ...prev, loaded: true }));
      }
    };
    
    trackAndFetchVisits();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/20 font-sans overflow-x-hidden text-slate-900">
      <PublicHeader />

      {/* Hero Section - Zig Zag Side by Side */}
      <section className="relative pt-24 lg:pt-28 pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft floating background orb */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 translate-x-1/3 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text & CTA */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                The #1 Construction Management Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight max-w-[100%] leading-[1.1] text-slate-900 mb-6 xl:whitespace-nowrap">
                Construction ERP, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">Built to Save Money.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed mb-10">
                The complete platform for every type of construction business. Replace disconnected tools with one unified app to manage projects, materials, labour, and finances.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/20 rounded-full hover:-translate-y-1 transition-transform duration-300 w-full sm:w-auto" onClick={() => router.push("/register")}>
                  Start your free trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto" onClick={() => router.push("/pricing")}>
                  Explore Pricing
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-5 font-medium lg:w-full text-center lg:text-left">
                3-day free trial. No credit card required.
              </p>

              {/* Visitor Stats Display */}
              <div className={`mt-10 lg:mt-12 flex items-center justify-center lg:justify-start gap-8 md:gap-12 transition-opacity duration-1000 ${visitorStats.loaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{visitorStats.today.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Today's Visits</span>
                </div>
                <div className="w-px h-10 bg-slate-300"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{visitorStats.overall.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Overall Visits</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Showcase */}
            <div className="relative mt-16 lg:mt-40 xl:mt-48 perspective-[1200px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 ease-out fill-mode-forwards z-0">
              {/* Soft shadow underneath */}
              <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/10 blur-2xl rounded-full"></div>
              
              <div className="relative rounded-[24px] overflow-hidden border border-slate-200/50 bg-white/50 p-2 shadow-2xl shadow-slate-300/50 backdrop-blur-sm transform transition-all hover:scale-[1.02] lg:-rotate-y-4 lg:rotate-x-2 duration-700 ease-out">
                <div className="rounded-[16px] overflow-hidden border border-slate-100 bg-white shadow-sm ring-1 ring-black/5 relative aspect-[16/10]">
                  <Image
                    src="/screenshots/dashboard.png"
                    alt="ConstructDesk Premium Dashboard"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
              
              {/* Decorative floating element */}
              <div className="absolute -left-6 sm:-left-10 lg:-left-12 top-1/4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-bounce z-30 transform -rotate-2" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Project On Track</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">Updated just now</p>
                  </div>
                </div>
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
              Everything you need in one platform.
            </h2>
            <p className="text-lg text-slate-600">
              Stop juggling between chaotic tools. Our most comprehensive ERP unifies every aspect of your operations, from planning and procurement to execution and accounting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect your sites and office seamlessly. Track progress, manage assigned tasks, and keep stakeholders instantly aligned with real-time updates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Material & Inventory</h3>
              <p className="text-slate-600 leading-relaxed">
                Never lose track of materials again. Efficiently track incoming shipments, distribute supplies across sites, and control your material budget.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Labour Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Replace paper registers with accurate workforce tracking. Monitor daily attendance, manage labour costs, and maintain perfect payroll records.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Billing & Expenses</h3>
              <p className="text-slate-600 leading-relaxed">
                Gain full visibility over your project finances. Categorize expenses, monitor payments, track budgets, and optimize cash flow in real-time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                <Briefcase className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Vendor Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Manage construction contractors, suppliers, and vendors without the chaos. Monitor progress against work orders and manage vendor payments.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="group bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out">
              <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300">
                <ClipboardList className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Site Progress</h3>
              <p className="text-slate-600 leading-relaxed">
                Keep an unshakeable record of daily operations. Log site conditions, upload verifications, and let owners know exactly what is happening today.
              </p>
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
