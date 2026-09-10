import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { reportStorage } from "@/api/localStorageService";
import { invokeLLM } from "@/api/llmService";
import { generateModel } from "@/api/generationService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, FileText, Bot, User, Sparkles, Copy, Pencil, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import TemplateSelector from "@/components/report/TemplateSelector";
import TemplateInputForm from "@/components/report/TemplateInputForm";

const SYSTEM_PROMPT = `You are a friendly project report assistant. Your job is to gather information from the user to create a professional project report.

CONVERSATION FLOW — follow this ORDER exactly. Ask ONE question per message, warm and short.

STEP 1 — the business (ask only what you do not already know):
   - Project/business title and what it does
   - Country and city/location
   - Industry/sector
   - Promoter/company name and their experience
   - Target market and customers

STEP 2 — as soon as you have the target market, ask THIS, before any money question:

  "Before we go into the numbers — which of these do you need?

   **Short** — a quick read to help you decide whether this business is worth doing:
   what it would cost to set up, what the market looks like, and a clear verdict.

   **Long** — the full CMA submission for your bank: every statutory form, schedule and
   supporting analysis a lender asks for."

   Set report_format to "short" or "long" from their answer. If they are unsure, ask what
   they need it FOR — to decide, or to submit to a bank — and choose from that. NEVER guess
   it, and NEVER mention page counts.

STEP 3 — now ask the money questions, and ask ONLY the set that matches their answer:

   IF SHORT — three questions, nothing more. Do not ask for balance-sheet figures; the
   short report does not use them and asking for them wastes the user's time:
     - roughly what the whole project would cost to set up (project_cost)
     - how much of that they want as a bank loan (loan_amount)
     - which bank they are approaching (bank_name)
     Then go straight to the JSON block.

   IF LONG — first the bank-format question:
     - India → "Do you need **CMA (Credit Monitoring Arrangement) data** format as required
       by Indian banks? If yes, which bank — SBI, PNB, Canara, or others?"
     - USA → "Is this for an **SBA loan** (SBA 7a/504)?"
     - UK → "Is this for a specific bank product — e.g. **British Business Bank / CBILS**?"
     - elsewhere → "Any specific bank format, or is the standard format fine?"
     then these figures, ONE at a time, into "purpose_answers" under these exact keys:
     loan_amount, existing_borrowings, working_capital_requirement, current_assets,
     current_liabilities, projected_sales, projected_expenses, inventory, debtors,
     creditors, bank_name

PURPOSE IS ALWAYS "bank_loan". Never ask what the report is for and never offer other
purposes — every report this product makes is a bank submission. Set it silently.

For numeric answers store plain numbers (no symbols or commas). If the user does not know a
value, store null and move on — never block on a figure they have not worked out yet.

STEP 4 — once you have everything STEP 3 asked for (and nothing more), respond with ONLY
this JSON block and no other text. For a SHORT report leave the balance-sheet keys out
entirely rather than inventing them, and set financial_format to "cma_india" for India or
"standard" elsewhere without asking.

\`\`\`json
{
  "ready": true,
  "data": {
    "title": "...",
    "industry": "...",
    "sub_industry": "...",
    "country": "...",
    "currency": "...",
    "location": "...",
    "promoter_name": "...",
    "promoter_experience": "...",
    "project_description": "...",
    "target_market": "...",
    "target_customers": "...",
    "project_cost": 0,
    "own_contribution": 0,
    "loan_amount": 0,
    "purpose": "bank_loan",
    "government_scheme_name": "...",
    "report_format": "short|long",
    "financial_format": "cma_india|sba_usa|innovate_uk|standard",
    "financial_format_detail": "e.g. SBI CMA, SBA 7a, Innovate UK, Series A VC, etc.",
    "purpose_answers": { "<only the keys STEP 3 actually asked for>": "<number or text>" }
  }
}
\`\`\`

IMPORTANT RULES:
- Never ask more than one question per message
- Be warm and professional
- If user gives vague costs (e.g. "around 50 lakhs"), use the number (5000000 for INR)
- Infer currency from country (India→INR, US→USD, etc.)
- Keep questions short and direct`;

