import { PageHero, LegalDocument } from '../components/shared'

export function RefundPolicyPage() {
  return (
    <>
      <PageHero align="left" eyebrow="Legal" title="Refund & Cancellation Policy" description="How trials, cancellations, and refunds work." />

      <LegalDocument effectiveDate="26 August 2026">
        <div>
          <h2>1. Free trial</h2>
          <p>
            Every new ConstructDesk workspace starts on a free trial with full access to explore the product. No
            payment is collected during the trial, and no card is required to start one. You choose a paid plan only
            when you're ready.
          </p>
        </div>

        <div>
          <h2>2. Cancelling your subscription</h2>
          <p>
            You can cancel a paid subscription at any time from <strong>Settings → Billing</strong> inside the app,
            or by emailing{' '}
            <a href="mailto:sales@constructdesk.in" className="text-primary underline underline-offset-2">
              sales@constructdesk.in
            </a>
            . Cancellation stops future renewals — your workspace stays fully accessible for the remainder of the
            billing period you've already paid for.
          </p>
        </div>

        <div>
          <h2>3. Refunds</h2>
          <ul>
            <li>Subscription fees are charged in advance for each billing period (monthly or yearly) and are generally non-refundable for the portion of a period already elapsed.</li>
            <li>
              If you're charged in error — a duplicate charge, or a charge after you'd already cancelled — email us
              within 7 days and we'll refund it in full.
            </li>
            <li>
              If you cancel within 7 days of your <strong>first</strong> paid charge (i.e. shortly after converting
              from trial), and haven't materially used the plan's paid-tier-only modules, we'll refund that charge on
              request.
            </li>
            <li>Yearly plans cancelled partway through the year are not refunded for unused months, except where the error/first-week cases above apply.</li>
            <li>Enterprise plans are billed per the terms agreed in that customer's specific order — those terms take precedence over this policy where they differ.</li>
          </ul>
        </div>

        <div>
          <h2>4. Failed or overdue payments</h2>
          <p>
            If a renewal payment fails, we'll notify you and give a grace period to update your payment method before
            any access is restricted. Continued non-payment beyond the grace period may result in the workspace
            being paused until payment is resolved; your data is preserved, not deleted, during this time.
          </p>
        </div>

        <div>
          <h2>5. How to request a refund</h2>
          <p>
            Email{' '}
            <a href="mailto:sales@constructdesk.in" className="text-primary underline underline-offset-2">
              sales@constructdesk.in
            </a>{' '}
            with your company name and the charge in question. We aim to respond within 3 business days, and
            approved refunds are issued to the original payment method via Razorpay within 5–7 business days.
          </p>
        </div>

        <div>
          <h2>6. Changes to this policy</h2>
          <p>We may update this policy from time to time. We'll post the revised version here with a new effective date.</p>
        </div>
      </LegalDocument>
    </>
  )
}
