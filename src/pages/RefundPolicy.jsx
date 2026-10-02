/**
 * RefundPolicy.jsx — the Refund & Cancellation policy.
 *
 * Two reasons this page exists. The payment gateway (Cashfree) requires a published refund
 * policy before it will hand over live keys, so without it the product cannot take real money. And the pricing page
 * already promises a "7-day money-back guarantee" to every visitor, which until now was a
 * promise with nothing behind it.
 *
 * Everything here describes what the SYSTEM ACTUALLY DOES — the billing cycle, what happens
 * when a plan ends, what happens to a failed payment — read off the entitlement code rather
 * than drafted from a template. A policy that contradicts the software is worse than no
 * policy: it is a promise the product will break.
 */
import React from "react";
import { Link } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Mail } from "lucide-react";

const UPDATED = "12 August 2026";
const SUPPORT = "support@infocrest.in";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {UPDATED}</p>

        <Section title="What you are buying">
          <p>
            Finthara AI generates financial project reports — a CMA-format Excel workbook
            and a written Word/PDF report — from the details you provide. It is a digital
            service. A report is produced and made available to download as soon as it is
            generated, and there is nothing to ship or return.
          </p>
          <p>We offer two plans:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Entrepreneur (₹1,999 + GST, one-time)</strong> — one report, with the Excel
              and Word report and the online report on the website, for a single user, with 1
              regeneration of that report included. Not a subscription: buy it again whenever
              you need another report.
            </li>
            <li>
              <strong>Consultant &amp; CA (₹11,000 / month, or ₹119,988 / year, GST excluded)</strong> — 20
              reports per month in the same formats, 2 regenerations included per report, plus 2
              team seats (invited members, as an editor or a viewer).
            </li>
          </ul>
          <p>
            Further regenerations of a report, beyond those included, are ₹50 + GST each, bought
            for that report.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            <strong>You may request a full refund within 7 days of a payment.</strong> Write
            to us at{" "}
            <a className="text-primary underline" href={`mailto:${SUPPORT}`}>
              {SUPPORT}
            </a>{" "}
            from the email address on the account, telling us which payment you mean. You do
            not have to give a reason.
          </p>
          <p>
            Approved refunds are returned to the original payment method. Your bank or card
            issuer decides how long it then takes to appear — typically 5 to 10 working days.
            We do not control that part and cannot speed it up.
          </p>
          <p>
            Reports you have already generated and downloaded remain yours to keep. We do not
            withdraw work you have already received.
          </p>
          <p>
            <strong>After 7 days</strong>, a payment is not refundable. Nothing renews
            automatically, so there is never a later charge to cancel — see below.
          </p>
        </Section>

        <Section title="Renewal and cancellation">
          <p>
            <strong>Consultant &amp; CA is a single payment for one period</strong> — a month or
            a year — and <strong>does not renew automatically</strong>. We never charge you again
            without you choosing to pay, so there is nothing to cancel.
          </p>
          <p>
            You keep full access until the end of the period you paid for. The plan then lapses
            on its own — new report generation and exports stop until you pay for another
            period. Renewing before the end adds the new period on top of the time you still
            have; nothing already paid for is lost.
          </p>
        </Section>

        <Section title="Failed payments">
          <p>
            If a payment fails, the plan is not activated and you can simply try again. If
            money left your account but the plan did not activate, write to {SUPPORT} with the
            order reference — we check it with the payment gateway and either activate the plan
            or make sure the amount is returned. Banks usually reverse a failed transaction on
            their own within 5 to 7 working days.
          </p>
        </Section>

        <Section title="When a report does not come out right">
          <p>
            Generation depends on AI services, and occasionally a report fails or comes back
            with something clearly wrong in it. That is our problem, not yours. Tell us at{" "}
            {SUPPORT} and we will regenerate it at no cost — on every plan. Regenerating an existing report
            never counts against your report allowance.
          </p>
          <p>
            The reports are a modelling tool built from the assumptions you supply. We do not
            refund on the grounds that a bank, investor or lender declined a proposal — that
            decision is theirs and is outside what this service does.
          </p>
        </Section>

        <Section title="Contact">
          <p className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a className="text-primary underline" href={`mailto:${SUPPORT}`}>
              {SUPPORT}
            </a>
          </p>
          <p>
            We aim to answer within two working days. See also our{" "}
            <Link className="text-primary underline" to="/pricing">
              pricing
            </Link>{" "}
            for what each plan includes.
          </p>
        </Section>
      </main>

      <LandingFooter />
    </div>
  );
}
