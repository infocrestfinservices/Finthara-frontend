import {
  Sparkles, Globe2, BarChart3, Download, Shield, Clock, Zap,
  Calculator, ShieldCheck, FileText,
} from "lucide-react";

export const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Interviews", desc: "Conversational AI asks the right questions to extract all project details — no forms to fill.", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Globe2, title: "Country-Specific Formats", desc: "CMA Data for India, SBA format for USA, Innovate UK grants, and more — auto-detected.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BarChart3, title: "Live Financial Charts", desc: "P&L, revenue projections, and cost breakdowns rendered as interactive graphs inside the report.", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Download, title: "Export Everywhere", desc: "Download as polished PDF, formatted Word doc, or editable Excel — ready to submit.", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Shield, title: "Bank & Investor Ready", desc: "DSCR, Current Ratio, IRR, Payback Period, MOIC — every metric lenders and investors need.", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Clock, title: "Minutes, Not Weeks", desc: "What a CA takes 2–3 weeks to prepare, Finthara delivers in under 5 minutes.", color: "text-sky-600", bg: "bg-sky-50" },
];

// Bank / scheme / report formats the AI can produce — used in the marquee strip.
export const FORMATS = [
  "CMA Data", "SBI", "SBA (USA)", "Mudra Loan", "PMEGP", "CGTMSE",
  "DSCR Analysis", "Innovate UK", "VC Term Sheet", "PE Diligence",
  "Feasibility Study", "IRR / MOIC",
];

// What the generated report actually contains — the deliverables.
export const REPORT_INCLUDES = [
  { icon: Calculator, title: "5-Year Financial Model", desc: "Projected P&L, balance sheet and cash flow — with editable assumptions before you export." },
  { icon: ShieldCheck, title: "Lender-Grade Ratios", desc: "DSCR, Current Ratio, IRR, Payback Period and MOIC, benchmarked against what banks expect." },
  { icon: BarChart3, title: "Charts & Data Tables", desc: "Revenue projections, cost breakdowns and ratio tables rendered as presentation-ready visuals." },
  { icon: Globe2, title: "Bank & Scheme Formats", desc: "CMA Data, SBA, Mudra, PMEGP, CGTMSE and Innovate UK — the exact structure each authority needs." },
  { icon: FileText, title: "Full Narrative Sections", desc: "Executive summary, market analysis, SWOT, promoter profile and risk assessment — all written for you." },
  { icon: Download, title: "PDF · Word · Excel Export", desc: "Download a polished PDF, an editable Word doc, or live Excel financials — submission-ready." },
];

export const STEPS = [
  { step: "01", title: "Describe your project", desc: "Type your business idea in plain English. The AI understands every industry and region.", icon: Zap },
  { step: "02", title: "AI interviews you", desc: "It asks smart follow-up questions — costs, location, bank format, investor type. One question at a time.", icon: Sparkles },
  { step: "03", title: "Download your report", desc: "Get a fully formatted CMA / SBA / investor-grade report in PDF, Word, or Excel in minutes.", icon: Download },
];

export const TESTIMONIALS = [
  { name: "Rajesh Mehta", role: "MSME Owner, Surat", text: "Got my SBI CMA data report in 4 minutes. The DSCR tables were perfect. My loan got approved in the first attempt.", avatar: "RM" },
  { name: "Priya Nair", role: "Startup Founder, Bangalore", text: "The VC-grade financial model with IRR and cap table saved us at least ₹80,000 in CA fees. Investors loved the depth.", avatar: "PN" },
  { name: "Amir Khan", role: "Restaurant Chain, Delhi", text: "Used it for a government PMEGP scheme report. The AI knew exactly what format KVIC requires. Remarkable.", avatar: "AK" },
];

// `id` is the server's plan key (services/entitlements.py). The price shown here is only for
// display — what is charged is decided by the server. A plan with `billing` has a Monthly /
// Yearly switch, and each option carries its own server plan id.
export const PLANS = [
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    price: "₹1,999",
    period: "one-time",
    note: "Pay once — buy again whenever you need another report.",
    description: "One complete project report for your own business.",
    features: [
      { text: "1 report", included: true },
      { text: "Excel + Word report", included: true },
      { text: "Online report on the website", included: true },
      { text: "CMA / SBA / All Bank & Scheme Formats", included: true },
      { text: "Investor-Grade Metrics", included: true },
    ],
  },
  {
    name: "Consultant & CA",
    description: "For consultants and CAs preparing reports for many clients.",
    billing: {
      monthly: {
        id: "consultant_monthly",
        price: "₹11,000",
        period: "/ month",
        note: "Billed monthly.",
      },
      yearly: {
        id: "consultant_yearly",
        price: "₹119,988",
        period: "/ year",
        note: "₹9,999 / month, billed once a year.",
      },
    },
    features: [
      { text: "20 reports per month", included: true },
      { text: "Excel + Word report", included: true },
      { text: "Online report on the website", included: true },
      { text: "CMA / SBA / All Bank & Scheme Formats", included: true },
      { text: "Investor-Grade Metrics", included: true },
      { text: "2 team seats", included: true },
    ],
  },
];
