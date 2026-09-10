import {
  Sparkles, Globe2, BarChart3, Download, Shield, Clock, Zap,
  Building2, TrendingUp, Award, Calculator, ShieldCheck, FileText,
} from "lucide-react";

export const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Interviews", desc: "Conversational AI asks the right questions to extract all project details — no forms to fill.", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Globe2, title: "Country-Specific Formats", desc: "CMA Data for India, SBA format for USA, Innovate UK grants, and more — auto-detected.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BarChart3, title: "Live Financial Charts", desc: "P&L, revenue projections, and cost breakdowns rendered as interactive graphs inside the report.", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Download, title: "Export Everywhere", desc: "Download as polished PDF, formatted Word doc, or editable Excel — ready to submit.", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Shield, title: "Bank & Investor Ready", desc: "DSCR, Current Ratio, IRR, Payback Period, MOIC — every metric lenders and investors need.", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Clock, title: "Minutes, Not Weeks", desc: "What a CA takes 2–3 weeks to prepare, ReportCraft delivers in under 5 minutes.", color: "text-sky-600", bg: "bg-sky-50" },
];

export const STATS = [
  { value: "10,000+", label: "Reports Generated" },
  { value: "₹2,400 Cr+", label: "Loans Facilitated" },
  { value: "95%", label: "Approval Rate" },
  { value: "4.9 ★", label: "User Rating" },
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

export const PLANS = [
  {
    name: "Starter",
    tag: null,
    price: "₹499",
    period: "one-time",
    description: "Perfect for a single loan application or project proposal.",
    color: "border-border",
    headerBg: "bg-muted/40",
    features: [
      { text: "3 Project Reports", included: true },
      { text: "Short & Long Format", included: true },
      { text: "PDF Export", included: true },
      { text: "Word Export", included: false },
      { text: "Excel Financials", included: false },
      { text: "CMA / SBA Formats", included: false },
      { text: "Investor-Grade Metrics", included: false },
    ],
    cta: "Get Started",
    variant: "outline",
  },
  {
    name: "Professional",
    tag: "Most Popular",
    price: "₹1,499",
    period: "/ month",
    description: "For CAs, consultants, and entrepreneurs with ongoing needs.",
    color: "border-primary",
    headerBg: "bg-primary",
    features: [
      { text: "Unlimited Reports", included: true },
      { text: "Short & Long Format", included: true },
      { text: "PDF + Word Export", included: true },
      { text: "Excel Financials Export", included: true },
      { text: "CMA Modeling", included: true },
      { text: "Team Members (3 seats)", included: true },
    ],
    cta: "Get Professional",
    variant: "default",
  },
  {
    name: "Enterprise",
    tag: null,
    price: "₹4,999",
    period: "/ month",
    description: "For CA firms, DSAs, and banks processing high volumes.",
    color: "border-border",
    headerBg: "bg-muted/40",
    features: [
      { text: "Unlimited Reports", included: true },
      { text: "All Export Formats", included: true },
      { text: "CMA Modeling", included: true },
      { text: "Team Members (10 seats)", included: true },
      { text: "White-label & Custom Branding", included: true },
    ],
    cta: "Get Enterprise",
    variant: "outline",
  },
];

export const ONE_TIME = [
  { name: "Single CMA Report", price: "₹299", desc: "One full CMA-format report for any Indian bank", icon: Building2 },
  { name: "Investor Pitch Pack", price: "₹799", desc: "VC-grade financials + pitch deck summary", icon: TrendingUp },
  { name: "Government Scheme Report", price: "₹199", desc: "PMEGP, Mudra, CGTMSE, or any state scheme", icon: Award },
  { name: "Feasibility Study", price: "₹499", desc: "Technical + financial feasibility with SWOT", icon: BarChart3 },
];
