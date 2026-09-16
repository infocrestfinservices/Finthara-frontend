import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LandingNavbar, LandingFooter, PhoneDemo } from "@/components/landing";
import {
  PencilLine, MessagesSquare, Calculator, LineChart, FileDown,
  Sparkles, ArrowRight, Clock, Brain, Globe2, ShieldCheck, FileText,
  TableProperties, CheckCircle2, IndianRupee,
} from "lucide-react";

// ── Detailed steps (vertical timeline) ───────────────────────────────────────
const STEPS = [
  {
    icon: PencilLine,
    title: "Describe your idea",
    time: "~30 seconds",
    desc: "Type your business idea in plain English and pick your country and purpose — loan, investor, or government scheme. No forms, no jargon.",
    chips: ["Any industry", "Any country", "Plain English"],
  },
  {
    icon: MessagesSquare,
    title: "Answer a few smart questions",
    time: "~2 minutes",
    desc: "The AI interviews you one question at a time — project cost, location, loan amount, bank format. It adapts each question to what you've already told it.",
    chips: ["One at a time", "Context-aware", "Skips what it can infer"],
  },
  {
    icon: Calculator,
    title: "AI builds your financial model",
    time: "Automatic",
    desc: "Behind the scenes it generates a full 5-year model — P&L, cash flow, and ratio analysis like DSCR, IRR and Payback — using your numbers and industry benchmarks.",
    chips: ["5-year projections", "DSCR · IRR · MOIC", "Benchmarked"],
  },
  {
    icon: LineChart,
    title: "Review your live report",
    time: "Instant",
    desc: "Your report renders instantly with interactive charts and formatted tables, structured to the exact CMA / SBA / scheme layout your institution expects.",
    chips: ["Interactive charts", "Bank-spec layout", "Edit & regenerate"],
  },
  {
    icon: FileDown,
    title: "Export & submit",
    time: "1 click",
    desc: "Download a polished PDF for the bank, an editable Word doc, or a live Excel model — submission-ready, every time.",
    chips: ["PDF", "Word", "Excel"],
  },
];

// ── Behind the scenes ────────────────────────────────────────────────────────
const ENGINE = [
  { icon: Brain, title: "Understands your industry", desc: "Recognises your sector and pulls the right cost structure and assumptions." },
  { icon: Globe2, title: "Detects the right format", desc: "Maps your country and loan type to CMA, SBA, PMEGP, Innovate UK and more." },
  { icon: Calculator, title: "Runs the financial model", desc: "Builds a 5-year P&L, cash flow and ratio analysis automatically." },
  { icon: TableProperties, title: "Renders charts & tables", desc: "Turns the numbers into interactive graphs and lender-ready tables." },
  { icon: ShieldCheck, title: "Checks the key ratios", desc: "Validates DSCR, Current Ratio, IRR and Payback against benchmarks." },
  { icon: FileText, title: "Formats the document", desc: "Lays everything out to the exact structure your bank or investor expects." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Header */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.07] to-background" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 bg-card border shadow-sm text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> How it works
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight leading-[1.05]">
            From a one-line idea to a funded report — in{" "}
            <span className="text-gradient">5 minutes</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
            No spreadsheets, no CA appointments. Here's exactly what happens between typing your idea
            and downloading a bank-ready report.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            {["Unlimited reports", "All export formats", "Edit anytime"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Vertical timeline, beside the live demo clip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Live demo — sticky beside the timeline on desktop */}
          <div className="lg:sticky lg:top-28 order-2 lg:order-1 flex justify-center">
            <PhoneDemo />
          </div>

          <div className="relative order-1 lg:order-2">
            {/* the rail */}
            <div className="absolute left-6 top-3 bottom-3 w-px bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 sm:left-7" />

            <div className="space-y-10">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative flex gap-5 sm:gap-7">
                  {/* node */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-lg shadow-primary/30">
                      <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-card border text-[11px] font-bold grid place-items-center">
                      {i + 1}
                    </span>
                  </div>

                  {/* card */}
                  <div className="flex-1 rounded-2xl border bg-card p-5 sm:p-6 -mt-1 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h3 className="font-heading font-bold text-lg sm:text-xl">{s.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                        <Clock className="w-3 h-3" /> {s.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {s.chips.map((c) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full border bg-muted/40 text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Behind the scenes */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
              Behind the scenes
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
              What the AI does while you wait
            </h2>
            <p className="text-muted-foreground mt-3">
              Six things happen automatically the moment you finish the interview.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENGINE.map((e) => (
              <div key={e.title} className="rounded-3xl border bg-card p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
                  <e.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcome band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient shadow-xl shadow-primary/20 px-6 sm:px-10 py-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { v: "5 min", l: "Idea to report" },
              { v: "5-year", l: "Financial model" },
              { v: "3 formats", l: "PDF · Word · Excel" },
              { v: "₹15k+", l: "Saved vs a CA" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl sm:text-3xl font-heading font-bold">{s.v}</p>
                <p className="text-sm text-white/75 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini CTA recap */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">
          That's the whole process.
        </h2>
        <p className="text-muted-foreground mb-7">
          Start now — your first report is free, and you'll have it before your coffee gets cold.
        </p>
        <Link to="/create">
          <Button size="lg" className="h-12 px-7 text-base gap-2 shadow-xl shadow-primary/30 group">
            Try it free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </section>

      <LandingFooter />
    </div>
  );
}
