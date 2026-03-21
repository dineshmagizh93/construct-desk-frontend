"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  Users,
  TrendingUp,
  CreditCard,
  Receipt,
  Package,
  Truck,
  HardHat,
  FileText,
  BarChart3,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description: "Track projects from planning to completion with real-time progress updates",
    },
    {
      icon: KanbanSquare,
      title: "Task Management",
      description: "Organize tasks, assign responsibilities, and track completion with Kanban boards",
    },
    {
      icon: Users,
      title: "Leads & Clients",
      description: "Manage leads, convert to clients, and maintain comprehensive client relationships",
    },
    {
      icon: TrendingUp,
      title: "Site Progress",
      description: "Document site progress with photos, notes, and milestone tracking",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description: "Monitor payments, invoices, and financial milestones across all projects",
    },
    {
      icon: Receipt,
      title: "Expense Management",
      description: "Track expenses by category, project, and vendor with detailed reporting",
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Manage stock levels, track inventory transactions, and prevent shortages",
    },
    {
      icon: Truck,
      title: "Vendor Management",
      description: "Maintain vendor relationships, track performance, and manage contracts",
    },
    {
      icon: HardHat,
      title: "Labour Management",
      description: "Track labour costs, headcount, and productivity across projects",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Store, organize, and access all project documents in one secure location",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Generate comprehensive reports and insights for data-driven decisions",
    },
    {
      icon: LayoutDashboard,
      title: "Unified Dashboard",
      description: "Get a complete overview of all projects, finances, and operations at a glance",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-36 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Complete Construction
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {" "}Management
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your construction business in one powerful platform
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border/40 bg-card hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
