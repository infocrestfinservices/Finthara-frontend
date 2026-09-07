/**
 * adminService.js — the staff endpoints.
 *
 * Everything under /admin answers 404 for a non-admin account, which is deliberate: a 403
 * would confirm the panel exists. So a 404 from here is not necessarily "no such record" —
 * it can mean "not staff", and the page says so rather than showing an empty table that
 * looks like the business has no users.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("rc_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function get(path, params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const res = await fetch(`${BACKEND_URL}/admin${path}${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(
      res.status === 404
        ? "This account does not have admin access."
        : body?.detail || `Request failed (${res.status})`
    );
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const getStats = () => get("/stats");
export const getIndustries = () => get("/industries");
export const getUsers = (params) => get("/users", params);
export const getPayments = (params) => get("/payments", params);
export const getProjects = (params) => get("/projects", params);

export async function setUserPlan(userId, { plan, days = null, reason = "" }) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/plan`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ plan, days, reason }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || `Could not change the plan (${res.status})`);
  return body;
}

export const getCoupons = () => get("/coupons");

export async function createCoupon(body) {
  const res = await fetch(`${BACKEND_URL}/admin/coupons`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out?.detail || `Could not create the coupon (${res.status})`);
  return out;
}

export async function setCouponActive(id, active) {
  const res = await fetch(`${BACKEND_URL}/admin/coupons/${id}?active=${active}`, {
    method: "PATCH", headers: authHeaders(),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out?.detail || `Could not update the coupon (${res.status})`);
  return out;
}

export const getDashboard = (days = 90) => get("/dashboard", { days });
export const getAdminInvoices = (params) => get("/invoices", params);

export const getRoles = () => get("/roles");
export const getRepeatBuyers = () => get("/repeat-buyers");

export async function setUserRole(userId, { isAdmin, reason = "" }) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ is_admin: isAdmin, reason }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || `Could not change the role (${res.status})`);
  return body;
}