function buildFinancialFormatInstructions(data, curr) {
  const fmt = data.financial_format || "standard";
  const detail = data.financial_format_detail || "";

  if (fmt === "cma_india") {
    return `FINANCIAL FORMAT: CMA DATA (Credit Monitoring Arrangement) — Standard Indian Bank Format${detail ? ` for ${detail}` : ""}

Generate ALL of the following CMA Forms as numbered markdown tables, EXACTLY in the structure used by SBI/PNB/Canara Bank RAM tool. All amounts in INR Lakhs (or Crores if large). Columns = 2 Audited years + 1 Estimated year + 5 Projected years (Year 1–5).

---

## CMA FORM I — Cost of Project & Means of Finance

**Table A: Cost of Project**
| Sr. No. | Particulars | Amount (₹ Lakhs) | % of Total |
(Include: Land & Development, Building, Furniture & Fixtures, Electrical Equipments, Plant & Machinery, Pre-operative Expenses, Contingencies, Working Capital Margin, Interest During Construction)

**Table B: Means of Finance**
| Particulars | Amount (₹ Lakhs) | % of Total |
(Include: Promoter's Own Contribution/Corpus Fund, Term Loan – Bank (TL-1, TL-2), Working Capital Loan)
Show: Debt-Equity Ratio, Promoter Contribution %

---

## CMA FORM II — Operating Statement (P&L Account)
(All figures in ₹ Lakhs. Columns: Audited Y-2 | Audited Y-1 | Estimated Y0 | Projected Y1 | Y2 | Y3 | Y4 | Y5)

| Sr. | Particulars | Y-2 (Aud) | Y-1 (Aud) | Y0 (Est) | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Gross Domestic Sales | | | | | | | | |
| 2 | Gross Export Sales | | | | | | | | |
| 3 | Total Gross Sales | | | | | | | | |
| 4 | Less: Excise Duty / GST | | | | | | | | |
| 5 | Net Sales | | | | | | | | |
| 6 | Net Sales Growth Rate (%) | | | | | | | | |
| 7 | Other Operating Income | | | | | | | | |
| 8 | Total Operating Income | | | | | | | | |
| | **Cost of Sales** | | | | | | | | |
| 9 | Raw Materials Consumed (Indigenous) | | | | | | | | |
| 10 | Raw Materials Consumed (Imported) | | | | | | | | |
| 11 | Power & Fuel | | | | | | | | |
| 12 | Direct Labour / Employee Cost | | | | | | | | |
| 13 | Other Operating Expenses | | | | | | | | |
| 14 | Depreciation | | | | | | | | |
| 15 | Sub-Total (Cost of Production) | | | | | | | | |
| 16 | Add: Opening Stock of WIP | | | | | | | | |
| 17 | Less: Closing Stock of WIP | | | | | | | | |
| 18 | **Cost of Production** | | | | | | | | |
| 19 | Add: Opening Stock of Finished Goods | | | | | | | | |
| 20 | Less: Closing Stock of Finished Goods | | | | | | | | |
| 21 | **Cost of Goods Sold** | | | | | | | | |
| 22 | Selling & Distribution Expenses | | | | | | | | |
| 23 | General & Administration Expenses | | | | | | | | |
| 24 | **Total Operating Cost** | | | | | | | | |
| 25 | **Operating Profit (EBITDA)** | | | | | | | | |
| 26 | Interest on Term Loans | | | | | | | | |
| 27 | Interest on Working Capital | | | | | | | | |
| 28 | Bank Charges | | | | | | | | |
| 29 | **Total Interest & Finance Charges** | | | | | | | | |
| 30 | **Operating Profit after Interest (EBIT)** | | | | | | | | |
| 31 | Add: Non-Operating Income | | | | | | | | |
| 32 | Less: Non-Operating Expenses | | | | | | | | |
| 33 | **Profit Before Tax (PBT)** | | | | | | | | |
| 34 | Less: Provision for Income Tax | | | | | | | | |
| 35 | **Profit After Tax (PAT)** | | | | | | | | |
| 36 | Add: Depreciation | | | | | | | | |
| 37 | **Cash Accruals (PAT + Depreciation)** | | | | | | | | |
| 38 | PBDIT (Profit Before Dep, Int & Tax) | | | | | | | | |
| 39 | PBDIT Margin (%) | | | | | | | | |
| 40 | PAT Margin (%) | | | | | | | | |

---

## CMA FORM III — Balance Sheet
(All figures in ₹ Lakhs. Same year columns as Form II)

**LIABILITIES SIDE**
| Sr. | Particulars | Y-2 | Y-1 | Y0 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| | **A. CURRENT LIABILITIES** | | | | | | | | |
| 1 | Short-Term Borrowings from Banks (CC/OD) | | | | | | | | |
| 2 | Creditors for Purchases (Trade Payables) | | | | | | | | |
| 3 | Advance Payments from Customers | | | | | | | | |
| 4 | Provisions (Tax, Others) | | | | | | | | |
| 5 | Other Current Liabilities | | | | | | | | |
| 6 | **Sub-Total: Current Liabilities (A)** | | | | | | | | |
| | **B. TERM LIABILITIES** | | | | | | | | |
| 7 | Term Loan – Bank (TL-1) | | | | | | | | |
| 8 | Term Loan – Bank (TL-2) | | | | | | | | |
| 9 | Other Term Liabilities | | | | | | | | |
| 10 | **Sub-Total: Term Liabilities (B)** | | | | | | | | |
| 11 | **Total Outside Liabilities (A+B)** | | | | | | | | |
| | **C. NET WORTH** | | | | | | | | |
| 12 | Share Capital / Partners' Capital / Corpus Fund | | | | | | | | |
| 13 | General Reserves | | | | | | | | |
| 14 | Retained Profit / P&L Balance | | | | | | | | |
| 15 | **Net Worth (C)** | | | | | | | | |
| 16 | **TOTAL LIABILITIES (A+B+C)** | | | | | | | | |

**ASSETS SIDE**
| Sr. | Particulars | Y-2 | Y-1 | Y0 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|---|---|
| | **D. CURRENT ASSETS** | | | | | | | | |
| 17 | Cash & Bank Balances | | | | | | | | |
| 18 | Domestic Receivables (Debtors ≤180 days) | | | | | | | | |
| 19 | Inventory (Raw Material + WIP + Finished Goods) | | | | | | | | |
| 20 | Advances to Suppliers | | | | | | | | |
| 21 | Other Current Assets | | | | | | | | |
| 22 | **Total Current Assets (D)** | | | | | | | | |
| | **E. FIXED ASSETS** | | | | | | | | |
| 23 | Gross Block | | | | | | | | |
| 24 | Less: Accumulated Depreciation | | | | | | | | |
| 25 | **Net Block (E)** | | | | | | | | |
| 26 | Capital Work-in-Progress | | | | | | | | |
| | **F. NON-CURRENT ASSETS** | | | | | | | | |
| 27 | Investments / Deposits / Other Non-Current Assets | | | | | | | | |
| 28 | **TOTAL ASSETS (D+E+F)** | | | | | | | | |
| | **Key Balance Sheet Metrics** | | | | | | | | |
| 29 | **Tangible Net Worth (TNW)** | | | | | | | | |
| 30 | **Net Working Capital (NWC = D - A)** | | | | | | | | |
| 31 | Current Ratio (D/A) | | | | | | | | |
| 32 | Quick Ratio | | | | | | | | |
| 33 | TOL/TNW | | | | | | | | |
| 34 | Debt-Equity Ratio (TL / Net Worth) | | | | | | | | |

---

## CMA FORM IV — Comparative Statement of Current Assets & Liabilities (MPBF — Working Capital Assessment)
(Tandon Committee Method II)

| Sl. | Particulars | Y0 (Est) | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|---|---|
| 1 | Total Current Assets (TCA) | | | | | | |
| 2 | Other Current Liabilities (OCL) excl. Bank Borrowings | | | | | | |
| 3 | Working Capital Gap (1 - 2) | | | | | | |
| 4 | Min. Stipulated NWC (25% of TCA — Method II) | | | | | | |
| 5 | Actual / Projected NWC | | | | | | |
| 6 | MPBF (Lower of: WC Gap - Min NWC OR WC Gap - Actual NWC) | | | | | | |
| 7 | Existing/Sanctioned Working Capital Limit | | | | | | |
| 8 | **Recommended Working Capital Limit** | | | | | | |

---

## CMA FORM V — Fund Flow Statement
(Sources and Uses of Funds — ₹ Lakhs)

| Particulars | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| **SOURCES OF FUNDS** | | | | | |
| PAT | | | | | |
| Depreciation | | | | | |
| Increase in Term Liabilities | | | | | |
| Increase in Capital / Corpus Fund | | | | | |
| **Total Sources** | | | | | |
| **USES OF FUNDS** | | | | | |
| Capital Expenditure (Fixed Assets) | | | | | |
| Repayment of Term Loans | | | | | |
| Increase in Net Working Capital | | | | | |
| Dividend / Withdrawals | | | | | |
| **Total Uses** | | | | | |
| **Surplus / Deficit** | | | | | |
| Opening Cash Balance | | | | | |
| **Closing Cash Balance** | | | | | |

---

## CMA FORM VI — Cash Flow Statement (Indirect Method)
(₹ Lakhs)

| Particulars | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| **A. Operating Activities** | | | | | |
| Net Profit Before Tax | | | | | |
| Add: Depreciation | | | | | |
| Add: Interest Paid | | | | | |
| Operating Profit before WC changes | | | | | |
| (Inc.) / Dec. in Current Assets | | | | | |
| Inc. / (Dec.) in Current Liabilities | | | | | |
| Less: Income Tax Paid | | | | | |
| **Net Cash from Operating Activities** | | | | | |
| **B. Investing Activities** | | | | | |
| Purchase of Fixed Assets | | | | | |
| **Net Cash from Investing Activities** | | | | | |
| **C. Financing Activities** | | | | | |
| Proceeds from Term Loans | | | | | |
| Repayment of Term Loans | | | | | |
| Interest Paid | | | | | |
| Inc. / (Dec.) in Working Capital Borrowings | | | | | |
| **Net Cash from Financing Activities** | | | | | |
| **Net Inc. / (Dec.) in Cash (A+B+C)** | | | | | |
| Opening Cash Balance | | | | | |
| **Closing Cash Balance** | | | | | |

---

## Loan Repayment Schedule — Term Loan(s)
(₹ Lakhs)

| Year | Opening Balance | Principal Repayment | Interest @ __% | Total Outflow | Closing Balance | DSCR |
|---|---|---|---|---|---|---|
| Y1 | | | | | | |
| Y2 | | | | | | |
| Y3 | | | | | | |
| Y4 | | | | | | |
| Y5 | | | | | | |
| Y6 | | | | | | |
| Y7 | | | | | | |
| Y8 | | | | | | |
| **Average DSCR** | | | | | | |

DSCR = (PAT + Depreciation + Interest on TL) / (Principal Repayment + Interest on TL). Average DSCR must be ≥ 1.50.

---

## Key Financial Ratios Summary

| Ratio | Benchmark | Y1 | Y2 | Y3 | Y4 | Y5 | Avg |
|---|---|---|---|---|---|---|---|
| DSCR | ≥ 1.50 | | | | | | |
| Current Ratio | ≥ 1.33 | | | | | | |
| Quick Ratio | ≥ 1.00 | | | | | | |
| TOL/TNW | ≤ 3.00 | | | | | | |
| Debt-Equity Ratio | ≤ 2.00 | | | | | | |
| Interest Coverage Ratio | ≥ 1.50 | | | | | | |
| PBDIT Margin (%) | — | | | | | | |
| PAT Margin (%) | — | | | | | | |
| Net Sales Growth (%) | — | | | | | | |
| Break-Even Point (% capacity) | — | | | | | | |

---

RULES:
- All amounts in ₹ Lakhs. If values > 100 Lakhs, show in Crores too as a note.
- Use Indian banking terminology throughout: "CC Limit", "MPBF", "NWC", "NOCF", "TOL/TNW", "Tangible Net Worth", "Cash Accruals".
- All numbers must be internally consistent across all Forms (Balance Sheet must balance: Total Assets = Total Liabilities + Net Worth).
- DSCR calculation must use the exact formula: (PAT + Dep + Interest on TL) / (Principal + Interest on TL).
- Highlight cells where ratios breach bank benchmarks with a note "(Below Benchmark)".`;
  }

  if (fmt === "sba_usa") {
    return `FINANCIAL FORMAT: SBA Loan Format (USA)${detail ? ` — ${detail}` : ""}
MANDATORY SBA-SPECIFIC SECTIONS & TABLES:
1. **SBA Personal Financial Statement Summary** (net worth, assets, liabilities of promoter).
2. **Global Cash Flow Analysis**: Business cash flow + personal cash flow of owners; must demonstrate ability to service all debt.
3. **Debt Schedule Table**: All existing debts — Creditor | Original Amount | Balance | Monthly Payment | Maturity | Collateral.
4. **SBA Loan Repayment Projection**: Year | Revenue | EBITDA | Debt Service | DSCR | Excess Cash Flow.
5. **Use of Proceeds Table**: columns = Purpose | SBA Loan Amount | Equity Injection | Total.
6. **3-Year Financial Projections** (minimum) with monthly Year 1 cash flow.
7. **Key SBA Ratios**: DSCR ≥ 1.25, Debt-to-Worth Ratio ≤ 4:1, Working Capital, Current Ratio.
8. **Collateral Summary Table**: Asset | Current Value | Liens | Net Value.
9. Use US GAAP terminology. Reference SBA SOP 50 10 standards.`;
  }

  if (fmt === "innovate_uk") {
    return `FINANCIAL FORMAT: UK Innovate UK / British Business Bank Grant Format${detail ? ` — ${detail}` : ""}
MANDATORY UK-SPECIFIC SECTIONS & TABLES:
1. **Innovation & Impact Statement**: TRL level, innovation merit, economic impact for UK.
2. **Project Cost Breakdown Table**: Work Package | Activity | Staff Cost (£) | Equipment (£) | Subcontract (£) | Travel (£) | Other (£) | Total (£) | Grant % | Grant Amount (£).
3. **Match Funding Evidence**: Own contribution breakdown, confirmed match funding sources.
4. **Financial Viability Table** (3 years): Revenue, EBITDA, Net Profit, Cash Position.
5. **Jobs Created / Safeguarded Table**: Role | Year 1 | Year 2 | Year 3 | Salary Band.
6. Use UK terminology: Grant Funding, Match Funding, De minimis Aid, Eligible Costs, GBP (£).`;
  }

  if (fmt === "investor_vc") {
    return `FINANCIAL FORMAT: VC / Angel Investor Grade — Startup Financial Projections
MANDATORY INVESTOR-GRADE SECTIONS & TABLES:
1. **Unit Economics Table**: CAC, LTV, LTV:CAC Ratio, Payback Period (months), Gross Margin %, Churn Rate.
2. **Revenue Model & MRR/ARR Projections**: Month-by-month Year 1, then annual Year 1–5.
3. **Use of Funds Table**: Category | Amount (${curr}) | % | Runway Months.
4. **Funding Milestones Table**: Milestone | Target Date | KPI/Metric | Amount Needed.
5. **Cap Table (illustrative)**: Founder | Investor Round | % Post-Money.
6. **Key Investor Metrics**: IRR ≥ 25%, NPV at 15% discount rate, Payback Period, ROI at Year 3 and Year 5, Exit Valuation.
7. **Scenario Analysis Table**: Conservative | Base | Optimistic — Revenue, EBITDA, Valuation for Year 3 and Year 5.
8. **Burn Rate & Runway Table**: Monthly Burn | Cash Balance | Runway (months) for 24 months.
9. Use startup/VC terminology: ARR, MRR, Runway, Burn Rate, Pre-money/Post-money, Series A/B, SAFE Note.`;
  }

  if (fmt === "investor_pe") {
    return `FINANCIAL FORMAT: Private Equity / Growth Equity Investor Grade
MANDATORY PE-GRADE SECTIONS & TABLES:
1. **EBITDA Bridge Table**: Year 1–5 EBITDA with margin expansion story.
2. **Returns Analysis Table**: Entry Equity | Exit Year | MOIC | IRR | Cash-on-Cash Return.
3. **Comparable Transactions Table**: Company | Revenue | EBITDA | EV/EBITDA | EV/Revenue.
4. **Sensitivity / Scenario Table**: Base, Upside, Downside — Revenue growth, EBITDA margin, Exit multiple, IRR.
5. **Key PE Metrics**: EV/EBITDA, EV/Revenue, IRR ≥ 20%, MOIC ≥ 2.5x, Net Debt/EBITDA.
6. Use PE terminology: EBITDA, EV, LBO, MOIC, IRR, Platform company, Management buyout.`;
  }

  // Standard / default
  return `PURPOSE-SPECIFIC REQUIREMENTS:
${data.purpose === "bank_loan" ? `- Emphasize repayment capacity, DSCR (show year-wise, avg ≥ 1.5), Current Ratio, collateral, debt-equity ratio.
- Include Loan Repayment Schedule table: Year | Opening Balance | Principal | Interest | Total Outflow | Closing Balance | DSCR.` : ""}
${data.purpose === "venture_capital" || data.purpose === "angel_investment" ? "- Emphasize market opportunity, scalability, ROI, IRR, payback period, exit strategy, use of funds, and growth projections." : ""}
${data.purpose === "government_grant" ? `- Emphasize employment generation, social impact, subsidy utilization, eligibility compliance${data.government_scheme_name ? `, and specific requirements for ${data.government_scheme_name}` : ""}.` : ""}
${data.purpose === "immigration_business_plan" ? `- Emphasize job creation, investment amount, business viability, owner's role, and compliance with visa requirements${data.government_scheme_name ? ` for ${data.government_scheme_name}` : ""}.` : ""}
${data.purpose === "feasibility_study" ? "- Emphasize technical & market feasibility, SWOT analysis, risk assessment, sensitivity analysis, and go/no-go recommendation." : ""}
${data.purpose === "internal_planning" ? "- Emphasize strategic objectives, growth targets, resource requirements, risk management, and KPI tracking." : ""}`;
}

/**
 * Find every balanced {...} in a string, as [start, end) spans.
 *
 * A regex cannot do this: the control block nests (`data.purpose_answers`), so
 * /\{[\s\S]*\}/ is greedy across the whole reply and /\{[^}]*\}/ stops at the first inner
 * brace. Strings are tracked so a "}" inside a value is not mistaken for the end.
 */
function jsonSpans(text) {
  const spans = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0, inString = false, escaped = false;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) {
        spans.push([i, j + 1]);
        i = j;
        break;
      }
    }
  }
  return spans;
}

/**
 * The pipeline's control block out of a chat reply, and the reply with it removed.
 *
 * The model is asked for ```json {...}``` and usually obliges — but not always, and when it
 * returned the object bare the whole thing was printed into the chat as if it were a
 * message, and the report never generated because `ready` was never seen. Both shapes are
 * accepted now, and whichever one is found is stripped from what the user sees.
 */
function readControlBlock(response) {
  const text = String(response || "");
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidates = [];
  if (fenced) candidates.push({ body: fenced[1], span: null });
  for (const [a, b] of jsonSpans(text)) candidates.push({ body: text.slice(a, b), span: [a, b] });

  let parsed = null, span = null;
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c.body);
      if (obj && typeof obj === "object" && "ready" in obj) {
        parsed = obj;
        span = c.span;
        break;
      }
    } catch { /* not the control block — keep looking */ }
  }

  let visible = text;
  if (span) visible = text.slice(0, span[0]) + text.slice(span[1]);
  visible = visible
    .replace(/```json\s*[\s\S]*?```/gi, "")
    .replace(/```/g, "")
    .trim();
  return { parsed, visible };
}

