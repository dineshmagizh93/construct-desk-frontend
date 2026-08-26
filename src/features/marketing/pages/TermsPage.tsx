import { PageHero, LegalDocument } from '../components/shared'

export function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" description="The agreement between your business and ConstructDesk." />

      <LegalDocument
        effectiveDate="26 August 2026"
        intro={
          <p>
            These Terms of Service ("Terms") govern access to and use of ConstructDesk (the "Service"), operated by{' '}
            <strong>[Legal Entity Name — e.g. "XYZ Technologies Pvt. Ltd."]</strong>, a company registered in India
            ("ConstructDesk", "we", "us"). By using the Service, the business you represent ("you", "Customer")
            agrees to these Terms.
          </p>
        }
      >
        <div>
          <h2>1. The Service</h2>
          <p>
            ConstructDesk is a cloud-based CRM for construction and interior design businesses, covering leads,
            clients, projects, site progress, estimates, contracts, resources, finance, and reporting. Access to
            individual modules depends on the subscription plan assigned to your account.
          </p>
        </div>

        <div>
          <h2>2. Accounts and access</h2>
          <p>
            ConstructDesk workspaces are provisioned by our team after a demo, not through open self-registration.
            The person who receives the initial admin login is responsible for creating and managing accounts for
            their own team members, and for all activity under their company's workspace. You must keep login
            credentials confidential and notify us promptly of any suspected unauthorized access.
          </p>
        </div>

        <div>
          <h2>3. Subscription, trial, and billing</h2>
          <ul>
            <li>New workspaces start on a free trial period. No card is required to start a trial.</li>
            <li>
              Paid subscriptions are billed in advance, monthly or yearly, via our payment processor (Razorpay), in
              Indian Rupees (₹).
            </li>
            <li>Your plan determines which modules and how many user seats your workspace can access.</li>
            <li>
              Subscriptions renew automatically at the end of each billing period unless cancelled before the
              renewal date.
            </li>
            <li>We may change plan pricing going forward; changes won't apply retroactively to a period you've already paid for.</li>
            <li>See our <a href="/refund-policy" className="text-primary underline underline-offset-2">Refund &amp; Cancellation Policy</a> for cancellation and refund terms.</li>
          </ul>
        </div>

        <div>
          <h2>4. Your data</h2>
          <p>
            You own the business data you put into ConstructDesk — your leads, clients, projects, documents, and
            records. We do not sell your data or use it to train third-party products. Our use of data is described
            in the <a href="/privacy-policy" className="text-primary underline underline-offset-2">Privacy Policy</a>.
            If your subscription ends, we retain your data for a reasonable recovery period before deletion, unless
            you request earlier deletion.
          </p>
        </div>

        <div>
          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose, or to store or transmit content you don't have the right to use.</li>
            <li>Attempt to access another company's workspace or data, or bypass access controls.</li>
            <li>Reverse-engineer, resell, or white-label the Service without our written permission.</li>
            <li>Introduce malware, or attempt to disrupt or overload the Service's infrastructure.</li>
          </ul>
        </div>

        <div>
          <h2>6. Intellectual property</h2>
          <p>
            The ConstructDesk software, branding, and underlying technology are our property (or our licensors').
            These Terms don't transfer any ownership of the Service to you — only the right to use it under an
            active subscription.
          </p>
        </div>

        <div>
          <h2>7. Availability and support</h2>
          <p>
            We aim for high availability but don't guarantee the Service will be uninterrupted or error-free.
            Planned maintenance will be communicated where practical. Support is available at{' '}
            <a href="mailto:sales@constructdesk.in" className="text-primary underline underline-offset-2">
              sales@constructdesk.in
            </a>
            , with response times and scope varying by plan.
          </p>
        </div>

        <div>
          <h2>8. Termination</h2>
          <p>
            You may cancel your subscription at any time from Settings → Billing. We may suspend or terminate a
            workspace for non-payment, breach of these Terms, or unlawful use, with notice where reasonably
            possible.
          </p>
        </div>

        <div>
          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, ConstructDesk is not liable for indirect, incidental, or
            consequential damages arising from use of the Service. Our total liability for any claim is limited to
            the amount you paid us in the 12 months before the claim arose.
          </p>
        </div>

        <div>
          <h2>10. Governing law</h2>
          <p>
            These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the
            courts of <strong>[City, State — e.g. "Chennai, Tamil Nadu"]</strong>.
          </p>
        </div>

        <div>
          <h2>11. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. We'll post the revised version here with a new effective
            date; continued use of the Service after a change means you accept the updated Terms.
          </p>
        </div>

        <div>
          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Write to{' '}
            <a href="mailto:sales@constructdesk.in" className="text-primary underline underline-offset-2">
              sales@constructdesk.in
            </a>
            .
          </p>
        </div>
      </LegalDocument>
    </>
  )
}
