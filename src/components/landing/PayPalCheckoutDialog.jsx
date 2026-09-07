import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { getPayPalConfig, createPayPalOrder, verifyPayPalOrder, loadPayPalSdk } from "@/api/paypalService";

/**
 * Renders PayPal's own Buttons widget for one plan and drives it through the create→approve→
 * capture flow. Unlike Razorpay's checkout.js (a popup you open and get a callback from),
 * PayPal Buttons is a widget that has to be mounted into the DOM — hence a dialog with a
 * container div, rather than a plain onClick like the Razorpay path.
 *
 * `createOrder` returns the order id the SERVER already created (see paypalService.js) — the
 * SDK never gets to invent its own amount. `onApprove` does NOT grant anything: it calls
 * /paypal/verify, which performs the actual server-side capture, and only a "paid" response
 * moves this dialog past "Confirming your payment…". A "pending" response (rare — a funding
 * source that doesn't settle instantly) is shown as still-pending rather than either success
 * or failure, since the money is neither confirmed received nor confirmed lost.
 */
export default function PayPalCheckoutDialog({ open, onOpenChange, planId, planName, onSuccess }) {
  const containerRef = useRef(null);
  const [phase, setPhase] = useState("loading"); // loading | ready | confirming | pending | error
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(null);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("loading");
    setError("");

    (async () => {
      try {
        const cfg = await getPayPalConfig();
        if (!cfg.enabled) throw new Error("PayPal is not available right now.");
        if (cancelled) return;
        setCurrency(cfg.currency || "USD");

        const paypal = await loadPayPalSdk(cfg.client_id, cfg.currency || "USD");
        if (cancelled) return;

        const buttons = paypal.Buttons({
          style: { layout: "vertical", label: "pay" },
          createOrder: async () => {
            const order = await createPayPalOrder(planId);
            if (!cancelled) setAmount(order.amount);
            return order.order_id;
          },
          onApprove: async (data) => {
            // Approval is the buyer's consent, not a completed payment — see the module
            // docstring. This is the call that actually captures the money.
            if (!cancelled) setPhase("confirming");
            const result = await verifyPayPalOrder(data.orderID);
            if (cancelled) return;
            if (result.status === "pending") {
              setPhase("pending");
              return;
            }
            onSuccess?.(result);
          },
          onError: (err) => {
            if (cancelled) return;
            setError(err?.message || "PayPal could not complete the payment.");
            setPhase("error");
          },
          onCancel: () => {
            if (!cancelled) onOpenChange(false);
          },
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          await buttons.render(containerRef.current);
        }
        if (!cancelled) setPhase("ready");
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Could not load PayPal.");
          setPhase("error");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [open, planId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay with PayPal</DialogTitle>
          <DialogDescription>
            {planName}{amount ? ` — ${currency} ${amount}` : ""}
          </DialogDescription>
        </DialogHeader>

        {phase === "confirming" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Confirming your payment…</p>
          </div>
        ) : phase === "pending" ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            PayPal is still processing this payment. Your plan will activate automatically the
            moment it clears — no need to try again.
          </div>
        ) : phase === "error" ? (
          <div className="py-8 text-center text-sm text-destructive">{error}</div>
        ) : null}

        {/* Kept mounted (not unmounted on confirming/error) so the SDK's own container
            reference stays valid if the buyer retries without closing the dialog. */}
        <div ref={containerRef} className={phase === "confirming" || phase === "pending" ? "hidden" : ""} />
        {phase === "loading" && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
