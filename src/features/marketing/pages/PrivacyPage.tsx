import { PageHero, LegalDocument } from '../components/shared'

export function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="What we collect, why, and how it's protected." />

      <LegalDocument
        effectiveDate="26 August 2026"
        intro={
          <p>
            This Privacy Policy explains how <strong>[Legal Entity Name]</strong> ("ConstructDesk", "we", "us")
            collects, uses, and protects information when you visit our website, request a demo, or use the
            ConstructDesk application as part of a customer workspace.
          </p>
        }
      >
        <div>
          <h2>1. Information we collect</h2>
          <p><strong>When you request a demo or contact us:</strong></p>
          <ul>
            <li>Name, work email, phone number, company name, and industry, submitted through our Request Demo form.</li>
            <li>Anything you write in the "what are you looking for" field.</li>
          </ul>
          <p><strong>When your company becomes a customer:</strong></p>
          <ul>
            <li>Login email and password (managed securely via Supabase Auth — we never see or store plain-text passwords).</li>
            <li>Business data you and your team enter: leads, clients, projects, tasks, site progress photos, estimates, contracts, vendor/labour/inventory records, expenses, and invoices.</li>
            <li>Files you upload — drawings, permits, contracts, site photos — stored on Cloudflare R2.</li>
            <li>Billing details processed by our payment partner, Razorpay (we do not store your card or bank details ourselves).</li>
            <li>Basic usage information (pages visited within the app, actions taken) used to operate and improve the product.</li>
          </ul>
        </div>

        <div>
          <h2>2. How we use it</h2>
          <ul>
            <li>To provide, maintain, and support the Service, including sending you login credentials and transactional emails.</li>
            <li>To process subscription payments and manage billing.</li>
            <li>To respond to demo requests and support inquiries.</li>
            <li>To detect and prevent fraud, abuse, or security incidents.</li>
            <li>To improve the product based on how it's actually used.</li>
          </ul>
          <p>We do not sell your personal data or your business data to anyone.</p>
        </div>

        <div>
          <h2>3. Who we share it with</h2>
          <p>We share data only with service providers who help us run ConstructDesk, under their own security commitments:</p>
          <ul>
            <li><strong>Supabase</strong> — authentication and database hosting.</li>
            <li><strong>Cloudflare R2</strong> — file and photo storage.</li>
            <li><strong>Razorpay</strong> — subscription payment processing.</li>
            <li><strong>Google (Gmail SMTP)</strong> — sending transactional and account emails.</li>
          </ul>
          <p>
            We don't share your business data across companies — every workspace on ConstructDesk is isolated from
            every other. We may disclose information if required by law or a valid legal process.
          </p>
        </div>

        <div>
          <h2>4. Data storage and security</h2>
          <p>
            Data is encrypted in transit (HTTPS/TLS) and access to your workspace is protected by authentication and
            role-based permissions, enforced both for regular users and platform administrators. Passwords are
            hashed and never visible to our team. Despite these measures, no system is 100% secure, and we can't
            guarantee absolute security.
          </p>
        </div>

        <div>
          <h2>5. Data retention</h2>
          <p>
            We retain your business data for as long as your subscription is active, plus a reasonable recovery
            window afterward, so you can resume without data loss if you renew. You can request earlier deletion by
            contacting us. Demo request submissions from prospects who don't convert are retained for our internal
            sales tracking and can be deleted on request.
          </p>
        </div>

        <div>
          <h2>6. Your rights</h2>
          <p>
            Subject to applicable law (including India's Digital Personal Data Protection Act, 2023), you may
            request access to, correction of, or deletion of your personal data, or withdraw consent for its
            processing where consent is the basis for processing. To exercise these rights, contact our Grievance
            Officer below.
          </p>
        </div>

        <div>
          <h2>7. Cookies</h2>
          <p>
            We use only the cookies/local storage necessary to keep you signed in and remember basic preferences
            (like your selected industry view). We don't use third-party advertising trackers.
          </p>
        </div>

        <div>
          <h2>8. Children's privacy</h2>
          <p>ConstructDesk is a business tool and is not directed at, or knowingly used by, children under 18.</p>
        </div>

        <div>
          <h2>9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We'll post the revised version here with a new
            effective date.
          </p>
        </div>

        <div>
          <h2>10. Grievance Officer &amp; contact</h2>
          <p>
            In accordance with Indian law, the Grievance Officer for ConstructDesk is:
          </p>
          <ul>
            <li>Name: <strong>[Grievance Officer Name]</strong></li>
            <li>Email: <a href="mailto:sales@constructdesk.in" className="text-primary underline underline-offset-2">sales@constructdesk.in</a></li>
            <li>Address: <strong>[Registered Business Address]</strong></li>
          </ul>
          <p>For any other privacy questions, reach us at the same email.</p>
        </div>
      </LegalDocument>
    </>
  )
}
