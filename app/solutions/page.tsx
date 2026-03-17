"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"

export default function SolutionsPage() {
  const solutions = [
    {
      title: "For General Contractors",
      description: "Manage multiple projects, subcontractors, and timelines efficiently. Track progress across all sites, coordinate with teams, and ensure timely project delivery.",
      features: [
        "Multi-project dashboard",
        "Subcontractor management",
        "Timeline tracking",
        "Resource allocation",
      ],
    },
    {
      title: "For Construction Companies",
      description: "Streamline operations from bidding to project completion. Manage finances, inventory, and workforce all in one place.",
      features: [
        "Bid management",
        "Financial tracking",
        "Inventory control",
        "Workforce management",
      ],
    },
    {
      title: "For Project Managers",
      description: "Track progress, manage resources, and ensure on-time delivery. Get real-time insights and make data-driven decisions.",
      features: [
        "Progress tracking",
        "Resource management",
        "Task assignment",
        "Real-time reporting",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Built for Every
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {" "}Construction Team
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for different roles in the construction industry
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border border-border/40 bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-4">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
