// Every blog post lives here. Newest first is not required — the list page sorts by date.
//
// A post is written as a list of blocks, in the order they appear on the page, so the
// author decides exactly where each heading, paragraph and image sits:
//
//   { type: "heading",   text: "..." }                      — a section heading
//   { type: "paragraph", text: "..." }                      — body text; **bold** works
//   { type: "list",      items: ["...", "..."] }            — bullet points
//   { type: "image",     src: "/blog/<file>", alt: "...",
//                        caption: "...", size: "full" | "wide" | "half" }
//   { type: "cta",       text: "...", label: "...", to: "/create" }  — call-to-action box
//
// `excerpt` doubles as the page's meta description; `keywords` goes into the meta
// keywords tag.
//
// Images go in frontend/public/blog/ and are referenced as "/blog/<file name>".
//
// Example:
// {
//   slug: "what-is-cma-data",              // the URL: finthara.com/blog/what-is-cma-data
//   category: "Bank Formats",              // one per post — the filter tabs on the list
//   highlight: "CMA Data",                 // optional — this part of the title shows in blue
//   author: "Finthara Team",
//   title: "What Is CMA Data?",
//   date: "2026-11-01",
//   tags: ["CMA", "Bank Loan"],
//   cover: "/blog/cma-cover.jpg",          // optional — shown on the card and at the top
//   excerpt: "One or two lines for the card on the blog list.",
//   blocks: [
//     { type: "paragraph", text: "..." },
//     { type: "image", src: "/blog/cma-table.png", alt: "CMA table", size: "wide" },
//     { type: "heading", text: "..." },
//   ],
// },
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const L = (...items) => ({ type: "list", items });

