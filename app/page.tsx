"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/landing/public-header"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  BarChart3,
  CreditCard,
  ClipboardList,
  TrendingUp,
  FileText,
  Package,
} from "lucide-react"

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard & Analytics",
      description: "Real-time insights into your projects, finances, and team performance",
    },
    {
      icon: FolderKanban,
      title: "Project Management",
      description: "Track projects from start to finish with timelines, budgets, and progress",
    },
    {
      icon: ClipboardList,
      title: "Task Management",
      description: "Organize work with Kanban boards and task tracking for your team",
    },
    {
      icon: CreditCard,
      title: "Financial Tracking",
      description: "Manage payments, expenses, and generate financial reports",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track materials, stock levels, and inventory transactions",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage users, roles, and permissions across your organization",
    },
  ]

  const benefits = [
    { icon: Zap, text: "Save 10+ hours per week with automated workflows" },
    { icon: Shield, text: "Secure cloud-based platform with data backup" },
    { icon: Clock, text: "Real-time updates and notifications" },
    { icon: TrendingUp, text: "Make data-driven decisions with analytics" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>✨</span> All-in-One Construction Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
              Manage Your Construction Business
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent block">
                {" "}in One Place
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Projects, finances, inventory, and team collaboration—all integrated in a single, easy-to-use platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" className="text-base px-8" onClick={() => router.push("/register")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" onClick={() => router.push("/pricing")}>
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{benefit.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for construction businesses
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border/40 bg-card hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold">See It In Action</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get a glimpse of how ConstructDesk works
            </p>
          </div>
          
          {/* Dashboard Preview */}
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-lg">
            <div className="aspect-[21/9] bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center relative">
              <Image
                src="/screenshots/dashboard.png"
                alt="ConstructDesk Dashboard"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
              />
              <div className="absolute left-3 top-3 rounded-md bg-background/80 backdrop-blur px-2 py-1 text-xs font-medium text-foreground border border-border/60">
                Dashboard Preview
              </div>
            </div>
          </div>

          {/* Video Section - Optional */}
          <div className="mt-4 rounded-xl border border-border/40 bg-card overflow-hidden shadow-lg">
            <div className="aspect-[21/9] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
              <div className="text-center space-y-4 z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/90 hover:bg-primary transition-colors cursor-pointer">
                  <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Demo Video</p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Add your demo video URL or upload to <code className="text-xs bg-background px-1.5 py-0.5 rounded">/public/videos/demo.mp4</code>
                  </p>
                </div>
              </div>
              {/* Uncomment when you have video:
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="ConstructDesk Demo"
                allowFullScreen
              />
              */}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join construction teams who are already using ConstructDesk to streamline their operations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8" onClick={() => router.push("/register")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" onClick={() => router.push("/pricing")}>
                View Pricing
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-bold">ConstructDesk</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Construction management software for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/register" className="hover:text-foreground transition-colors">Sign Up</a></li>
                <li><a href="/login" className="hover:text-foreground transition-colors">Sign In</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
