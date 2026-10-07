/**
 * Terms.jsx — Terms & Conditions.
 *
 * Written from what the product actually does (plans, credits, regenerations, team seats,
 * GST, payments, no auto-renewal) so the terms never promise something the system does not
 * do. Keep in step with services/entitlements.py and the pricing page. A legal review is
 * recommended before relying on it.
 */
import React from "react";
import { Link } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Mail } from "lucide-react";
import { COMPANY_NAME, SUPPORT_EMAIL, COMPANY_CITY } from "@/lib/company";

const UPDATED = "7 October 2026";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {UPDATED}</p>

        <Section title="Who we are">
          <p>
            Finthara (finthara.com) is a product of <strong>{COMPANY_NAME}</strong>, a company
            registered in India ("we", "us"). These terms apply to everyone who creates an
            account or uses Finthara ("you"). By creating an account or using the service you
            agree to them. If you do not agree, please do not use Finthara.
          </p>
        </Section>

        <Section title="What Finthara does">
          <p>
            Finthara helps you prepare financial project reports — an Excel financial model
            (CMA format and others), a Word report and an online report — from the details you
            give it. Parts of the report are written and estimated with the help of AI.
          </p>
          <p>
            <strong>Finthara is a tool, not financial, legal, tax or investment advice.</strong>{" "}
            A report is only as good as the information you enter and may contain mistakes.
            Please review every report before you submit or rely on it. Whether a bank,
            investor or government body accepts a proposal is entirely their decision; we do
            not guarantee any loan, grant, investment or approval.
          </p>
        </Section>

        <Section title="Your account">
          <ul className="list-disc pl-6 space-y-1">
            <li>Give accurate details and keep your password private. You are responsible for
              what happens under your account.</li>
            <li>You must be at least 18 years old and able to enter a contract.</li>
            <li>Team members you invite use your plan; you are responsible for who you invite
              and the role you give them.</li>
          </ul>
        </Section>

        <Section title="Plans and payments">
          <p>
            Current plans, prices and what each includes are shown on the{" "}
            <Link className="text-primary underline" to="/pricing">pricing page</Link>. In
            short:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Entrepreneur</strong> — a one-time purchase for one report, with one
              regeneration of that report included.</li>
            <li><strong>Consultant &amp; CA</strong> — paid monthly or yearly; 20 reports per
              month, two regenerations included per report, and two team members.</li>
            <li>Extra regenerations and extra team seats can be bought separately at the prices
              shown in the app.</li>
            <li>Prices are <strong>exclusive of GST</strong>; GST at the applicable rate is added
              at checkout and shown on your invoice.</li>
            <li>Payments in INR are processed by Cashfree; payments in USD (for customers outside
              India) by PayPal. We do not see or store your card or UPI details.</li>
            <li><strong>Nothing renews automatically.</strong> A plan or seat runs for the period
              you paid for and then ends unless you pay again.</li>
          </ul>
          <p>
            Refunds are covered by our{" "}
            <Link className="text-primary underline" to="/refund-policy">Refund &amp;
            Cancellation Policy</Link>.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>use Finthara to make false or misleading reports intended to deceive a lender,
              investor or authority, or for anything unlawful;</li>
            <li>share one account among people who are not members of your team, or try to
              get around plan limits;</li>
            <li>copy, resell, reverse-engineer or scrape the service, its templates or its
              software, or interfere with its security or operation.</li>
          </ul>
          <p>We may suspend or close an account that breaks these rules.</p>
        </Section>

        <Section title="Your content and ours">
          <p>
            The details you enter and the reports generated for you are yours to use for your
            business. You allow us to store and process them only to provide the service to
            you (see our <Link className="text-primary underline" to="/privacy">Privacy
            Policy</Link>).
          </p>
          <p>
            The Finthara software, website, report and Excel templates, design and brand
            belong to {COMPANY_NAME} and are protected by copyright and other laws. Using
            Finthara does not give you any right to them beyond using the service.
          </p>
        </Section>

        <Section title="Availability and changes">
          <p>
            We work to keep Finthara available and accurate, but it is provided "as is", and it
            may occasionally be unavailable or change. We may update features, plans or prices;
            a price change does not affect a period you have already paid for.
          </p>
        </Section>

        <Section title="Liability">
          <p>
            To the extent the law allows, we are not liable for indirect or consequential
            losses — such as a declined loan, lost profit or lost opportunity — arising from
            the use of Finthara or of a report it produced, and our total liability to you is
            limited to the amount you paid us in the 12 months before the claim.
          </p>
        </Section>

        <Section title="Ending your use">
          <p>
            You can stop using Finthara and delete your account at any time from your settings.
            Records we must keep by law (for example invoices) are retained as described in the
            Privacy Policy.
          </p>
        </Section>

        <Section title="Law and disputes">
          <p>
            These terms are governed by the laws of India. Disputes will be subject to the
            courts at {COMPANY_CITY}.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms. The date at the top shows the latest version; continuing
            to use Finthara after a change means you accept the updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </Section>
      </main>

      <LandingFooter />
    </div>
  );
}
