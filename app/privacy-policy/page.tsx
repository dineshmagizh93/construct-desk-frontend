"use client"

import * as React from "react"
import { PublicHeader } from "@/components/landing/public-header"

export default function PrivacyPolicyPage() {
  const effectiveDate = "March 25, 2026"

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Effective date: {effectiveDate}</p>

          <div className="space-y-8 text-sm leading-7 text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Who we are</h2>
              <p>
                ConstructDesk ("we", "our", or "us") provides construction CRM software and related services for
                project, team, financial, and operations management.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Information we collect</h2>
              <p>We may collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account data: name, company name, email, phone, role, and login credentials.</li>
                <li>Business data: projects, tasks, vendors, labour, expenses, payments, documents, and reports.</li>
                <li>Usage data: device/browser information, IP, logs, feature activity, and diagnostics.</li>
                <li>Communication data: contact forms, support tickets, and email interactions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. How we use information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and improve the platform.</li>
                <li>To authenticate users, secure accounts, and prevent fraud or abuse.</li>
                <li>To process transactions, subscriptions, and billing workflows.</li>
                <li>To send service notifications, security alerts, and support responses.</li>
                <li>To comply with legal obligations and enforce our terms.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Legal basis and consent</h2>
              <p>
                We process data based on contractual necessity, legitimate interests, legal compliance, and consent
                where required. You may withdraw consent for optional communications at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Data sharing</h2>
              <p>We do not sell personal data. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Infrastructure and cloud hosting providers.</li>
                <li>Payment processors and billing service providers.</li>
                <li>Email and communication providers for service messages.</li>
                <li>Authorities when required by applicable law.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Data retention</h2>
              <p>
                We retain data for as long as needed to provide services, maintain records, resolve disputes, and
                comply with legal requirements. Data retention periods may vary by data type and account status.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
              <p>
                We use reasonable technical and organizational controls to protect data. No system is completely secure,
                and you are responsible for keeping account credentials confidential.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. International transfers</h2>
              <p>
                Your information may be processed in locations outside your state or country where our service providers
                operate. We take appropriate measures to safeguard such transfers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Your rights</h2>
              <p>Depending on applicable law, you may have rights to access, correct, delete, or export your data.</p>
              <p>
                To submit a privacy request, contact us at{" "}
                <a className="text-primary hover:underline" href="mailto:info@constructdesk.in">
                  info@constructdesk.in
                </a>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">10. Cookies and analytics</h2>
              <p>
                We may use cookies and similar technologies for authentication, session continuity, product analytics,
                and performance monitoring.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">11. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy periodically. Updated versions become effective when published on this
                page with a revised effective date.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