export const BLOG_POSTS = [
  {
    slug: "what-is-a-project-report",
    category: "Loan Basics",
    highlight: "Project Report",
    author: "Finthara Team",
    title: "What Is a Project Report and Why Does Your Bank Ask for One?",
    date: "2026-10-30",
    tags: ["ProjectReport", "BusinessLoan", "MSME", "StartupIndia", "SmallBusiness", "LoanApplication", "Entrepreneurship", "Finthara"],
    cover: "/blog/blog1-what-is-a-project-report.png",
    excerpt: "New to business loans? Learn what a project report is, what banks look for in it, and how to prepare a bank-ready report in minutes.",
    keywords: "project report for bank loan, business loan project report, DPR for MSME, how to make project report",
    blocks: [
      P("You have a business idea, a location in mind and a rough budget. Then the bank manager asks for a project report, and suddenly the loan feels a long way off. The good news: a project report is simply your business plan written in the language a lender understands."),
      H("What a project report actually contains"),
      L(
        "**Business overview:** what you will do, where, and who your customers are.",
        "**Project cost:** land, building, machinery, pre-operative expenses and working capital.",
        "**Means of finance:** how much is your contribution and how much is the loan.",
        "**Financial projections:** 5-year profit and loss, cash flow and balance sheet.",
        "**Key ratios:** DSCR, current ratio, break-even and payback period.",
      ),
      H("Why banks insist on it"),
      P("A lender is not only judging your idea. It wants evidence that the business can generate enough cash to repay the loan on time. The report is how the bank tests that evidence, so numbers that do not tie together, or ratios that miss the bank's benchmarks, are the most common reasons applications get sent back."),
      H("Doing it the faster way"),
      P("Traditionally, a project report meant weeks of back-and-forth with a consultant and a hefty fee. With Finthara, you describe your business in plain English, answer a few smart questions, and the AI builds the financial model, checks the ratios and formats everything in the structure your bank expects. You download it as a PDF, an editable Word file or a live Excel model."),
      { type: "cta", text: "Ready to apply? Create your first bank-ready project report on Finthara today.", label: "Create Report", to: "/create" },
    ],
  },
  {
    slug: "cma-data-explained",
    category: "Bank Formats",
    highlight: "CMA Data",
    author: "Finthara Team",
    title: "CMA Data Explained: The Format Indian Banks Expect",
    date: "2026-11-06",
    tags: ["CMAData", "WorkingCapital", "BankLoan", "MSMEIndia", "CharteredAccountant", "TermLoan", "FinancialPlanning", "Finthara"],
    cover: "/blog/blog2-cma-data-explained.png",
    excerpt: "CMA data is a must for most business loans in India. Here is what it includes, why banks rely on it, and how to prepare it without errors.",
    keywords: "CMA data format, CMA report for bank loan, credit monitoring arrangement, working capital loan India",
    blocks: [
      P("If you have applied for a term loan or a cash credit limit in India, you have probably heard the term CMA data. CMA stands for Credit Monitoring Arrangement, and it is the standard set of financial statements banks use to assess how much credit a business can safely handle."),
      H("What goes into CMA data"),
      L(
        "Past and projected operating statement (sales, costs and profit).",
        "Analysis of the balance sheet (assets and liabilities, year by year).",
        "Comparative statement of current assets and current liabilities.",
        "Calculation of maximum permissible bank finance (MPBF) for working capital.",
        "Fund flow statement and key ratio analysis.",
      ),
      H("Why it trips people up"),
      P("CMA data is not hard because the concepts are complex. It is hard because every figure has to reconcile across several statements. Change the sales assumption in one sheet, and inventory, receivables, working capital and ratios all have to move with it. One mismatch and the credit officer will ask you to redo the file."),
      H("Getting it right the first time"),
      P("Finthara generates CMA data in the precise structure Indian banks require for project and working-capital loans, so there is no manual reformatting. Every figure is checked to tie back to the underlying workbook, and you get the live Excel file so your CA can review or tweak any assumption."),
      { type: "cta", text: "Skip the spreadsheet headache. Generate bank-format CMA data with Finthara.", label: "Create Report", to: "/create" },
    ],
  },
  {
    slug: "dscr-current-ratio-payback",
    category: "Financial Ratios",
    highlight: "DSCR",
    author: "Finthara Team",
    title: "DSCR, Current Ratio and Payback: The Numbers Banks Check Before Saying Yes",
    date: "2026-11-13",
    tags: ["DSCR", "FinancialRatios", "LoanApproval", "BusinessFinance", "MSME", "CreditAnalysis", "SmallBusinessTips", "Finthara"],
    cover: "/blog/blog3-dscr-current-ratio-payback.png",
    excerpt: "Learn the key ratios banks check before approving a business loan, including DSCR, current ratio and payback period, and how to improve them.",
    keywords: "DSCR meaning, debt service coverage ratio, current ratio bank loan, payback period, loan approval ratios",
    blocks: [
      P("Two businesses can ask for the same loan amount and get very different answers. Often, the difference comes down to a handful of ratios. Understanding them before you apply puts you in control of the conversation."),
      H("1. Debt Service Coverage Ratio (DSCR)"),
      P("DSCR compares the cash your business generates with the loan instalments (principal plus interest) it must pay. A DSCR of 1.5 means you earn ₹1.50 for every ₹1 of debt due. Lenders generally want this comfortably above 1, and many set a minimum around 1.25 or higher."),
      H("2. Current Ratio"),
      P("Current assets divided by current liabilities. It shows whether you can meet short-term obligations. Banks commonly look for roughly 1.33 or better for working-capital lending."),
      H("3. Payback Period and IRR"),
      P("How many years it takes to recover the investment, and the return the project earns. A shorter payback and a healthy IRR signal lower risk."),
      H("How to strengthen your numbers"),
      L(
        "Use realistic, sector-appropriate sales and cost assumptions.",
        "Consider a slightly longer repayment tenure or moratorium to ease early-year DSCR.",
        "Increase your own contribution to reduce debt.",
      ),
      P("Finthara calculates DSCR, current ratio, IRR and payback automatically, validates them against bank benchmarks and shows them as interactive charts, so you can spot a weak ratio and fix it before the bank does."),
      { type: "cta", text: "See your ratios before your banker does. Try Finthara now.", label: "Try Finthara", to: "/create" },
    ],
  },
  {
    slug: "pmegp-mudra-project-report",
    category: "Government Schemes",
    highlight: "PMEGP or Mudra",
    author: "Finthara Team",
    title: "Applying Under PMEGP or Mudra? Here Is How to Prepare Your Project Report",
    date: "2026-11-20",
    tags: ["PMEGP", "MudraLoan", "CGTMSE", "GovernmentSchemes", "StartupIndia", "MSMESubsidy", "WomenEntrepreneurs", "Finthara"],
    cover: "/blog/blog4-pmegp-mudra-project-report.png",
    excerpt: "Planning to apply for a PMEGP or Mudra loan? Learn what your project report must include and the mistakes that delay approval.",
    keywords: "PMEGP project report, Mudra loan project report, government loan scheme India, CGTMSE, MSME subsidy",
    blocks: [
      P("Government-backed schemes such as PMEGP, Mudra and CGTMSE have helped lakhs of Indians start and grow businesses with subsidies, lower collateral requirements or credit guarantees. But every application still goes through a bank, and every bank wants a solid project report."),
      H("Schemes at a glance"),
      L(
        "**PMEGP:** a credit-linked subsidy scheme for new micro-enterprises in manufacturing and services.",
        "**Mudra (PMMY):** loans for micro and small businesses across Shishu, Kishore and Tarun categories.",
        "**CGTMSE:** a credit guarantee that helps eligible MSMEs access loans without collateral.",
      ),
      H("What your report must show"),
      L(
        "A clear description of the activity and why it will succeed locally.",
        "Itemised project cost, including machinery quotes and working capital.",
        "Your own contribution and the loan or subsidy amount requested.",
        "Projections showing the business can repay comfortably.",
      ),
      H("Common mistakes"),
      P("Overestimating first-year sales, leaving out working capital, and using a generic template that does not match the scheme's format are the top reasons files get returned. Scheme limits and subsidy rates are also revised from time to time, so always confirm the latest rules on the official portal before applying."),
      P("Finthara builds your report in the bank-ready CMA format and recognises your sector to pull in suitable cost structures and assumptions."),
      { type: "cta", text: "Turn your scheme application into a bank-ready report with Finthara.", label: "Create Report", to: "/create" },
    ],
  },
  {
    slug: "ai-project-report-preparation",
    category: "AI in Finance",
    highlight: "AI",
    author: "Finthara Team",
    title: "How AI Is Changing Project Report Preparation for Businesses and Consultants",
    date: "2026-11-27",
    tags: ["AIinFinance", "FinTech", "ProjectReport", "CharteredAccountant", "LoanConsultant", "Automation", "MSMEFinance", "Finthara"],
    cover: "/blog/blog5-ai-project-report-preparation.png",
    excerpt: "AI is turning weeks of project-report work into minutes. See how consultants and businesses use it to produce accurate, bank-ready reports.",
    keywords: "AI project report generator, AI financial model, project report software, loan consultant tools, automated CMA report",
    blocks: [
      P("For years, preparing a detailed project report meant copying an old template, adjusting dozens of linked formulas and hoping nothing broke. For a consultant handling several clients, that could mean many hours per file. AI is changing that workflow."),
      H("From forms to conversation"),
      P("Instead of a 40-field form, an AI assistant can interview the business owner one question at a time: project cost, location, loan amount, preferred bank format. It adapts each question to the answers already given and fills reasonable gaps based on the industry."),
      H("What AI does well"),
      L(
        "Builds a 5-year P&L, cash flow and balance sheet in minutes.",
        "Keeps every figure consistent across statements.",
        "Validates ratios against lender benchmarks automatically.",
        "Formats the output in the CMA format Indian banks expect.",
      ),
      H("Where humans still matter"),
      P("AI speeds up the work, but judgement remains yours. Review the assumptions, add local market knowledge, and remember that the final lending decision always rests with the bank. The best results come when a professional uses AI to remove the repetitive work and spends the saved time advising the client."),
      P("Finthara gives consultants editable Word and live Excel outputs, the ability to regenerate a report with new inputs, and space to add their own photos and branding."),
      { type: "cta", text: "Prepare more reports in less time. Explore Finthara's consultant plans.", label: "See Plans", to: "/pricing" },
    ],
  },
];

// A post goes live on its `date` (the reader's local day) — a future-dated post is
// scheduled: hidden from the list and its link, with no redeploy needed to publish it.
const today = () => new Date().toLocaleDateString("en-CA");   // YYYY-MM-DD
const isPublished = (p) => !p.date || p.date <= today();

export const sortedPosts = () =>
  BLOG_POSTS.filter(isPublished).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export const findPost = (slug) => BLOG_POSTS.find((p) => p.slug === slug && isPublished(p));

// About 200 words a minute, counted over every text block.
export const readMinutes = (post) => {
  const words = (post.blocks || [])
    .flatMap((b) => [b.text, ...(b.items || [])])
    .join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const formatPostDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";
