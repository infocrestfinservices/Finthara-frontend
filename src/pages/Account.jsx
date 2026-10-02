/**
 * Account.jsx — the customer's own plan and invoices.
 *
 * The invoice view deliberately mirrors the PDF line for line: someone who opens it on screen
 * and someone who forwards the PDF to their accountant must be looking at the same document.
 * Two layouts that drift apart is how a customer ends up quoting a figure their accountant
 * cannot find.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Download, FileText, Loader2, Receipt, ExternalLink,
} from "lucide-react";
import { listInvoices, getInvoice, downloadInvoicePdf } from "@/api/invoiceService";
import { getMyPlan } from "@/api/paymentService";

const money = (n, ccy = "INR") =>
  `${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${ccy}`;

const day = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN",
    { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function Account() {
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    const [p, inv] = await Promise.all([
      getMyPlan(),
      listInvoices().catch(() => ({ invoices: [] })),
    ]);
    setPlan(p);
    setInvoices(inv.invoices || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const download = async (inv) => {
    setBusy(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoice_number);
    } catch (e) {
      toast({ title: "Download failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {openId ? (
          <InvoiceView id={openId} onBack={() => setOpenId(null)} onDownload={download}
                       busy={busy} />
        ) : (
          <>
            <h1 className="text-2xl font-heading font-bold">My account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your plan and every invoice we have issued you.
            </p>

            <PlanCard plan={plan} />

            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Invoices</h2>
              </div>

              {invoices === null ? (
                <div className="flex items-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : invoices.length === 0 ? (
                <div className="border rounded-xl p-8 text-center">
                  <FileText className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No invoices yet. One is issued automatically each time a payment goes
                    through.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/pricing">See plans</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        {["Invoice", "Date", "Plan", "Amount", "Status", ""].map((h) => (
                          <th key={h} className="px-4 py-3 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-medium">{inv.invoice_number}</td>
                          <td className="px-4 py-3 text-muted-foreground">{day(inv.issued_at)}</td>
                          <td className="px-4 py-3 capitalize">{inv.plan}</td>
                          <td className="px-4 py-3 tabular-nums">{money(inv.total, inv.currency)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                              {inv.amount_due > 0 ? "due" : "paid"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setOpenId(inv.id)}>
                                View
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1.5"
                                      disabled={busy === inv.id}
                                      onClick={() => download(inv)}>
                                {busy === inv.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Download className="w-3.5 h-3.5" />}
                                PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

function PlanCard({ plan }) {
  if (!plan) return null;
  const left = plan.reports_limit === null
    ? "Unlimited reports"
    : `${plan.reports_left} of ${plan.reports_limit} reports left`;
  return (
    <div className="mt-6 border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
        <p className="text-xl font-semibold mt-0.5">{plan.label}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {left}
          {plan.expires_at ? ` · renews ${day(plan.expires_at)}` : ""}
        </p>
      </div>
      <Button asChild variant="outline" className="gap-1.5">
        <Link to="/pricing">Change plan <ExternalLink className="w-3.5 h-3.5" /></Link>
      </Button>
    </div>
  );
}

/** The same document the PDF renders, in the same order. */
function InvoiceView({ id, onBack, onDownload, busy }) {
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setInv(null);
    getInvoice(id).then(setInv).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <p className="py-10 text-center text-sm text-destructive">{err}</p>;
  if (!inv) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  const isTax = Boolean(inv.supplier.gstin);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> All invoices
        </Button>
        <Button className="gap-1.5" disabled={busy === inv.id}
                onClick={() => onDownload({ id: inv.id, invoice_number: inv.invoice_number })}>
          {busy === inv.id ? <Loader2 className="w-4 h-4 animate-spin" />
                           : <Download className="w-4 h-4" />}
          Download PDF
        </Button>
      </div>

      <div className="border rounded-xl bg-card p-8 sm:p-10">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {inv.document_type}
            </p>
            <p className="text-4xl font-bold mt-1 tabular-nums">
              {money(inv.total, inv.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{inv.supplier.name}</p>
            <p className="text-xs text-muted-foreground">
              Bank &amp; investor-ready project reports
            </p>
          </div>
        </div>

        <hr className="my-7" />

        {/* parties */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">To</p>
            {inv.customer.company ? <p className="font-medium">{inv.customer.company}</p> : null}
            <p className={inv.customer.company ? "text-sm" : "font-medium"}>
              {inv.customer.name || inv.customer.email}
            </p>
            {inv.customer.name ? (
              <p className="text-sm text-muted-foreground">{inv.customer.email}</p>
            ) : null}
            {inv.customer.gstin ? (
              <p className="text-sm text-muted-foreground">GSTIN {inv.customer.gstin}</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">From</p>
            <p className="font-medium">{inv.supplier.name}</p>
            {inv.supplier.address ? (
              <p className="text-sm text-muted-foreground">{inv.supplier.address}</p>
            ) : null}
            {inv.supplier.email ? (
              <p className="text-sm text-muted-foreground">{inv.supplier.email}</p>
            ) : null}
            {isTax ? (
              <p className="text-sm text-muted-foreground">GSTIN {inv.supplier.gstin}</p>
            ) : null}
          </div>
        </div>

        {/* references */}
        <div className="flex flex-wrap gap-x-14 gap-y-4 mt-7">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice number</p>
            <p className="font-mono font-semibold mt-0.5">{inv.invoice_number}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Issue date</p>
            <p className="mt-0.5">{day(inv.issued_at)}</p>
          </div>
        </div>

        {/* line items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y text-xs uppercase tracking-wide text-muted-foreground">
                <th className="text-left py-2.5 font-medium">Description</th>
                {isTax && inv.sac_code ? (
                  <th className="text-left py-2.5 font-medium w-24">SAC</th>
                ) : null}
                <th className="text-right py-2.5 font-medium w-40">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 pr-6">{inv.description}</td>
                {isTax && inv.sac_code ? (
                  <td className="py-4 text-muted-foreground">{inv.sac_code}</td>
                ) : null}
                <td className="py-4 text-right tabular-nums">
                  {money((inv.taxable_value || 0) + (inv.discount || 0), inv.currency)}
                </td>
              </tr>
              {inv.coupon_code && inv.discount ? (
                <tr className="text-muted-foreground">
                  <td className="pb-4 pr-6">Coupon {inv.coupon_code} applied</td>
                  {isTax && inv.sac_code ? <td /> : null}
                  <td className="pb-4 text-right tabular-nums">
                    −{money(inv.discount, inv.currency)}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* summary */}
        <div className="border-t pt-5 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            {isTax ? (
              <>
                <Row label="Taxable value" value={money(inv.taxable_value, inv.currency)} />
                {inv.cgst || inv.sgst ? (
                  <>
                    <Row label={`CGST ${(inv.tax_rate * 100) / 2}%`} value={money(inv.cgst, inv.currency)} />
                    <Row label={`SGST ${(inv.tax_rate * 100) / 2}%`} value={money(inv.sgst, inv.currency)} />
                  </>
                ) : inv.igst ? (
                  <Row label={`IGST ${Math.round(inv.tax_rate * 100)}%`} value={money(inv.igst, inv.currency)} />
                ) : null}
              </>
            ) : null}
            <Row label="Total" value={money(inv.total, inv.currency)} />
            <Row label="Less amount paid" value={money(inv.amount_paid, inv.currency)} />
            <div className="border-t pt-3 flex items-baseline justify-between">
              <dt className="font-semibold">Amount due</dt>
              <dd className="text-lg font-bold tabular-nums">
                {money(inv.amount_due, inv.currency)}
              </dd>
            </div>
          </dl>
        </div>

        <hr className="my-7" />
        <div className="text-xs text-muted-foreground space-y-1">
          {!isTax ? (
            <p>
              {inv.supplier.name} is not registered for GST. No tax has been charged on this
              supply.
            </p>
          ) : null}
          {inv.place_of_supply ? <p>Place of supply: {inv.place_of_supply}</p> : null}
          {inv.tax_note ? <p>{inv.tax_note}</p> : null}
          <p>This is a computer-generated document and needs no signature.</p>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
