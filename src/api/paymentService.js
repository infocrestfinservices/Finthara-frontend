/**
 * paymentService.js — Razorpay checkout for the pricing plans.
 *
 * The browser never decides the price. It says which plan the user picked; the server
 * creates the order at its own price and hands back an order id. Anything else would let
 * the console buy the ₹4,999 plan for ₹1, and the signature would still verify.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function authHeaders() {
  const token = localStorage.getItem("rc_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("rc_auth_token"));
}

export async function getPaymentConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/payments/config`);
    if (!res.ok) return { enabled: false };
    return await res.json();
  } catch {
    return { enabled: false };
  }
}

// Loaded on demand rather than in index.html: the script is only needed by whoever
// actually clicks a plan, and a payment provider's script on every page view is a
// third-party request the rest of the site does not need.
let checkoutPromise = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  if (checkoutPromise) return checkoutPromise;
  checkoutPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = CHECKOUT_SRC;
    el.onload = () => resolve(true);
    el.onerror = () => {
      checkoutPromise = null;
      reject(new Error("Could not reach Razorpay. Check your internet connection."));
    };
    document.body.appendChild(el);
  });
  return checkoutPromise;
}

/**
 * Run the whole flow for one plan. Resolves with the verified payment, or throws.
 * Resolves to null if the user closes the checkout — that is a choice, not a failure.
 */
export async function payForPlan(planId, { onStatus, coupon } = {}) {
  const say = (m) => onStatus && onStatus(m);

  say("Starting…");
  // The code goes up; the PRICE comes back. The server recomputes the discount from the
  // coupon row, so nothing here can influence what is charged.
  const orderRes = await fetch(`${BACKEND_URL}/payments/order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan: planId, coupon: coupon || null }),
  });
  const order = await orderRes.json().catch(() => ({}));
  if (!orderRes.ok) throw new Error(order?.detail || "Could not start the payment.");

  // A coupon can cover the whole price. There is then nothing for Razorpay to charge — the
  // server has already granted the plan — so opening a checkout for ₹0 would only confuse.
  if (order.free) return { free: true, ...order };

  say("Opening checkout…");
  await loadCheckout();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "Smart Project Blueprint",
      description: order.plan?.name || planId,
      prefill: order.prefill || {},
      theme: { color: "#4F46E5" },
      handler: async (resp) => {
        try {
          say("Confirming your payment…");
          // The signature is checked on the SERVER. Nothing is granted until it passes.
          const vr = await fetch(`${BACKEND_URL}/payments/verify`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          const data = await vr.json().catch(() => ({}));
          if (!vr.ok) throw new Error(data?.detail || "Payment could not be verified.");
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => resolve(null),     // closed the window — not an error
      },
    });
    rzp.on("payment.failed", (e) =>
      reject(new Error(e?.error?.description || "The payment did not go through.")));
    rzp.open();
  });
}

/**
 * The plan this user is on, and what it still allows.
 *
 * Reads the SERVER's answer rather than anything cached at login: the plan can lapse
 * between one page load and the next (the monthly plans expire), and the report allowance
 * changes every time one is generated. A stale copy would offer a button that the backend
 * then refuses, which is a worse experience than not offering it.
 */
export async function getMyPlan() {
  try {
    const res = await fetch(`${BACKEND_URL}/payments/me`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Start AUTO-PAY for a monthly or yearly plan.
 *
 * Different from payForPlan in one way that matters: Razorpay's checkout is opened with a
 * `subscription_id` instead of an `order_id`, and what the customer authorises is a MANDATE,
 * not a single charge. There is no verify call afterwards — the plan is granted by the
 * `subscription.activated` webhook, server to server. A browser that closes at the wrong
 * moment therefore cannot cost someone the plan they just paid for, which is exactly the
 * failure the one-time flow is exposed to.
 *
 * Resolves with the checkout response once authorised, or null if the customer closes it.
 * The plan may take a moment to appear afterwards — that is the webhook arriving.
 */
export async function subscribeToPlan(planId, { onStatus } = {}) {
  const say = (m) => onStatus && onStatus(m);

  say("Starting…");
  const res = await fetch(`${BACKEND_URL}/payments/subscribe`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan: planId }),
  });
  const sub = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = sub?.detail;
    // The server distinguishes "auto-pay is not available on this account yet" from a real
    // failure, because the two deserve opposite responses: one falls back and still takes
    // the money, the other must not.
    const err = new Error(
      (typeof d === "string" ? d : d?.message) || "Could not start auto-pay."
    );
    err.autoPayUnavailable = Boolean(d && typeof d === "object" && d.auto_pay_unavailable);
    throw err;
  }

  say("Opening checkout…");
  await loadCheckout();

  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: sub.key_id,
      subscription_id: sub.subscription_id,
      name: "Smart Project Blueprint",
      description: `${sub.plan?.name || planId} — billed ${sub.plan?.period || "monthly"}`,
      prefill: sub.prefill || {},
      theme: { color: "#4F46E5" },
      handler: () => {
        say("Setting up your plan…");
        resolve({ subscription_id: sub.subscription_id, pending: true });
      },
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}

/** Stop auto-pay. The plan keeps working until the period already paid for ends. */
export async function cancelAutoPay({ atCycleEnd = true } = {}) {
  const res = await fetch(
    `${BACKEND_URL}/payments/subscription/cancel?at_cycle_end=${atCycleEnd}`,
    { method: "POST", headers: authHeaders() }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Could not cancel auto-pay.");
  return body;
}


/** What a code is worth on a plan, before committing to pay. Informational only — the
 *  charge is recomputed server-side when the order is created. */
export async function previewCoupon(code, plan) {
  const res = await fetch(`${BACKEND_URL}/payments/coupon/preview`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code, plan }),
  });
  if (!res.ok) return { valid: false, message: "Could not check that code." };
  return res.json();
}
