import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { X, Loader2, Tag, Check, CreditCard } from "lucide-react";
import { PLANS } from "./landingData";
import { getPaymentConfig, createOrder, openCheckout as openCashfree, verifyOrder, previewCoupon, isLoggedIn, getMyPlan } from "@/api/paymentService";
import { getPayPalConfig } from "@/api/paypalService";
import PayPalCheckoutDialog from "./PayPalCheckoutDialog";
import { useToast } from "@/components/ui/use-toast";

// How long one purchase of each plan lasts, for the confirmation message. Nothing renews
// automatically: every plan is a single payment for one period (or one report).
const CYCLE_WORD = { consultant_monthly: "month", consultant_yearly: "year" };

/** The plan card + billing cycle that sells a given server plan id, or null. */
function findOption(planId) {
  for (const plan of PLANS) {
    if (!plan.billing && plan.id === planId) return { cycle: null, option: plan };
    for (const [cycle, b] of Object.entries(plan.billing || {})) {
      if (b.id === planId) return { cycle, option: selected(plan, cycle) };
    }
  }
  return null;
}

/** The option a card is currently selling: its server id, price and billing note. */
function selected(plan, cycle) {
  if (!plan.billing) return plan;
  return { ...plan, ...plan.billing[cycle] };
}

export default function Pricing({ showHeader = true }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState({ enabled: false });
  const [paypal, setPaypal] = useState({ enabled: false });
  const [cycle, setCycle] = useState("monthly");          // Consultant & CA billing
  const [checkout, setCheckout] = useState(null);         // {id, name, price, period, note}
  const [paypalPlan, setPaypalPlan] = useState(null);     // {id, name} for the PayPal dialog
  const [busy, setBusy] = useState("");

  // Whether checkout is available is the SERVER's answer — it holds the keys. Without
  // this the dialog would offer to take money the backend cannot accept.
  useEffect(() => {
    let cancelled = false;
    getPaymentConfig().then((c) => !cancelled && setPayments(c || { enabled: false }));
    getPayPalConfig().then((c) => !cancelled && setPaypal(c || { enabled: false }));
    return () => { cancelled = true; };
  }, []);

  // Coming back from login with ?plan=<id>: reopen the checkout for the plan that was
  // picked, so the customer does not have to find it and click Get Plan a second time.
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (!planId) return;
    const found = findOption(planId);
    if (found && isLoggedIn()) {
      if (found.cycle) setCycle(found.cycle);
      setCheckout(found.option);
    }
    const rest = new URLSearchParams(searchParams);
    rest.delete("plan");
    setSearchParams(rest, { replace: true });
  }, [searchParams, setSearchParams]);

  // Coming back from Cashfree's own page (?cf_order=<id>) — some payment methods leave the
  // site to finish. The server checks the order with Cashfree before anything is granted.
  useEffect(() => {
    const orderId = searchParams.get("cf_order");
    if (!orderId) return;
    const rest = new URLSearchParams(searchParams);
    rest.delete("cf_order");
    setSearchParams(rest, { replace: true });
    if (!isLoggedIn()) return;
    verifyOrder(orderId)
      .then((r) => announce(r, null))
      .catch((err) => toast({ title: "Payment could not be verified",
                              description: err?.message || "Please contact support.",
                              variant: "destructive" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  const openCheckout = (option) => {
    if (!isLoggedIn()) {
      toast({ title: "Please sign in first",
              description: "A plan is attached to your account, so we need you signed in." });
      // Back to this plan's checkout after login, not to the dashboard.
      navigate(`/login?next=${encodeURIComponent(`/pricing?plan=${option.id}`)}`);
      return;
    }
    setCheckout(option);
  };

  /** Tell the customer how a verified Cashfree order ended. */
  const announce = (result, option) => {
    if (!result) return;                                   // checkout closed — say nothing
    if (result.status === "pending") {
      toast({ title: "Payment is being confirmed",
              description: "Your bank has not confirmed it yet. Your plan activates as soon "
                         + "as it does — refresh this page in a minute." });
      return;
    }
    if (result.status !== "paid") {
      toast({ title: "Payment was not completed",
              description: "No money was taken for this order. Please try again.",
              variant: "destructive" });
      return;
    }
    const planId = result.plan || option?.id;
    if (planId === "entrepreneur") {
      toast({ title: "Payment received",
              description: "Your Entrepreneur report is ready to use — generate it any time." });
      return;
    }
    toast({ title: "Payment received",
            description: `You are on Consultant & CA for one ${CYCLE_WORD[planId] || "period"}. `
                       + `It does not renew automatically — renew here before it ends.` });
  };

  /** Called from the dialog once the server has created the order: close the dialog (its
   *  focus trap would sit on top of Cashfree's window and swallow clicks), open Cashfree,
   *  then report what the server says happened. */
  const payWithCashfree = async (option, order) => {
    setCheckout(null);
    if (order.free) {
      toast({ title: "Your plan is active",
              description: order.message || `${option.name} is now active — nothing to pay.` });
      return;
    }
    setBusy(option.id);
    try {
      announce(await openCashfree(order), option);
    } catch (err) {
      toast({ title: "Payment could not be completed",
              description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const payWithPayPal = (option) => {
    setCheckout(null);
    setPaypalPlan({ id: option.id, name: option.name });
  };

  const paypalSuccess = (plan, result) => {
    setPaypalPlan(null);
    if (result.status === "paid") {
      toast({ title: "Payment received", description: `You are on ${plan.name}.` });
    }
  };

  return (
    <section id="pricing" className="bg-muted/30 border-y">
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16 ${showHeader ? "pt-14 sm:pt-16" : "pt-8 sm:pt-10"}`}>
        {showHeader && (
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Pricing</p>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold">Plans for every need</h3>
            <p className="text-muted-foreground mt-3">One report when you need it, or a monthly allowance for your practice.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const option = selected(plan, cycle);
            return (
              <div key={plan.name}
                   className="rounded-2xl border border-border bg-card shadow-sm flex flex-col">
                {/* Header */}
                <div className="px-6 pt-7 pb-6 border-b">
                  {plan.billing && (
                    <div className="flex justify-center mb-5">
                      <BillingToggle cycle={cycle} onChange={setCycle} />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-muted-foreground mb-2">{plan.name}</p>
                  <div key={option.id} className="animate-in fade-in duration-300">
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-heading font-bold">{option.price}</span>
                      <span className="text-muted-foreground text-sm mb-1">{option.period}</span>
                      <span className="text-muted-foreground text-xs mb-1.5">· GST excluded</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{option.note}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 flex-1 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-sm">
                      <FeatureIcon included={f.included} />
                      <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                  {plan.footnote && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{plan.footnote}</p>
                  )}
                </div>

                {/* CTA — payment options only appear after this is clicked */}
                <div className="px-6 pb-6 mt-auto">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={Boolean(busy)}
                    onClick={() => openCheckout(option)}
                  >
                    {busy === option.id
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Opening checkout…</>
                      : "Get Plan"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CheckoutDialog
        option={checkout}
        cashfree={payments.enabled}
        gstConfig={payments.gst}
        planAmounts={Object.fromEntries((payments.plans || []).map((p) => [p.id, p.amount]))}
        paypal={paypal.enabled}
        onClose={() => setCheckout(null)}
        onCashfree={payWithCashfree}
        onPayPal={payWithPayPal}
      />

      {paypalPlan && (
        <PayPalCheckoutDialog
          open={Boolean(paypalPlan)}
          onOpenChange={(v) => !v && setPaypalPlan(null)}
          planId={paypalPlan.id}
          planName={paypalPlan.name}
          onSuccess={(result) => paypalSuccess(paypalPlan, result)}
        />
      )}
    </section>
  );
}

/** Solid green tick for what a plan includes, solid red cross for what it does not. */
function FeatureIcon({ included }) {
  return (
    <span className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
      included ? "bg-emerald-500" : "bg-rose-500"}`}>
      {included
        ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
        : <X className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
    </span>
  );
}

/** Monthly ⇄ Yearly switch for the Consultant & CA card. Yearly = ₹9,999 × 12 = ₹1,19,988
 *  against ₹11,000 × 12 = ₹1,32,000 monthly: ₹12,012 a year saved, 9.1%. */
function BillingToggle({ cycle, onChange }) {
  const yearly = cycle === "yearly";
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <button type="button" onClick={() => onChange("monthly")}
              className={`transition-colors ${!yearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        Monthly
      </button>
      <Switch
        checked={yearly}
        onCheckedChange={(on) => onChange(on ? "yearly" : "monthly")}
        aria-label="Bill yearly"
      />
      <button type="button" onClick={() => onChange("yearly")}
              className={`transition-colors ${yearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        Yearly
      </button>
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        Save 9%
      </span>
    </div>
  );
}

/** Step two of buying: the chosen plan, an optional coupon, and the ways to pay for it. */
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function CheckoutDialog({ option, cashfree, gstConfig, planAmounts, paypal, onClose, onCashfree, onPayPal }) {
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState(null);   // {valid, message, discount}
  const [checking, setChecking] = useState(false);
  // Cashfree needs a mobile number. Asked for only when the server says the account has none.
  const [needPhone, setNeedPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  // GST billing details — asked for only when GST applies, pre-filled from last time.
  const gstOn = Boolean(cashfree && gstConfig?.registered);
  const [state, setState] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [gstin, setGstin] = useState("");
  const [company, setCompany] = useState("");

  // A fresh dialog per plan: a code checked against one plan says nothing about another.
  useEffect(() => {
    setCoupon(""); setCouponState(null); setError(""); setStarting(false);
  }, [option?.id]);

  useEffect(() => {
    if (!option || !gstOn) return;
    getMyPlan().then((p) => {
      const b = p?.billing || {};
      if (b.state) setState(b.state);
      if (b.gstin) { setIsBusiness(true); setGstin(b.gstin); setCompany(b.company || ""); }
    });
  }, [option?.id, gstOn]);

  // What will be charged. Display only — the server computes the real amount.
  const listAmount = Number(planAmounts?.[option?.id] || 0);
  const base = couponState?.valid ? Number(couponState.final_amount) : listAmount;
  const taxAmount = gstOn ? Math.round(base * (gstConfig.rate || 0) * 100) / 100 : 0;
  const totalAmount = Math.round((base + taxAmount) * 100) / 100;

  const startCashfree = async () => {
    setStarting(true);
    setError("");
    try {
      if (gstOn && !state && !(isBusiness && gstin.trim())) {
        setError("Please choose your state — it decides how GST is applied.");
        return;
      }
      const order = await createOrder(option.id, {
        coupon: appliedCode, phone: needPhone ? phone : null,
        state: gstOn ? state : null,
        gstin: gstOn && isBusiness ? gstin.trim() : null,
        company: gstOn && isBusiness ? company.trim() : null,
      });
      setNeedPhone(false);
      onCashfree(option, order);
    } catch (err) {
      if (err.phoneRequired) setNeedPhone(true);
      setError(err.message || "Could not start the payment.");
    } finally {
      setStarting(false);
    }
  };

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code || !option) { setCouponState(null); return; }
    setChecking(true);
    // Checked against the plan actually being bought. The price is still recomputed from
    // scratch when the order is created — this preview is a courtesy, not the rule.
    setCouponState(await previewCoupon(code, option.id));
    setChecking(false);
  };

  // Only a code the SERVER said was valid is sent. A rejected one is not smuggled along in
  // the hope the order endpoint is more forgiving — it is not, and it would fail the sale.
  const appliedCode = couponState?.valid ? coupon.trim() : null;
  const none = !cashfree && !paypal;

  return (
    <Dialog open={Boolean(option)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {option && (
          <>
            <DialogHeader>
              <DialogTitle>{option.name}</DialogTitle>
              <DialogDescription>
                {option.price} {option.period} (GST excluded) · {option.note}
              </DialogDescription>
            </DialogHeader>

            {none ? (
              <p className="text-sm text-muted-foreground">
                Online payment isn't available right now.{" "}
                <Link to="/contact" className="underline text-foreground" onClick={onClose}>Contact us</Link>{" "}
                and we'll set up your plan.
              </p>
            ) : (
              <div className="space-y-4">
                {cashfree && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9 uppercase"
                          placeholder="Have a coupon code?"
                          value={coupon}
                          onChange={(e) => { setCoupon(e.target.value); setCouponState(null); }}
                          onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        />
                      </div>
                      <Button variant="outline" onClick={applyCoupon} disabled={checking || !coupon.trim()}>
                        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {couponState && (
                      <p className={`text-sm inline-flex items-center gap-1.5 ${couponState.valid
                        ? "text-emerald-600" : "text-destructive"}`}>
                        {couponState.valid && <Check className="h-4 w-4" />}
                        {couponState.message}
                      </p>
                    )}
                  </div>
                )}

                {gstOn && (
                  <div className="space-y-2">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      aria-label="Your state"
                    >
                      <option value="">Select your state (for GST)</option>
                      {(gstConfig.states || []).map((s) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={isBusiness}
                             onChange={(e) => setIsBusiness(e.target.checked)} />
                      Business purchase — add my GSTIN to the invoice
                    </label>
                    {isBusiness && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="GSTIN (15 characters)" className="uppercase"
                               value={gstin} onChange={(e) => setGstin(e.target.value)} />
                        <Input placeholder="Registered business name"
                               value={company} onChange={(e) => setCompany(e.target.value)} />
                      </div>
                    )}
                  </div>
                )}

                {cashfree && listAmount > 0 && (
                  <dl className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Price{couponState?.valid ? " after coupon" : ""}</dt>
                      <dd className="tabular-nums">{inr(base)}</dd>
                    </div>
                    {gstOn && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">GST {Math.round((gstConfig.rate || 0) * 100)}%</dt>
                        <dd className="tabular-nums">{inr(taxAmount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <dt>Total payable</dt>
                      <dd className="tabular-nums">{inr(totalAmount)}</dd>
                    </div>
                  </dl>
                )}

                {cashfree && needPhone && (
                  <div className="space-y-1.5">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && startCashfree()}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Required by the payment gateway. Saved to your profile.
                    </p>
                  </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex flex-col gap-2">
                  {cashfree && (
                    <Button size="lg" className="w-full gap-2" disabled={starting}
                            onClick={startCashfree}>
                      {starting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting payment…</>
                        : <><CreditCard className="w-4 h-4" /> Pay with Cashfree</>}
                    </Button>
                  )}
                  {paypal && (
                    <Button size="lg" variant="outline" className="w-full" onClick={() => onPayPal(option)}>
                      Pay with PayPal
                    </Button>
                  )}
                </div>
                {cashfree && paypal && (
                  <p className="text-xs text-muted-foreground">
                    Cashfree: UPI, cards and netbanking in INR{gstOn ? ", GST added" : ""}.
                    PayPal: cards in USD, for customers outside India
                    {appliedCode ? " (coupons apply to Cashfree payments only)" : ""}.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
