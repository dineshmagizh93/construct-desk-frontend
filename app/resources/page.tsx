"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"
import { FileText, BarChart3, Users, BookOpen, Video, MessageSquare } from "lucide-react"

export default function ResourcesPage() {
  const resources = [
    {
      title: "Documentation",
      description: "Comprehensive guides, tutorials, and API documentation to help you get the most out of ConstructDesk.",
      icon: FileText,
      items: [
        "Getting Started Guide",
        "User Manual",
        "API Documentation",
        "Best Practices",
      ],
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides covering all features and best practices for construction management.",
      icon: Video,
      items: [
        "Feature Walkthroughs",
        "Setup Tutorials",
        "Advanced Tips",
        "Case Studies",
      ],
    },
    {
      title: "Community Forum",
      description: "Join our growing community to share tips, get answers, and connect with other construction professionals.",
      icon: Users,
      items: [
        "Q&A Discussions",
        "Feature Requests",
        "User Tips",
        "Announcements",
      ],
    },
    {
      title: "Knowledge Base",
      description: "Searchable articles and FAQs to help you find answers quickly.",
      icon: BookOpen,
      items: [
        "FAQs",
        "Troubleshooting",
        "How-to Articles",
        "Glossary",
      ],
    },
    {
      title: "Webinars",
      description: "Join live and recorded webinars to learn from experts and see ConstructDesk in action.",
      icon: BarChart3,
      items: [
        "Live Training Sessions",
        "Product Demos",
        "Industry Insights",
        "Recorded Sessions",
      ],
    },
    {
      title: "Support Center",
      description: "Get help when you need it with our dedicated support resources.",
      icon: MessageSquare,
      items: [
        "Contact Support",
        "Ticket System",
        "Live Chat",
        "Email Support",
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
              Resources & Support
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to get started and succeed with ConstructDesk
            </p>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border/40 bg-card hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {resource.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
