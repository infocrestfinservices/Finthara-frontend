/**
 * Admin.jsx — the staff view: who signed up, what they paid, what they generated.
 *
 * Built around the questions that were previously answered by opening a Python shell against
 * the database: how many users are there, is anyone actually paying, did an order get stuck,
 * is some industry quietly failing to generate.
 *
 * The route is guarded twice over. This page only renders for `user.is_admin`, and every
 * request it makes 404s server-side for anyone else — the flag saves showing a door, it is
 * not what keeps the door shut.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, CreditCard, FileText, ArrowLeft, Loader2, AlertCircle, Search, Tag, Plus,
  LayoutDashboard, Crown, LogOut, RefreshCw, ShieldCheck, Repeat, Receipt,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from "lucide-react";
import DashboardTab from "@/components/admin/DashboardTab";
import RolesTab from "@/components/admin/RolesTab";
import {
  getStats, getIndustries, getUsers, getPayments, getProjects, setUserPlan,
  getCoupons, createCoupon, setCouponActive, getRepeatBuyers, getAdminInvoices,
} from "@/api/adminService";

const PLANS = ["free", "starter", "professional", "enterprise"];

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Invoices can now be in more than one currency (PayPal pays in USD) — this formats whatever
// currency the invoice actually carries instead of assuming INR the way money() above does.
const moneyIn = (n, currency) =>
  `${currency || "INR"} ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const when = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** A number with its meaning underneath. The caption is not decoration — "16 on a paid plan"
 *  next to "₹0 collected" is only comprehensible if both are labelled honestly. */
