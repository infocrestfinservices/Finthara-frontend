/**
 * RefundPolicy.jsx — the Refund & Cancellation policy.
 *
 * Two reasons this page exists. Razorpay requires a published refund policy before it will
 * hand over live keys, so without it the product cannot take real money. And the pricing page
 * already promises a "7-day money-back guarantee" to every visitor, which until now was a
 * promise with nothing behind it.
 *
 * Everything here describes what the SYSTEM ACTUALLY DOES — the billing cycle, what happens
 * on cancellation, when access ends — read off the entitlement and subscription code rather
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
          <p>We offer four plans:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Free</strong> — no payment. One report, PDF download.
            </li>
            <li>
              <strong>Starter (₹499)</strong> — a one-time payment. Three reports, PDF
              download. It does not renew and does not expire.
            </li>
            <li>
              <strong>Professional (₹1,499 / month)</strong> and{" "}
              <strong>Enterprise (₹4,999 / month)</strong> — billed every 30 days. Unlimited
              reports with PDF, Word and Excel downloads.
            </li>
          </ul>
          <p>
            You can try the product on the Free plan without entering any payment details.
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
            <strong>After 7 days</strong>, a payment is not refundable. On the monthly plans,
            you can cancel at any time so that you are not charged again — see below.
          </p>
        </Section>

        <Section title="Cancelling a monthly plan">
          <p>
            You can cancel Professional or Enterprise at any time from your billing settings,
            or by writing to {SUPPORT}.
          </p>
          <p>
            <strong>Cancelling stops the next charge. It does not end your current month.</strong>{" "}
            You keep full access until the end of the period you have already paid for, and
            your plan then drops to Free automatically. We do not take back access you have
            paid for.
          </p>
          <p>
            We do not charge part-months. If you cancel on day 3 of a cycle, you keep the plan
            for the remaining 27 days and are not billed again.
          </p>
        </Section>

        <Section title="Failed payments">
          <p>
            If a renewal payment fails, your card issuer is usually the reason and we will
            retry. Access continues until the end of the period you have already paid for. If
            the payment still has not gone through by then, the account moves to the Free plan
            — your projects and reports are not deleted, and paying again restores access to
            them.
          </p>
        </Section>

        <Section title="When a report does not come out right">
          <p>
            Generation depends on AI services, and occasionally a report fails or comes back
            with something clearly wrong in it. That is our problem, not yours. Tell us at{" "}
            {SUPPORT} and we will regenerate it at no cost. Regenerating an existing report
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
