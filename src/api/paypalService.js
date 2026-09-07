/**
 * paypalService.js — PayPal Orders checkout, alongside paymentService.js's Razorpay flow.
 *
 * Same rule as Razorpay: the browser never decides the price. It creates an order for a
 * plan id; the server looks up that plan's USD price and creates the PayPal order against
 * it. Approving in the PayPal Buttons popup is the buyer's consent, not a completed
 * payment — /paypal/verify is what actually captures the money server-side, and nothing is
 * granted here in the browser no matter what the approve callback reports.
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const SDK_SRC = "https://www.paypal.com/sdk/js";

function authHeaders() {
  const token = localStorage.getItem("rc_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getPayPalConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/paypal/config`);
    if (!res.ok) return { enabled: false };
    return await res.json();
  } catch {
    return { enabled: false };
  }
}

export async function createPayPalOrder(plan) {
  const res = await fetch(`${BACKEND_URL}/paypal/order`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ plan }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Could not start the PayPal payment.");
  return data;   // { order_id, client_id, currency, amount, plan }
}

/** The actual capture. Only once this resolves with status "paid" is anything granted. */
export async function verifyPayPalOrder(orderId) {
  const res = await fetch(`${BACKEND_URL}/paypal/verify`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ order_id: orderId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Payment could not be completed.");
  return data;   // { status: "paid" | "pending", plan, amount, expires_at }
}

// Loaded on demand, once, keyed by client_id+currency (the SDK script itself encodes both in
// its query string, so switching currency mid-session would need a fresh script — not a case
// this app hits, since PAYPAL_CURRENCY is one fixed value server-side).
let sdkPromise = null;
export function loadPayPalSdk(clientId, currency) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = `${SDK_SRC}?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    el.onload = () => resolve(window.paypal);
    el.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not reach PayPal. Check your internet connection."));
    };
    document.body.appendChild(el);
  });
  return sdkPromise;
}
