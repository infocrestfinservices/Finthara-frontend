/**
 * paymentService.js — Cashfree checkout for the pricing plans.
 *
 * The browser never decides the price. It says which plan the user picked; the server
 * creates the Cashfree order at its own price and hands back a payment session. And the
 * browser never decides that a payment SUCCEEDED either: after the checkout closes, the
 * server asks Cashfree for the order's status before anything is granted.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const CHECKOUT_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

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
  if (window.Cashfree) return Promise.resolve(true);
  if (checkoutPromise) return checkoutPromise;
  checkoutPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = CHECKOUT_SRC;
    el.onload = () => resolve(true);
    el.onerror = () => {
      checkoutPromise = null;
      reject(new Error("Could not reach Cashfree. Check your internet connection."));
    };
    document.body.appendChild(el);
  });
  return checkoutPromise;
}

/**
 * Step 1: ask the server for an order. Resolves with the order, or with {free: true, ...}
 * when a coupon covered the whole price (the plan is then already active).
 * Throws an error with `phoneRequired = true` when the account has no mobile number — the
 * caller asks for one and calls again with `phone`.
 */
export async function createOrder(planId, { coupon, phone } = {}) {
  // The code goes up; the PRICE comes back. Nothing here can influence what is charged.
  const res = await fetch(`${BACKEND_URL}/payments/order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan: planId, coupon: coupon || null, phone: phone || null }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = body?.detail;
    const err = new Error((typeof d === "string" ? d : d?.message) || "Could not start the payment.");
    err.phoneRequired = Boolean(d && typeof d === "object" && d.phone_required);
    throw err;
  }
  if (body.free) return { free: true, ...body };
  return body;
}

/** Ask the server (which asks Cashfree) what happened to an order. */
export async function verifyOrder(orderId) {
  const res = await fetch(`${BACKEND_URL}/payments/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ order_id: orderId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Payment could not be verified.");
  return data;                               // {status: "paid" | "pending" | "failed", ...}
}

/**
 * Step 2: open Cashfree's checkout for an order from createOrder(), then verify it.
 * Resolves with the verified result ({status: "paid" | "pending" | "failed"}), or null if
 * the customer closed the checkout without paying — that is a choice, not a failure.
 */
export async function openCheckout(order) {
  await loadCheckout();
  const cashfree = window.Cashfree({ mode: order.mode === "production" ? "production" : "sandbox" });
  const result = await cashfree.checkout({
    paymentSessionId: order.payment_session_id,
    redirectTarget: "_modal",
  });
  // Whatever the modal reports, the server's check of the order is what counts — a closed
  // window after a successful payment is still a successful payment.
  const verified = await verifyOrder(order.order_id);
  if (verified.status === "paid") return verified;
  if (result?.error) {
    const msg = result.error.message || "";
    // Closing the window is not an error worth shouting about.
    if (/closed|cancel|abort|dropped/i.test(msg)) return null;
    throw new Error(msg || "The payment did not go through.");
  }
  return verified.status === "pending" ? verified : null;
}

/**
 * The plan this user is on, and what it still allows.
 *
 * Reads the SERVER's answer rather than anything cached at login: the plan can lapse
 * between one page load and the next, and the report allowance changes every time one is
 * generated. A stale copy would offer a button that the backend then refuses.
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
