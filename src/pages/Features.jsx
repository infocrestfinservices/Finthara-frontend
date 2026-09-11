import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import {
  MessageSquare, Globe2, BarChart3, FileDown, Check, X, ArrowRight,
  Sparkles, FileText, FileSpreadsheet, FileType, IndianRupee, Clock,
  CheckCircle2, Bot, User,
} from "lucide-react";

// Re-reveals each row as it scrolls into view — the page reads static
// otherwise, since nothing on it moves until you interact with the FAQ.
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Deep-dive capabilities (alternating rows) ────────────────────────────────
const CAPABILITIES = [
  {
    icon: MessageSquare,
    eyebrow: "Conversational AI",
    title: "It interviews you — no forms to fill",
    desc: "Instead of a 40-field form, the AI asks one smart question at a time. It adapts to your industry, country and loan type, then fills the gaps itself.",
    points: ["Understands every industry", "One question at a time", "Auto-detects your region's format"],
    visual: "chat",
  },
  {
    icon: Globe2,
    eyebrow: "Bank formats",
    title: "The exact CMA format your bank expects",
    desc: "CMA Data generated to the precise structure Indian banks require for a project or working-capital loan — no manual reformatting needed.",
    points: ["CMA Data, India", "Bank-ready structure", "Lender-ready, not generic"],
    visual: "formats",
  },
  {
    icon: BarChart3,
    eyebrow: "Lender-grade financials",
    title: "Every ratio a bank checks before approving",
    desc: "DSCR, Current Ratio, Payback Period and a full 5-year P&L projection — calculated and rendered as interactive charts inside the report.",
    points: ["Live P&L & cash-flow charts", "Ratio analysis vs bank benchmarks", "5-year projections"],
    visual: "metrics",
  },
  {
    icon: FileDown,
    eyebrow: "Export anywhere",
    title: "Submission-ready in one click",
    desc: "Download a polished PDF for the bank, an editable Word doc for your consultant, or live Excel financials you can tweak — all formatted, all ready.",
    points: ["Polished PDF", "Editable Word", "Live Excel financials"],
    visual: "export",
  },
];

// ── Comparison ───────────────────────────────────────────────────────────────
const COMPARISON = [
  { label: "Turnaround time", rc: "5 minutes", ca: "2–3 weeks", diy: "Days of work" },
  { label: "Cost per report", rc: "From ₹199", ca: "₹15,000+", diy: "Your time" },
  { label: "Bank-format accuracy", rc: true, ca: true, diy: false },
  { label: "Interactive financial charts", rc: true, ca: false, diy: false },
  { label: "Unlimited revisions", rc: true, ca: false, diy: true },
  { label: "PDF / Word / Excel export", rc: true, ca: false, diy: false },
];

