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
 * "Buy regeneration" — shown when this report has used the regenerations its plan includes.
 * One purchase = one more regeneration of THIS report, paid through Cashfree at the server's
 * price (₹50, plus GST once GST applies). The server grants it only after Cashfree confirms.
 */
export default function BuyRegenerationDialog({ open, projectId, status, onClose, onPurchased }) {
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
  const price = Number(status?.price || 50);
  const tax = gstOn ? Math.round(price * (gst.rate || 0) * 100) / 100 : 0;
  const total = Math.round((price + tax) * 100) / 100;
  const included = status?.included;

  const buy = async () => {
    if (gstOn && !state) { setError("Please choose your state — it decides how GST is applied."); return; }
    setBusy(true); setError("");
    try {
      const order = await createOrder("regeneration", {
        projectId, state: gstOn ? state : null, phone: needPhone ? phone : null,
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
          <DialogTitle>Buy a regeneration</DialogTitle>
          <DialogDescription>
            {included != null
              ? `Your plan includes ${included} regeneration${included === 1 ? "" : "s"} per report, and this report has used ${included === 1 ? "it" : "them"}.`
              : "This report has no regenerations left."}{" "}
            One more regeneration of this report is {inr(price)}{gstOn ? " + GST" : ""}.
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
              <dt className="text-muted-foreground">1 regeneration</dt>
              <dd className="tabular-nums">{inr(price)}</dd>
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
            After payment you can choose what to change, then the report is regenerated once.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
