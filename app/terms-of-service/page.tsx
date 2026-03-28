"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"

export default function TermsOfServicePage() {
  const effectiveDate = "March 25, 2026"

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Effective date: {effectiveDate}</p>

          <div className="space-y-8 text-sm leading-7 text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Agreement</h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use of ConstructDesk services. By using the
                platform, you agree to these Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Eligibility and account responsibility</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate account details and keep them updated.</li>
                <li>You are responsible for all activity under your account credentials.</li>
                <li>You must promptly notify us of unauthorized account access.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Subscription, trial, and billing</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>New users may receive a 3-day trial period where applicable.</li>
                <li>After trial expiry, access may be limited until a paid plan is activated.</li>
                <li>Paid subscriptions renew per selected billing cycle unless cancelled.</li>
                <li>Fees are non-refundable except where required by law or explicitly stated.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the service for unlawful, fraudulent, or harmful activity.</li>
                <li>Interfere with service integrity, availability, or security.</li>
                <li>Attempt unauthorized access to systems, data, or accounts.</li>
                <li>Upload malicious code or violate third-party rights.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Customer data</h2>
              <p>
                You retain ownership of data you upload. You grant us the rights necessary to host, process, and
                transmit your data solely to provide and improve the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Service availability and changes</h2>
              <p>
                We aim for reliable service but do not guarantee uninterrupted availability. We may modify features,
                limits, or pricing with reasonable notice where required.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Intellectual property</h2>
              <p>
                ConstructDesk, its software, branding, and related content are protected by intellectual property laws.
                You receive a limited, non-exclusive right to use the service under these Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Suspension and termination</h2>
              <p>
                We may suspend or terminate access for violation of these Terms, non-payment, legal requirements, or
                security risks. You may stop using the service at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Disclaimers and limitation of liability</h2>
              <p>
                The service is provided on an "as is" and "as available" basis to the maximum extent permitted by law.
                We are not liable for indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Indemnity</h2>
              <p>
                You agree to defend and indemnify ConstructDesk against claims arising from your misuse of the service,
                violation of law, or breach of these Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">11. Governing law</h2>
              <p>
                These Terms are governed by applicable laws of India, unless mandatory local law requires otherwise.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
              <p>
                For legal or service questions, contact{" "}
                <a className="text-primary hover:underline" href="mailto:info@constructdesk.in">
                  info@constructdesk.in
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