// ── Export formats ───────────────────────────────────────────────────────────
const EXPORTS = [
  { icon: FileText, name: "PDF", desc: "Polished, print-ready report for bank submission.", tint: "text-rose-500 bg-rose-50" },
  { icon: FileType, name: "Word", desc: "Fully editable .docx for consultants and edits.", tint: "text-blue-500 bg-blue-50" },
  { icon: FileSpreadsheet, name: "Excel", desc: "Live financial model with formulas you can tweak.", tint: "text-emerald-500 bg-emerald-50" },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = [
  { q: "Is the first report really free?", a: "Yes — your first report is free, no credit card required. You only pay when you need more reports or premium export formats." },
  { q: "Will banks accept an AI-generated report?", a: "Absolutely. Reports follow the exact CMA Data format Indian banks expect, with all required ratios and projections. Thousands have been submitted and approved." },
  { q: "Can I edit the report after it's generated?", a: "Yes. Export to Word or Excel and edit freely, or regenerate sections by giving the AI new details — revisions are unlimited on paid plans." },
  { q: "How accurate are the financial projections?", a: "The AI builds a complete 5-year model — P&L, cash flow and ratio analysis — based on your inputs and industry benchmarks, rendered as live charts you can verify." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Page header */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-grid mask-fade" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.07] to-background" />
        <div className="absolute top-[-10%] left-[8%] -z-10 w-72 h-72 bg-primary/10 blur-[100px] rounded-full animate-float-slow" />
        <div className="absolute top-[10%] right-[10%] -z-10 w-56 h-56 bg-emerald-400/10 blur-[90px] rounded-full animate-float" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 bg-card border shadow-sm text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Platform features
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight leading-[1.05] animate-fade-up animation-delay-200">
            A closer look at how <span className="text-gradient">Finthara AI</span> works
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg leading-relaxed animate-fade-up animation-delay-300">
            Not just another report builder. Explore the AI interview, bank-ready CMA
            formatting, lender-grade financials and one-click exports — in detail.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm animate-fade-up animation-delay-500">
            {["AI interview", "CMA bank format", "Live charts", "PDF · Word · Excel"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-dive capability rows */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 space-y-20 sm:space-y-28 overflow-hidden">
        <div className="absolute top-[15%] right-[-4%] -z-10 w-72 h-72 bg-primary/[0.06] blur-[110px] rounded-full animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-4%] -z-10 w-64 h-64 bg-emerald-400/[0.08] blur-[100px] rounded-full animate-float" />
        {CAPABILITIES.map((c, i) => (
          <Reveal
            key={c.title}
            className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
                <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center">
                  <c.icon className="w-5 h-5" />
                </span>
                {c.eyebrow}
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight mb-3">{c.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{c.desc}</p>
              <ul className="space-y-2.5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual */}
            <CapabilityVisual kind={c.visual} />
          </Reveal>
        ))}
      </section>

      {/* Comparison table */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <Reveal className="text-center mb-12 max-w-2xl mx-auto">
            <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
              The difference
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
              Finthara AI vs the old way
            </h2>
          </Reveal>

          <Reveal className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium text-muted-foreground px-5 py-4 w-[34%]"></th>
                  <th className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 font-heading font-bold text-primary">
                      <Sparkles className="w-4 h-4" /> Finthara AI
                    </span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-foreground/70">Hiring a CA</th>
                  <th className="px-5 py-4 font-semibold text-foreground/70">DIY Excel</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? "bg-muted/30" : ""}>
                    <td className="px-5 py-3.5 font-medium">{row.label}</td>
                    <Cell value={row.rc} highlight />
                    <Cell value={row.ca} />
                    <Cell value={row.diy} />
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* Export formats */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <Reveal className="text-center mb-12 max-w-2xl mx-auto">
            <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
              Exports
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
              Download it the way you need it
            </h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EXPORTS.map((e) => (
              <div key={e.name} className="rounded-3xl border bg-card p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-2xl ${e.tint} grid place-items-center mx-auto mb-4`}>
                  <e.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-1.5">{e.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <Reveal className="text-center mb-12">
          <p className="inline-block text-primary text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Questions, answered
          </h2>
        </Reveal>
        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border rounded-2xl bg-card px-5 transition-shadow hover:shadow-md data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}

// ── Comparison cell ──────────────────────────────────────────────────────────
function Cell({ value, highlight }) {
  let content;
  if (value === true) content = <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  else if (value === false) content = <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;
  else content = <span className={highlight ? "font-semibold text-primary" : "text-muted-foreground"}>{value}</span>;
  return <td className={`px-5 py-3.5 text-center ${highlight ? "bg-primary/[0.04]" : ""}`}>{content}</td>;
}

// ── Capability visuals (lightweight CSS mockups) ─────────────────────────────
function CapabilityVisual({ kind }) {
  if (kind === "chat") {
    return (
      <Frame>
        <div className="space-y-3">
          <Bubble from="ai"><Bot className="w-4 h-4 shrink-0" /> What product or service will your business offer?</Bubble>
          <Bubble from="user"><User className="w-4 h-4 shrink-0" /> A cloud kitchen for healthy meals in Pune.</Bubble>
          <Bubble from="ai"><Bot className="w-4 h-4 shrink-0" /> Great — what's your estimated project cost &amp; how much loan do you need?</Bubble>
          <div className="flex items-center gap-1.5 pl-1 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse animation-delay-200" />
            <span className="w-2 h-2 rounded-full bg-primary/30 animate-pulse animation-delay-300" />
          </div>
        </div>
      </Frame>
    );
  }
  if (kind === "formats") {
    return (
      <Frame>
        <div className="grid grid-cols-2 gap-3">
          {["CMA Data", "SBI Format", "PNB Format", "BoB Format", "HDFC Format", "ICICI Format"].map((f, i) => (
            <div key={f} className={`rounded-xl border px-3 py-4 text-center text-sm font-medium ${i === 0 ? "bg-brand-gradient text-white border-transparent" : "bg-muted/40"}`}>
              {f}
            </div>
          ))}
        </div>
      </Frame>
    );
  }
  if (kind === "metrics") {
    return (
      <Frame>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Net Profit (Yr 5)</p>
            <p className="text-2xl font-heading font-bold flex items-center"><IndianRupee className="w-5 h-5" />1.8 Cr</p>
          </div>
          <div className="h-16 flex items-end gap-1.5">
            {[40, 58, 52, 74, 90].map((h, i) => (
              <div key={i} className="w-3 rounded-t bg-gradient-to-t from-primary/30 to-primary origin-bottom animate-bar-wave" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ k: "DSCR", v: "1.82" }, { k: "Current Ratio", v: "1.4" }, { k: "Payback", v: "3.1 yr" }].map((m) => (
            <div key={m.k} className="rounded-xl border bg-muted/40 px-2 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">{m.k}</p>
              <p className="text-sm font-bold">{m.v}</p>
            </div>
          ))}
        </div>
      </Frame>
    );
  }
  // export
  return (
    <Frame>
      <div className="space-y-3">
        {[
          { icon: FileText, name: "Feasibility_Study.pdf", tint: "text-rose-500 bg-rose-50", size: "2.4 MB" },
          { icon: FileType, name: "Project_Report.docx", tint: "text-blue-500 bg-blue-50", size: "1.1 MB" },
          { icon: FileSpreadsheet, name: "Financials.xlsx", tint: "text-emerald-500 bg-emerald-50", size: "480 KB" },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3.5 py-3">
            <span className={`w-9 h-9 rounded-lg grid place-items-center ${f.tint}`}><f.icon className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.name}</p>
              <p className="text-[11px] text-muted-foreground">{f.size}</p>
            </div>
            <FileDown className="w-4 h-4 text-primary" />
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Frame({ children }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-brand-gradient blur-2xl opacity-10 group-hover:opacity-20 rounded-3xl transition-opacity" />
      <div className="relative rounded-2xl border bg-card shadow-xl shadow-primary/5 p-5 sm:p-6 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        {children}
      </div>
    </div>
  );
}

function Bubble({ from, children }) {
  const isAi = from === "ai";
  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
      <div className={`inline-flex items-start gap-2 max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${isAi ? "bg-muted/60 rounded-tl-sm" : "bg-brand-gradient text-white rounded-tr-sm"}`}>
        {children}
      </div>
    </div>
  );
}