function Stat({ icon: Icon, label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-foreground",
    warn: "text-amber-400",
    good: "text-emerald-400",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {Icon ? (
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      ) : null}
      <div className={`text-2xl font-semibold ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground/80">{hint}</div> : null}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 py-10 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

function Empty({ children }) {
  return <div className="py-10 text-center text-sm text-muted-foreground">{children}</div>;
}

/** One scrolling table. Wide tables must scroll inside their own box — otherwise the whole
 *  page scrolls sideways and the tab strip walks off the screen. */
function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function PlanBadge({ plan, lapsed }) {
  const styles = {
    free: "bg-muted text-muted-foreground",
    starter: "bg-blue-500/15 text-blue-400",
    professional: "bg-emerald-500/15 text-emerald-400",
    enterprise: "bg-violet-500/15 text-violet-400",
  };
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[plan] || styles.free}`}>
        {plan}
      </span>
      {lapsed ? <span className="text-xs text-amber-400">(lapsed)</span> : null}
    </span>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [error, setError] = useState("");
  const [section, setSection] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, i] = await Promise.all([getStats(), getIndustries()]);
      setStats(s);
      setIndustries(i.industries || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (user?.is_admin) load(); }, [user, load]);

  // The console is deliberately DARK while the customer-facing app is light. It is not
  // decoration: staff tools and customer tools get confused with each other, and a surface
  // that looks nothing like the app is the cheapest way to always know which one you are in
  // and whose data you are about to change.
  //
  // Applied to <html> rather than to a wrapper div because Radix renders dialogs into a
  // portal on <body> — a wrapper would leave every dialog light on a dark page.
  useEffect(() => {
    const el = document.documentElement;
    const had = el.classList.contains("dark");
    el.classList.add("dark");
    return () => { if (!had) el.classList.remove("dark"); };
  }, []);

  if (user && !user.is_admin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar section={section} onSelect={setSection} onLogout={logout} />

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{SECTIONS.find((x) => x.id === section)?.label}</h1>
            <p className="text-xs text-muted-foreground">
              {SECTIONS.find((x) => x.id === section)?.hint}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to app</Link>
            </Button>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              {/* The person, not their email domain. Deriving the label from the domain read
                  as "gmail.com" for anyone not on a company address, which names nothing. */}
              <div className="leading-tight">
                <div className="text-xs font-medium">
                  {user?.full_name || user?.email?.split("@")[0] || "admin"}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-amber-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {section === "overview" ? (
            <div className="rounded-xl border border-border bg-gradient-to-r from-primary/15 to-transparent p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome back, {user?.full_name || "Super Admin"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Live snapshot of every user, report and payment on the platform.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0"
                        onClick={load} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          ) : null}

          {stats && section === "overview" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Users" value={stats.users.total}
                    hint={`${stats.users.on_paid_plan} on a paid plan · ${stats.users.ever_paid} have ever paid`} />
              <Stat icon={CreditCard} label="Collected" value={money(stats.revenue.total)}
                    hint={`${stats.revenue.paid_orders} completed order${stats.revenue.paid_orders === 1 ? "" : "s"}`}
                    tone={stats.revenue.total > 0 ? "good" : "default"} />
              <Stat icon={AlertCircle} label="Incomplete orders" value={stats.revenue.incomplete_orders}
                    hint="Checkout opened, payment never finished"
                    tone={stats.revenue.incomplete_orders > 0 ? "warn" : "default"} />
              <Stat icon={FileText} label="Reports generated" value={stats.projects.generated}
                    hint={`of ${stats.projects.total} projects · ${stats.projects.never_generated} never generated`}
                    tone={stats.projects.never_generated > 0 ? "warn" : "default"} />
            </div>
          ) : null}

          {section === "overview" ? <DashboardTab /> : null}
          {section === "users" ? <UsersTab toast={toast} /> : null}
          {section === "payments" ? <PaymentsTab /> : null}
          {section === "invoices" ? <InvoicesTab /> : null}
          {section === "projects" ? <ProjectsTab industries={industries} /> : null}
          {section === "coupons" ? <CouponsTab toast={toast} /> : null}
          {section === "roles" ? <RolesTab toast={toast} /> : null}
        </div>
      </main>
    </div>
  );
}

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard,
    hint: "Platform-wide snapshot" },
  { id: "users", label: "User Management", icon: Users,
    hint: "Accounts, plans and report allowances" },
  { id: "payments", label: "Payments", icon: CreditCard,
    hint: "Every order, finished or not" },
  { id: "invoices", label: "Invoices", icon: Receipt,
    hint: "Every paid invoice, grouped by buyer" },
  { id: "projects", label: "Projects", icon: FileText,
    hint: "What has been created and whether it generated" },
  { id: "coupons", label: "Coupons", icon: Tag,
    hint: "Discount codes and what is left of them" },
  { id: "roles", label: "Roles", icon: ShieldCheck,
    hint: "Who can get into this console" },
];

