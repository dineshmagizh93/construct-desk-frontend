"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"
import { DemoForm } from "@/components/landing/demo-form"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-36 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Sales Inquiries</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8 mb-1">
                      Interested in learning more about ConstructDesk? Our sales team is ready to help.
                    </p>
                    <a href="mailto:sales@constructdesk.com" className="text-sm text-primary ml-8 hover:underline">
                      sales@constructdesk.com
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8 mb-1">
                      Need technical assistance? Our support team is available 24/7.
                    </p>
                    <a href="mailto:support@constructdesk.com" className="text-sm text-primary ml-8 hover:underline">
                      support@constructdesk.com
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">General Inquiries</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8 mb-1">
                      For general questions or partnerships, contact us at:
                    </p>
                    <a href="mailto:info@constructdesk.com" className="text-sm text-primary ml-8 hover:underline">
                      info@constructdesk.com
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Business Hours</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Demo Form */}
            <div>
              <div className="sticky top-24">
                <DemoForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
