/**
 * Privacy.jsx — Privacy Policy.
 *
 * Lists what the system actually stores and which services actually receive data
 * (Supabase database, DigitalOcean API, Vercel website, Cashfree / PayPal payments,
 * DeepSeek / OpenAI for AI writing, Resend for email). Keep it in step when a provider is
 * added or removed. A legal review is recommended before relying on it.
 */
import React from "react";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Mail } from "lucide-react";
import { COMPANY_NAME, SUPPORT_EMAIL } from "@/lib/company";

const UPDATED = "7 October 2026";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {UPDATED}</p>

        <Section title="Who is responsible for your data">
          <p>
            Finthara is a product of <strong>{COMPANY_NAME}</strong>, India. We decide how your
            personal data is used for the service and are responsible for it. Questions or
            requests about your data: <a className="text-primary underline"
            href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account:</strong> your name, email address, mobile number, and your
              password (stored only in a one-way scrambled form we cannot read).</li>
            <li><strong>Your projects:</strong> the business details, figures and answers you
              enter, and the reports generated from them.</li>
            <li><strong>Payments and invoices:</strong> what you bought, amounts, order and
              payment references, and the GST details you give (state, and optionally a GSTIN
              and business name). Card, UPI and bank details are handled by the payment
              provider — we never see or store them.</li>
            <li><strong>Team:</strong> the email addresses you invite and the roles you give.</li>
            <li><strong>Technical:</strong> basic server logs, and your login and display
              preferences saved in your browser.</li>
          </ul>
        </Section>

        <Section title="Why we use it">
          <ul className="list-disc pl-6 space-y-1">
            <li>to run your account and generate your reports;</li>
            <li>to take payments and issue invoices, as tax law requires;</li>
            <li>to send service emails — sign-in codes, receipts, invitations, replies to you;</li>
            <li>to keep the service secure and fix problems.</li>
          </ul>
          <p>We do not sell your data and do not use it for advertising.</p>
        </Section>

        <Section title="Who we share it with">
          <p>Only the services that run Finthara for us, and only what each one needs:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — our database;</li>
            <li><strong>DigitalOcean</strong> and <strong>Vercel</strong> — hosting for the
              service and the website;</li>
            <li><strong>Cashfree</strong> and <strong>PayPal</strong> — payments;</li>
            <li><strong>DeepSeek</strong> and <strong>OpenAI</strong> — AI models that write and
              estimate parts of your report from your project details;</li>
            <li><strong>Resend</strong> — sending emails.</li>
          </ul>
          <p>
            Some of these providers may process data outside India. We may also disclose data
            when the law requires it.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep your account and projects while your account is active. If you delete your
            account from your settings, it is closed and you can no longer sign in. Payment and
            invoice records are kept for as long as tax and accounting laws require. To ask for
            the rest of your data to be erased, write to us.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask to see, correct or erase your personal data, withdraw your consent, or
            raise a grievance about how it is handled, by writing to{" "}
            <a className="text-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            We aim to respond within 30 days. You can update your name and phone number
            yourself in your profile.
          </p>
        </Section>

        <Section title="Security">
          <p>
            Data travels over encrypted connections, passwords are stored hashed, and access to
            your projects is limited to you and the team members you invite. No system is
            perfectly secure; tell us at once if you suspect a problem with your account.
          </p>
        </Section>

        <Section title="Children">
          <p>Finthara is for businesses and is not meant for anyone under 18.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy. The date at the top shows the latest version; we will
            tell you of significant changes by email or in the app.
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
