/**
 * RenewalPolicy.jsx — the Renewal & Cancellation policy.
 *
 * Everything here describes what the SYSTEM ACTUALLY DOES — the billing period, that nothing
 * renews automatically, what happens when a plan ends, what happens to a failed payment —
 * read off services/entitlements.py rather than drafted from a template. A policy that
 * contradicts the software is worse than no policy: it is a promise the product will break.
 * Prices are deliberately not repeated here; the pricing page is the one place they live.
 */
import React from "react";
import { Link } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/company";

const UPDATED = "21 October 2026";
const SUPPORT = SUPPORT_EMAIL;

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function RenewalPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
          Renewal &amp; Cancellation Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {UPDATED}</p>

        <Section title="Overview">
          <p>
            This policy explains how Finthara plans run, how they are renewed, and how you can
            stop using a plan. Finthara is a digital service: a report is made available to
            download as soon as it is generated. Current plans, prices and what each includes
            are shown on the{" "}
            <Link className="text-primary underline" to="/pricing">
              pricing page
            </Link>
            .
          </p>
        </Section>

        <Section title="Plans and billing periods">
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Entrepreneur</strong> — a one-time purchase for one report. It is not a
              subscription: it does not expire and does not renew. Buy it again whenever you
              need another report.
            </li>
            <li>
              <strong>Consultant &amp; CA</strong> — paid for one billing period at a time,
              either a month or a year.
            </li>
            <li>
              <strong>Extra team seats</strong> — paid for one month at a time.
            </li>
          </ul>
        </Section>

        <Section title="Renewal">
          <p>
            <strong>Plans do not renew automatically.</strong> We never charge you again
            without you choosing to pay.
          </p>
          <p>
            To continue after a billing period, pay for the next period from the{" "}
            <Link className="text-primary underline" to="/pricing">
              pricing page
            </Link>
            . You can renew at any time: renewing before the current period ends adds the new
            period on top of the time you still have, so nothing already paid for is lost.
          </p>
        </Section>

        <Section title="Cancellation">
          <p>
            Because nothing renews automatically, there is no cancellation deadline and nothing
            you need to cancel to avoid a further charge. If you do not wish to continue, simply
            do not renew — your plan ends on its own at the end of the period you paid for.
          </p>
          <p>
            You can also stop using Finthara and delete your account at any time from your
            settings.
          </p>
        </Section>

        <Section title="Access until the end of the billing period">
          <p>
            You keep full access to your plan until the end of the billing period you paid for.
            After it ends, new report generation and exports stop until you pay for another
            period. Any unused Entrepreneur reports on your account remain available to use.
          </p>
          <p>
            Reports you have already generated and downloaded remain yours to keep.
          </p>
        </Section>

        <Section title="Failed payments">
          <p>
            If a payment fails, the plan is not activated and you can simply try again. If
            money left your account but the plan did not activate, write to {SUPPORT} with the
            order reference — we check it with the payment gateway and activate the plan. Banks
            usually reverse a failed transaction on their own within 5 to 7 working days.
          </p>
        </Section>

        <Section title="Contact">
          <p className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a className="text-primary underline" href={`mailto:${SUPPORT}`}>
              {SUPPORT}
            </a>
          </p>
          <p>We aim to answer within two working days.</p>
        </Section>
      </main>

      <LandingFooter />
    </div>
  );
}
