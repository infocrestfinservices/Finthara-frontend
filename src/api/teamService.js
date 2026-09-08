/**
 * teamService.js — thin client for the backend /team endpoints.
 * Mirrors profileService.js.
 *
 * Two audiences:
 *   - an owner managing their team    -> getMyTeam / invite / setRole / removeMember / audit
 *   - a member of other teams         -> getMemberships / getPendingInvites / accept / leave
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function extractError(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg?.replace(/^Value error,\s*/i, "") || fallback;
  }
  return fallback;
}

function authHeaders(hasBody) {
  const token = localStorage.getItem("rc_auth_token");
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: authHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractError(data, `Request failed (${res.status})`));
  return data;
}

export const teamService = {
  getMyTeam: () => request("/team"),
  invite: (email, role) => request("/team/invites", { method: "POST", body: { email, role } }),
  revokeInvite: (id) => request(`/team/invites/${id}`, { method: "DELETE" }),
  setRole: (userId, role) =>
    request(`/team/members/${userId}`, { method: "PATCH", body: { role } }),
  removeMember: (userId) => request(`/team/members/${userId}`, { method: "DELETE" }),
  getAudit: (limit = 50, offset = 0) =>
    request(`/team/audit?limit=${limit}&offset=${offset}`),

  getMemberships: () => request("/team/memberships"),
  leaveTeam: (ownerUserId) =>
    request(`/team/memberships/${ownerUserId}`, { method: "DELETE" }),
  getPendingInvites: () => request("/team/invites/pending"),
  acceptInvite: (token) =>
    request("/team/invites/accept", { method: "POST", body: { token } }),
};
