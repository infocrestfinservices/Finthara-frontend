import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Tag, Check, CreditCard } from "lucide-react";
import { PLANS } from "./landingData";
import { getPaymentConfig, payForPlan, subscribeToPlan, previewCoupon, isLoggedIn } from "@/api/paymentService";
import { getPayPalConfig } from "@/api/paypalService";
import PayPalCheckoutDialog from "./PayPalCheckoutDialog";
import { useToast } from "@/components/ui/use-toast";

// Plans billed on a cycle, and so sold with a mandate rather than a one-off charge. The
// server refuses /payments/subscribe for anything else, so this only decides which checkout
// to open — it is not what enforces the rule.
const RECURRING = new Set(["consultant_monthly", "consultant_yearly"]);
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

  const payWithRazorpay = async (option, appliedCode) => {
    // The checkout dialog is closed BEFORE Razorpay opens: its focus trap would otherwise
    // sit on top of Razorpay's own window and swallow clicks on it.
    setCheckout(null);
    setBusy(option.id);
    try {
      // Cycle plans take a MANDATE, not a single charge — except when a coupon is applied:
      // a coupon discounts one payment, so it is sold as a single period at the discounted
      // price rather than silently dropped from an auto-pay mandate at full price.
      let recurring = RECURRING.has(option.id) && !appliedCode;
      let result;
      if (recurring) {
        try {
          result = await subscribeToPlan(option.id, { onStatus: () => {} });
        } catch (e) {
          // Auto-pay not enabled on the payment account yet. Selling one period is far
          // better than refusing the sale — the server grants exactly one period either way;
          // only the renewal differs.
          if (!e?.autoPayUnavailable) throw e;
          recurring = false;
          result = await payForPlan(option.id, { onStatus: () => {}, coupon: appliedCode });
        }
      } else {
        result = await payForPlan(option.id, { onStatus: () => {}, coupon: appliedCode });
      }
      if (!result) return;                                 // checkout closed — say nothing

      if (result.free) {
        toast({ title: "Your plan is active",
                description: result.message || `${option.name} is now active — nothing to pay.` });
        return;
      }
      if (option.id === "entrepreneur") {
        toast({ title: "Payment received",
                description: "Your Entrepreneur report is ready to use — generate it any time." });
        return;
      }
      const every = CYCLE_WORD[option.id] || "period";
      toast(recurring
        ? { title: "Auto-pay is set up",
            // The plan is granted by a webhook, server to server, so it can land a moment
            // after the browser is done. Promising it is already active would be a lie the
            // user can see through by reloading.
            description: `${option.name} will activate in a few seconds and renew every `
                       + `${every}. You can cancel any time.` }
        : { title: "Payment received",
            description: `You are on ${option.name} for one ${every}. You can renew it here `
                       + `before it ends.` });
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
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-heading font-bold">{option.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">{option.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{option.note}</p>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 flex-1 flex flex-col gap-3">
                  {plan.features.filter((f) => f.included).map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{f.text}</span>
                    </div>
                  ))}
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

        {/* Trust line */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          🔒 Secure payments · <Link to="/refund-policy" className="underline hover:text-foreground">7-day money-back guarantee</Link> · Invoice on every plan
        </p>
      </div>

      <CheckoutDialog
        option={checkout}
        razorpay={payments.enabled}
        paypal={paypal.enabled}
        onClose={() => setCheckout(null)}
        onRazorpay={payWithRazorpay}
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

/** Monthly | Yearly pill for the Consultant & CA card. */
function BillingToggle({ cycle, onChange }) {
  return (
    <div role="radiogroup" aria-label="Billing period"
         className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-background/60 backdrop-blur-md shadow-sm">
      {[["monthly", "Monthly"], ["yearly", "Yearly"]].map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={cycle === key}
          onClick={() => onChange(key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            cycle === key
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
          {key === "yearly" && (
            <span className={`ml-1.5 text-xs ${cycle === key ? "opacity-90" : "text-emerald-600"}`}>
              Save ₹12,012
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Step two of buying: the chosen plan, an optional coupon, and the ways to pay for it. */
function CheckoutDialog({ option, razorpay, paypal, onClose, onRazorpay, onPayPal }) {
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState(null);   // {valid, message, discount}
  const [checking, setChecking] = useState(false);

  // A fresh dialog per plan: a code checked against one plan says nothing about another.
  useEffect(() => { setCoupon(""); setCouponState(null); }, [option?.id]);

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
  const none = !razorpay && !paypal;

  return (
    <Dialog open={Boolean(option)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {option && (
          <>
            <DialogHeader>
              <DialogTitle>{option.name}</DialogTitle>
              <DialogDescription>
                {option.price} {option.period} · {option.note}
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
                {razorpay && (
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
                    {appliedCode && RECURRING.has(option.id) && (
                      <p className="text-xs text-muted-foreground">
                        With a coupon this is a single {CYCLE_WORD[option.id]}'s payment — it
                        won't renew automatically.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {razorpay && (
                    <Button size="lg" className="w-full gap-2" onClick={() => onRazorpay(option, appliedCode)}>
                      <CreditCard className="w-4 h-4" /> Pay with Razorpay
                    </Button>
                  )}
                  {paypal && (
                    <Button size="lg" variant="outline" className="w-full" onClick={() => onPayPal(option)}>
                      Pay with PayPal
                    </Button>
                  )}
                </div>
                {razorpay && paypal && (
                  <p className="text-xs text-muted-foreground">
                    Razorpay: UPI, cards and netbanking in INR. PayPal: cards in USD
                    {appliedCode ? " (coupons apply to Razorpay payments only)" : ""}.
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
