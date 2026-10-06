import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard } from "lucide-react";
import { getPaymentConfig, getMyPlan, createOrder, openCheckout } from "@/api/paymentService";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Buy one more team seat for a month — or, with `seatId`, one more month on an existing seat.
 * Paid through Cashfree at the server's price (₹200, plus GST once GST applies); the seat is
 * granted only after Cashfree confirms the payment.
 */
export default function BuySeatDialog({ open, seatId, price, onClose, onPurchased }) {
  const [config, setConfig] = useState(null);
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [needPhone, setNeedPhone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(""); setBusy(false);
    getPaymentConfig().then(setConfig);
    getMyPlan().then((p) => { if (p?.billing?.state) setState(p.billing.state); });
  }, [open]);

  const gst = config?.gst || {};
  const gstOn = Boolean(gst.registered);
  const base = Number(price || 200);
  const tax = gstOn ? Math.round(base * (gst.rate || 0) * 100) / 100 : 0;
  const total = Math.round((base + tax) * 100) / 100;
  const renewing = Boolean(seatId);

  const buy = async () => {
    if (gstOn && !state) { setError("Please choose your state — it decides how GST is applied."); return; }
    setBusy(true); setError("");
    try {
      const order = await createOrder("extra_seat", {
        seatId: seatId || null, state: gstOn ? state : null, phone: needPhone ? phone : null,
      });
      onClose();                       // Cashfree's window must not sit under this dialog
      const result = await openCheckout(order);
      if (result?.status === "paid") onPurchased(true);
      else if (result?.status === "pending") onPurchased(false);
    } catch (err) {
      if (err.phoneRequired) setNeedPhone(true);
      setError(err.message || "Could not start the payment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{renewing ? "Renew team seat" : "Add a team seat"}</DialogTitle>
          <DialogDescription>
            {renewing
              ? "Adds one more month to this seat."
              : "One more person on your team, for one month. Invite them as usual once it's added."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {gstOn && (
            <select value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Your state">
              <option value="">Select your state (for GST)</option>
              {(gst.states || []).map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          )}
          {needPhone && (
            <Input type="tel" inputMode="numeric" placeholder="10-digit mobile number"
                   value={phone} onChange={(e) => setPhone(e.target.value)} />
          )}

          <dl className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">1 seat × 1 month</dt>
              <dd className="tabular-nums">{inr(base)}</dd>
            </div>
            {gstOn && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST {Math.round((gst.rate || 0) * 100)}%</dt>
                <dd className="tabular-nums">{inr(tax)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1">
              <dt>Total payable</dt>
              <dd className="tabular-nums">{inr(total)}</dd>
            </div>
          </dl>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full gap-2" size="lg" onClick={buy} disabled={busy || !config?.enabled}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting payment…</>
                  : <><CreditCard className="w-4 h-4" /> Pay {inr(total)} with Cashfree</>}
          </Button>
          {config && !config.enabled && (
            <p className="text-xs text-muted-foreground">Online payment isn't available right now.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Not a subscription — renew the seat each month from this tab. If a seat runs out,
            nobody is removed; you just can't invite more people until it's renewed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
