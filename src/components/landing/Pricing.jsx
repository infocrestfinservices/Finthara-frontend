import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { PLANS } from "./landingData";
import { getPaymentConfig, payForPlan, subscribeToPlan, previewCoupon, isLoggedIn } from "@/api/paymentService";
import { getPayPalConfig } from "@/api/paypalService";
import PayPalCheckoutDialog from "./PayPalCheckoutDialog";
import { Input } from "@/components/ui/input";
import { Tag, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// The card's display name is what the server knows the plan by. Keep these in step: an
// unknown id is refused by /payments/order rather than charged at some default.
const PLAN_IDS = { Starter: "starter", Professional: "professional", Enterprise: "enterprise" };
// Which plans are billed every month and so need a mandate rather than a one-off charge.
// The server refuses /payments/subscribe for anything else, so this only decides which
// checkout to open — it is not what enforces the rule.
const RECURRING = new Set(["professional", "enterprise"]);

export default function Pricing({ showHeader = true }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payments, setPayments] = useState({ enabled: false });
  const [paypal, setPaypal] = useState({ enabled: false });
  const [paypalPlan, setPaypalPlan] = useState(null); // {id, name} of the plan the PayPal dialog is open for
  const [busy, setBusy] = useState("");
  // One code for the whole page rather than one per card: a customer has a code, not a code
  // per plan, and the server refuses it on any plan it does not apply to anyway.
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState(null);   // {valid, message, discount}
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) { setCouponState(null); return; }
    if (!isLoggedIn()) {
      setCouponState({ valid: false, message: "Sign in to use a coupon." });
      return;
    }
    setCheckingCoupon(true);
    // Previewed against Professional, the plan the code is most likely meant for. It is
    // re-checked against the ACTUAL plan when the order is created, so a code that only
    // applies to Starter is still honoured there — this preview is a courtesy, not the rule.
    setCouponState(await previewCoupon(code, "professional"));
    setCheckingCoupon(false);
  };

  // Whether checkout is available is the SERVER's answer — it holds the keys. Without
  // this the buttons would offer to take money the backend cannot accept.
  useEffect(() => {
    let cancelled = false;
    getPaymentConfig().then((c) => !cancelled && setPayments(c || { enabled: false }));
    getPayPalConfig().then((c) => !cancelled && setPaypal(c || { enabled: false }));
    return () => { cancelled = true; };
  }, []);

  const paypalSuccess = (plan, result) => {
    setPaypalPlan(null);
    if (result.status === "paid") {
      toast({ title: "Payment received", description: `You are on the ${plan.name} plan.` });
    }
  };

  const buy = async (plan) => {
    const id = PLAN_IDS[plan.name];
    if (!id) return;
    if (!isLoggedIn()) {
      toast({ title: "Please sign in first",
              description: "A plan is attached to your account, so we need you signed in." });
      navigate("/login");
      return;
    }
    // Only a code the SERVER said was valid is sent. A rejected one is not smuggled along
    // in the hope the order endpoint is more forgiving — it is not, and it would fail the
    // sale instead of just not discounting it.
    const appliedCode = couponState?.valid ? coupon.trim() : null;
    setBusy(id);
    try {
      // Monthly plans take a MANDATE, not a single charge. Charging them once was how
      // "₹1,499 / month" became a one-off payment for a licence that never ended. Starter
      // is genuinely one-time and keeps the Orders flow.
      const recurring = RECURRING.has(id);
      let result;
      let usedAutoPay = recurring;
      if (recurring) {
        try {
          result = await subscribeToPlan(id, { onStatus: () => {} });
        } catch (e) {
          // Auto-pay not enabled on the payment account yet. Selling the plan as a single
          // month is far better than refusing the sale — the server grants exactly 30 days
          // either way; only the renewal differs.
          if (!e?.autoPayUnavailable) throw e;
          usedAutoPay = false;
          result = await payForPlan(id, { onStatus: () => {}, coupon: appliedCode });
        }
      } else {
        result = await payForPlan(id, { onStatus: () => {}, coupon: appliedCode });
      }
      if (!result) return;

      if (result.free) {
        toast({ title: "Your plan is active",
                description: result.message || `${plan.name} is now active — nothing to pay.` });
        return;
      }                       // checkout closed — say nothing

      if (recurring && !usedAutoPay) {
        toast({ title: "Payment received",
                description: `You are on ${plan.name} for 30 days. Automatic renewal is `
                           + `being switched on shortly — until then you can renew here.` });
        return;
      }
      toast(usedAutoPay
        ? { title: "Auto-pay is set up",
            // The plan is granted by a webhook, server to server, so it can land a moment
            // after the browser is done. Promising it is already active would be a lie the
            // user can see through by reloading.
            description: `${plan.name} will activate in a few seconds and renew every month. `
                       + `You can cancel any time.` }
        : { title: "Payment received",
            description: `You are on the ${plan.name} plan.` });
    } catch (err) {
      toast({ title: "Payment could not be completed",
              description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  return (
    <section id="pricing" className="bg-muted/30 border-y">
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16 ${showHeader ? "pt-14 sm:pt-16" : "pt-8 sm:pt-10"}`}>
        {showHeader && (
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Pricing</p>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold">Plans for every need</h3>
            <p className="text-muted-foreground mt-3">Start free. Upgrade when you need more. Cancel anytime.</p>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start md:pt-4">
          {PLANS.map((plan) => {
            const popular = Boolean(plan.tag);
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-card flex flex-col transition-all ${
                  popular
                    ? "border-primary shadow-2xl shadow-primary/20 md:-mt-4 md:mb-4 ring-1 ring-primary/20"
                    : "border-border shadow-sm hover:shadow-md"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {plan.tag}
                  </div>
                )}

                {/* Header */}
                <div className="px-6 pt-7 pb-6 border-b">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-4xl font-heading font-bold ${popular ? "text-primary" : ""}`}>{plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed min-h-[2.5rem]">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-6 flex-1 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      }
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60 line-through"}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 mt-auto">
                  {/* Enterprise is a conversation, not a checkout — and if the server has
                      no keys the button stays a link rather than offering to take money
                      that cannot be collected. */}
                  {payments.enabled && PLAN_IDS[plan.name] && plan.name !== "Enterprise" ? (
                    <Button
                      variant={plan.variant}
                      className="w-full gap-1.5"
                      size="lg"
                      disabled={Boolean(busy)}
                      onClick={() => buy(plan)}
                    >
                      {busy === PLAN_IDS[plan.name]
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</>
                        : <>{plan.cta}{popular && <ArrowRight className="w-4 h-4" />}</>}
                    </Button>
                  ) : (
                    <Link to={plan.name === "Enterprise" ? "/contact" : "/create"}>
                      <Button variant={plan.variant} className="w-full gap-1.5" size="lg">
                        {plan.cta}
                        {popular && <ArrowRight className="w-4 h-4" />}
                      </Button>
                    </Link>
                  )}

                  {/* A second gateway for a buyer who'd rather pay in USD — Starter and the
                      monthly plans, same as Razorpay above; Enterprise stays a conversation. */}
                  {paypal.enabled && PLAN_IDS[plan.name] && plan.name !== "Enterprise" && (
                    <button
                      type="button"
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-2.5 underline underline-offset-2"
                      onClick={() => {
                        if (!isLoggedIn()) {
                          toast({ title: "Please sign in first",
                                 description: "A plan is attached to your account, so we need you signed in." });
                          navigate("/login");
                          return;
                        }
                        setPaypalPlan({ id: PLAN_IDS[plan.name], name: plan.name });
                      }}
                    >
                      or pay with PayPal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coupon */}
        {payments.enabled && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="flex w-full max-w-sm gap-2">
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
              <Button variant="outline" onClick={applyCoupon} disabled={checkingCoupon || !coupon.trim()}>
                {checkingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
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

        {/* Trust line */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          🔒 Secure payments · <Link to="/refund-policy" className="underline hover:text-foreground">7-day money-back guarantee</Link> · Invoice on every plan
        </p>
      </div>

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