function Sidebar({ section, onSelect, onLogout }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
          <Crown className="h-5 w-5 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Admin Console</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Super Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Management
        </p>
        {SECTIONS.map((x) => {
          const Icon = x.icon;
          const active = section === x.id;
          return (
            <button
              key={x.id}
              onClick={() => onSelect(x.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {x.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

/* The tab strip is gone; on a narrow screen the sidebar is hidden, so this is how the
   sections stay reachable there. */
function MobileNav({ section, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border p-3 md:hidden">
      {SECTIONS.map((x) => (
        <button key={x.id} onClick={() => onSelect(x.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                  section === x.id ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

const PLAN_FILTERS = [
  { id: "", label: "All" },
  { id: "free", label: "Free" },
  { id: "starter", label: "Starter" },
  { id: "professional", label: "Professional" },
  { id: "enterprise", label: "Enterprise" },
];

function UsersTab({ toast }) {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [editing, setEditing] = useState(null);

  // Filtered on the plan IN FORCE, not the column — a lapsed monthly plan belongs under
  // Free, which is what "who is on the free tier" actually means.
  const load = useCallback(async (search = q, planFilter = plan) => {
    setRows(null);
    try {
      const d = await getUsers({ q: search, plan: planFilter, limit: 200 });
      setRows(d.users); setTotal(d.total);
    } catch {
      setRows([]);
    }
  }, [q, plan]);

  useEffect(() => { load(""); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <form
        className="mb-3 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); load(q); }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input className="pl-9" placeholder="Search email or name…"
                 value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="mb-3 flex flex-wrap gap-2">
        {PLAN_FILTERS.map((f) => (
          <Button key={f.id} size="sm" variant={plan === f.id ? "default" : "outline"}
                  onClick={() => { setPlan(f.id); load(q, f.id); }}>
            {f.label}
          </Button>
        ))}
      </div>

      {rows === null ? <Loading /> : rows.length === 0 ? (
        <Empty>No users{plan ? ` on the ${plan} plan` : ""} found.</Empty>
      ) : (
        <>
          <Table head={["User", "Plan", "Expires", "Reports", "Projects", "Joined", ""]}>
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{u.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.full_name || "—"}
                    {u.is_admin ? <Badge variant="secondary" className="ml-2">admin</Badge> : null}
                    {!u.is_verified ? <span className="ml-2 text-amber-400">unverified</span> : null}
                  </div>
                </td>
                <td className="px-4 py-3"><PlanBadge plan={u.plan} lapsed={u.lapsed} /></td>
                <td className="px-4 py-3 text-muted-foreground">{when(u.plan_expires_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.reports_used}{u.reports_limit === null ? "" : ` / ${u.reports_limit}`}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.projects}</td>
                <td className="px-4 py-3 text-muted-foreground">{when(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>Change plan</Button>
                </td>
              </tr>
            ))}
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {rows.length} of {total}.
          </p>
        </>
      )}

      <PlanDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={(msg) => { toast({ title: "Plan updated", description: msg }); load(); }}
      />
    </>
  );
}

/** Moving someone's plan by hand. Support does this for a payment that did not register, a
 *  goodwill extension, or a refund; the reason is recorded in the server log because there
 *  is no payment record to explain it later. */
function PlanDialog({ user, onClose, onSaved }) {
  const [plan, setPlan] = useState("professional");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) { setPlan(user.plan); setDays(""); setReason(""); setErr(""); }
  }, [user]);

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const r = await setUserPlan(user.id, {
        plan,
        days: days === "" ? null : Number(days),
        reason,
      });
      onSaved(`${r.email} is now on ${r.plan}.`);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Change plan</DialogTitle></DialogHeader>
        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {user.email} is on <strong>{user.plan}</strong>.
            </p>
            <div className="space-y-2">
              <Label>New plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Days (optional)</Label>
              <Input type="number" placeholder="Leave blank for the plan's own period"
                     value={days} onChange={(e) => setDays(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Blank uses the plan's normal period — 30 days for the monthly plans, no expiry
                for Free and Starter. Enter 0 for no expiry.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input placeholder="e.g. payment did not register — Razorpay ref 12345"
                     value={reason} onChange={(e) => setReason(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Recorded in the server log. Nothing else will explain this change later.
              </p>
            </div>
            {err ? <p className="text-sm text-destructive">{err}</p> : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsTab() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("");
  const [repeat, setRepeat] = useState(null);

  useEffect(() => {
    setRows(null);
    getPayments({ status: filter, limit: 200 })
      .then((d) => setRows(d.payments))
      .catch(() => setRows([]));
  }, [filter]);

  // Someone who has bought four times shows up as four unrelated rows scattered through the
  // list above; that they are the same person is the interesting part and is invisible there.
  useEffect(() => {
    getRepeatBuyers().then((d) => setRepeat(d.buyers)).catch(() => setRepeat([]));
  }, []);

  const tone = {
    paid: "bg-emerald-500/15 text-emerald-400",
    created: "bg-amber-500/15 text-amber-400",
    failed: "bg-red-500/15 text-red-400",
  };

  return (
    <>
      {repeat?.length ? (
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Repeat className="h-4 w-4 text-emerald-400" /> Repeat customers
          </div>
          <div className="flex flex-wrap gap-2">
            {repeat.map((b) => (
              <span key={b.user_id}
                    className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                {b.email} — {b.orders} orders, {money(b.total)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex gap-2">
        {["", "paid", "created", "failed"].map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}>
            {f === "" ? "All" : f}
          </Button>
        ))}
      </div>
      {rows === null ? <Loading /> : rows.length === 0 ? (
        <Empty>No payments{filter ? ` with status “${filter}”` : ""} yet.</Empty>
      ) : (
        <Table head={["User", "Plan", "Amount", "Status", "Order", "Started", "Paid"]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-muted/40">
              <td className="px-4 py-3 font-medium text-foreground">{p.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.plan}</td>
              <td className="px-4 py-3 text-foreground">{money(p.amount)}</td>
              <td className="px-4 py-3">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone[p.status] || "bg-muted text-muted-foreground"}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.order_id}</td>
              <td className="px-4 py-3 text-muted-foreground">{when(p.created_at)}</td>
              <td className="px-4 py-3 text-muted-foreground">{when(p.paid_at)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

/** Every paid invoice, grouped by buyer — a customer's whole payment history in one card
 *  instead of scattered through a flat list ordered by date. */
function InvoicesTab() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set());
  const LIMIT = 25;

  const load = useCallback(async (p = page) => {
    setData(null);
    try {
      const d = await getAdminInvoices({
        q: q || undefined,
        date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        date_to: dateTo ? new Date(dateTo).toISOString() : undefined,
        limit: LIMIT, offset: p * LIMIT,
      });
      setData(d);
    } catch {
      setData({ buyers: [], buyer_count: 0, invoice_count: 0, currency_totals: {} });
    }
  }, [q, dateFrom, dateTo, page]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(0); setPage(0); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const search = () => { setPage(0); load(0); };
  const toggle = (uid) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(uid) ? next.delete(uid) : next.add(uid);
    return next;
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.buyer_count / LIMIT)) : 1;

  return (
    <>
      {data ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2.5">
            <div className="text-lg font-semibold">{data.buyer_count}</div>
            <div className="text-xs text-muted-foreground">buyers</div>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-2.5">
            <div className="text-lg font-semibold">{data.invoice_count}</div>
            <div className="text-xs text-muted-foreground">invoices</div>
          </div>
          {Object.entries(data.currency_totals || {}).map(([ccy, total]) => (
            <div key={ccy} className="rounded-lg border border-border bg-card px-4 py-2.5">
              <div className="text-lg font-semibold">{moneyIn(total, ccy)}</div>
              <div className="text-xs text-muted-foreground">collected ({ccy})</div>
            </div>
          ))}
        </div>
      ) : null}

      <form className="mb-4 flex flex-wrap items-end gap-2"
            onSubmit={(e) => { e.preventDefault(); search(); }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input className="pl-9" placeholder="Invoice #, email or payment reference…"
                 value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {data === null ? <Loading /> : data.buyers.length === 0 ? (
        <Empty>No invoices found.</Empty>
      ) : (
        <>
          <div className="space-y-3">
            {data.buyers.map((b) => {
              const open = expanded.has(b.user_id);
              return (
                <div key={b.user_id} className="rounded-lg border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => toggle(b.user_id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40"
                  >
                    <div>
                      <div className="font-medium text-foreground">{b.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.name || "—"} · {b.invoices.length} invoice{b.invoices.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {Object.entries(b.total_paid).map(([ccy, total]) => (
                        <span key={ccy} className="text-sm font-medium text-foreground">
                          {moneyIn(total, ccy)}
                        </span>
                      ))}
                      {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {open ? (
                    <div className="border-t border-border">
                      <Table head={["Invoice", "Date", "Item", "List", "Discount", "Paid", "Method", "Reference"]}>
                        {b.invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-muted/40">
                            <td className="px-4 py-3 font-mono text-xs text-foreground">{inv.invoice_number}</td>
                            <td className="px-4 py-3 text-muted-foreground">{when(inv.issued_at)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{inv.description}</td>
                            <td className="px-4 py-3 text-muted-foreground">{moneyIn(inv.list_amount, inv.currency)}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {inv.discount ? moneyIn(inv.discount, inv.currency) : "—"}
                              {inv.coupon_code ? <div className="text-xs">{inv.coupon_code}</div> : null}
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">{moneyIn(inv.paid_amount, inv.currency)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{inv.payment_method}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.payment_reference}</td>
                          </tr>
                        ))}
                      </Table>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0}
                      onClick={() => { const p = page - 1; setPage(p); load(p); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages}
                      onClick={() => { const p = page + 1; setPage(p); load(p); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ProjectsTab({ industries }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [onlyFailed, setOnlyFailed] = useState(false);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const d = await getProjects({
        q, limit: 100, generated: onlyFailed ? false : undefined,
      });
      setRows(d.projects);
    } catch { setRows([]); }
  }, [q, onlyFailed]);

  useEffect(() => { load(); }, [onlyFailed]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {industries.length ? (
        <div className="mb-4 overflow-x-auto rounded-lg border border-border bg-card p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            By industry — anything with a “failed” count is a project that was created and
            never produced a report
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.map((i) => (
              <span
                key={i.key}
                /* The industry field is free text, so one industry arrives under several
                   names. These are grouped the way the ENGINE groups them, and the hover
                   shows which raw names were merged — a merged count is only trustworthy if
                   you can see what went into it. */
                title={i.variants?.length
                  ? `Includes: ${i.variants.map((v) => `${v.name} (${v.count})`).join(", ")}`
                  : undefined}
                className={`cursor-default rounded border px-2 py-1 text-xs ${i.failed > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border-border text-muted-foreground"}`}>
                {i.industry}: {i.generated}/{i.projects}
                {i.variants?.length > 1
                  ? <span className="ml-1 text-muted-foreground/70">({i.variants.length} names)</span>
                  : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <form className="mb-3 flex flex-wrap gap-2"
            onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input className="pl-9" placeholder="Search project title…"
                 value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        <Button type="button" variant={onlyFailed ? "default" : "outline"}
                onClick={() => setOnlyFailed((v) => !v)}>
          Never generated
        </Button>
      </form>

      {rows === null ? <Loading /> : rows.length === 0 ? <Empty>No projects found.</Empty> : (
        <Table head={["#", "Project", "Industry", "Owner", "Format", "Cost", "Report", "Created"]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-muted/40">
              <td className="px-4 py-3 text-muted-foreground/70">{p.id}</td>
              <td className="px-4 py-3 font-medium text-foreground">{p.title || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.industry || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.report_format || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {p.project_cost ? money(p.project_cost) : "—"}
              </td>
              <td className="px-4 py-3">
                {p.generated
                  ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">generated</span>
                  : <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">none</span>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{when(p.created_at)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}


/** Discount codes. Creating one gives money away, so it lives behind the same door as
 *  changing a plan, and every code shows how much of it is left. */
function CouponsTab({ toast }) {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setRows(null);
    try { setRows((await getCoupons()).coupons); } catch { setRows([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (cpn) => {
    try {
      await setCouponActive(cpn.id, !cpn.active);
      toast({ title: cpn.active ? "Coupon disabled" : "Coupon enabled", description: cpn.code });
      load();
    } catch (e) {
      toast({ title: "Could not update the coupon", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          A code discounts the price at checkout. The amount is always worked out on the
          server, so a code cannot be edited into a bigger discount from the browser.
        </p>
        <Button size="sm" onClick={() => setOpen(true)} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </div>

      {rows === null ? <Loading /> : rows.length === 0 ? (
        <Empty>No coupons yet.</Empty>
      ) : (
        <Table head={["Code", "Discount", "Applies to", "Used", "Expires", "Given away", "State", ""]}>
          {rows.map((cpn) => (
            <tr key={cpn.id} className="hover:bg-muted/40">
              <td className="px-4 py-3">
                <div className="font-mono font-medium text-foreground">{cpn.code}</div>
                {cpn.description ? <div className="text-xs text-muted-foreground">{cpn.description}</div> : null}
              </td>
              <td className="px-4 py-3 text-foreground">
                {cpn.kind === "percent" ? `${cpn.value}%` : money(cpn.value)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {cpn.applies_to?.length ? cpn.applies_to.join(", ") : "all paid plans"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {cpn.used_count}{cpn.max_redemptions ? ` / ${cpn.max_redemptions}` : ""}
                {cpn.per_user_limit ? (
                  <div className="text-xs text-muted-foreground/70">{cpn.per_user_limit} per customer</div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{when(cpn.valid_until)}</td>
              <td className="px-4 py-3 text-muted-foreground">{money(cpn.discount_given)}</td>
              <td className="px-4 py-3">
                {/* "active" is the switch; "usable now" is whether it would actually work,
                    which is what matters when you are about to send it to a customer. */}
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${cpn.usable_now
                  ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                  {cpn.usable_now ? "usable now" : cpn.active ? "not usable" : "off"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="ghost" onClick={() => toggle(cpn)}>
                  {cpn.active ? "Disable" : "Enable"}
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <NewCouponDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(code) => { toast({ title: "Coupon created", description: code }); load(); }}
      />
    </>
  );
}

function NewCouponDialog({ open, onClose, onCreated }) {
  const blank = {
    code: "", kind: "percent", value: "", description: "",
    applies_to: "", max_redemptions: "", per_user_limit: "1", valid_until: "",
  };
  const [f, setF] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setF(blank); setErr(""); } }, [open]);   // eslint-disable-line

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const r = await createCoupon({
        code: f.code,
        kind: f.kind,
        value: Number(f.value),
        description: f.description || null,
        applies_to: f.applies_to ? f.applies_to.split(",").map((x) => x.trim()) : null,
        max_redemptions: f.max_redemptions === "" ? null : Number(f.max_redemptions),
        per_user_limit: f.per_user_limit === "" ? null : Number(f.per_user_limit),
        valid_until: f.valid_until ? new Date(f.valid_until).toISOString() : null,
      });
      onCreated(r.code);
      onClose();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New coupon</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input className="font-mono uppercase" placeholder="LAUNCH20"
                     value={f.code} onChange={set("code")} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={f.kind} onValueChange={(v) => setF((p) => ({ ...p, kind: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage off</SelectItem>
                  <SelectItem value="flat">Flat rupees off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{f.kind === "percent" ? "Percentage" : "Amount in rupees"}</Label>
            <Input type="number" value={f.value} onChange={set("value")}
                   placeholder={f.kind === "percent" ? "20" : "250"} />
            {f.kind === "percent" && Number(f.value) === 100 ? (
              <p className="text-xs text-amber-400">
                100% means the customer pays nothing and the plan is granted outright — no
                payment screen appears at all.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input placeholder="Launch offer" value={f.description} onChange={set("description")} />
          </div>

          <div className="space-y-2">
            <Label>Applies to</Label>
            <Input placeholder="Blank for all paid plans, or e.g. professional, enterprise"
                   value={f.applies_to} onChange={set("applies_to")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Total uses</Label>
              <Input type="number" placeholder="unlimited" value={f.max_redemptions}
                     onChange={set("max_redemptions")} />
            </div>
            <div className="space-y-2">
              <Label>Per customer</Label>
              <Input type="number" value={f.per_user_limit} onChange={set("per_user_limit")} />
            </div>
            <div className="space-y-2">
              <Label>Expires</Label>
              <Input type="date" value={f.valid_until} onChange={set("valid_until")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leaving both limits blank makes the code unlimited — that is how a code ends up on
            a deals site and is redeemed thousands of times.
          </p>

          {err ? <p className="text-sm text-destructive">{err}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !f.code.trim() || !f.value}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
