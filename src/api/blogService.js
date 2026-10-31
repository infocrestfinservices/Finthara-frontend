/**
 * blogService.js — blog posts live on the backend now, edited from the admin console.
 *
 * Public reads need no login. The admin calls go to /admin/blog, which answers 404 for
 * anyone who is not staff (see adminService.js for why).
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function authHeaders(json = true) {
  const token = localStorage.getItem("rc_auth_token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function call(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: auth ? authHeaders() : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.detail || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Where an uploaded blog image is served from. */
export const blogImageUrl = (id) => (id ? `${BACKEND_URL}/blog/images/${id}` : "");

export const listPosts = () => call("/blog/posts").then((d) => d.posts || []);
export const getPost = (slug) => call(`/blog/posts/${encodeURIComponent(slug)}`);

export const adminListPosts = () => call("/admin/blog/posts", { auth: true });
export const adminCreatePost = (post) => call("/admin/blog/posts", { method: "POST", body: post, auth: true });
export const adminUpdatePost = (id, post) => call(`/admin/blog/posts/${id}`, { method: "PUT", body: post, auth: true });
export const adminDeletePost = (id) => call(`/admin/blog/posts/${id}`, { method: "DELETE", auth: true });

export async function adminUploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BACKEND_URL}/admin/blog/images`, {
    method: "POST",
    headers: authHeaders(false),
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Upload failed (${res.status})`);
  return data.id;
}