export default function CreateReport() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  // The real step the backend job reports (via generateModel's onProgress). When set it
  // replaces the timed guesswork line; empty falls back to the rotating GENERATION_STEPS.
  const [backendStage, setBackendStage] = useState("");
  const [collectedData, setCollectedData] = useState(null);
  // After the chat is "ready", we pause to let the user review the chosen
  // template's financial inputs before generating.
  const [pendingData, setPendingData] = useState(null);
  const [showInputs, setShowInputs] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessages([{
      role: "assistant",
      content: `Great choice! 🎯 You've selected the **${template.label}** template.\n\nTell me about your ${template.label.toLowerCase()} project and I'll create a tailored report.\n\nFor example: *"${template.examples[0]}"* or *"${template.examples[1]}"*`
    }]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Return focus to the input after the assistant finishes (the textarea is
  // disabled while thinking/generating, which blurs it). This lets the user
  // keep typing answer after answer without clicking back into the box.
  useEffect(() => {
    if (selectedTemplate && !isThinking && !isGenerating) {
      textareaRef.current?.focus();
    }
  }, [isThinking, isGenerating, selectedTemplate]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isThinking || isGenerating) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      const conversationHistory = newMessages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
      const templateContext = selectedTemplate ? `\nTEMPLATE CONTEXT: ${selectedTemplate.contextHint}\n` : "";

      const response = await invokeLLM({
        prompt: `${SYSTEM_PROMPT}${templateContext}\n\n---CONVERSATION SO FAR---\n${conversationHistory}\n\nAssistant:`,
        model: "claude_sonnet_4_6"
      });

      // The control block is machine data for the pipeline, never something to show the
      // user — fenced or bare, it is read out and stripped from the visible reply.
      const { parsed, visible } = readControlBlock(response);
      if (parsed?.ready && parsed?.data) {
        setCollectedData(parsed.data);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "✅ Got everything I need! Generating your report now — the AI is building the financial model for your industry.",
          isReady: true
        }]);
        setIsThinking(false);
        // No manual template picker: the backend automatically selects the
        // workbook whose CALCULATIONS match the project's industry (retail,
        // restaurant, hotel, software, healthcare, …). Generate straight away
        // with no chosen template so that industry routing decides.
        setPendingData(parsed.data);
        generateReport(parsed.data, {}, null);
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: visible || "Got it — just a couple more details, please.",
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an issue. Could you try again?"
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // What the user watches for several minutes. Two rules learnt the hard way:
  // never quote a page count (the report's length is decided by the business, not by us),
  // and never leave the same line on screen long enough for them to think it has hung.
  const isLongFormat = String(pendingData?.report_format || collectedData?.report_format
                              || "").toLowerCase().startsWith("l");
  const GENERATION_STEPS = [
    "Reading your business details…",
    "Studying your market and who you would be competing with…",
    "Working out what the project would cost to set up…",
    "Building your financial model…",
    "Putting the CMA figures together the way your bank reads them…",
    "Writing your report…",
    "Assembling the workbook…",
  ];
  // Once the steps run out the work is usually still going, so these keep turning over
  // rather than freezing on "finalizing" for six more minutes.
  const HOLDING_LINES = [
    "Still working — this one takes a few minutes.",
    "Almost there. Please stay on this page.",
    "Checking every figure ties back to the workbook…",
    "Nearly done — putting the last pieces together.",
  ];
  const OVEN = ["📄", "📊", "📈", "🧮", "📋", "✨"];

  // Called from the template-inputs step: the user's cell answers + chosen template.
  const handleInputsSubmit = ({ templateId, cellAnswers }) => {
    setShowInputs(false);
    generateReport(pendingData, cellAnswers || {}, templateId || null);
  };
  const handleInputsSkip = () => {
    setShowInputs(false);
    generateReport(pendingData, {}, null);
  };

  const generateReport = async (data, cellAnswers = {}, templateId = null) => {
    setIsGenerating(true);
    setGeneratingStep(0);
    setBackendStage("");
    try {
      const purposeLabels = {
        bank_loan: "Bank Loan / Term Loan",
        feasibility_study: "Feasibility Study",
        government_grant: "Government Grant",
        venture_capital: "Venture Capital",
        angel_investment: "Angel Investment",
        immigration_business_plan: "Immigration Business Plan",
        internal_planning: "Internal Business Planning",
      };
      const purposeLabel = purposeLabels[data.purpose] || data.purpose;
      // Accept whatever wording the model returned ("long", "Long", "long report",
      // "detailed"): a strict === "long" silently produced a SHORT report whenever
      // the casing or phrasing differed.
      const fmt = String(data.report_format || "").toLowerCase();
      const isLong = fmt.includes("long") || fmt.includes("detail") || fmt.includes("comprehensive");
      const curr = data.currency || "USD";

      const templateSections = selectedTemplate
        ? (isLong ? selectedTemplate.extraSections.long : selectedTemplate.extraSections.short)
        : [];
      const templateNote = selectedTemplate && templateSections.length > 0
        ? `\nINDUSTRY-SPECIFIC SECTIONS TO INCLUDE: ${templateSections.join(", ")}\n${selectedTemplate.contextHint}`
        : "";

      // Keep the progress UI moving while the backend does the heavy work. A full run is
      // MINUTES, not seconds, so the steps advance slowly and then the holding lines take
      // over — a screen frozen on one sentence is what makes people close the tab.
      setElapsed(0);
      const startedAt = Date.now();
      const stepTimer = setInterval(() => {
        setGeneratingStep((s) => s + 1);
        setElapsed(Math.round((Date.now() - startedAt) / 1000));
      }, 7000);
      const tickTimer = setInterval(
        () => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000);
      const clearTimers = () => { clearInterval(stepTimer); clearInterval(tickTimer); };

      try {
        // 1) Create the project (ownership is enforced server-side from the JWT).
        const saved = await reportStorage.create({
          title: data.title,
          industry: data.industry,
          sub_industry: data.sub_industry,
          country: data.country,
          currency: data.currency,
          location: data.location,
          promoter_name: data.promoter_name,
          promoter_experience: data.promoter_experience,
          project_description: data.project_description,
          target_market: data.target_market,
          target_customers: data.target_customers,
          project_cost: data.project_cost,
          own_contribution: data.own_contribution,
          loan_amount: data.loan_amount,
          purpose: data.purpose,
          government_scheme_name: data.government_scheme_name,
          report_format: isLong ? "long" : "short",   // normalised, not the raw wording
          financial_format: data.financial_format,
          status: "draft",
        });

        // 2) Backend drives the purpose-specific pipeline: runs the agents,
        //    builds the structured model, and stores the preview + Word/Excel.
        //    cellAnswers ("Sheet!Cell": value) fill the chosen sample template;
        //    the generic purpose_answers feed the narrative.
        await generateModel(
          saved.id,
          { ...(data.purpose_answers || {}), ...cellAnswers },
          templateId,
          false, undefined, false,
          (pct, stage) => { if (stage) setBackendStage(stage); },
        );

        clearTimers();
        navigate(`/report/${saved.id}`);
      } catch (innerErr) {
        clearTimers();
        throw innerErr;
      }
    } catch (err) {
      setIsGenerating(false);
      console.error("Report generation error:", err);
      // A plan limit is not a failure and "please try again" is the wrong advice for it —
      // trying again gives the same answer. Say what ran out and where to go.
      setMessages(prev => [...prev, err?.needsUpgrade ? {
        role: "assistant",
        content: `${err.message}\n\nYou can see the plans at /pricing — everything you have already created stays exactly where it is.`
      } : {
        role: "assistant",
        content: `❌ Report generation failed: ${err?.message || "Unknown error"}. Please try again.`
      }]);
    }
  };

  const handleCopyMessage = async (i) => {
    try {
      await navigator.clipboard.writeText(messages[i].content);
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Edit a previous answer: load it back into the input and drop this message
  // (and everything after it) so re-sending continues the chat from here.
  const handleEditMessage = (i) => {
    if (isThinking || isGenerating) return;
    setInput(messages[i].content);
    setMessages((prev) => prev.slice(0, i));
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm font-semibold">New Report</p>
          </div>
        </header>
        <TemplateSelector onSelect={handleTemplateSelect} />
      </div>
    );
  }

  // Template financial-inputs step: after the chat is ready, before generating.
  if (showInputs && pendingData && !isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => { setShowInputs(false); }}
              className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
              title="Back to chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-semibold">Review Financial Inputs</p>
          </div>
        </header>
        <TemplateInputForm
          purpose={pendingData.purpose}
          currency={pendingData.currency}
          onSubmit={handleInputsSubmit}
          onSkip={handleInputsSkip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Report Assistant</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>{selectedTemplate.icon}</span>
                <span>{selectedTemplate.label} Template</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedTemplate(null); setMessages([]); }}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Change
          </button>
          {isGenerating && (
            <div className="ml-auto flex items-center gap-2 text-xs text-primary font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating report...
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`group flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border rounded-tl-sm"
                  } ${msg.isReady ? "border-primary/30 bg-accent" : ""}`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {!msg.isReady && (
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(i)}
                      title="Copy"
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {msg.role === "user" && (
                      <button
                        type="button"
                        onClick={() => handleEditMessage(i)}
                        disabled={isThinking || isGenerating}
                        title="Edit & resend"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-accent border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-4 text-sm flex flex-col gap-3 min-w-[280px] max-w-[380px]">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span className="text-lg leading-none animate-bounce flex-shrink-0"
                        style={{ animationDuration: "1.6s" }}>
                    {OVEN[generatingStep % OVEN.length]}
                  </span>
                  <span>
                    {backendStage
                      ? `${backendStage}…`
                      : generatingStep < GENERATION_STEPS.length
                        ? GENERATION_STEPS[generatingStep]
                        : HOLDING_LINES[(generatingStep - GENERATION_STEPS.length) % HOLDING_LINES.length]}
                  </span>
                </div>

                {/* Deliberately NOT a percentage: the work does not finish on a schedule,
                    and a bar that sticks at 90% reads as broken. This one just moves. */}
                <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                  <div className="h-2 w-1/3 rounded-full bg-primary"
                       style={{ animation: "shortReportSlide 1.8s ease-in-out infinite" }} />
                </div>
                <style>{`@keyframes shortReportSlide {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(300%); }
                }`}</style>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your CMA report is being prepared for your business in the{" "}
                  <strong>{isLongFormat ? "long" : "short"}</strong> format.
                  <br />
                  Please stay on this page — it is still working.
                  {elapsed > 0 && (
                    <> {" · "}{Math.floor(elapsed / 60)}m {String(elapsed % 60).padStart(2, "0")}s</>
                  )}
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your business idea or answer the question above..."
            className="resize-none min-h-[44px] max-h-32 text-sm"
            rows={1}
            disabled={isThinking || isGenerating}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isThinking || isGenerating}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}