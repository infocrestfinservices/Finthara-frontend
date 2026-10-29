const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export const countries = [
  { name: "India", code: "IN", currency: "INR", symbol: "₹" },
  { name: "United States", code: "US", currency: "USD", symbol: "$" },
  { name: "United Kingdom", code: "GB", currency: "GBP", symbol: "£" },
  { name: "Canada", code: "CA", currency: "CAD", symbol: "C$" },
  { name: "Australia", code: "AU", currency: "AUD", symbol: "A$" },
  { name: "Germany", code: "DE", currency: "EUR", symbol: "€" },
  { name: "France", code: "FR", currency: "EUR", symbol: "€" },
  { name: "Japan", code: "JP", currency: "JPY", symbol: "¥" },
  { name: "China", code: "CN", currency: "CNY", symbol: "¥" },
  { name: "Brazil", code: "BR", currency: "BRL", symbol: "R$" },
  { name: "Mexico", code: "MX", currency: "MXN", symbol: "Mex$" },
  { name: "South Korea", code: "KR", currency: "KRW", symbol: "₩" },
  { name: "Singapore", code: "SG", currency: "SGD", symbol: "S$" },
  { name: "UAE", code: "AE", currency: "AED", symbol: "د.إ" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR", symbol: "﷼" },
  { name: "South Africa", code: "ZA", currency: "ZAR", symbol: "R" },
  { name: "Nigeria", code: "NG", currency: "NGN", symbol: "₦" },
  { name: "Kenya", code: "KE", currency: "KES", symbol: "KSh" },
  { name: "Indonesia", code: "ID", currency: "IDR", symbol: "Rp" },
  { name: "Malaysia", code: "MY", currency: "MYR", symbol: "RM" },
  { name: "Thailand", code: "TH", currency: "THB", symbol: "฿" },
  { name: "Vietnam", code: "VN", currency: "VND", symbol: "₫" },
  { name: "Philippines", code: "PH", currency: "PHP", symbol: "₱" },
  { name: "Bangladesh", code: "BD", currency: "BDT", symbol: "৳" },
  { name: "Pakistan", code: "PK", currency: "PKR", symbol: "₨" },
  { name: "Sri Lanka", code: "LK", currency: "LKR", symbol: "Rs" },
  { name: "Nepal", code: "NP", currency: "NPR", symbol: "रू" },
  { name: "Egypt", code: "EG", currency: "EGP", symbol: "E£" },
  { name: "Turkey", code: "TR", currency: "TRY", symbol: "₺" },
  { name: "Russia", code: "RU", currency: "RUB", symbol: "₽" },
  { name: "Italy", code: "IT", currency: "EUR", symbol: "€" },
  { name: "Spain", code: "ES", currency: "EUR", symbol: "€" },
  { name: "Netherlands", code: "NL", currency: "EUR", symbol: "€" },
  { name: "Sweden", code: "SE", currency: "SEK", symbol: "kr" },
  { name: "Switzerland", code: "CH", currency: "CHF", symbol: "CHF" },
  { name: "Poland", code: "PL", currency: "PLN", symbol: "zł" },
  { name: "New Zealand", code: "NZ", currency: "NZD", symbol: "NZ$" },
  { name: "Israel", code: "IL", currency: "ILS", symbol: "₪" },
  { name: "Ghana", code: "GH", currency: "GHS", symbol: "GH₵" },
  { name: "Tanzania", code: "TZ", currency: "TZS", symbol: "TSh" },
  { name: "Colombia", code: "CO", currency: "COP", symbol: "COL$" },
  { name: "Argentina", code: "AR", currency: "ARS", symbol: "AR$" },
  { name: "Chile", code: "CL", currency: "CLP", symbol: "CLP$" },
  { name: "Peru", code: "PE", currency: "PEN", symbol: "S/" },
  { name: "Ireland", code: "IE", currency: "EUR", symbol: "€" },
  { name: "Portugal", code: "PT", currency: "EUR", symbol: "€" },
  { name: "Belgium", code: "BE", currency: "EUR", symbol: "€" },
  { name: "Austria", code: "AT", currency: "EUR", symbol: "€" },
  { name: "Denmark", code: "DK", currency: "DKK", symbol: "kr" },
  { name: "Norway", code: "NO", currency: "NOK", symbol: "kr" },
];

export const industries = [
  "Agriculture & Farming",
  "Food Processing & Beverages",
  "Food & Beverage / Restaurant",
  "Textiles & Apparel",
  "Manufacturing & Engineering",
  "Automobile & Auto Components",
  "Chemicals & Petrochemicals",
  "Pharmaceuticals & Healthcare",
  "Information Technology & Software",
  "E-Commerce & Retail",
  "Real Estate & Construction",
  "Renewable Energy & Solar",
  "Education & EdTech",
  "Tourism & Hospitality",
  "Transportation & Logistics",
  "Banking & Financial Services",
  "Mining & Minerals",
  "Waste Management & Recycling",
  "Media & Entertainment",
  "Telecommunications",
  "Biotechnology",
  "Artificial Intelligence & ML",
  "Blockchain & Fintech",
  "Dairy & Animal Husbandry",
  "Fisheries & Aquaculture",
  "Handicrafts & Artisan Products",
  "Other",
];

// Static fallback — used if backend is unavailable
export const purposes = [
  { value: "bank_loan", label: "Bank Loan", description: "For businesses seeking loans from banks and financial institutions." },
  { value: "feasibility_study", label: "Feasibility Study", description: "Evaluates whether a business idea is viable and profitable." },
  { value: "government_scheme", label: "Government Grant", description: "Helps secure grants, subsidies, and government funding." },
  { value: "venture_capital", label: "Venture Capital", description: "Designed for startups seeking venture capital funding." },
  { value: "angel_investment", label: "Angel Investment", description: "Suitable for startups looking for seed-stage investors." },
  { value: "immigration_business_plan", label: "Immigration Business Plan", description: "Business plans designed for immigration and entrepreneur visa applications." },
  { value: "real_estate", label: "Real Estate", description: "Development / investment financial models for real estate projects." },
  { value: "startup_and_sme_fundraising", label: "Startup and SME Fundraising", description: "Investor-ready financial models for startups and SMEs raising capital." },
  { value: "internal_planning", label: "Internal Business Planning", description: "Strategic planning and growth forecasting for existing businesses." },
];

// Fetch live purposes from your backend
export async function fetchPurposes() {
  try {
    const res = await fetch(`${BACKEND_URL}/purposes/`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.map(p => ({
      value: p.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, ""),
      label: p.name,
      description: p.description || "",
      best_for: p.best_for || "",
      recommended_when: p.recommended_when || "",
      icon: p.icon || "",
      id: p.id,
    }));
  } catch {
    return purposes; // fallback to static
  }
}

// Fetch live industries from your backend
export async function fetchIndustries() {
  try {
    const res = await fetch(`${BACKEND_URL}/industries/`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.map(i => i.name);
  } catch {
    return industries; // fallback to static
  }
}

// Fetch live countries from your backend
export async function fetchCountries() {
  try {
    const res = await fetch(`${BACKEND_URL}/countries/`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.map(c => ({
      name: c.name,
      currency: c.currency || "USD",
    }));
  } catch {
    return countries; // fallback to static
  }
}

export function getCurrencySymbol(currencyCode) {
  const country = countries.find(c => c.currency === currencyCode);
  return country ? country.symbol : currencyCode;
}

export function formatCurrency(amount, currencyCode) {
  if (!amount && amount !== 0) return "—";
  const symbol = currencyCode ? getCurrencySymbol(currencyCode) : "₹";
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}